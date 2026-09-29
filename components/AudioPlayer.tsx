'use client'
import { useEffect, useState } from 'react'
import type { Track } from '@/data/releases'

// Mock player: no audio files yet, playback is simulated from the track durations.
const toSeconds = (d: string) => d.split(':').reduce((s, part) => s * 60 + (Number(part) || 0), 0)
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`
const r3 = (n: number) => Math.round(n * 1000) / 1000 // identical style strings on server and client
const BARS = Array.from({ length: 64 }, (_, i) => ({
  h: r3(0.3 + 0.7 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.43))),
  dur: r3(0.8 + ((i * 37) % 9) / 10),
  delay: r3(-((i * 53) % 13) / 10),
}))

export default function AudioPlayer({ tracks }: { tracks: Track[] }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const track = tracks[index]
  const total = Math.max(1, toSeconds(track?.duration ?? '0'))

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setElapsed((e) => Math.min(total, e + 0.1)), 100)
    return () => clearInterval(id)
  }, [playing, total])

  // End of track: continue with the next one, stop after the last.
  useEffect(() => {
    if (elapsed < total) return
    setElapsed(0)
    if (index < tracks.length - 1) setIndex(index + 1)
    else setPlaying(false)
  }, [elapsed, total, index, tracks.length])

  const play = (i = index) => {
    if (i === index && playing) { setPlaying(false); return }
    if (i !== index) { setIndex(i); setElapsed(0) }
    setPlaying(true); setStarted(true)
  }

  if (!track) return null
  const progress = elapsed / total
  return (
    <div className="w-full">
      <div className="flex items-center gap-5">
        <button onClick={() => play()} aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
          className="group flex h-12 shrink-0 items-center gap-3 rounded-full border border-white/30 pl-4 pr-5 text-xs tracking-[.2em] transition-colors hover:border-white hover:bg-white hover:text-[#050608]">
          {playing
            ? <span className="flex h-3 gap-[3px]"><i className="w-[2px] bg-current" /><i className="w-[2px] bg-current" /></span>
            : <span className="ml-0.5 h-0 w-0 border-y-[6px] border-l-[9px] border-y-transparent border-l-current" />}
          <span className="w-[3.4em] text-left">{playing ? 'PAUSE' : 'PLAY'}</span>
        </button>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex justify-between gap-3 text-xs">
            <span className="truncate text-white/70">{String(index + 1).padStart(2, '0')} {track.title}</span>
            <span className="shrink-0 tabular-nums text-white/45">{fmt(elapsed)} / {track.duration}</span>
          </div>
          <div className="h-px bg-white/15"><div className="h-px bg-white transition-[width] duration-100 ease-linear" style={{ width: `${progress * 100}%` }} /></div>
        </div>
      </div>

      {/* Waveform appears on first play, freezes on pause; bars left of the playhead are lit. */}
      <div aria-hidden className={`flex items-center gap-[3px] overflow-hidden transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${started ? 'mt-6 h-9 opacity-100' : 'mt-0 h-0 opacity-0'}`}>
        {BARS.map((b, i) => (
          <span key={i} className="flex-1 rounded-full transition-colors duration-300"
            style={{
              height: `${b.h * 100}%`,
              background: i / BARS.length < progress ? '#fff' : 'rgba(255,255,255,.28)',
              animation: `wave ${b.dur}s ease-in-out ${b.delay}s infinite`,
              animationPlayState: playing ? 'running' : 'paused',
            }} />
        ))}
      </div>

      <ol className="mt-10 border-t border-white/15">
        {tracks.map((t, i) => {
          const current = i === index && started
          return (
            <li key={t.title}>
              <button onClick={() => play(i)} aria-current={current ? 'true' : undefined}
                className={`group flex w-full items-center gap-5 border-b border-white/10 py-4 text-left text-sm transition-colors hover:text-white ${current ? 'text-white' : 'text-white/75'}`}>
                <span className="w-7 tabular-nums text-white/35">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1">{t.title}</span>
                {current && playing && <span aria-hidden className="flex h-3 items-end gap-[2px]">{[0.9, 1.3, 1.1].map((d, k) => <i key={k} className="h-full w-[2px] origin-bottom bg-white" style={{ animation: `wave ${d}s ease-in-out ${-k * 0.3}s infinite` }} />)}</span>}
                <span className="tabular-nums text-white/45">{t.duration}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
