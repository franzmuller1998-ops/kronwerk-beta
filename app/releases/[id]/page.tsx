import Link from 'next/link'
import { notFound } from 'next/navigation'
import ColorFlow from '@/components/ColorFlow'
import Artwork from '@/components/Artwork'
import AudioPlayer from '@/components/AudioPlayer'
import { getRelease, releases } from '@/data/releases'

export function generateStaticParams(){ return releases.map(r=>({id:r.id.toLowerCase()})) }

export default async function ReleaseDetail({ params }: { params: Promise<{id:string}> }) {
  const {id}=await params
  const release=getRelease(id)
  if(!release) return notFound()
  return (
    <main className="relative min-h-screen overflow-hidden px-6 pb-20 pt-28 md:px-10 md:pt-32">
      <ColorFlow colors={[...release.colors,'#050608']} intensity={.45} speed={.16} className="fixed inset-0 -z-10" />
      <Link href="/releases" className="ul mb-8 inline-block text-xs text-white/60">← BACK</Link>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,.85fr)] lg:items-start lg:gap-16">
        <Artwork colors={release.colors} className="aspect-square max-w-[760px]" />
        <div className="flex min-h-full flex-col">
          <div className="mb-10">
            <p className="mb-3 text-xs text-white/45">{release.id} · {release.year}</p>
            <h1 className="font-display text-[13vw] leading-[.9] tracking-tight md:text-[7vw]">{release.artist}</h1>
            <p className="mt-2 text-2xl text-white/70 md:text-3xl">{release.title}</p>
          </div>
          <AudioPlayer duration={release.tracks[0].duration} />
          <div className="mt-10 border-t border-white/15">
            {release.tracks.map((t,i)=><div key={t.title} className="flex items-center gap-5 border-b border-white/10 py-4 text-sm"><span className="w-7 text-white/35">{String(i+1).padStart(2,'0')}</span><span className="flex-1">{t.title}</span><span className="text-white/45">{t.duration}</span></div>)}
          </div>
          <div className="mt-auto grid gap-2 pt-12 text-xs text-white/45"><p>{release.description}</p><p>Written & produced by {release.artist}</p><p>Mastered by KRONWERK</p></div>
        </div>
      </div>
    </main>
  )
}
