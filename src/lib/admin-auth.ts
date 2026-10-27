/**
 * ADMIN SESSION — signed cookie, no database required.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY NOT SUPABASE AUTH
 * ═══════════════════════════════════════════════════════════════════
 * Supabase Auth is the better answer once a Supabase project exists, and the
 * login page still uses it when one does. But the admin has to be usable
 * before then, and "the dashboard is locked until you create a database
 * account" is the same dead end the read-only version was.
 *
 * So: one shared passcode, held in `ADMIN_PASSCODE`, exchanged for an
 * HMAC-signed cookie. The passcode is never stored in a cookie or sent back to
 * the browser — the cookie carries an expiry and a signature over it, and
 * nothing else. Without `ADMIN_SESSION_SECRET` no valid cookie can be minted,
 * so a leaked cookie from one deployment is worthless against another.
 *
 * Web Crypto, not `node:crypto`, because this same code runs in the middleware
 * on the Edge runtime where the Node module does not exist.
 *
 * Deliberately not built here: password reset, per-user accounts, audit trail.
 * One restaurant, one or two staff. Anything more is Supabase's job, and the
 * migration path to it is already open.
 */

export const SESSION_COOKIE = 'nk_admin'

/** Eight hours — a shift, not a month. */
const TTL_SECONDS = 60 * 60 * 8

const enc = new TextEncoder()

const secret = () => process.env.ADMIN_SESSION_SECRET ?? ''
export const passcode = () => process.env.ADMIN_PASSCODE ?? ''

/** The passcode path is available only when BOTH values are configured. */
export const passcodeAuthEnabled = () => Boolean(secret() && passcode())

async function key() {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

const b64url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

/** `<expiryEpochSeconds>.<hmac>` */
export async function mintSession(): Promise<{ value: string; maxAge: number }> {
  const exp = String(Math.floor(Date.now() / 1000) + TTL_SECONDS)
  const sig = await crypto.subtle.sign('HMAC', await key(), enc.encode(exp))
  return { value: `${exp}.${b64url(sig)}`, maxAge: TTL_SECONDS }
}

export async function verifySession(value: string | undefined): Promise<boolean> {
  if (!value || !secret()) return false

  const [exp, sig] = value.split('.')
  if (!exp || !sig) return false

  // Expiry first: an expired cookie is rejected even if the signature is good.
  if (Number(exp) * 1000 < Date.now()) return false

  const expected = await crypto.subtle.sign('HMAC', await key(), enc.encode(exp))
  // Constant-time compare — a plain `===` short-circuits on the first differing
  // character, which is a MAC-verification timing oracle. The passcode path was
  // already careful about this; the signature check now matches.
  return timingSafeEqual(b64url(expected), sig)
}

/**
 * Constant-time byte comparison.
 *
 * A naive `===` returns as soon as two bytes differ, which leaks the length of
 * the matching prefix to anyone who can time the response. The XOR-accumulate
 * below always walks the full length.
 */
function timingSafeEqual(x: string, y: string): boolean {
  const a = enc.encode(x)
  const b = enc.encode(y)
  let diff = a.length ^ b.length
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0)
  }
  return diff === 0
}

export function passcodeMatches(input: string): boolean {
  const expected = passcode()
  if (!expected) return false
  return timingSafeEqual(input, expected)
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  secure: process.env.NODE_ENV === 'production',
} as const
