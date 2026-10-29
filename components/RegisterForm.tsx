'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Choice, Err, input, label } from './FormParts'
import { emptyRegistration, MAX_GUESTS, validateRegistration, type RegErrors, type Registration } from '@/lib/register'

type Done = { code: string; guests: number; repeat: boolean; mailed: boolean }

/** Sign-up for one event. `left` caps the guest choice when the seat count is known. */
export default function RegisterForm({ slug, date, left }: { slug: string; date: string; left: number | null }) {
  const router = useRouter()
  const [r, setR] = useState<Registration>(emptyRegistration)
  const [errors, setErrors] = useState<RegErrors>({})
  const [submitted, setSubmitted] = useState(false) // show errors live only after the first submit attempt
  const [status, setStatus] = useState<'idle' | 'sending' | 'failed' | 'full'>('idle')
  const [done, setDone] = useState<Done | null>(null)
  const [fullLeft, setFullLeft] = useState(0)
  const [focusError, setFocusError] = useState(0)
  const form = useRef<HTMLFormElement>(null)
  const maxGuests = Math.min(MAX_GUESTS, left ?? MAX_GUESTS)

  const set = <K extends keyof Registration>(k: K, v: Registration[K]) => {
    const next = { ...r, [k]: v }
    setR(next)
    if (submitted) setErrors(validateRegistration(next))
  }

  useEffect(() => {
    if (focusError) form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [focusError])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    const found = validateRegistration(r)
    setErrors(found)
    if (Object.keys(found).length) { setFocusError((n) => n + 1); return }
    setStatus('sending')
    try {
      const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, ...r }) })
      const data = await res.json().catch(() => ({}))
      if (res.status === 422 && data.errors) { setErrors(data.errors); setStatus('idle'); setFocusError((n) => n + 1); return }
      if (res.status === 409) { setFullLeft(data.left ?? 0); setStatus('full'); router.refresh(); return }
      if (!res.ok || !data.code) { setStatus('failed'); return }
      setDone({ code: data.code, guests: data.guests, repeat: data.repeat, mailed: data.mailed })
      router.refresh() // updates the seats left on the page
    } catch { setStatus('failed') }
  }

  if (done) {
    return (
      <div role="status" className="border-t border-white/15 pt-8">
        <p className="text-[11px] uppercase tracking-[.2em] text-white/50">{done.repeat ? 'Вы уже записаны' : 'Вы записаны'}</p>
        <p className="font-display mt-3 text-5xl tracking-tight md:text-6xl">{done.code}</p>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-white/70">
          Ждём вас {date}{done.guests > 1 ? `, вас ${done.guests}` : ''}. Оплата на входе — назовите номер брони.
        </p>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/50">
          {done.mailed
            ? `${done.repeat ? 'Повторно отправили' : 'Отправили'} письмо с номером брони на ${r.email}. Если его нет, проверьте папку «Спам».`
            : 'Письмо отправить не получилось — сохраните номер брони.'}
        </p>
      </div>
    )
  }

  if (maxGuests < 1) return <SoldOut />

  // ym-disable-keys on the form: Metrika Webvisor does not record what people type into it.
  return (
    <form ref={form} onSubmit={submit} noValidate className="ym-disable-keys grid gap-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <label htmlFor="name" className={label}>Имя</label>
          <input id="name" className={input} value={r.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" placeholder="Анна" aria-invalid={!!errors.name || undefined} aria-describedby="name-err" />
          <Err id="name-err" msg={errors.name} />
        </div>
        <div>
          <label htmlFor="email" className={label}>Email для подтверждения</label>
          <input id="email" type="email" inputMode="email" className={input} value={r.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@mail.ru" aria-invalid={!!errors.email || undefined} aria-describedby="email-err" />
          <Err id="email-err" msg={errors.email} />
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <label htmlFor="phone" className={label}>Телефон или Telegram <span className="normal-case tracking-normal text-white/30">— по желанию</span></label>
          <input id="phone" className={input} value={r.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" placeholder="+7 900 000 00 00 или @username" />
        </div>
        <fieldset>
          <legend className={label}>Сколько вас будет</legend>
          <div role="radiogroup" className="flex flex-wrap gap-2 pt-1" aria-describedby="guests-err">
            {Array.from({ length: MAX_GUESTS }, (_, i) => i + 1).map((n) => (
              <Choice key={n} name="guests" value={String(n)} checked={r.guests === n} onChange={() => set('guests', n)} invalid={!!errors.guests} disabled={n > maxGuests}>{n}</Choice>
            ))}
          </div>
          <Err id="guests-err" msg={errors.guests} />
        </fieldset>
      </div>

      {/* Honeypot: off-screen and skipped by keyboard and screen readers; only bots fill it in. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden value={r.website} onChange={(e) => set('website', e.target.value)} className="absolute -left-[9999px] h-px w-px opacity-0" />

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-white/70">
          <input type="checkbox" checked={r.consent} onChange={(e) => set('consent', e.target.checked)} aria-invalid={!!errors.consent || undefined} aria-describedby="consent-err" className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-white" />
          <span>Согласен(на) на обработку персональных данных для записи на мероприятие</span>
        </label>
        <Err id="consent-err" msg={errors.consent} />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <button type="submit" disabled={status === 'sending'} className="rounded-full border border-white/40 px-8 py-4 text-xs tracking-[.2em] transition-colors hover:border-white hover:bg-white hover:text-[#050608] disabled:opacity-50">
          {status === 'sending' ? 'ЗАПИСЫВАЕМ…' : 'ЗАПИСАТЬСЯ'}
        </button>
        {status === 'failed' && <p role="alert" className="text-xs text-[#ff9a9a]">Не получилось записаться. Попробуйте ещё раз или напишите на kronwerk.music.spb@gmail.com.</p>}
        {status === 'full' && <p role="alert" className="text-xs text-[#ff9a9a]">{fullLeft > 0 ? `Осталось только ${fullLeft} — выберите меньше гостей.` : 'Места только что закончились.'}</p>}
      </div>
    </form>
  )
}

export const SoldOut = () => (
  <div className="border-t border-white/15 pt-8">
    <p className="font-display text-3xl tracking-tight md:text-4xl">Мест нет.</p>
    <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">Все места на этот вечер заняты. Следите за другими событиями — или напишите нам, если освободится место.</p>
  </div>
)
