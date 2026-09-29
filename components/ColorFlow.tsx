'use client'
import { useEffect, useRef } from 'react'

export const PALETTES = {
  hero: ['#1d4dff', '#8a3cff', '#ff3cc8', '#ff8a1f'],
  releases: ['#1d4dff', '#7a3cff', '#1d4dff', '#00d5ff'],
  artists: ['#7a3cff', '#1d4dff', '#5a3cff', '#1d4dff'],
  about: ['#1d4dff', '#00d5ff', '#ff8a1f', '#7a3cff'],
  contact: ['#7a3cff', '#ff3cc8', '#ff8a1f', '#1d4dff'],
}
type Props = { variant?: 'hero' | 'page'; palette?: keyof typeof PALETTES; colors?: string[]; speed?: number; intensity?: number; interactive?: boolean; className?: string }

// Normalises #rgb / #rrggbb(aa); anything else falls back to the page background instead of NaN uniforms.
const hex = (h: string) => {
  const s = h.replace('#', '')
  const full = s.length === 3 ? s.split('').map((c) => c + c).join('') : s.slice(0, 6)
  return /^[0-9a-f]{6}$/i.test(full) ? `#${full}` : '#050608'
}
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
// The shader takes exactly 4 colours.
const four = (c: string[]) => [0, 1, 2, 3].map((i) => (c.length ? c[i % c.length] : '#050608'))

const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'
const FS = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 R,M;uniform float T,I;uniform vec3 C[4];
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n(p);p=p*2.02+7.3;a*=.5;}return s;}
vec3 pal(float x){x=fract(x)*4.;vec3 c=mix(C[0],C[1],smoothstep(0.,1.,clamp(x,0.,1.)));
c=mix(c,C[2],smoothstep(0.,1.,clamp(x-1.,0.,1.)));c=mix(c,C[3],smoothstep(0.,1.,clamp(x-2.,0.,1.)));
return mix(c,C[0],smoothstep(0.,1.,clamp(x-3.,0.,1.)));}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*R)/R.y; vec2 m=(M-.5)*vec2(R.x/R.y,1.);
  vec2 d=uv-m; vec2 p=uv*1.25+.10*d*exp(-dot(d,d)*4.);        // subtle local warp around cursor
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

export default function ColorFlow({ variant = 'page', palette = 'hero', colors, speed = 0.3, intensity = 1, interactive = false, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const c = four(colors ?? PALETTES[palette]).map(hex)
  const cfg = useRef({ colors: c, speed, intensity })
  cfg.current = { colors: c, speed, intensity }
  const redraw = useRef(() => {})

  useEffect(() => {
    // A fresh canvas per effect run, so each WebGL context can be released on unmount:
    // browsers keep only ~16 live contexts and silently kill the oldest ones.
    const host = ref.current!
    const cv = document.createElement('canvas')
    cv.className = `block h-full w-full ${variant === 'hero' ? 'scale-105' : ''}`
    cv.style.opacity = '0' // keep the CSS fallback visible until the first frame is drawn
    host.appendChild(cv)
    const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!gl) { cv.remove(); return }
    const release = () => { gl.getExtension('WEBGL_lose_context')?.loseContext(); cv.remove() }
    const sh = (t: number, s: string) => { const o = gl.createShader(t)!; gl.shaderSource(o, s); gl.compileShader(o); return o }
    const pr = gl.createProgram()!
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr)
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { release(); return }
    gl.useProgram(pr)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const U = (n: string) => gl.getUniformLocation(pr, n)
    const [uR, uM, uT, uI, uC] = [U('R'), U('M'), U('T'), U('I'), U('C')]

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = matchMedia('(pointer: coarse)').matches
    const scale = coarse ? 0.45 : 0.6 // low-res render + CSS upscale = free soft blur, cheap on GPU

    const cur = cfg.current.colors.flatMap(rgb), mouse = [0.5, 0.5], tgt = [0.5, 0.5]
    let t = Math.random() * 50
    const draw = () => {
      gl.uniform2f(uR, cv.width, cv.height); gl.uniform2f(uM, mouse[0], mouse[1])
      gl.uniform1f(uT, t); gl.uniform1f(uI, cfg.current.intensity); gl.uniform3fv(uC, cur)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      cv.style.opacity = ''
    }
    // Reduced motion shows a single still frame, redrawn only on resize or prop changes.
    if (reduced) redraw.current = () => { cur.splice(0, 12, ...cfg.current.colors.flatMap(rgb)); draw() }

    // ResizeObserver also catches layout-only size changes (grid cells, aspect-ratio boxes), not just window resizes.
    const resize = () => {
      cv.width = Math.max(1, Math.round(cv.clientWidth * scale)); cv.height = Math.max(1, Math.round(cv.clientHeight * scale))
      gl.viewport(0, 0, cv.width, cv.height)
      if (reduced) draw() // resizing clears the canvas
    }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(cv)

    const move = (e: PointerEvent) => { const b = cv.getBoundingClientRect(); tgt[0] = (e.clientX - b.left) / b.width; tgt[1] = 1 - (e.clientY - b.top) / b.height }
    if (interactive && !coarse && !reduced) addEventListener('pointermove', move)

    let raf = 0, visible = true, last = performance.now()
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(cv)
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible || document.hidden) { last = now; return }
      t += ((now - last) / 1000) * cfg.current.speed; last = now
      const goal = cfg.current.colors.flatMap(rgb)
      for (let i = 0; i < 12; i++) cur[i] += (goal[i] - cur[i]) * 0.04
      mouse[0] += (tgt[0] - mouse[0]) * 0.04; mouse[1] += (tgt[1] - mouse[1]) * 0.04
      draw()
    }
    if (!reduced) raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); removeEventListener('pointermove', move)
      redraw.current = () => {}
      release()
    }
  }, [interactive, variant])

  const key = c.join()
  useEffect(() => { redraw.current() }, [key, intensity])

  return (
    <div ref={ref} className={`overflow-hidden bg-[#050608] ${className}`} aria-hidden
      style={{ backgroundImage: `radial-gradient(60% 50% at 20% 20%,${c[0]}88,transparent),radial-gradient(50% 50% at 80% 80%,${c[2]}66,transparent)` }} />
  )
}
