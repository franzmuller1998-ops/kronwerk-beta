'use client'
import { useEffect, useState } from 'react'

const toSeconds = (d: string) => d.split(':').reduce((s, part) => s * 60 + (Number(part) || 0), 0)
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export default function AudioPlayer({ duration='05:32' }: { duration?:string }) {
  const total = Math.max(1, toSeconds(duration))
  const [playing,setPlaying]=useState(false)
  const [elapsed,setElapsed]=useState(0)
  useEffect(()=>{
    if(!playing) return
    const id=setInterval(()=>setElapsed(e=>Math.min(total,e+0.1)),100)
    return()=>clearInterval(id)
  },[playing,total])
  // Stop at the end of the track instead of silently looping.
  useEffect(()=>{ if(elapsed>=total) setPlaying(false) },[elapsed,total])
  const toggle=()=>{
    if(!playing && elapsed>=total) setElapsed(0)
    setPlaying(!playing)
  }
  const progress=elapsed/total*100
  return (
    <div className="w-full">
      <div className="mb-3 flex items-center gap-4">
        <button aria-label={playing?'Pause':'Play'} onClick={toggle} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/30 transition-transform hover:scale-105">
          {playing ? <span className="flex gap-1"><i className="h-4 w-px bg-white"/><i className="h-4 w-px bg-white"/></span> : <span className="ml-0.5 h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-white" />}
        </button>
        <div className="flex-1">
          <div className="h-px bg-white/15"><div className="h-px bg-white transition-[width] duration-100" style={{width:`${progress}%`}} /></div>
        </div>
        <span className="text-xs tabular-nums text-white/50">{elapsed>0 ? `${fmt(elapsed)} / ` : ''}{duration}</span>
      </div>
      <div className="flex h-5 items-center gap-[2px] opacity-50">
        {Array.from({length:70}).map((_,i)=><span key={i} className="w-px bg-white" style={{height:`${4+Math.abs(Math.sin(i*1.7))*12}px`,opacity:playing?.75:.4}} />)}
      </div>
    </div>
  )
}
