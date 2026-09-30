// Demo / collaboration application: field options, normalisation and validation shared by the form
// (components/ApplyForm.tsx) and the API route (app/api/apply/route.ts), so both enforce the same rules.

export const SAMPLES = [
  ['no', 'Нет, всё своё'],
  ['cleared', 'Да, с разрешением или из лицензированных библиотек'],
  ['uncleared', 'Да, без разрешения'],
] as const

export const MAX_LINKS = 5
export const MIN_AGE = 14

export type Application = {
  artist: string
  email: string
  links: string[]
  age: string
  samples: string
  samplesInfo: string
  consent: boolean
  website: string // honeypot: hidden from people, bots fill it in
}
export type Errors = Partial<Record<keyof Application, string>> & { linkItems?: (string | undefined)[] }

export const emptyApplication = (): Application => ({
  artist: '', email: '', links: [''], age: '', samples: '', samplesInfo: '', consent: false, website: '',
})

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/** Coerces untrusted input (e.g. a request body) into an Application with bounded field sizes. */
export function normalize(input: unknown): Application {
  const o = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const links = Array.isArray(o.links) ? o.links.slice(0, MAX_LINKS).map((l) => str(l, 500)) : []
  return {
    artist: str(o.artist, 80),
    email: str(o.email, 200),
    links: links.length ? links : [''],
    age: str(o.age, 3),
    samples: str(o.samples, 20),
    samplesInfo: str(o.samplesInfo, 1000),
    consent: o.consent === true,
    website: str(o.website, 200),
  }
}

const isUrl = (s: string) => {
  try { const u = new URL(s); return (u.protocol === 'https:' || u.protocol === 'http:') && u.hostname.includes('.') } catch { return false }
}

export function validate(a: Application): Errors {
  const e: Errors = {}
  if (!a.artist) e.artist = 'Укажите имя или псевдоним'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)) e.email = 'Укажите email, на который мы ответим'

  const filled = a.links.filter(Boolean)
  const linkItems = a.links.map((l) => (l && !isUrl(l) ? 'Ссылка должна начинаться с https://' : undefined))
  if (linkItems.some(Boolean)) e.linkItems = linkItems
  if (!filled.length) e.links = 'Добавьте хотя бы одну ссылку на трек'

  const age = Number(a.age)
  if (!a.age || !Number.isInteger(age)) e.age = 'Укажите возраст числом'
  else if (age < MIN_AGE || age > 100) e.age = `Принимаем заявки от ${MIN_AGE} лет`

  if (!SAMPLES.some(([v]) => v === a.samples)) e.samples = 'Ответьте про семплы'
  else if (a.samples !== 'no' && a.samplesInfo.length < 3) e.samplesInfo = 'Опишите, какие семплы и откуда'

  if (!a.consent) e.consent = 'Нужно согласие на обработку данных'
  return e
}

export const hasErrors = (e: Errors) => Object.keys(e).length > 0
