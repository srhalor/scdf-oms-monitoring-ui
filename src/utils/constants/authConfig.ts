import type { AuthMode } from '@/types/auth'

export const AUTH_CONFIG = {
  mode: (process.env.NEXT_PUBLIC_AUTH_MODE || 'development') as AuthMode,

  oidm: {
    baseUrl: process.env.NEXT_PUBLIC_OIDM_BASE_URL || '',
    domain: process.env.NEXT_PUBLIC_OAUTH_DOMAIN || '',
    scope: process.env.NEXT_PUBLIC_OAUTH_SCOPE || '',
  },

  sso: {
    loginUrl: process.env.NEXT_PUBLIC_SSO_LOGIN_URL || '',
    logoutUrl: process.env.NEXT_PUBLIC_SSO_LOGOUT_URL || '',
    cookieName: process.env.NEXT_PUBLIC_OAUTH_TOKEN_COOKIE_NAME || 'OAUTH_TOKEN',
  },

  headers: {
    originService: process.env.NEXT_PUBLIC_ORIGIN_SERVICE || 'oms-monitoring-ui',
    originApplication:
      process.env.NEXT_PUBLIC_ORIGIN_APPLICATION || 'OMS-Monitoring-Tool',
  },

  session: {
    cookieName: 'oms-session',
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    maxAge: 3600, // 1 hour in seconds
  },

  refresh: {
    bufferSeconds: 60, // Refresh 60s before expiry
  },
}
