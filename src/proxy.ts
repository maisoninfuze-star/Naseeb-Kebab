import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { LOCALES, DEFAULT_LOCALE } from '@/data/dictionary'
import { SESSION_COOKIE, verifySession, passcodeAuthEnabled } from '@/lib/admin-auth'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseReady = Boolean(SUPABASE_URL && SUPABASE_ANON)

/**
 * Two jobs: gate /admin, and put every public request under a locale prefix.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) return guardAdmin(request)

  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  )
  if (hasLocale) return NextResponse.next()

  const accept = (request.headers.get('accept-language') ?? '').toLowerCase()
  // English only when it genuinely outranks French for this visitor.
  const en = accept.indexOf('en')
  const fr = accept.indexOf('fr')
  const prefersEnglish = en !== -1 && (fr === -1 || en < fr)

  const locale = prefersEnglish ? 'en' : DEFAULT_LOCALE
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url)
}

/** Send an unauthenticated visitor to the login page, remembering where they were headed. */
function toLogin(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const url = request.nextUrl.clone()
  url.pathname = '/admin/login'
  // Round-trip the intended destination so a bookmarked deep link still lands
  // where it was pointing after sign-in.
  url.search = `?next=${encodeURIComponent(pathname + search)}`
  return NextResponse.redirect(url)
}

/**
 * Admin gate.
 *
 * Two ways in, checked in that order: the shared passcode, and Supabase Auth.
 * The passcode path exists because the admin has to be usable before a
 * Supabase project does; when it is configured it is the only way in, so a
 * half-configured Supabase cannot be used to walk around it.
 *
 * With neither configured there is no way to authenticate anyone, so in
 * production the admin is refused outright rather than served unprotected. In
 * local development it stays open — the whole point of the dashboard is to
 * review the photo↔dish matches before either backend exists.
 *
 * The check runs here rather than per-page so a route added later is protected
 * by default. Missing a guard is a silent failure; the matcher makes it
 * structural. Server Actions are POSTs to the page URL they were defined on,
 * so they pass through here too — an unauthenticated save is redirected before
 * it reaches the store.
 */
async function guardAdmin(request: NextRequest) {
  if (request.nextUrl.pathname === '/admin/login') return NextResponse.next()

  if (passcodeAuthEnabled()) {
    return (await verifySession(request.cookies.get(SESSION_COOKIE)?.value))
      ? NextResponse.next()
      : toLogin(request)
  }

  if (!supabaseReady) {
    if (process.env.NODE_ENV === 'development') return NextResponse.next()
    return new NextResponse(
      'Administration unavailable: authentication is not configured.',
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const response = NextResponse.next()
  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) =>
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return toLogin(request)

  return response
}

export const config = {
  // Everything except Next internals, API routes and files with an extension.
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
