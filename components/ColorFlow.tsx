'use client'
import { useEffect, useRef } from 'react'
import { registerFlow } from '@/lib/flowRenderer'

export const PALETTES = {
  hero: ['#1d4dff', '#8a3cff', '#ff3cc8', '#ff8a1f'],
  releases: ['#1d4dff', '#7a3cff', '#1d4dff', '#00d5ff'],
  artists: ['#7a3cff', '#1d4dff', '#5a3cff', '#1d4dff'],
  about: ['#1d4dff', '#00d5ff', '#ff8a1f', '#7a3cff'],
  contact: ['#7a3cff', '#ff3cc8', '#ff8a1f', '#1d4dff'],
}
type Props = { variant?: 'hero' | 'page'; palette?: keyof typeof PALETTES; colors?: string[]; speed?: number; intensity?: number; fps?: number; className?: string }

// Normalises #rgb / #rrggbb(aa); anything else falls back to the page background instead of NaN uniforms.
const hex = (h: string) => {
  const s = h.replace('#', '')
  const full = s.length === 3 ? s.split('').map((c) => c + c).join('') : s.slice(0, 6)
  return /^[0-9a-f]{6}$/i.test(full) ? `#${full}` : '#050608'
}
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
// The shader takes exactly 4 colours.
const four = (c: string[]) => [0, 1, 2, 3].map((i) => (c.length ? c[i % c.length] : '#050608'))

/**
 * Animated colour field. Drawn by the shared renderer (lib/flowRenderer.ts); the CSS gradient on the
 * wrapper is what shows with prefers-reduced-motion, on weak/software-GL devices, and before the first frame.
 */
export default function ColorFlow({ variant = 'page', palette = 'hero', colors, speed = 0.3, intensity = 1, fps, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const c = four(colors ?? PALETTES[palette]).map(hex)
  const params = useRef({ rgb: c.flatMap(rgb), speed, intensity })
  params.current = { rgb: c.flatMap(rgb), speed, intensity }

  useEffect(() => {
    const cv = document.createElement('canvas')
    cv.className = `block h-full w-full ${variant === 'hero' ? 'scale-105' : ''}`
    cv.style.opacity = '0' // gradient stays visible until the first frame lands
    ref.current!.appendChild(cv)
    const unregister = registerFlow({ canvas: cv, params: () => params.current, fps, onDisable: () => cv.remove() })
    if (!unregister) { cv.remove(); return }
    return () => { unregister(); cv.remove() }
  }, [variant, fps])

  return (
    <div ref={ref} className={`overflow-hidden bg-[#050608] ${className}`} aria-hidden
      style={{ backgroundImage: `radial-gradient(60% 50% at 18% 22%,${c[0]}77,transparent),radial-gradient(45% 45% at 78% 28%,${c[1]}44,transparent),radial-gradient(55% 55% at 82% 82%,${c[2]}66,transparent),radial-gradient(40% 40% at 25% 85%,${c[3]}33,transparent)` }} />
  )
}
