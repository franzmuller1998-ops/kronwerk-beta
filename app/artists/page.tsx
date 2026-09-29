import ColorFlow from '@/components/ColorFlow'
import { artists, artistSlug } from '@/data/artists'
import Link from 'next/link'
export default function Artists() {
  return (
    <main className="relative min-h-screen px-6 pb-24 pt-32 md:px-10">
      <ColorFlow palette="artists" intensity={0.5} speed={0.2} className="fixed inset-0 -z-10" />
      <h1 className="font-display mb-10 text-[9vw] font-light tracking-tight md:text-[5vw]">ARTISTS</h1>
      <ul className="border-b border-white/15">
        {artists.map((a, i) => (
          <li key={a.name} style={{ ['--c' as string]: a.color }} className="group border-t border-white/15 transition-all duration-500 hover:bg-gradient-to-r hover:from-[color-mix(in_srgb,var(--c)_45%,transparent)] hover:to-transparent">
            <Link href={`/artists/${encodeURIComponent(artistSlug(a))}`} className="font-display flex items-center gap-[4vw] py-[2.4vw] text-[10vw] leading-none tracking-tight md:py-[1.4vw] md:text-[5.4vw]">
              <span className="w-[1.4em] text-[.4em] font-light text-white/40 transition-colors group-hover:text-[var(--c)]">{String(i + 1).padStart(2, '0')}</span>
              <span className="flex-1 transition-transform duration-500 group-hover:translate-x-3">{a.name}</span>
              <span className="pr-2 text-[.6em] opacity-0 transition-all duration-500 group-hover:translate-x-2 group-hover:opacity-100">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
