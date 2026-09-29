'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import ColorFlow from './ColorFlow'

type Props = { children: React.ReactNode }

/**
 * COLOR FLOW route transition:
 * 0–700ms: the flow rises from below and fully covers the current route.
 * ~700ms: route changes underneath the cover.
 * 700–1400ms: the flow exits upward while the new page resolves from blur.
 */
export default function PageTransition({ children }: Props) {
  const router = useRouter()
  const [active, setActive] = useState(false)
  const [covering, setCovering] = useState(false)
  const reducedRef = useRef(false)
  const timerRef = useRef<number | null>(null)
  const queuedHref = useRef<string | null>(null)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedRef.current = media.matches
    const update = () => { reducedRef.current = media.matches }
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!active) return
    const start = window.setTimeout(() => setCovering(true), 20)
    const navigate = window.setTimeout(() => {
      if (queuedHref.current) router.push(queuedHref.current)
    }, 700)
    const finish = window.setTimeout(() => {
      setActive(false)
      setCovering(false)
      queuedHref.current = null
    }, 1400)
    timerRef.current = finish
    return () => {
      window.clearTimeout(start)
      window.clearTimeout(navigate)
      window.clearTimeout(finish)
    }
  }, [active, router])

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current) }, [])

  useEffect(() => {
    const click = (event: MouseEvent) => {
      if (reducedRef.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const target = event.target as Element | null
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname && url.search === window.location.search) return
      if (active) return
      event.preventDefault()
      queuedHref.current = url.pathname + url.search + url.hash
      setActive(true)
    }
    document.addEventListener('click', click, true)
    return () => document.removeEventListener('click', click, true)
  }, [active])

  return (
    <div className={active ? 'kr-transition-root is-active' : 'kr-transition-root'}>
      <div className={covering ? 'kr-route-page kr-route-page-active' : 'kr-route-page'}>{children}</div>
      {active && (
        <div className="kr-color-transition" aria-hidden="true">
          <ColorFlow palette="hero" speed={0.32} intensity={1.2} interactive={false} className="absolute inset-0" />
          <div className="absolute inset-0 bg-[#050608]/20" />
        </div>
      )}
    </div>
  )
}
