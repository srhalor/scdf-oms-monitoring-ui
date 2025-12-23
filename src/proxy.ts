import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_CONFIG } from '@/utils/constants/authConfig'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Define public paths that don't need authentication checking
  // We include /api/auth because those endpoints (login, sso, refresh) handle their own auth or are entry points
  const publicPaths = ['/login', '/_next', '/static', '/favicon.ico', '/api/auth']
  
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // Clone headers for downstream use (e.g. x-pathname)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)
  
  // If public path, we still might want to redirect authenticated users away from /login
  if (isPublicPath) {
     if (pathname === '/login') {
         // In Production, /login is disabled; redirect to SSO
         if (!AUTH_CONFIG.isDevelopment) {
            return NextResponse.redirect(AUTH_CONFIG.sso.loginUrl)
         }

         const sessionCookie = request.cookies.get(AUTH_CONFIG.session.cookieName)
         if (sessionCookie?.value) {
             return NextResponse.redirect(new URL('/', request.url))
         }
     }
     return NextResponse.next({
         request: { headers: requestHeaders }
     })
  }

  // Check for existing session
  const sessionCookie = request.cookies.get(AUTH_CONFIG.session.cookieName)
  
  if (sessionCookie?.value) {
    // Session exists, allow request
    return NextResponse.next({
        request: { headers: requestHeaders }
    })
  }

  // No session - Handle Authentication Flow
  
  if (!AUTH_CONFIG.isDevelopment) {
    // Production: Check for SSO OAUTH_TOKEN
    const ssoCookie = request.cookies.get(AUTH_CONFIG.sso.cookieName)
    
    if (ssoCookie?.value) {
      // SSO cookie present but no internal session -> Redirect to SSO exchange handler
      // Pass 'next' param to return to orig path
      const ssoUrl = new URL('/api/auth/sso', request.url)
      ssoUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(ssoUrl)
    } else {
      // No SSO cookie -> Redirect to SSO Login
      return NextResponse.redirect(AUTH_CONFIG.sso.loginUrl)
    }
  } else {
    // Development: Redirect to local login
    return NextResponse.redirect(new URL('/login', request.url))
  }
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
