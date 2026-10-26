import type { PALETTES } from '@/components/ColorFlow'

// Upcoming events on /events. Dates are DD.MM; status is shown at the bottom of each card.
export type Event = { date: string; title: string; city: string; status: string; palette: keyof typeof PALETTES }

export const events: Event[] = [
  { date: '14.11', title: 'Бар X', city: 'Краснодар', status: 'Ожидается', palette: 'hero' },
  { date: '28.11', title: 'Ночной клуб', city: 'Краснодар', status: 'Ожидается', palette: 'about' },
  { date: '12.12', title: 'Бар', city: 'Санкт-Петербург', status: 'Ожидается', palette: 'contact' },
]
