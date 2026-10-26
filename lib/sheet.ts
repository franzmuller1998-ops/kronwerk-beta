import { unstable_cache } from 'next/cache'

// Calls to the Google Apps Script web app (google-sheets/apply-webhook.gs) for event sign-ups.
// The secret goes as `auth`, not `token`: a script deployed before sign-ups existed rejects these calls
// instead of filing them as artist applications.
export async function callSheet<T extends { ok: boolean }>(payload: Record<string, unknown>): Promise<T | null> {
  const url = process.env.APPLY_SHEET_URL, auth = process.env.APPLY_SHEET_TOKEN
  if (!url || !auth) { console.warn('[sheet] APPLY_SHEET_URL / APPLY_SHEET_TOKEN not set'); return null }
  try {
    // Apps Script answers POST with a redirect to the result; fetch follows it.
    const res = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auth, ...payload }),
      signal: AbortSignal.timeout(15_000),
      cache: 'no-store',
    })
    const data = await res.json().catch(() => null)
    if (!res.ok || !data) { console.error('[sheet] bad response', payload.action, res.status); return null }
    if (data.error === 'forbidden') console.error('[sheet] forbidden: token mismatch, or the deployed script predates event sign-ups (deploy a new version)')
    return data as T
  } catch (err) {
    console.error('[sheet] request failed', payload.action, err)
    return null
  }
}

export const SEATS_TAG = 'seats'

/** Guests signed up per event slug, cached for a minute (and dropped after each sign-up); null if unknown. */
export const getTakenSeats = unstable_cache(
  async () => {
    const res = await callSheet<{ ok: boolean; taken?: Record<string, number> }>({ action: 'seats' })
    return res?.ok && res.taken ? res.taken : null
  },
  ['taken-seats'],
  { revalidate: 60, tags: [SEATS_TAG] },
)
