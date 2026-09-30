import { NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { hasErrors, normalize, validate } from '@/lib/apply'

// Stores each application as a JSON file in ./submissions (git-ignored). This works for `next dev` and
// `next start` on a server with a writable disk; on serverless hosting, swap the write for email/Telegram/CRM.
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

  const dir = path.join(process.cwd(), 'submissions')
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, `${id}.json`), JSON.stringify(record, null, 2), 'utf8')
  return NextResponse.json({ ok: true, id })
}
