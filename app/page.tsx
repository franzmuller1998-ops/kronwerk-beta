import ColorFlow from '@/components/ColorFlow'

export default function Home() {
  return (
    <section className="relative h-[100svh] min-h-[560px] overflow-hidden">
      <ColorFlow variant="hero" palette="hero" speed={0.28} intensity={1.08} className="absolute inset-0" />
      {/* Roughens the marker's edges like a felt-tip stroke. Static filter, rendered once. */}
      <svg aria-hidden className="absolute h-0 w-0">
        <filter id="kw-marker-edge"><feTurbulence type="fractalNoise" baseFrequency=".035 .6" numOctaves="2" seed="7" /><feDisplacementMap in="SourceGraphic" scale="9" /></filter>
      </svg>
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-3 text-center">
        <h1 className="font-display relative whitespace-nowrap text-[12.2vw] font-extrabold uppercase leading-[.9] tracking-[-.055em]">
          <span aria-hidden className="kw-marker" />
          <span className="relative">KRONWERK</span>
        </h1>
        <p data-cursor="lg" className="font-display -mt-[.15vw] text-[8.8vw] font-extralight leading-none tracking-[.02em]">music</p>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-6 pb-8 text-[12px] leading-[1.5] md:px-10 md:pb-9">
        <p>Sound<br/>Shapes<br/>Tomorrow</p>
        <a href="#explore" className="flex items-center gap-4 text-xs">Scroll down <span className="h-[64px] w-px bg-white/80 md:h-[72px]" /></a>
      </div>
      <span id="explore" className="absolute bottom-0" />
    </section>
  )
}
