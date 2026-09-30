'use client'
import { useState } from 'react'
import { releases } from '@/data/releases'
import Link from 'next/link'
import Artwork from './Artwork'

const years = [...new Set(releases.map((r) => r.year))].sort((a, b) => b - a)

export default function ReleaseGrid() {
  const [y, setY] = useState<number | null>(null)
  const list = releases.filter((r) => y === null || r.year === y)
  return (
    <>
      <div className="mb-10 flex gap-6 border-t border-white/15 pt-4 text-xs tracking-widest">
        {[null, ...years].map((v) => (
          <button key={v ?? 'all'} onClick={() => setY(v)} aria-pressed={y === v} className={`ul transition-opacity ${y === v ? 'opacity-100' : 'opacity-40 hover:opacity-80'}`}>{v ?? 'ВСЕ'}</button>
        ))}
      </div>
      <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 md:mx-0 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-12 md:overflow-visible md:px-0 lg:grid-cols-4">
        {list.map((r) => (
          <Link href={`/releases/${r.id.toLowerCase()}`} key={r.id} className="group block w-[85vw] shrink-0 snap-center md:w-auto">
            <div className="relative aspect-square overflow-hidden border border-white/10">
              <Artwork colors={r.colors} className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 grid place-items-center bg-black/10 text-[11px] tracking-[.4em] opacity-0 transition-opacity duration-500 group-hover:opacity-100">ОТКРЫТЬ</span>
            </div>
            <div className="mt-3 space-y-0.5 text-xs text-white/50 transition-colors group-hover:text-white">
              <p>{r.id}</p><p className="font-display text-sm text-white">{r.artist}</p><p>{r.title}</p><p>{r.year}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
