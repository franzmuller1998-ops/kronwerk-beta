import ColorFlow from '@/components/ColorFlow'

export default function Home() {
  return (
    <section className="relative h-[100svh] min-h-[560px] overflow-hidden">
      <ColorFlow variant="hero" palette="hero" speed={0.28} intensity={1.08} vignette={1.2} className="absolute inset-0" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-3 text-center">
        <h1 className="kw-underline font-display whitespace-nowrap text-[12.2vw] font-extrabold uppercase leading-[.9] tracking-[-.055em]">
          KRONWERK
          {/* Hand-drawn underline: a gentle wave that turns, under "RK", into the plan of a crownwork (кронверк):
              half-bastion, curtain, central bastion, curtain, half-bastion, points facing away from the letters. */}
          <svg aria-hidden viewBox="0 0 1000 80" fill="none">
            <path pathLength={1} d="M30 42 C220 34 470 50 700 40 C760 37 800 40 850 40 L855 63 L847 75 L867 69 L878 69 L888 83 L898 69 L909 69 L929 75 L921 63 L926 40 L990 40" />
          </svg>
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
