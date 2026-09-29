'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import ColorFlow from './ColorFlow'

/**
 * COLOR FLOW route transition (~900ms). Lives in the root layout so it survives the route swap.
 *   0–400ms    the current page dims while a band of flow rises from below and covers the screen
 *   ~400ms     the route changes underneath the cover
 *   400–900ms  the band leaves through the top; the new page resolves from blur (app/template.tsx)
 * The band is taller than the viewport with feathered edges, so it never shows a hard wipe line.
 */
const COVER = { duration: 0.4, ease: [0.65, 0, 0.35, 1] } as const
const REVEAL = { duration: 0.5, ease: [0.33, 0, 0.15, 1] } as const
const BELOW = '100vh', COVERING = '-20vh', ABOVE = '-140vh'

export default function PageTransition() {
  const router = useRouter()
  const pathname = usePathname()
  const band = useAnimationControls()
  const dim = useAnimationControls()
  const busy = useRef(false)
  const awaitingRoute = useRef(false)
  const fallback = useRef<number | undefined>(undefined)

  const reveal = useRef(async () => {})
  reveal.current = async () => {
    awaitingRoute.current = false
    window.clearTimeout(fallback.current)
    await Promise.all([
      band.start({ y: ABOVE, transition: REVEAL }),
      dim.start({ opacity: 0, transition: { duration: 0.45, ease: 'easeOut' } }),
    ])
    band.set({ y: BELOW })
    dim.set({ pointerEvents: 'none' })
    busy.current = false
  }

  // The new route has rendered under the cover.
  useEffect(() => { if (awaitingRoute.current) reveal.current() }, [pathname])

  useEffect(() => {
    const click = async (event: MouseEvent) => {
      if (busy.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const anchor = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!anchor || (anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return
      const url = new URL(anchor.href, location.href)
      if (url.origin !== location.origin || url.pathname === location.pathname) return // external, mailto:, hash or same page

      // Capture phase runs before next/link, which skips its own navigation when defaultPrevented.
      event.preventDefault()
      busy.current = true
      dim.set({ pointerEvents: 'auto' }) // swallow clicks during the transition
      await Promise.all([
        band.start({ y: COVERING, transition: COVER }),
        dim.start({ opacity: 0.45, transition: COVER }),
      ])
      awaitingRoute.current = true
      router.push(url.pathname + url.search + url.hash)
      fallback.current = window.setTimeout(() => reveal.current(), 2500) // never leave the screen covered
    }
    document.addEventListener('click', click, true)
    return () => { document.removeEventListener('click', click, true); window.clearTimeout(fallback.current) }
  }, [band, dim, router])

  return (
    <>
      <motion.div aria-hidden className="fixed inset-0 z-[79] bg-[#050608]" initial={{ opacity: 0, pointerEvents: 'none' }} animate={dim} />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[140vh] [mask-image:linear-gradient(to_bottom,transparent,#000_14%,#000_86%,transparent)]"
        initial={{ y: BELOW }}
        animate={band}
      >
        <ColorFlow palette="hero" speed={0.35} intensity={1.2} interactive={false} className="absolute inset-0" />
      </motion.div>
    </>
  )
}
