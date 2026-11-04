import ColorFlow from '@/components/ColorFlow'
export default function Contact() {
  return (
    <main className="relative flex min-h-screen flex-col justify-end gap-12 px-6 pb-10 pt-32 md:items-center md:justify-center md:px-10 md:pb-16 md:text-center">
      <ColorFlow palette="contact" intensity={0.85} speed={0.25} className="fixed inset-0 -z-10" />
      <h1 className="font-display w-fit text-[13vw] font-normal uppercase leading-[1] tracking-tight md:text-[8vw]">
        Звук<br />формирует<br />
        <span style={{ backgroundImage: 'linear-gradient(90deg,#2f6bff,#9b4dff,#ff3cc8,#ff7a1a)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>будущее.</span>
      </h1>
      <div className="space-y-6 text-sm md:space-y-10 md:text-[1.75rem] md:leading-snug">
        <div><p className="mb-1 text-[11px] uppercase tracking-[.2em] text-white/50 md:mb-4 md:text-base">Для сотрудничества</p><a href="mailto:kronwerk.music.spb@gmail.com" className="ul">kronwerk.music.spb@gmail.com</a><p className="mt-2 md:mt-3"><a href="tel:+79011079360" className="ul">8 901 107 93 60</a> <span className="text-white/60">Георгий</span></p></div>
        <ul className="space-y-2 text-white/70 md:flex md:justify-center md:gap-10 md:space-y-0 md:text-lg">{['Instagram', 'SoundCloud', 'Bandcamp', 'Spotify'].map((s) => <li key={s}><a href="#" className="ul transition-colors hover:text-white">{s}</a></li>)}</ul>
      </div>
    </main>
  )
}
