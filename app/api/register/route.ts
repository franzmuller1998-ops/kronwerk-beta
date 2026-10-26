import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getEvent } from '@/data/events'
import { normalizeRegistration, validateRegistration } from '@/lib/register'
import { callSheet, SEATS_TAG } from '@/lib/sheet'

type Result = { ok: boolean; error?: string; code?: string; guests?: number; left?: number; repeat?: boolean; mailed?: boolean }

// Guest sign-up for an event. The Apps Script checks seats against the event's capacity under a lock,
// issues the booking number, emails the confirmation and adds a row to the "Регистрации" sheet.
export async function POST(req: Request) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ ok: false }, { status: 400 }) }

  const event = typeof body.slug === 'string' ? getEvent(body.slug) : undefined
  if (!event) return NextResponse.json({ ok: false, error: 'unknown event' }, { status: 404 })

  const r = normalizeRegistration(body)
  if (r.website) return NextResponse.json({ ok: true, code: 'KW-0000', guests: r.guests, mailed: true }) // honeypot: bot, pretend success
  const errors = validateRegistration(r)
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422 })

  const { website: _honeypot, consent: _consent, ...fields } = r
  const res = await callSheet<Result>({ action: 'register', ...fields, event })
  if (!res) return NextResponse.json({ ok: false }, { status: 502 })
  if (!res.ok) {
    if (res.error === 'full') { revalidateTag(SEATS_TAG); return NextResponse.json({ ok: false, error: 'full', left: res.left ?? 0 }, { status: 409 }) }
    console.error('[register] sheet rejected the sign-up', event.slug, res.error)
    return NextResponse.json({ ok: false }, { status: 502 })
  }
  revalidateTag(SEATS_TAG)
  return NextResponse.json({ ok: true, code: res.code, guests: res.guests, repeat: !!res.repeat, mailed: res.mailed !== false })
}
