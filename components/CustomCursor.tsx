'use client'
import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  // Mouse-like pointers only: on touch screens the dot used to sit stuck in the top-left corner.
  const [enabled, setEnabled] = useState(false)
  useEffect(() => { setEnabled(matchMedia('(hover: hover) and (pointer: fine)').matches) }, [])

  useEffect(() => {
    if (!enabled) return
    let x=0,y=0,rx=0,ry=0,raf=0,seen=false
    const show=(v:boolean)=>{ for (const el of [dot.current, ring.current]) if (el) el.style.opacity = v ? '1' : '0' }
    const move=(e:PointerEvent)=>{
      x=e.clientX;y=e.clientY
      if(!seen){ rx=x; ry=y; seen=true }
      show(true)
    }
    const loop=()=>{
      rx += (x-rx)*.18; ry += (y-ry)*.18
      if(dot.current) dot.current.style.transform=`translate3d(${x}px,${y}px,0)`
      if(ring.current) ring.current.style.transform=`translate3d(${rx}px,${ry}px,0)`
      raf=requestAnimationFrame(loop)
    }
    // Delegated, so links and buttons rendered after mount (menu, other routes) enlarge the ring too.
    const over=(e:PointerEvent)=>ring.current?.classList.toggle('cursor-large', e.target instanceof Element && !!e.target.closest('a,button'))
    const leave=()=>show(false)
    addEventListener('pointermove',move)
    document.addEventListener('pointerover',over)
    document.documentElement.addEventListener('pointerleave',leave)
    raf=requestAnimationFrame(loop)
    return()=>{
      removeEventListener('pointermove',move)
      document.removeEventListener('pointerover',over)
      document.documentElement.removeEventListener('pointerleave',leave)
      cancelAnimationFrame(raf)
    }
  },[enabled])

  if (!enabled) return null
  return <>
    <div ref={dot} style={{opacity:0}} className="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference" />
    <div ref={ring} style={{opacity:0}} className="cursor-ring pointer-events-none fixed left-0 top-0 z-[99] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60 mix-blend-difference transition-[width,height] duration-300" />
  </>
}
