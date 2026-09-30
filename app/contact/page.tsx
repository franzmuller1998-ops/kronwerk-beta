import ColorFlow from '@/components/ColorFlow'
export default function Contact() {
  return (
    <main className="relative flex min-h-screen flex-col justify-end gap-12 px-6 pb-10 pt-32 md:flex-row md:items-end md:justify-between md:px-10">
      <ColorFlow palette="contact" intensity={0.85} speed={0.25} className="fixed inset-0 -z-10" />
      <h1 className="font-display w-fit text-[13vw] font-normal uppercase leading-[1] tracking-tight md:text-[8vw]">
        Звук<br />формирует<br />
        <span style={{ backgroundImage: 'linear-gradient(90deg,#2f6bff,#9b4dff,#ff3cc8,#ff7a1a)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>будущее.</span>
      </h1>
      <div className="space-y-6 text-sm md:mb-4">
        <a href="mailto:hello@kronwerk.music" className="ul block">hello@kronwerk.music</a>
        <ul className="space-y-2 text-white/70">{['Instagram', 'SoundCloud', 'Bandcamp', 'Spotify'].map((s) => <li key={s}><a href="#" className="ul transition-colors hover:text-white">{s}</a></li>)}</ul>
      </div>
    </main>
  )
}
