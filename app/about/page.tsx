import type { Metadata } from 'next'
import Link from 'next/link'
import ColorFlow from '@/components/ColorFlow'

export const metadata: Metadata = { title: 'О нас · KRONWERK music', description: 'KRONWERK — площадка для концертов независимых исполнителей.' }

const g = (a: string, b: string) => ({ backgroundImage: `linear-gradient(90deg,${a},${b})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' } as const)
const roles = [
  ['Исполнителям', '/apply', 'Подать заявку', 'Подайте заявку и пришлите треки. Мы послушаем, подберём дату, площадку и состав вечера, а дальше возьмём на себя организацию: звук, свет, афишу и продвижение.'],
  ['Гостям', '/events', 'Смотреть события', 'Выберите концерт, зарегистрируйтесь и получите билет. На входе достаточно показать его с телефона — остальное просто музыка.'],
] as const

export default function About() {
  return (
    <main className="relative flex min-h-screen flex-col justify-between px-6 pb-10 pt-32 md:px-10">
      <ColorFlow palette="about" intensity={0.8} speed={0.22} className="fixed inset-0 -z-10" />
      <h1 className="font-display w-fit text-[7.4vw] font-normal uppercase leading-[1.08] tracking-tight md:text-[4.6vw]">
        KRONWERK —<br />площадка, где<br />исполнители<br />выходят на сцену,<br />
        <span style={g('#2f6bff', '#9b4dff')}>а гости находят</span><br />
        <span style={g('#9b4dff', '#ff7a1a')}>свой концерт</span><br />и <span style={{ color: '#ff8a1f' }}>свой звук.</span>
      </h1>
      <div className="mt-24 grid max-w-3xl gap-10 text-xs leading-relaxed md:grid-cols-2">
        {roles.map(([title, href, cta, text]) => (
          <div key={title}>
            <p className="mb-3 text-[11px] uppercase tracking-[.2em] text-white">{title}</p>
            <p className="text-white/60">{text}</p>
            <Link href={href} className="ul mt-4 inline-block text-[11px] uppercase tracking-[.2em]">{cta} →</Link>
          </div>
        ))}
      </div>
    </main>
  )
}
