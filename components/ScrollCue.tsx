import ScrollLink from './ScrollLink'

// Pulsing scroll cue (hero, all screens): a thin vertical oval with a chevron, a soft white glow that breathes
// outwards and a chevron that nudges down a few px. One 2.4s cycle; static with prefers-reduced-motion.
// Keyframes live here so the component is self-contained (they can be moved to globals.css as they are).
const css = `
.kw-cue-oval{box-shadow:0 0 10px rgb(255 255 255/.10);animation:kw-cue-pulse 2.4s ease-out infinite}
.kw-cue-arrow{animation:kw-cue-nudge 2.4s ease-in-out infinite}
@keyframes kw-cue-pulse{
  0%{box-shadow:0 0 0 0 rgb(255 255 255/.28),0 0 10px 0 rgb(255 255 255/.10)}
  50%{box-shadow:0 0 0 6px rgb(255 255 255/.10),0 0 16px 2px rgb(255 255 255/.22)}
  100%{box-shadow:0 0 0 12px rgb(255 255 255/0),0 0 10px 0 rgb(255 255 255/.10)}
}
@keyframes kw-cue-nudge{0%,100%{transform:translateY(-1px)}50%{transform:translateY(4px)}}
@media (prefers-reduced-motion:reduce){.kw-cue-oval,.kw-cue-arrow{animation:none}}
`

/**
 * Replaces the old "Ближайшие мероприятия" pill. The link keeps the old slot: it is exactly as tall as the pill was
 * (h-10) and the cue hangs below it, so the logo, title and subtitle stay where they were.
 */
export default function ScrollCue() {
  return (
    <>
      <style>{css}</style>
      <ScrollLink to="announce" className="kw-late-in group relative mt-8 block h-10 w-64">
        <span className="absolute inset-x-0 top-0 flex flex-col items-center gap-3">
          <span className="whitespace-nowrap text-xs uppercase tracking-[.2em] text-white/80 transition-colors group-hover:text-white">Ближайшие мероприятия</span>
          <span className="kw-cue-oval flex h-12 w-8 items-center justify-center rounded-full border border-white/80 transition-colors group-hover:border-white">
            <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="kw-cue-arrow h-4 w-4 text-white/90"><path d="M6 9l6 6 6-6" /></svg>
          </span>
        </span>
      </ScrollLink>
    </>
  )
}
