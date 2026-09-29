import Link from 'next/link'
import { notFound } from 'next/navigation'
import ColorFlow from '@/components/ColorFlow'
import Artwork from '@/components/Artwork'
import { artists, artistSlug, getArtist } from '@/data/artists'
import { releases } from '@/data/releases'

export function generateStaticParams(){ return artists.map(a=>({name:artistSlug(a)})) }

export default async function ArtistDetail({params}:{params:Promise<{name:string}>}){
  const {name}=await params
  const artist=getArtist(name)
  if(!artist) return notFound()
  const selected=releases.filter(r=>artist.releases.includes(r.id))
  return (
    <main className="relative min-h-screen overflow-hidden px-6 pb-20 pt-28 md:px-10 md:pt-32">
      <ColorFlow colors={[artist.color,'#1d4dff','#ff3cc8','#050608']} intensity={.35} speed={.15} className="fixed inset-0 -z-10" />
      <Link href="/artists" className="ul mb-8 inline-block text-xs text-white/60">← BACK</Link>
      <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
        <section>
          <p className="mb-4 text-xs uppercase tracking-[.25em] text-white/45">Artist</p>
          <h1 className="font-display w-fit text-[17vw] leading-[.88] tracking-[-.04em] md:text-[9vw]">{artist.name}</h1>
          <p className="mt-5 text-sm text-white/55">Electronic producer based in {artist.location}.</p>
          <p className="mt-8 max-w-md text-sm leading-relaxed text-white/70">{artist.bio}</p>
          <div className="mt-8 flex gap-5 text-xs text-white/55"><span>Instagram</span><span>SoundCloud</span><span>Bandcamp</span></div>
        </section>
        <section>
          <Artwork colors={[artist.color,'#2f6bff','#ff3cc8']} className="aspect-square w-full" />
        </section>
      </div>
      <section className="mt-20 border-t border-white/15 pt-5">
        <p className="mb-8 text-xs tracking-[.2em] text-white/45">SELECTED RELEASES</p>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {selected.map(r=><Link href={`/releases/${r.id.toLowerCase()}`} key={r.id} className="group">
            <Artwork colors={r.colors} className="aspect-square transition-transform duration-700 group-hover:scale-[.98]" />
            <div className="mt-3 flex justify-between text-xs"><span>{r.id} · {r.title}</span><span className="text-white/40">{r.year}</span></div>
          </Link>)}
        </div>
      </section>
    </main>
  )
}
