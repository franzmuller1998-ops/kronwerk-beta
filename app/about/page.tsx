import ColorFlow from '@/components/ColorFlow'
const g = (a: string, b: string) => ({ backgroundImage: `linear-gradient(90deg,${a},${b})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' } as const)
export default function About() {
  return (
    <main className="relative flex min-h-screen flex-col justify-between px-6 pb-10 pt-32 md:px-10">
      <ColorFlow palette="about" intensity={0.8} speed={0.22} className="fixed inset-0 -z-10" />
      <h1 className="font-display w-fit text-[7.4vw] font-normal uppercase leading-[1.08] tracking-tight md:text-[4.6vw]">
        KRONWERK —<br />независимый<br />музыкальный лейбл,<br />посвящённый<br />
        <span style={g('#2f6bff', '#9b4dff')}>электронной музыке,</span><br />
        <span style={g('#9b4dff', '#ff7a1a')}>экспериментам</span><br />и <span style={{ color: '#ff8a1f' }}>звуку.</span>
      </h1>
      <p className="mt-24 max-w-sm text-xs leading-relaxed text-white/60">KRONWERK music — независимый цифровой лейбл, который раздвигает границы электронной музыки.</p>
    </main>
  )
}
