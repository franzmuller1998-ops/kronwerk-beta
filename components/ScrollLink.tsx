'use client'
import type { ReactNode } from 'react'

/**
 * Link that scrolls smoothly to an element on the same page (by id). Without JavaScript it still works
 * as a plain #anchor. With prefers-reduced-motion the jump is instant. The page transition ignores it,
 * because it does not change the route.
 */
export default function ScrollLink({ to, className, children }: { to: string; className?: string; children: ReactNode }) {
  const go = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById(to)
    if (!el) return
    e.preventDefault()
    el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
  }
  return <a href={`#${to}`} onClick={go} className={className}>{children}</a>
}
