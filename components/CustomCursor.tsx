'use client'
import { useEffect, useRef, useState } from 'react'

const INTERACTIVE = 'a,button,[role="button"],input,select,textarea,label,summary'
// Large display type: every h1, plus other big text opted in with data-cursor="lg".
const DISPLAY = 'h1,[data-cursor="lg"]'

/**
 * Minimal white dot that replaces the system cursor on mouse devices. It grows slightly over interactive
 * elements and a lot over large display type, where mix-blend-difference inverts the letters under it.
 * It follows the pointer 1:1 (no easing lag) and never touches the backgrounds.
 */
export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  useEffect(() => { setEnabled(matchMedia('(hover: hover) and (pointer: fine)').matches) }, [])

  useEffect(() => {
    const el = dot.current
    if (!enabled || !el) return
    const root = document.documentElement
    root.classList.add('has-custom-cursor')
    let x = 0, y = 0, raf = 0
    const paint = () => { raf = 0; el.style.transform = `translate3d(${x}px,${y}px,0)` }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x = e.clientX; y = e.clientY
      el.classList.add('is-visible')
      if (!raf) raf = requestAnimationFrame(paint) // at most one style write per frame
    }
    // Delegated, so links and buttons rendered later (menu, other routes) work too.
    const over = (e: PointerEvent) => {
      const t = e.target instanceof Element ? e.target : null
      const big = !!t?.closest(DISPLAY) // wins over the link state, e.g. artist names in the list
      el.classList.toggle('is-big', big)
      el.classList.toggle('is-hover', !big && !!t?.closest(INTERACTIVE))
    }
    const leave = () => el.classList.remove('is-visible')
    addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerover', over)
    root.addEventListener('pointerleave', leave)
    return () => {
      root.classList.remove('has-custom-cursor')
      removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
      root.removeEventListener('pointerleave', leave)
      cancelAnimationFrame(raf)
    }
  }, [enabled])

  if (!enabled) return null
  return <div ref={dot} aria-hidden className="kw-cursor"><span /></div>
}
