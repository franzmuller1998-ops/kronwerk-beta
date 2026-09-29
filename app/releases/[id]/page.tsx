import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ColorFlow from '@/components/ColorFlow'
import Artwork from '@/components/Artwork'
import AudioPlayer from '@/components/AudioPlayer'
import { getRelease, releases } from '@/data/releases'

export function generateStaticParams(){ return releases.map(r=>({id:r.id.toLowerCase()})) }

export async function generateMetadata({ params }: { params: Promise<{id:string}> }): Promise<Metadata> {
  const release=getRelease((await params).id)
  return release ? { title: `${release.artist} — ${release.title} · KRONWERK music` } : {}
}

export default async function ReleaseDetail({ params }: { params: Promise<{id:string}> }) {
  const {id}=await params
  const release=getRelease(id)
  if(!release) return notFound()
  return (
    <main className="relative min-h-screen px-6 pb-20 pt-28 md:px-10 md:pt-32">
      <ColorFlow colors={[...release.colors,'#050608']} intensity={.45} speed={.16} className="fixed inset-0 -z-10" />
      <Link href="/releases" className="ul mb-8 inline-block text-xs text-white/60">← BACK</Link>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,.9fr)] lg:items-start lg:gap-16">
        <Artwork colors={release.colors} className="aspect-square w-full" />
        <div className="lg:sticky lg:top-28">
          <p className="mb-4 flex gap-4 text-xs tracking-[.2em] text-white/45"><span>{release.id}</span><span>{release.year}</span></p>
          <h1 className="font-display text-[15vw] font-semibold leading-[.88] tracking-[-.045em] md:text-[8vw] lg:text-[6.2vw]">{release.artist}</h1>
          <p className="font-display mt-3 text-2xl font-light tracking-[-.01em] text-white/75 md:text-3xl">{release.title}</p>
          <p className="mb-10 mt-6 max-w-md text-sm leading-relaxed text-white/50">{release.description}</p>
          <AudioPlayer tracks={release.tracks} />
          <div className="mt-10 grid gap-1.5 text-xs text-white/45">
            <p>Written &amp; produced by {release.artist}</p>
            <p>Mastered by KRONWERK</p>
          </div>
        </div>
      </div>
    </main>
  )
}
