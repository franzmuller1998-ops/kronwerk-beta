'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import ColorFlow from './ColorFlow'

/**
 * COLOR FLOW route transition (~650ms). Lives in the root layout so it survives the route swap.
 *   0–280ms    the current page dims while a band of flow rises from below and covers the screen;
 *              the route is requested immediately, so loading overlaps the cover instead of following it
 *   then       as soon as the cover is closed AND the new route has rendered, the band leaves through
 *              the top (380ms) while the new page resolves from blur (app/template.tsx)
 * The band is taller than the viewport with feathered edges, so it never shows a hard wipe line.
 * Skipped entirely with prefers-reduced-motion.
 */
const COVER = { duration: 0.28, ease: [0.65, 0, 0.35, 1] } as const
const REVEAL = { duration: 0.38, ease: [0.33, 0, 0.15, 1] } as const
const BELOW = '100vh', COVERING = '-20vh', ABOVE = '-140vh'

const internalPath = (anchor: HTMLAnchorElement) => {
  if ((anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return null
  const url = new URL(anchor.href, location.href)
  if (url.origin !== location.origin || url.pathname === location.pathname) return null // external, mailto:, hash or same page
  return url
}

export default function PageTransition() {
  const router = useRouter()
  const pathname = usePathname()
  const band = useAnimationControls()
  const dim = useAnimationControls()
  const busy = useRef(false)
  const pending = useRef<Promise<unknown> | null>(null) // resolves when the cover is closed
  const fallback = useRef<number | undefined>(undefined)

  const reveal = useRef(async () => {})
  reveal.current = async () => {
    window.clearTimeout(fallback.current)
    await Promise.all([
      band.start({ y: ABOVE, transition: REVEAL }),
      dim.start({ opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } }),
    ])
    band.set({ y: BELOW })
    dim.set({ pointerEvents: 'none' })
    busy.current = false
  }
  const finish = () => {
    const covered = pending.current
    if (!covered) return
    pending.current = null
    covered.then(() => reveal.current())
  }

  // The new route has rendered (possibly while the cover is still closing).
  useEffect(finish, [pathname])

  useEffect(() => {
    const prefetched = new Set<string>()
    // Warm the route on hover so the click rarely has to wait for data.
    const over = (event: PointerEvent) => {
      const anchor = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      const url = anchor && internalPath(anchor)
      if (url && !prefetched.has(url.pathname)) { prefetched.add(url.pathname); router.prefetch(url.pathname) }
    }
    const click = (event: MouseEvent) => {
      if (busy.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const anchor = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      const url = anchor && internalPath(anchor)
      if (!url) return

      // Capture phase runs before next/link, which skips its own navigation when defaultPrevented.
      event.preventDefault()
      busy.current = true
      dim.set({ pointerEvents: 'auto' }) // swallow clicks during the transition
      pending.current = Promise.all([
        band.start({ y: COVERING, transition: COVER }),
        dim.start({ opacity: 0.4, transition: COVER }),
      ])
      router.push(url.pathname + url.search + url.hash)
      fallback.current = window.setTimeout(finish, 3000) // never leave the screen covered
    }
    document.addEventListener('pointerover', over)
    document.addEventListener('click', click, true)
    return () => {
      document.removeEventListener('pointerover', over)
      document.removeEventListener('click', click, true)
      window.clearTimeout(fallback.current)
    }
  }, [band, dim, router])

  return (
    <>
      <motion.div aria-hidden className="fixed inset-0 z-[79] bg-[#050608]" initial={{ opacity: 0, pointerEvents: 'none' }} animate={dim} />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[140vh] will-change-transform [mask-image:linear-gradient(to_bottom,transparent,#000_14%,#000_86%,transparent)]"
        initial={{ y: BELOW }}
        animate={band}
      >
        <ColorFlow palette="hero" speed={0.35} intensity={1.2} className="absolute inset-0" />
      </motion.div>
    </>
  )
}
