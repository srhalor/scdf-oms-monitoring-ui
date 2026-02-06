import { useEffect, useRef, useCallback } from 'react'
import { ENV_CONFIG } from '@/config/env.config'
import { useApiQuery } from '@/hooks/useApiQuery'
import { useApiMutation } from '@/hooks/useApiMutation'
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const basePath = process.env.NEXT_PUBLIC_BASEPATH || ''

  // Mutation for token refresh
  const { mutate: refreshToken } = useApiMutation<RefreshResponse, void>({
    mutationFn: async () => {
      const response = await fetch(`${basePath}/api/auth/refresh`, { method: 'POST' })
      if (!response.ok) {
        if (response.status === 401) {
          const data = await response.json()
          if (data.error === 'SSO cookie expired' || data.error === 'SSO cookie missing') {
            globalThis.location.href = '/api/auth/logout'
          }
        }
        throw new Error(`Refresh failed: ${response.status}`)
      }
      return response.json()
    },
    onSuccess: (data) => {
      if (data.success && data.expiresIn) {
        logger.info('TokenRefresher', 'Token refreshed successfully', { expiresIn: data.expiresIn })
        const newExpiresAt = Date.now() + data.expiresIn * 1000
        scheduleRefresh(newExpiresAt)
      }
    },
  })

  // Recursive scheduling logic
  const scheduleRefresh = useCallback((expiresAt: number) => {
    const now = Date.now()
    const delay = expiresAt - now - REFRESH_BUFFER
    const delaySeconds = Math.round(delay / 1000)
    
    logger.debug('TokenRefresher', 'Scheduling token refresh', { 
      delaySeconds, 
      expiresAt: new Date(expiresAt).toISOString() 
    })
    
    if (delay <= 0) {
      if (expiresAt > now) {
        refreshToken(undefined)
      } else {
        logger.warn('TokenRefresher', 'Token expired before refresh could be scheduled')
      }
      return
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      refreshToken(undefined)
    }, delay)
  }, [refreshToken])

  // Initial session check using useApiQuery (runs once on mount)
  useApiQuery<SessionResponse>({
    queryFn: async () => {
      const response = await fetch(`${basePath}/api/auth/session`)
      if (!response.ok) {
        throw new Error('Session check failed')
      }
      return response.json()
    },
    onSuccess: (data) => {
      if (data.authenticated && data.expiresAt) {
        scheduleRefresh(data.expiresAt)
      }
    },
  })

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return null // Headless component
}

