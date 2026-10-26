import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import ColorFlow from '@/components/ColorFlow'

export const metadata: Metadata = { title: 'О нас · KRONWERK music', description: 'KRONWERK — площадка для концертов независимых исполнителей.' }

const g = (...c: string[]) => ({ backgroundImage: `linear-gradient(90deg,${c.join(',')})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' } as const)
const roles = [
  ['Исполнителям', '/apply', 'Подать заявку', 'Подайте заявку и пришлите треки. Мы послушаем, подберём дату, площадку и состав вечера, а дальше возьмём на себя организацию: звук, свет, афишу и продвижение.'],
  ['Гостям', '/events', 'Смотреть события', 'Выберите концерт и запишитесь на сайте — номер брони придёт на почту. Оплата на входе, остальное просто музыка.'],
] as const

export default function About() {
  return (
    <main className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-6 pb-10 pt-28 md:px-10 md:pt-36">
      {/* Backdrop: the concert photo is a band under the heading on phones and fills the right side on wider screens, fading into
          the page colour at its edges so the text stays readable; the COLOR FLOW plays across the top and fades out
          over the photo (screen blend, so its dark base adds nothing). */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[#050608]">
        <div className="absolute inset-x-0 top-[330px] h-[125vw] md:inset-y-0 md:left-[32%] md:h-auto">
          <Image src="/about-stage.webp" alt="" fill priority sizes="(min-width: 768px) 68vw, 100vw" className="object-cover object-[32%_50%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050608] via-[#050608]/10 via-40% to-transparent" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-[#050608] via-[#050608]/30 via-35% to-transparent md:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-[#050608]/50 via-20% to-transparent to-45% md:via-[#050608]/20 md:via-30% md:to-100%" />
        </div>
        <ColorFlow palette="about" intensity={0.6} speed={0.22} className="absolute inset-x-0 top-0 h-[55%] mix-blend-screen [mask-image:linear-gradient(to_bottom,#000_25%,transparent)]" />
      </div>

      <div className="font-display font-light uppercase tracking-tight">
        <h1 className="text-[14vw] leading-[.95] md:text-[6.4vw]">KRONWERK <span style={g('#00d5ff', '#9b4dff', '#ff3cc8')}>Music</span></h1>
        <div className="mt-6 flex gap-[.35em] text-[6.6vw] leading-[1.12] md:mt-[2.2vw] md:ml-[2.6vw] md:text-[3.1vw]">
          <span aria-hidden>—</span>
          <div>
            <p>Площадка, где <br className="max-md:hidden" />исполнители находят <br className="max-md:hidden" />своих слушателей.</p>
            <p className="mt-[.9em] w-fit text-[.78em]" style={g('#00d5ff', '#b06bff')}>Следующий концерт<br />уже здесь.</p>
          </div>
        </div>
      </div>

      <div className="mt-[78vw] grid max-w-4xl gap-10 text-sm leading-relaxed md:mt-16 md:grid-cols-2 md:gap-0">
        {roles.map(([title, href, cta, text], i) => (
          <div key={title} className={i ? 'md:border-l md:border-white/25 md:pl-10' : 'md:pr-10'}>
            <div className="relative mb-3 w-fit text-[13px] uppercase tracking-[.2em] text-white">
              {/* Phones: a pill behind the whole word playing the same COLOR FLOW as the top of the page. The flow's
                  pattern scales with its canvas height, so the pill is a window onto a screen-sized canvas (same
                  filaments as the top) rather than a 30px canvas that would blow the pattern up into soft blobs.
                  No dark centre, so the colour reaches the middle of the word. */}
              <div aria-hidden className="absolute -inset-x-3 -inset-y-1.5 overflow-hidden rounded-full md:hidden">
                <ColorFlow palette="about" intensity={0.9} speed={0.22} vignette={0.05} className="absolute left-0 top-1/2 h-[55svh] w-[100vw] -translate-y-1/2" />
              </div>
              <span className="relative [text-shadow:0_1px_6px_rgba(5,6,8,.6)]">{title}</span>
            </div>
            <p className="text-white/70">{text}</p>
            <Link href={href} className="ul mt-5 inline-block text-[12px] uppercase tracking-[.2em]">{cta} →</Link>
          </div>
        ))}
      </div>
    </main>
  )
}
