import { useEffect, useRef } from 'react'
import { ENV_CONFIG } from '@/config/env.config'
import { logger } from '@/lib/logger'

interface SessionResponse {
  authenticated: boolean
  expiresAt?: number
}

interface RefreshResponse {
  success: boolean
  expiresIn: number
}

// Refresh buffer in milliseconds, converted from seconds
const REFRESH_BUFFER = ENV_CONFIG.refresh.bufferSeconds * 1000

export function TokenRefresher() {
  // Use ref to track timeout to prevent cleanup issues
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Refresh loop logic
  const scheduleRefresh = (expiresAt: number) => {
    const now = Date.now()
    
    // Calculate delay
    // If expiresAt is 3600s from now, delay is 3600 - REFRESH_BUFFER
    const delay = expiresAt - now - REFRESH_BUFFER
    const delaySeconds = Math.round(delay / 1000)
    
    logger.debug('TokenRefresher', 'Scheduling token refresh', { delaySeconds, expiresAt: new Date(expiresAt).toISOString() })
    
    if (delay <= 0) {
      // Token already expired or about to expire?
      // If delay is negative but expiresAt is future, we should refresh immediately.
      // If expiresAt is past, we are logged out effectively.
      if (expiresAt > now) {
         // Immediate refresh
         performRefresh()
      } else {
         logger.warn('TokenRefresher', 'Token expired before refresh could be scheduled')
      }
      return
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      performRefresh()
    }, delay)
  }

  const performRefresh = async () => {
    logger.info('TokenRefresher', 'Performing token refresh')
    try {
      const basePath = process.env.NEXT_PUBLIC_BASEPATH || ''
      const response = await fetch(`${basePath}/api/auth/refresh`, { method: 'POST' })
      
      if (response.ok) {
        const data: RefreshResponse = await response.json()
        if (data.success && data.expiresIn) {
           logger.info('TokenRefresher', 'Token refreshed successfully', { expiresIn: data.expiresIn })
           const newExpiresAt = Date.now() + data.expiresIn * 1000
           scheduleRefresh(newExpiresAt)
        }
      } else {
        logger.error('TokenRefresher', 'Refresh failed with status', response.status)
        // If refresh fails (e.g. 401), we might want to redirect to login?
        // Or just let the session expire naturally.
        // If we redirect here, checking logout might be abrupt.
        // It's safer to just stop scheduling and let the user hit an auth barrier later.
        // But user asked to "validate OAUTH_TOKEN... if not present redirect".
        // If refresh fails due to expired SSO token, we should probably redirect.
        if (response.status === 401) {
             const data = await response.json()
             if (data.error === 'SSO cookie expired' || data.error === 'SSO cookie missing') {
                globalThis.location.href = '/api/auth/logout' // Perform full logout
             }
        }
      }
    } catch (error) {
      logger.error('TokenRefresher', 'Network error during refresh', error)
    }
  }

  useEffect(() => {
    // Initial check
    const checkSession = async () => {
      try {
        const basePath = process.env.NEXT_PUBLIC_BASEPATH || ''
        const response = await fetch(`${basePath}/api/auth/session`)
        if (response.ok) {
          const data: SessionResponse = await response.json()
          if (data.authenticated && data.expiresAt) {
            scheduleRefresh(data.expiresAt)
          }
        }
      } catch (error) {
        logger.error('TokenRefresher', 'Session check failed', error)
      }
    }

    checkSession()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return null // Headless component
}

