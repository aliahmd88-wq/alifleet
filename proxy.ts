import { NextRequest, NextResponse } from 'next/server'
import {
  LOCALE_HEADER,
  LOCALE_STORAGE_KEY,
  defaultLocale,
  isLocale,
  type Locale,
} from '@/lib/i18n/config'
import {
  localePrefixedPrivatePathname,
  resolvePublicPathname,
} from '@/lib/i18n/routing'

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function withLocaleCookie(
  response: NextResponse,
  request: NextRequest,
  locale: Locale
) {
  if (request.cookies.get(LOCALE_STORAGE_KEY)?.value !== locale) {
    response.cookies.set(LOCALE_STORAGE_KEY, locale, {
      path: '/',
      maxAge: COOKIE_MAX_AGE,
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
    })
  }
  return response
}

function requestHeaders(request: NextRequest, locale: Locale) {
  const headers = new Headers(request.headers)
  headers.set(LOCALE_HEADER, locale)
  return headers
}

function localeRedirect(
  request: NextRequest,
  pathname: string,
  locale: Locale,
  removeLocaleQuery = true
) {
  const current = request.nextUrl.clone()
  if (removeLocaleQuery) current.searchParams.delete('locale')
  // NextURL normalises a trailing slash away when it formats a pathname, so
  // the canonical `/products/` came out as `/products`: every request without
  // the slash was redirected to itself, forever. Build the Location by hand so
  // the canonical form survives; `/products/` then matches and is served.
  const location = `${current.origin}${pathname}${current.search}${current.hash}`
  return withLocaleCookie(
    NextResponse.redirect(location, { status: 308 }),
    request,
    locale
  )
}

/**
 * The store moved to Lion Car. Every catalogue, vehicle, basket, checkout,
 * account and article URL — in any of its Hebrew, Arabic, English or legacy
 * spellings — is answered with a permanent redirect to the same page on
 * lioncar.co.il, so old links, bookmarks and search results keep working.
 */
const LION_CAR_ORIGIN = 'https://lioncar.co.il'
const MOVED_ROOTS = new Set(['products', 'cars', 'cart', 'checkout', 'account', 'my-account', 'blog', 'cms', 'wc-ajax'])

function movedToLionCar(request: NextRequest): NextResponse | null {
  const { pathname, searchParams } = request.nextUrl
  const requestedLocale = searchParams.get('locale')
  const publicRoute = resolvePublicPathname(pathname, requestedLocale)
  const prefixedPrivate = publicRoute ? null : localePrefixedPrivatePathname(pathname)
  const cookieLocale = request.cookies.get(LOCALE_STORAGE_KEY)?.value
  const locale: Locale =
    publicRoute?.locale ??
    prefixedPrivate?.locale ??
    (isLocale(requestedLocale) ? requestedLocale : isLocale(cookieLocale) ? cookieLocale : defaultLocale)
  const internal = publicRoute?.internalPathname ?? prefixedPrivate?.pathname ?? pathname
  const root = internal.split('/').filter(Boolean)[0] ?? ''
  if (!MOVED_ROOTS.has(root)) return null

  const target = new URL(`/${locale}${internal.replace(/\/+$/, '')}`, LION_CAR_ORIGIN)
  searchParams.forEach((value, key) => {
    if (key !== 'locale') target.searchParams.append(key, value)
  })
  return NextResponse.redirect(target, { status: 301 })
}

/** The owner's habit: typing /wp-admin on alifleet.com opens its own WordPress (cms.alifleet.com). */
const WP_ADMIN_ORIGIN = process.env.WORDPRESS_STORE_URL?.replace(/\/+$/, '') || 'https://cms.alifleet.com'

export function proxy(request: NextRequest) {
  const adminPath = request.nextUrl.pathname
  if (/^\/(?:[a-z]{2}\/)?(?:wp-admin|wp-login\.php)(?:\/|$)/.test(adminPath)) {
    const target = adminPath.replace(/^\/[a-z]{2}(?=\/)/, '')
    return NextResponse.redirect(`${WP_ADMIN_ORIGIN}${target}${request.nextUrl.search}`, 307)
  }

  const moved = movedToLionCar(request)
  if (moved) return moved

  const { pathname, searchParams } = request.nextUrl
  const requestedLocale = searchParams.get('locale')
  const publicRoute = resolvePublicPathname(pathname, requestedLocale)

  if (publicRoute) {
    const mustRedirect =
      pathname !== publicRoute.canonicalPathname || isLocale(requestedLocale)

    if (mustRedirect) {
      return localeRedirect(
        request,
        publicRoute.canonicalPathname,
        publicRoute.locale
      )
    }

    const headers = requestHeaders(request, publicRoute.locale)
    const response =
      publicRoute.internalPathname === pathname
        ? NextResponse.next({ request: { headers } })
        : NextResponse.rewrite(
            new URL(
              `${publicRoute.internalPathname}${request.nextUrl.search}`,
              request.url
            ),
            { request: { headers } }
          )

    return withLocaleCookie(response, request, publicRoute.locale)
  }

  const prefixedPrivate = localePrefixedPrivatePathname(pathname)
  if (prefixedPrivate) {
    return localeRedirect(
      request,
      prefixedPrivate.pathname,
      prefixedPrivate.locale
    )
  }

  const cookieLocale = request.cookies.get(LOCALE_STORAGE_KEY)?.value
  const locale = isLocale(requestedLocale)
    ? requestedLocale
    : isLocale(cookieLocale)
      ? cookieLocale
      : defaultLocale

  if (isLocale(requestedLocale)) {
    return localeRedirect(request, pathname, locale)
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders(request, locale) },
  })
  return withLocaleCookie(response, request, locale)
}

export const config = {
  matcher: [
    '/((?!api(?:/|$)|_next(?:/|$)|favicon.ico$|icon.png$|apple-icon.png$|robots.txt$|sitemap.xml$|.*\\.[a-zA-Z0-9]+$).*)',
  ],
}
