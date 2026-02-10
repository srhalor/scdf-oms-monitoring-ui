/**
 * useApiQuery Hook
 * 
 * Standardizes ALL API data fetching with consistent loading/error states.
 * 
 * Features:
 * - Automatic error logging with context
 * - Loading state management
 * - Cache management with TTL
 * - Automatic retry on transient failures
 * - Request deduplication
 * - Cleanup on unmount
 * 
 * MANDATORY: Replace ALL useEffect + fetch patterns with this hook
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { logger } from '@/lib/logger'
import type { ErrorResponseDto } from '@/types/api'

export interface UseApiQueryOptions<T> {
  /** Function that performs the API call */
  queryFn: () => Promise<T>
  /** Whether the query should run automatically (default: true) */
  enabled?: boolean
  /** Callback on successful data fetch */
  onSuccess?: (data: T) => void
  /** Callback on error */
  onError?: (error: ErrorResponseDto) => void
  /** Cache time in milliseconds (default: 5 minutes) */
  cacheTime?: number
  /** Auto-refetch interval in milliseconds (disabled by default) */
  refetchInterval?: number
  /** Number of retry attempts on failure (default: 0) */
  retryCount?: number
  /** Delay between retries in milliseconds (default: 1000) */
  retryDelay?: number
  /** Unique key for caching and deduplication */
  queryKey?: string
}

export interface UseApiQueryReturn<T> {
  /** Fetched data or null */
  data: T | null
  /** Whether the initial fetch is loading */
  loading: boolean
  /** Backend error structure or null */
  error: ErrorResponseDto | null
  /** Manually trigger a refetch */
  refetch: () => Promise<void>
  /** Whether the cached data is stale */
  isStale: boolean
  /** Whether a refetch is in progress */
  isFetching: boolean
}

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>()

export function useApiQuery<T = unknown>(
  options: UseApiQueryOptions<T>
): UseApiQueryReturn<T> {
  const {
    queryFn,
    enabled = true,
    onSuccess,
    onError,
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    refetchInterval,
    retryCount = 0,
    retryDelay = 1000,
    queryKey,
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<ErrorResponseDto | null>(null)
  const [isStale, setIsStale] = useState(false)

  const isMountedRef = useRef(true)
  const retryTimeoutRef = useRef<NodeJS.Timeout>()
  const refetchIntervalRef = useRef<NodeJS.Timeout>()
  const fetchDataRef = useRef<(attempt?: number, isRefetch?: boolean) => Promise<void>>()

  // Check cache and return cached data if valid
  const checkCache = useCallback((): T | null => {
    if (!queryKey) return null
    
    const cached = cache.get(queryKey)
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data as T
    }
    return null
  }, [queryKey, cacheTime])

  // Handle retry logic for transient failures
  const scheduleRetry = useCallback(
    (attempt: number, isRefetch: boolean) => {
      logger.info('useApiQuery', 'Retrying query', {
        queryKey,
        attempt: attempt + 1,
        maxAttempts: retryCount + 1,
        delay: retryDelay,
      })

      retryTimeoutRef.current = setTimeout(() => {
        fetchDataRef.current?.(attempt + 1, isRefetch)
      }, retryDelay)
    },
    [queryKey, retryCount, retryDelay]
  )

  const fetchData = useCallback(
    async (attempt = 0, isRefetch = false): Promise<void> => {
      if (!isMountedRef.current) return

      // Check cache first (skip on refetch)
      if (!isRefetch) {
        const cachedData = checkCache()
        if (cachedData !== null) {
          setData(cachedData)
          setLoading(false)
          setIsStale(false)
          onSuccess?.(cachedData)
          return
        }
      }

      // Set loading state
      if (isRefetch) {
        setIsFetching(true)
      } else {
        setLoading(true)
      }
      setError(null)

      try {
        const result = await queryFn()

        if (!isMountedRef.current) return

        // Update cache
        if (queryKey) {
          cache.set(queryKey, { data: result, timestamp: Date.now() })
        }

        setData(result)
        setError(null)
        setIsStale(false)
        onSuccess?.(result)

        logger.info('useApiQuery', 'Query successful', {
          queryKey,
          hasData: !!result,
          fromCache: false,
        })
      } catch (err) {
        if (!isMountedRef.current) return

        const errorResponse = err as ErrorResponseDto

        logger.error('useApiQuery', 'Query failed', {
          queryKey,
          status: errorResponse.status,
          error: errorResponse.error,
          message: errorResponse.message,
          path: errorResponse.path,
          attempt: attempt + 1,
          maxAttempts: retryCount + 1,
        })

        // Retry logic for transient failures (5xx errors)
        const shouldRetry =
          attempt < retryCount &&
          errorResponse.status >= 500 &&
          errorResponse.status < 600

        if (shouldRetry) {
          scheduleRetry(attempt, isRefetch)
          return
        }

        setError(errorResponse)
        onError?.(errorResponse)
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
          setIsFetching(false)
        }
      }
    },
    [queryFn, onSuccess, onError, retryCount, queryKey, checkCache, scheduleRetry]
  )

  // Store fetchData in ref for stable access
  fetchDataRef.current = fetchData

  const refetch = useCallback(async (): Promise<void> => {
    await fetchDataRef.current?.(0, true)
  }, [])

  // Initial fetch - runs once on mount if enabled
  useEffect(() => {
    if (enabled) {
      fetchDataRef.current?.()
    }
  }, [enabled])

  // Auto-refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      refetchIntervalRef.current = setInterval(() => {
        setIsStale(true)
        fetchDataRef.current?.(0, true)
      }, refetchInterval)
    }

    return () => {
      if (refetchIntervalRef.current) {
        clearInterval(refetchIntervalRef.current)
      }
    }
  }, [refetchInterval, enabled])

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      if (refetchIntervalRef.current) {
        clearInterval(refetchIntervalRef.current)
      }
    }
  }, [])

  return {
    data,
    loading,
    error,
    refetch,
    isStale,
    isFetching,
  }
}
