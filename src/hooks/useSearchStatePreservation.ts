'use client'

import { useEffect, useCallback, useRef } from 'react'
import {
  DocumentRequestFilters,
  SortItem,
  EMPTY_FILTERS,
  DEFAULT_SORT,
  PAGINATION_DEFAULTS,
} from '@/types/documentRequest'
import { logger } from '@/lib/logger'

/**
 * Persisted search state structure
 */
export interface PersistedSearchState {
  filters: DocumentRequestFilters
  sorts: SortItem[]
  page: number
  size: number
  timestamp: number
}

/**
 * Hook options
 */
export interface UseSearchStatePreservationOptions {
  /** Storage key prefix */
  storageKey?: string
  /** Max age in milliseconds before state is considered stale (default: 30 minutes) */
  maxAge?: number
  /** Whether to enable persistence (default: true) */
  enabled?: boolean
}

/**
 * Hook return type
 */
export interface UseSearchStatePreservationReturn {
  saveState: (state: Omit<PersistedSearchState, 'timestamp'>) => void
  loadState: () => PersistedSearchState | null
  clearState: () => void
  hasPersistedState: () => boolean
}

const DEFAULT_STORAGE_KEY = 'document-request-search-state'
const DEFAULT_MAX_AGE = 30 * 60 * 1000 // 30 minutes

/**
 * useSearchStatePreservation hook
 *
 * Persists search state (filters, sorts, pagination) to sessionStorage.
 * Used to preserve state when navigating to details and back.
 *
 * @param options - Configuration options
 * @returns State persistence functions
 *
 * @example
 * const { saveState, loadState, clearState } = useSearchStatePreservation()
 *
 * // Save before navigating to details
 * saveState({ filters, sorts, page, size })
 *
 * // Load on mount
 * useEffect(() => {
 *   const saved = loadState()
 *   if (saved) {
 *     setFilters(saved.filters)
 *     setSorts(saved.sorts)
 *   }
 * }, [])
 */
export function useSearchStatePreservation(
  options: UseSearchStatePreservationOptions = {}
): UseSearchStatePreservationReturn {
  const {
    storageKey = DEFAULT_STORAGE_KEY,
    maxAge = DEFAULT_MAX_AGE,
    enabled = true,
  } = options

  const storageKeyRef = useRef(storageKey)
  const maxAgeRef = useRef(maxAge)
  const enabledRef = useRef(enabled)

  // Update refs when options change
  useEffect(() => {
    storageKeyRef.current = storageKey
    maxAgeRef.current = maxAge
    enabledRef.current = enabled
  }, [storageKey, maxAge, enabled])

  /**
   * Save state to sessionStorage
   */
  const saveState = useCallback((state: Omit<PersistedSearchState, 'timestamp'>) => {
    if (!enabledRef.current) return

    try {
      const persistedState: PersistedSearchState = {
        ...state,
        timestamp: Date.now(),
      }
      sessionStorage.setItem(storageKeyRef.current, JSON.stringify(persistedState))
    } catch (error) {
      // Silently fail - storage might be full or disabled
      logger.warn('useSearchStatePreservation', 'Failed to save search state', { error })
    }
  }, [])

  /**
   * Load state from sessionStorage
   * Returns null if no state, state is stale, or on error
   */
  const loadState = useCallback((): PersistedSearchState | null => {
    if (!enabledRef.current) return null

    try {
      const stored = sessionStorage.getItem(storageKeyRef.current)
      if (!stored) return null

      const state: PersistedSearchState = JSON.parse(stored)

      // Check if state is stale
      const age = Date.now() - state.timestamp
      if (age > maxAgeRef.current) {
        sessionStorage.removeItem(storageKeyRef.current)
        return null
      }

      // Validate required properties exist
      if (!state.filters || !state.sorts) {
        return null
      }

      return state
    } catch {
      // Invalid JSON or other error - clear and return null
      sessionStorage.removeItem(storageKeyRef.current)
      return null
    }
  }, [])

  /**
   * Clear persisted state
   */
  const clearState = useCallback(() => {
    try {
      sessionStorage.removeItem(storageKeyRef.current)
    } catch {
      // Ignore errors
    }
  }, [])

  /**
   * Check if there's valid persisted state
   */
  const hasPersistedState = useCallback((): boolean => {
    return loadState() !== null
  }, [loadState])

  return {
    saveState,
    loadState,
    clearState,
    hasPersistedState,
  }
}

/**
 * Get default state for when no persisted state exists
 */
export function getDefaultSearchState(): PersistedSearchState {
  return {
    filters: EMPTY_FILTERS,
    sorts: DEFAULT_SORT,
    page: PAGINATION_DEFAULTS.page,
    size: PAGINATION_DEFAULTS.size,
    timestamp: Date.now(),
  }
}
