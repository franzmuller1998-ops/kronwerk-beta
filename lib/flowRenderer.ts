/**
 * Shared COLOR FLOW renderer.
 *
 * Every <ColorFlow> on the page (background, artworks, menu, route transition) is drawn by ONE WebGL
 * context on an off-screen canvas and copied into its own small 2D canvas. One context instead of one per
 * flow avoids the per-context GPU overhead, the browser's ~16-context limit, and gives a single frame loop
 * that can watch the frame rate and step quality down on weak hardware:
 *
 *   tier 2  desktop   60fps, 0.5x resolution, 5 noise octaves
 *   tier 1  4-core    60fps, 0.4x resolution, 4 octaves (also the first step down from tier 2)
 *   tier 0  mobile    30fps, 0.3x resolution, 3 octaves
 *   off     static CSS gradient (reduced motion, software GL, or still too slow at tier 0)
 */

const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'
const fs = (octaves: number) => `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 R;uniform float T,I;uniform vec3 C[4];
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<${octaves};i++){s+=a*n(p);p=p*2.02+7.3;a*=.5;}return s;}
vec3 pal(float x){x=fract(x)*4.;vec3 c=mix(C[0],C[1],smoothstep(0.,1.,clamp(x,0.,1.)));
c=mix(c,C[2],smoothstep(0.,1.,clamp(x-1.,0.,1.)));c=mix(c,C[3],smoothstep(0.,1.,clamp(x-2.,0.,1.)));
return mix(c,C[0],smoothstep(0.,1.,clamp(x-3.,0.,1.)));}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*R)/R.y; vec2 p=uv*1.25;
  vec2 q=vec2(fbm(p+T*.55),fbm(p+vec2(5.2,1.3)-T*.45));
  vec2 r=vec2(fbm(p+3.*q+vec2(1.7,9.2)+T*.35),fbm(p+3.*q+vec2(8.3,2.8)-T*.3));
  float f=fbm(p+3.*r);
  float rib=pow(1.-abs(f*2.-1.),3.5);
  vec3 col=pal(f*1.4+q.x*.6+r.y*.4+T*.04);
  float v=smoothstep(.12,.8,length(uv*vec2(.75,1.15)));      // dark centre keeps logo legible
  vec3 o=col*(rib*1.5+.12*f)*v*I;
  o+=vec3(1.,.92,.85)*pow(rib,9.)*.55*v*I;                    // white-hot filament cores
  o+=(h(gl_FragCoord.xy+T)-.5)*.035;                          // fine grain
  gl_FragColor=vec4(max(o,vec3(.02,.024,.03)),1.);}`

type Tier = { scale: number; budget: number; octaves: number; fps: number }
const TIERS: Tier[] = [
  { scale: 0.3, budget: 160_000, octaves: 3, fps: 30 },
  { scale: 0.4, budget: 320_000, octaves: 4, fps: 60 },
  { scale: 0.5, budget: 520_000, octaves: 5, fps: 60 }, // budget caps huge screens (max canvas pixels)
]
const OFF_KEY = 'kw-flow-off'

export type FlowParams = { rgb: number[]; speed: number; intensity: number }
export type FlowOptions = { canvas: HTMLCanvasElement; params: () => FlowParams; fps?: number; onDisable: () => void }
type Program = { prog: WebGLProgram; R: WebGLUniformLocation | null; T: WebGLUniformLocation | null; I: WebGLUniformLocation | null; C: WebGLUniformLocation | null }
type Entry = FlowOptions & { ctx: CanvasRenderingContext2D; cur: number[]; t: number; last: number; visible: boolean; drawn: boolean; io: IntersectionObserver; ro: ResizeObserver }

let gl: WebGLRenderingContext | null = null
let glCanvas: HTMLCanvasElement | null = null
let disabled = false
let tier = 2
const programs = new Map<number, Program | null>()
const entries = new Set<Entry>()
let raf = 0, lastFrame = 0, graceUntil = 0
let samples: number[] = []

/** False when the flow must stay a static gradient: reduced motion, no usable WebGL, or disabled for being too slow. */
export function flowAllowed() {
  if (typeof window === 'undefined' || disabled) return false
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try { if (sessionStorage.getItem(OFF_KEY)) return false } catch {}
  return true
}

function initialTier() {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  // Phones/tablets and very weak or data-saving devices start at the lowest tier; 4-core desktops
  // (typical integrated-GPU laptops) start one step down. From there the frame-rate monitor decides.
  if (matchMedia('(pointer: coarse)').matches || (nav.deviceMemory ?? 8) <= 2 || nav.connection?.saveData) return 0
  return (nav.hardwareConcurrency ?? 8) <= 4 ? 1 : 2
}

function disable() {
  disabled = true
  try { sessionStorage.setItem(OFF_KEY, '1') } catch {} // don't retry on every page of this visit
  cancelAnimationFrame(raf); raf = 0
  for (const e of [...entries]) e.onDisable()
  entries.clear()
  gl?.getExtension('WEBGL_lose_context')?.loseContext()
  gl = null
}

