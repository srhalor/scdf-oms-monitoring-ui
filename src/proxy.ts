import { NextResponse } from 'next/server'
import { ENV_CONFIG } from '@/config/env.config'
import { getServerCookie } from '@/utils/cookieUtils'
import { isDevelopment } from '@/utils/envUtils'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const basePath = process.env.NEXTJS_BASEPATH || ''

  // Strip basePath from pathname for internal logic
  const pathWithoutBase = basePath && pathname.startsWith(basePath) 
    ? pathname.slice(basePath.length) || '/'
    : pathname

  // Setup Request Headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathWithoutBase)

  // Check if public path (check against path without basePath)
  const publicPaths = ['/login', '/_next', '/static', '/favicon.ico', '/api/auth']
  const isPublic = publicPaths.some(path => pathWithoutBase.startsWith(path))
  // Check if session exists
  const session = await getServerCookie(ENV_CONFIG.session.cookieName)

  // Allow if Authenticated OR Public
  if (session || isPublic) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  // Handle Unauthenticated Private Access
  if (isDevelopment()) {
    // Development: Redirect to local login
    const loginUrl = new URL(`${basePath}/login`, request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If production and no session, check for SSO Cookie for seamless exchange
  const assertion = await getServerCookie(ENV_CONFIG.sso.cookieName)

  if (assertion) {
    const ssoUrl = new URL(`${basePath}/api/auth/sso`, request.url)
    ssoUrl.searchParams.set('next', pathWithoutBase)
    return NextResponse.redirect(ssoUrl)
  }

  // If production and no session, no assertion -> Redirect to SSO login page
  return NextResponse.redirect(ENV_CONFIG.sso.loginUrl)
}

// Run proxy on all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - fonts (static fonts)
     * - favicon.ico (favicon file)
     * - .well-known (browser/devtools known files)
     */
    '/((?!api|_next/static|_next/image|fonts|favicon.ico|.well-known).*)',
  ],
}
