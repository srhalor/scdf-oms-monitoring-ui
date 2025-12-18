import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_CONFIG } from '@/utils/constants/authConfig'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check for session cookie
  const sessionCookie = request.cookies.get(AUTH_CONFIG.session.cookieName)
  const isAuthenticated = !!sessionCookie?.value

  const isLoginPage = pathname === '/login'
  
  // Redirect logic
  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!isLoginPage && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Clone the request headers and add pathname
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  // Return response with updated headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

// Run proxy on all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
