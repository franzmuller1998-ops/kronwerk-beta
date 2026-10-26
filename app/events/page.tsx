import type { Metadata } from 'next'
import ColorFlow from '@/components/ColorFlow'
import { events } from '@/data/events'

export const metadata: Metadata = { title: 'События · KRONWERK music', description: 'Ближайшие концерты и вечеринки KRONWERK music.' }

export default function Events() {
  return (
    <main className="relative min-h-screen px-6 pb-16 pt-28 md:px-10 md:pt-32">
      <ColorFlow palette="hero" intensity={0.8} speed={0.22} vignette={1.8} className="fixed inset-0 -z-10" />
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:gap-8">
        <h1 className="font-display shrink-0 text-[14vw] font-light uppercase leading-[.9] tracking-tight md:text-[7vw]">События</h1>
        {/* The home page's hand-drawn stroke, run out to the right of the title (under it on phones): a gentle line that turns
            into the crownwork (кронверк) plan and ends in a short tail. Drawn left to right like a pen. */}
        <svg aria-hidden viewBox="0 0 600 90" fill="none" className="kw-line w-[85%] max-w-[560px] min-w-0 md:w-full">
          <path pathLength={1} d="M4 40 C150 36 300 44 470 40 L475 63 L467 75 L487 69 L498 69 L508 83 L518 69 L529 69 L549 75 L541 63 L546 40 L596 40" />
        </svg>
      </div>
      <p className="mt-6 text-[11px] uppercase leading-[1.8] tracking-[.2em] text-white/60">Ближайшие мероприятия<br />KRONWERK music</p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-14 md:gap-5 lg:grid-cols-3">
        {events.map((e) => (
          <li key={e.title + e.date} className="group relative aspect-[5/4] overflow-hidden border border-white/40 transition-colors duration-500 hover:border-white">
            <ColorFlow palette={e.palette} intensity={0.85} speed={0.3} vignette={0.5} className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.03]" />
            {/* Darkens the bottom of the card so the title stays readable over the brightest flow. */}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#050608]/85 via-[#050608]/20 to-transparent" />
            <div className="relative flex h-full flex-col justify-between p-5 md:p-6">
              <div className="flex items-start justify-between text-sm">
                <time>{e.date}</time>
                <span aria-hidden className="text-lg leading-none transition-transform duration-500 group-hover:translate-x-1">→</span>
              </div>
              <div>
                <h2 className="font-display text-[9vw] leading-[1.05] tracking-tight sm:text-4xl">{e.title}</h2>
                <p className="mt-1 text-sm text-white/80">{e.city}</p>
                <p className="mt-4 text-xs text-white/60">{e.status}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
