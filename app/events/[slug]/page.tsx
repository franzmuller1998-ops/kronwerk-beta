import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ColorFlow from '@/components/ColorFlow'
import RegisterForm from '@/components/RegisterForm'
import { events, getEvent, seatsLeft, seatsStatus } from '@/data/events'
import { getTakenSeats } from '@/lib/sheet'

export const revalidate = 60 // seat counts; a sign-up also refreshes them right away
export const generateStaticParams = () => events.map((e) => ({ slug: e.slug }))

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = getEvent((await params).slug)
  return e ? { title: `${e.title}, ${e.city} · ${e.date} · KRONWERK music`, description: `Запись на вечер KRONWERK music: ${e.title}, ${e.city}, ${e.date}.` } : {}
}

export default async function EventPage({ params }: Props) {
  const event = getEvent((await params).slug)
  if (!event) notFound()
  const left = seatsLeft(event, await getTakenSeats())
  const facts = [['Время', event.time ?? 'уточняется'], ['Адрес', event.address ?? 'уточняется'], ['Вход', 'оплата на месте'], ['Места', seatsStatus(left)]]

  return (
    <main className="relative min-h-screen px-6 pb-24 pt-28 md:px-10 md:pt-32">
      <ColorFlow palette={event.palette} intensity={0.45} speed={0.2} className="fixed inset-0 -z-10" />
      <div className="grid gap-12 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Link href="/events" className="ul text-[11px] uppercase tracking-[.2em] text-white/60">← Все события</Link>
          <p className="mt-8 text-sm">{event.date}</p>
          <h1 className="font-display mt-2 w-fit text-[13vw] font-light leading-none tracking-tight md:text-[5vw]">{event.title}</h1>
          <p className="mt-3 text-sm text-white/80">{event.city}</p>
          <dl className="mt-8 grid max-w-sm grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            {facts.map(([k, v]) => <div key={k} className="contents"><dt className="text-white/50">{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </div>
        <div>
          <h2 className="mb-8 text-[11px] uppercase tracking-[.2em] text-white/50">Запись на вечер</h2>
          <RegisterForm slug={event.slug} date={event.date} left={left} />
        </div>
      </div>
    </main>
  )
}
