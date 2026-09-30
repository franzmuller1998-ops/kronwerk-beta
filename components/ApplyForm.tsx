'use client'
import { useEffect, useRef, useState } from 'react'
import { emptyApplication, hasErrors, MAX_LINKS, MIN_AGE, SAMPLES, validate, type Application, type Errors } from '@/lib/apply'

const label = 'mb-2 block text-[11px] uppercase tracking-[.2em] text-white/50'
const input = 'w-full border-b border-white/25 bg-transparent py-3 text-lg outline-none transition-colors placeholder:text-white/25 focus:border-white aria-[invalid=true]:border-[#ff8a8a]'
const Err = ({ id, msg }: { id: string; msg?: string }) => (msg ? <p id={id} className="mt-2 text-xs text-[#ff9a9a]">{msg}</p> : null)
const Choice = ({ name, value, checked, onChange, children, invalid }: { name: string; value: string; checked: boolean; onChange: () => void; children: React.ReactNode; invalid?: boolean }) => (
  <label className="cursor-pointer">
    <input type="radio" name={name} value={value} checked={checked} onChange={onChange} aria-invalid={invalid || undefined} className="peer sr-only" />
    <span className="block rounded-full border border-white/25 px-4 py-2 text-sm transition-colors hover:border-white peer-checked:border-white peer-checked:bg-white peer-checked:text-[#050608] peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-white">{children}</span>
  </label>
)

