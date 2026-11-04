import { NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { hasErrors, normalize, SAMPLES, validate } from '@/lib/apply'

// Each application goes to a Google Sheet through an Apps Script web app (google-sheets/apply-webhook.gs),
// configured with APPLY_SHEET_URL and APPLY_SHEET_TOKEN in .env.local. A JSON copy is also written to
// ./submissions (git-ignored) as a backup where the disk is writable; the applicant gets "ok" if either landed.
export async function POST(req: Request) {
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ ok: false }, { status: 400 }) }

  const a = normalize(body)
  if (a.website) return NextResponse.json({ ok: true }) // honeypot filled: bot, pretend success and drop it
  const errors = validate(a)
  if (hasErrors(errors)) return NextResponse.json({ ok: false, errors }, { status: 422 })

  const receivedAt = new Date().toISOString()
  const id = `${receivedAt.replace(/[:.]/g, '-')}-${Math.random().toString(36).slice(2, 8)}`
  const { website: _honeypot, ...fields } = a
  const record = { id, receivedAt, ...fields, links: fields.links.filter(Boolean), samplesInfo: fields.samples === 'no' ? '' : fields.samplesInfo }

  const [sheet, file] = await Promise.all([toSheet(record), toFile(record)])
  if (!sheet && !file) return NextResponse.json({ ok: false }, { status: 502 })
  return NextResponse.json({ ok: true, id })
}

type ApplicationRecord = { id: string; receivedAt: string; samples: string } & Record<string, unknown>

async function toSheet(record: ApplicationRecord) {
  const url = process.env.APPLY_SHEET_URL, token = process.env.APPLY_SHEET_TOKEN
  if (!url || !token) { console.warn('[apply] APPLY_SHEET_URL / APPLY_SHEET_TOKEN not set; application not sent to Google Sheets'); return false }
  const samplesLabel = SAMPLES.find(([v]) => v === record.samples)?.[1] ?? record.samples
  try {
    // Apps Script answers POST with a redirect to the result; fetch follows it.
    const res = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, ...record, samplesLabel }),
      signal: AbortSignal.timeout(10_000),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok || !data?.ok) { console.error('[apply] Google Sheets rejected the application', record.id, res.status, data); return false }
    return true
  } catch (err) {
    console.error('[apply] Google Sheets request failed', record.id, err)
    return false
  }
}

async function toFile(record: ApplicationRecord) {
  try {
    const dir = path.join(process.cwd(), 'submissions')
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, `${record.id}.json`), JSON.stringify(record, null, 2), 'utf8')
    return true
  } catch (err) {
    console.error('[apply] could not write backup file', record.id, err)
    return false
  }
}
