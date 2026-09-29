'use client'

import { ReactNode, useEffect, useRef } from 'react'

type Props = {
  children: ReactNode
  className?: string
  strength?: number
}

/** Mouse-only spring magnet. Touch/coarse pointers stay completely passive. */
export default function Magnetic({ children, className = '', strength = 0.28 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const state = useRef({ x: 0, y: 0, tx: 0, ty: 0, raf: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const s = state.current
    const animate = () => {
      s.x += (s.tx - s.x) * 0.14
      s.y += (s.ty - s.y) * 0.14
      el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`
      if (Math.abs(s.x - s.tx) > 0.05 || Math.abs(s.y - s.ty) > 0.05) s.raf = requestAnimationFrame(animate)
      else s.raf = 0
    }
    const wake = () => { if (!s.raf) s.raf = requestAnimationFrame(animate) }
    const move = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      s.tx = (event.clientX - (rect.left + rect.width / 2)) * strength
      s.ty = (event.clientY - (rect.top + rect.height / 2)) * strength
      wake()
    }
    const leave = () => { s.tx = 0; s.ty = 0; wake() }

    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      if (s.raf) cancelAnimationFrame(s.raf)
    }
  }, [strength])

  return <div ref={ref} className={className}>{children}</div>
}