export default function ApplyForm() {
  const [a, setA] = useState<Application>(emptyApplication)
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false) // show errors live only after the first submit attempt
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle')
  const [focusError, setFocusError] = useState(0)
  const form = useRef<HTMLFormElement>(null)

  const set = <K extends keyof Application>(k: K, v: Application[K]) => {
    const next = { ...a, [k]: v }
    setA(next)
    if (submitted) setErrors(validate(next))
  }
  const setLink = (i: number, v: string) => set('links', a.links.map((l, j) => (j === i ? v : l)))

  useEffect(() => {
    if (focusError) form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [focusError])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    const found = validate(a)
    setErrors(found)
    if (hasErrors(found)) { setFocusError((n) => n + 1); return }
    setStatus('sending')
    try {
      const res = await fetch('/api/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(a) })
      const data = await res.json().catch(() => ({}))
      if (res.status === 422 && data.errors) { setErrors(data.errors); setStatus('idle'); setFocusError((n) => n + 1); return }
      setStatus(res.ok ? 'sent' : 'failed')
    } catch { setStatus('failed') }
  }

  if (status === 'sent') {
    return (
      <div role="status" className="border-t border-white/15 pt-8">
        <p className="font-display text-3xl tracking-tight md:text-4xl">Заявка отправлена.</p>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">Спасибо, {a.artist}. Мы послушаем треки и ответим на {a.email}.</p>
        <button type="button" onClick={() => { setA(emptyApplication()); setErrors({}); setSubmitted(false); setStatus('idle') }} className="ul mt-8 text-xs tracking-[.2em]">ОТПРАВИТЬ ЕЩЁ ОДНУ</button>
      </div>
    )
  }

  const age = Number(a.age)
  return (
    <form ref={form} onSubmit={submit} noValidate className="grid gap-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <label htmlFor="artist" className={label}>Имя или псевдоним</label>
          <input id="artist" className={input} value={a.artist} onChange={(e) => set('artist', e.target.value)} autoComplete="nickname" placeholder="Chief Keef" aria-invalid={!!errors.artist || undefined} aria-describedby="artist-err" />
          <Err id="artist-err" msg={errors.artist} />
        </div>
        <div>
          <label htmlFor="email" className={label}>Email для ответа</label>
          <input id="email" type="email" inputMode="email" className={input} value={a.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" placeholder="you@mail.ru" aria-invalid={!!errors.email || undefined} aria-describedby="email-err" />
          <Err id="email-err" msg={errors.email} />
        </div>
      </div>

      <fieldset>
        <legend className={label}>Ссылки на треки</legend>
        <p className="-mt-1 mb-2 text-xs text-white/40">SoundCloud, Яндекс Музыка, Bandcamp, Google Диск — лучше с доступом по ссылке.</p>
        <div className="grid gap-2">
          {a.links.map((l, i) => (
            <div key={i}>
              <div className="flex items-end gap-4">
                <input type="url" inputMode="url" aria-label={`Ссылка на трек ${i + 1}`} className={input} value={l} onChange={(e) => setLink(i, e.target.value)} placeholder="https://soundcloud.com/…"
                  aria-invalid={!!errors.linkItems?.[i] || (!!errors.links && i === 0) || undefined} />
                {a.links.length > 1 && <button type="button" onClick={() => set('links', a.links.filter((_, j) => j !== i))} aria-label={`Убрать ссылку ${i + 1}`} className="pb-3 text-white/50 transition-colors hover:text-white">✕</button>}
              </div>
              <Err id={`link-${i}-err`} msg={errors.linkItems?.[i]} />
            </div>
          ))}
        </div>
        <Err id="links-err" msg={errors.links} />
        {a.links.length < MAX_LINKS && <button type="button" onClick={() => set('links', [...a.links, ''])} className="ul mt-4 text-xs tracking-[.2em] text-white/70">+ ДОБАВИТЬ ССЫЛКУ</button>}
      </fieldset>

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <label htmlFor="age" className={label}>Возраст</label>
          <input id="age" type="number" inputMode="numeric" min={MIN_AGE} max={100} className={`${input} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none`} value={a.age} onChange={(e) => set('age', e.target.value)} placeholder="25" aria-invalid={!!errors.age || undefined} aria-describedby="age-err" />
          <Err id="age-err" msg={errors.age} />
          {!errors.age && age >= MIN_AGE && age < 18 && <p className="mt-2 text-xs text-white/50">Для подписания договора понадобится согласие родителей.</p>}
        </div>
      </div>

      <fieldset>
        <legend className={label}>Есть ли в треках чужие семплы?</legend>
        <div role="radiogroup" className="flex flex-wrap gap-2" aria-describedby="samples-err">
          {SAMPLES.map(([v, t]) => <Choice key={v} name="samples" value={v} checked={a.samples === v} onChange={() => set('samples', v)} invalid={!!errors.samples}>{t}</Choice>)}
        </div>
        <Err id="samples-err" msg={errors.samples} />
        {a.samples && a.samples !== 'no' && (
          <div className="mt-6">
            <label htmlFor="samplesInfo" className={label}>Какие семплы и откуда</label>
            <textarea id="samplesInfo" rows={3} className={`${input} resize-y text-base`} value={a.samplesInfo} onChange={(e) => set('samplesInfo', e.target.value)} placeholder="Трек, исполнитель или библиотека (Splice, Loopmasters…)" aria-invalid={!!errors.samplesInfo || undefined} aria-describedby="samples-info-err" />
            <Err id="samples-info-err" msg={errors.samplesInfo} />
          </div>
        )}
      </fieldset>

      {/* Honeypot: off-screen and skipped by keyboard and screen readers; only bots fill it in. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden value={a.website} onChange={(e) => set('website', e.target.value)} className="absolute -left-[9999px] h-px w-px opacity-0" />

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-white/70">
          <input type="checkbox" checked={a.consent} onChange={(e) => set('consent', e.target.checked)} aria-invalid={!!errors.consent || undefined} aria-describedby="consent-err" className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-white" />
          <span>Согласен(на) на обработку персональных данных для рассмотрения заявки</span>
        </label>
        <Err id="consent-err" msg={errors.consent} />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <button type="submit" disabled={status === 'sending'} className="rounded-full border border-white/40 px-8 py-4 text-xs tracking-[.2em] transition-colors hover:border-white hover:bg-white hover:text-[#050608] disabled:opacity-50">
          {status === 'sending' ? 'ОТПРАВЛЯЕМ…' : 'ОТПРАВИТЬ ЗАЯВКУ'}
        </button>
        {status === 'failed' && <p role="alert" className="text-xs text-[#ff9a9a]">Не получилось отправить. Попробуйте ещё раз или напишите на hello@kronwerk.music.</p>}
      </div>
    </form>
  )
}
