import ScrollLink from '@/components/ScrollLink'
import ColorFlow from '@/components/ColorFlow'
import ArtistCarousel from '@/components/ArtistCarousel'
import { announcement } from '@/data/announcement'

export default function Home() {
  return (
    <div className="relative">
      {/* One colour field for the whole page: sticky (not fixed, so ancestors with transforms/filters, e.g. the page
          transition, cannot break it) and pulled out of the flow with a negative margin. It stays put while the
          sections scroll over it. */}
      <div aria-hidden className="pointer-events-none sticky top-0 z-0 -mb-[100lvh] h-[100lvh]">
        <ColorFlow variant="hero" palette="hero" speed={0.28} intensity={1.08} vignette={1.2} className="absolute inset-0" />
      </div>
      <section className="relative z-10 h-[100svh] min-h-[560px]">
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-3 text-center">
          <h1 className="kw-underline font-display whitespace-nowrap text-[12.2vw] font-extrabold uppercase leading-[.9] tracking-[-.055em] md:text-[8.4vw] md:tracking-[-.01em]">
            KRONWERK
            {/* Hand-drawn underline: a gentle wave that turns, under "RK", into the plan of a crownwork (кронверк):
                half-bastion, curtain, central bastion, curtain, half-bastion, points facing away from the letters.
                Phones (< md) get the crownwork at full size so it stays readable; wider screens a half-size one. */}
            <svg aria-hidden viewBox="0 0 1000 80" fill="none">
              <path className="md:hidden" pathLength={1} d="M30 42 C220 34 470 50 700 40 C760 37 790 40 812 40 L822 86 L806 110 L846 98 L868 98 L888 126 L908 98 L930 98 L970 110 L954 86 L964 40 L990 40" />
              <path className="max-md:hidden" pathLength={1} d="M30 42 C220 34 470 50 700 40 C760 37 800 40 850 40 L855 63 L847 75 L867 69 L878 69 L888 83 L898 69 L909 69 L929 75 L921 63 L926 40 L990 40" />
            </svg>
          </h1>
          <p data-cursor="lg" className="font-display -mt-[.15vw] text-[8.8vw] font-extralight md:text-[6vw] leading-none tracking-[.02em]">music</p>
          <p className="mt-6 text-sm leading-relaxed text-white/50 md:mt-8 md:text-base">Площадка для новых имён.</p>
          {/* Phones only: fades in 2s after the page opens (.kw-late-in in globals.css). */}
          <ScrollLink to="announce" className="kw-late-in mt-8 rounded-full border border-white/70 px-7 py-2.5 text-sm transition-colors hover:border-white hover:bg-white hover:text-[#050608] md:hidden">Ближайшие мероприятия</ScrollLink>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-6 pb-8 text-[12px] leading-[1.5] md:px-10 md:pb-9">
          <p>Организация<br/>концертов<br/>и букинг артистов</p>
          <p className="text-right text-xs">© KRON Music 2026 <br className="md:hidden" />Все права защищены</p>
        </div>
      </section>
      <ArtistCarousel {...announcement} />
    </div>
  )
}
