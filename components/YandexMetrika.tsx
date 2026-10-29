'use client'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export const METRIKA_ID = 113887004
type Ym = (id: number, method: string, ...args: unknown[]) => void

/**
 * Yandex Metrika counter (the official snippet, loaded after the page is interactive).
 * Links between pages are client-side route changes, not page loads, so each new pathname is
 * reported as a hit; the first load is counted by `init` itself.
 */
export default function YandexMetrika() {
  const pathname = usePathname()
  const first = useRef(true)

  useEffect(() => {
    if (first.current) { first.current = false; return }
    ;(window as unknown as { ym?: Ym }).ym?.(METRIKA_ID, 'hit', location.href, { referer: document.referrer })
  }, [pathname])

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">{`
        (function(m,e,t,r,i,k,a){
          m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
        })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}', 'ym');
        ym(${METRIKA_ID}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
      `}</Script>
      <noscript><div><img src={`https://mc.yandex.ru/watch/${METRIKA_ID}`} style={{ position: 'absolute', left: '-9999px' }} alt="" /></div></noscript>
    </>
  )
}
