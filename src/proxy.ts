import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ENV_CONFIG } from '@/config/env.config'
import { isDevelopment } from '@/utils/envUtils'
import { getServerCookie } from '@/utils/cookieUtils'

export async function proxy(request: NextRequest) {
  let { pathname } = request.nextUrl

  // If Production and /login -> Redirect to / as SSO will handle login
  if (pathname === '/login' && !isDevelopment) {
    pathname = '/'
  }

  // Setup Request Headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  // Check if public path
  const publicPaths = ['/login', '/_next', '/static', '/favicon.ico', '/api/auth']
  const isPublic = publicPaths.some(path => pathname.startsWith(path))
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
    const loginUrl = new URL(`${process.env.NEXTJS_BASEPATH || ''}/login`, request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If production and no session, check for SSO Cookie for seamless exchange
  const assertion = await getServerCookie(ENV_CONFIG.sso.cookieName)

  if (assertion) {
    const ssoUrl = new URL('/api/auth/sso', request.url)
    ssoUrl.searchParams.set('next', pathname)
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
