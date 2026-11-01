'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { Announcement, Artist } from '@/data/announcement'

// Цвета фирменной палитры: если у артиста нет фото (или оно не загрузилось), карточка получает цветной фон.
const TINTS = ['#1d4dff', '#8a3cff', '#ff3cc8', '#ff8a1f']
const tint = (i: number) => ({
  backgroundImage: `radial-gradient(80% 60% at 20% 18%,${TINTS[i % 4]}99,transparent),radial-gradient(70% 60% at 82% 85%,${TINTS[(i + 1) % 4]}66,transparent)`,
})

const Play = () => <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 translate-x-px"><path d="M8 5v14l11-7z" /></svg>
const Pause = () => <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>

/**
 * Анонс выступления: заголовок, дата и карусель карточек артистов.
 * Карусель — обычный горизонтальный скролл с CSS scroll-snap (на телефоне листается пальцем),
 * стрелки только на десктопе. Один общий <audio> на все карточки: включается только один отрывок.
 */
export default function ArtistCarousel({ title, date, place, href, artists }: Announcement) {
  const list = useRef<HTMLUListElement>(null)
  const audio = useRef<HTMLAudioElement>(null)
  const [edge, setEdge] = useState({ start: true, end: false })
  const [activeId, setActiveId] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  // Стрелки отключаются на краях списка.
  useEffect(() => {
    const el = list.current
    if (!el) return
    const update = () => {
      const start = el.scrollLeft < 4
      const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
      setEdge((p) => (p.start === start && p.end === end ? p : { start, end }))
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', update); ro.disconnect() }
  }, [artists.length])

  // Уходим со страницы — музыка замолкает.
  useEffect(() => {
    const a = audio.current
    return () => a?.pause()
  }, [])

  if (!artists.length) return null

  const scrollByCard = (dir: 1 | -1) => {
    const el = list.current
    if (!el) return
    const [a, b] = Array.from(el.children) as HTMLElement[]
    const step = b ? b.offsetLeft - a.offsetLeft : a.offsetWidth
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: dir * step, behavior: smooth ? 'smooth' : 'auto' })
  }

  const toggle = (art: Artist) => {
    const a = audio.current
    if (!a || !art.audio) return
    if (activeId === art.id) {
      if (a.paused) a.play().catch(() => setPlaying(false))
      else a.pause()
      return
    }
    a.src = art.audio
    setActiveId(art.id)
    setProgress(0)
    a.play().catch(() => setPlaying(false)) // файла нет или браузер не разрешил: просто остаёмся на паузе
  }

  const arrow = 'h-11 w-11 rounded-full border border-white/40 text-lg transition-colors hover:border-white hover:bg-white hover:text-[#050608] disabled:pointer-events-none disabled:opacity-30'

  return (
    <section id="announce" aria-labelledby="announce-title" className="relative z-10 py-20 md:py-28">
      <div className="relative z-10">
        <div className="flex items-end justify-between gap-6 px-6 md:px-10">
          <div>
            <h2 id="announce-title" className="font-display text-4xl tracking-tight md:text-6xl">{title}</h2>
            <p className="mt-4 text-base md:text-lg">{date}</p>
            <p className="mt-1 text-sm text-white/75">{place}</p>
          </div>
          {/* На телефоне листают пальцем, стрелки только для мыши. */}
          <div className="flex gap-3 max-md:hidden">
            <button type="button" aria-label="Назад" disabled={edge.start} onClick={() => scrollByCard(-1)} className={arrow}>←</button>
            <button type="button" aria-label="Вперёд" disabled={edge.end} onClick={() => scrollByCard(1)} className={arrow}>→</button>
          </div>
        </div>

        <div role="region" aria-roledescription="карусель" aria-label="Артисты выступления" className="mt-10 md:mt-14">
          <ul
            ref={list}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 pt-8 scroll-px-6 [scrollbar-width:none] md:gap-5 md:px-10 md:scroll-px-10 [&::-webkit-scrollbar]:hidden"
          >
            {artists.map((art, i) => {
              const on = activeId === art.id && playing
              const mine = activeId === art.id
              return (
                <li key={art.id} className="group relative w-[72vw] max-w-[320px] shrink-0 snap-start md:w-[320px]">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border-4 border-white/40 transition-colors duration-500 group-hover:border-white/80 group-focus-within:border-white/80" style={tint(i)}>
                    {art.photo && (
                      // Обычный <img>: в standalone-образе не нужен sharp. Фото заранее готовим нужного размера (см. data/announcement.ts).
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={art.photo}
                        alt={art.name}
                        width={640}
                        height={800}
                        loading="lazy"
                        draggable={false}
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                    {art.audio && (
                      <>
                        <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-[#050608]/85 to-transparent p-4 pt-12">
                          <button
                            type="button"
                            onClick={() => toggle(art)}
                            aria-label={`${on ? 'Пауза' : 'Слушать отрывок'}: ${art.name}`}
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#050608] transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                          >
                            {on ? <Pause /> : <Play />}
                          </button>
                          <span className="text-sm text-white/90">{on ? 'Играет' : mine ? 'Продолжить' : 'Слушать отрывок'}</span>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/20" aria-hidden>
                          <div className="h-full origin-left bg-white transition-transform duration-300 ease-linear" style={{ transform: `scaleX(${mine ? progress : 0})` }} />
                        </div>
                      </>
                    )}
                  </div>
                  {art.badge && (
                    // Плашка достижения: половиной над верхним краем карточки, правее края на 8 px. Лежит поверх фото.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={art.badge.src}
                      alt={art.badge.alt}
                      width={640}
                      height={153}
                      loading="lazy"
                      draggable={false}
                      className="pointer-events-none absolute -right-2 top-0 w-[68%] -translate-y-1/2 drop-shadow-[0_6px_16px_rgba(0,0,0,.45)]"
                    />
                  )}
                  <h3 data-cursor="lg" className="font-display mt-4 text-2xl tracking-tight">{art.name}</h3>
                  <p className="mt-1 text-sm text-white/75">{art.genre}</p>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="mt-10 px-6 md:mt-14 md:px-10">
          <Link href={href} className="inline-block rounded-full border border-white/70 px-7 py-2.5 text-sm transition-colors hover:border-white hover:bg-white hover:text-[#050608]">Подробности и запись</Link>
        </div>

        <audio
          ref={audio}
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => { setPlaying(false); setProgress(0) }}
          onError={() => setPlaying(false)}
          onTimeUpdate={(e) => { const a = e.currentTarget; if (a.duration) setProgress(a.currentTime / a.duration) }}
        />
      </div>
    </section>
  )
}