function init() {
  if (gl) return true
  if (disabled) return false
  glCanvas = document.createElement('canvas')
  // failIfMajorPerformanceCaveat: software rendering (no GPU / blocklisted driver) gets the static gradient instead.
  gl = glCanvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, failIfMajorPerformanceCaveat: true })
  if (!gl) { disable(); return false }
  glCanvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); disable() })
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  tier = initialTier()
  document.addEventListener('visibilitychange', kick)
  return !!program(TIERS[tier].octaves)
}

function program(octaves: number): Program | null {
  if (programs.has(octaves)) return programs.get(octaves)!
  const g = gl!
  const sh = (t: number, s: string) => { const o = g.createShader(t)!; g.shaderSource(o, s); g.compileShader(o); return o }
  const prog = g.createProgram()!
  g.attachShader(prog, sh(g.VERTEX_SHADER, VS)); g.attachShader(prog, sh(g.FRAGMENT_SHADER, fs(octaves)))
  g.bindAttribLocation(prog, 0, 'p'); g.linkProgram(prog)
  const ok = g.getProgramParameter(prog, g.LINK_STATUS)
  const p = ok ? { prog, R: g.getUniformLocation(prog, 'R'), T: g.getUniformLocation(prog, 'T'), I: g.getUniformLocation(prog, 'I'), C: g.getUniformLocation(prog, 'C') } : null
  programs.set(octaves, p)
  if (!p) disable()
  return p
}

function size(e: Entry) {
  const { scale, budget } = TIERS[tier]
  const cw = e.canvas.clientWidth, ch = e.canvas.clientHeight
  const s = Math.min(scale, Math.sqrt(budget / Math.max(1, cw * ch)))
  const w = Math.max(1, Math.round(cw * s)), h = Math.max(1, Math.round(ch * s))
  if (e.canvas.width !== w || e.canvas.height !== h) { e.canvas.width = w; e.canvas.height = h; e.last = 0 }
}

// Adaptive quality: judge by the median rAF interval over ~1.5s so single hitches (hydration, route swap) don't count.
function sample(interval: number, now: number) {
  if (interval > 250 || now < graceUntil) return // throttled/background tab, or settling after a change
  samples.push(interval)
  if (samples.length < 90) return
  const median = samples.sort((a, b) => a - b)[45]
  samples = []
  const tooSlow = tier > 0 ? median > 22 : median > 42 // below ~45fps (desktop tiers) / ~24fps (lowest tier)
  if (!tooSlow) return
  if (tier === 0) { disable(); return }
  tier--
  graceUntil = now + 1000
  if (!program(TIERS[tier].octaves)) return
  entries.forEach(size)
}

function render(e: Entry, dt: number) {
  const g = gl!, p = program(TIERS[tier].octaves)
  if (!p) return
  const { rgb, speed, intensity } = e.params()
  e.t += dt * speed
  const k = 1 - Math.exp(-dt * 2.5) // colour cross-fade when a palette changes
  for (let i = 0; i < 12; i++) e.cur[i] += (rgb[i] - e.cur[i]) * k
  const w = e.canvas.width, h = e.canvas.height, gc = glCanvas!
  if (gc.width < w || gc.height < h) { gc.width = Math.max(gc.width, w); gc.height = Math.max(gc.height, h) }
  g.viewport(0, 0, w, h)
  g.useProgram(p.prog)
  g.uniform2f(p.R, w, h); g.uniform1f(p.T, e.t); g.uniform1f(p.I, intensity); g.uniform3fv(p.C, e.cur)
  g.drawArrays(g.TRIANGLES, 0, 3)
  // GL's viewport sits at the bottom-left of the shared canvas.
  e.ctx.drawImage(gc, 0, gc.height - h, w, h, 0, 0, w, h)
  if (!e.drawn) { e.drawn = true; e.canvas.style.opacity = '' }
}

function frame(now: number) {
  raf = 0
  if (disabled) return
  const active = [...entries].filter((e) => e.visible)
  if (!active.length || document.hidden) { lastFrame = 0; return } // idle: restarted by kick()
  raf = requestAnimationFrame(frame)
  if (lastFrame) sample(now - lastFrame, now)
  lastFrame = now
  const maxFps = TIERS[tier].fps
  for (const e of active) {
    const fps = Math.min(maxFps, e.fps ?? 60)
    if (e.last && now - e.last < 1000 / fps - 2) continue
    const dt = e.last ? Math.min(0.1, (now - e.last) / 1000) : 0
    e.last = now
    render(e, dt)
  }
}

function kick() { if (!raf && !disabled && !document.hidden) raf = requestAnimationFrame(frame) }

/** Registers a canvas to be painted with the flow. Returns an unregister function, or null if it stays static. */
export function registerFlow(opts: FlowOptions): (() => void) | null {
  if (!flowAllowed() || !init()) return null
  const ctx = opts.canvas.getContext('2d', { alpha: false })
  if (!ctx) return null
  const entry: Entry = {
    ...opts, ctx, cur: [...opts.params().rgb], t: Math.random() * 50, last: 0, visible: true, drawn: false,
    io: new IntersectionObserver(([x]) => { entry.visible = x.isIntersecting; if (entry.visible) kick() }),
    ro: new ResizeObserver(() => size(entry)),
  }
  entry.io.observe(opts.canvas); entry.ro.observe(opts.canvas)
  size(entry)
  entries.add(entry)
  kick()
  return () => { entry.io.disconnect(); entry.ro.disconnect(); entries.delete(entry) }
}
