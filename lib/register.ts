// Event sign-up: fields, normalisation and validation shared by the form (components/RegisterForm.tsx)
// and the API route (app/api/register/route.ts), so both enforce the same rules.

export const MAX_GUESTS = 4

export type Registration = {
  name: string
  email: string // the confirmation with the booking number goes here
  phone: string // optional phone or Telegram for the organisers
  guests: number
  consent: boolean
  website: string // honeypot: hidden from people, bots fill it in
}
export type RegErrors = Partial<Record<keyof Registration, string>>

export const emptyRegistration = (): Registration => ({ name: '', email: '', phone: '', guests: 1, consent: false, website: '' })

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/** Coerces untrusted input (e.g. a request body) into a Registration with bounded field sizes. */
export function normalizeRegistration(input: unknown): Registration {
  const o = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  return {
    name: str(o.name, 80),
    email: str(o.email, 200),
    phone: str(o.phone, 80),
    guests: Number(o.guests),
    consent: o.consent === true,
    website: str(o.website, 200),
  }
}

export function validateRegistration(r: Registration): RegErrors {
  const e: RegErrors = {}
  if (!r.name) e.name = 'Укажите имя'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) e.email = 'Укажите email — на него придёт номер брони'
  if (!Number.isInteger(r.guests) || r.guests < 1 || r.guests > MAX_GUESTS) e.guests = `От 1 до ${MAX_GUESTS} человек`
  if (!r.consent) e.consent = 'Нужно согласие на обработку данных'
  return e
}
