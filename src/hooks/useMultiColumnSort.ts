'use client'

import { useState, useCallback } from 'react'
import { SortItem, DEFAULT_SORT } from '@/types/documentRequest'

/**
 * Hook return type
 */
export interface UseMultiColumnSortReturn {
  sorts: SortItem[]
  toggleSort: (property: string) => SortItem[]
  setSort: (property: string, direction: 'ASC' | 'DESC') => void
  removeSort: (property: string) => void
  clearSorts: () => void
  resetToDefault: () => void
  getSortDirection: (property: string) => 'ASC' | 'DESC' | null
  getSortIndex: (property: string) => number
}

/**
 * useMultiColumnSort hook
 *
 * Manages multi-column sort state for document request table.
 * Default sort: id DESC
 *
 * Sorting behavior:
 * - Click column: Add as primary sort (ASC) or toggle direction if already sorted
 * - Shift+click: Add to multi-column sort
 * - Sort index shown on column header for multi-column
 *
 * @param initialSorts - Optional initial sort state (defaults to id DESC)
 * @param maxSorts - Maximum number of sort columns (default: 3)
 * @returns Sort state and manipulation functions
 *
 * @example
 * const { sorts, toggleSort, getSortDirection } = useMultiColumnSort()
 *
 * // In column header
 * <th onClick={() => toggleSort('createdDat')}>
 *   Created Date {getSortDirection('createdDat') === 'ASC' ? '↑' : '↓'}
 * </th>
 */
export function useMultiColumnSort(
  initialSorts: SortItem[] = DEFAULT_SORT,
  maxSorts: number = 3
): UseMultiColumnSortReturn {
  const [sorts, setSorts] = useState<SortItem[]>(initialSorts)

  /**
   * Calculate new sorts for a column toggle (pure function for immediate return)
   */
  const calculateNewSorts = useCallback((prevSorts: SortItem[], property: string): SortItem[] => {
    const existingIndex = prevSorts.findIndex(s => s.property === property)

    if (existingIndex === -1) {
      // Not currently sorted - add as new sort with DESC
      const newSort: SortItem = { property, direction: 'DESC' }
      // Add to existing sorts (multi-column sort behavior)
      // If we've reached max sorts, remove the oldest one
      if (prevSorts.length >= maxSorts) {
        return [...prevSorts.slice(1), newSort]
      }
      return [...prevSorts, newSort]
    }

    const existing = prevSorts[existingIndex]

    if (existing.direction === 'DESC') {
      // Currently DESC - change to ASC
      const updated = [...prevSorts]
      updated[existingIndex] = { ...existing, direction: 'ASC' }
      return updated
    }

    // Currently ASC - remove from sort, revert to default if no sorts left
    const filtered = prevSorts.filter(s => s.property !== property)
    return filtered.length > 0 ? filtered : DEFAULT_SORT
  }, [maxSorts])

  /**
   * Toggle sort for a column:
   * - If not sorted: Add as DESC (primary)
   * - If DESC: Change to ASC
   * - If ASC: Remove from sort
   *
   * Returns the new sorts array immediately (does not wait for state update)
   */
  const toggleSort = useCallback((property: string): SortItem[] => {
    // Calculate new sorts synchronously from current state
    const newSorts = calculateNewSorts(sorts, property)
    // Update state
    setSorts(newSorts)
    // Return immediately so caller can use it
    return newSorts
  }, [sorts, calculateNewSorts])

  /**
   * Set specific sort direction for a column
   */
  const setSort = useCallback((property: string, direction: 'ASC' | 'DESC') => {
    setSorts(prevSorts => {
      const existingIndex = prevSorts.findIndex(s => s.property === property)

      if (existingIndex === -1) {
        // Add new sort if under max
        if (prevSorts.length >= maxSorts) {
          // Replace last sort
          const updated = [...prevSorts]
          updated[updated.length - 1] = { property, direction }
          return updated
        }
        return [...prevSorts, { property, direction }]
      }

      // Update existing
      const updated = [...prevSorts]
      updated[existingIndex] = { property, direction }
      return updated
    })
  }, [maxSorts])

  /**
   * Remove a column from sort
   */
  const removeSort = useCallback((property: string) => {
    setSorts(prevSorts => {
      const filtered = prevSorts.filter(s => s.property !== property)
      return filtered.length > 0 ? filtered : DEFAULT_SORT
    })
  }, [])

  /**
   * Clear all sorts and revert to default
   */
  const clearSorts = useCallback(() => {
    setSorts(DEFAULT_SORT)
  }, [])

  /**
   * Reset to default sort (id DESC)
   */
  const resetToDefault = useCallback(() => {
    setSorts(DEFAULT_SORT)
  }, [])

  /**
   * Get current sort direction for a column
   */
  const getSortDirection = useCallback((property: string): 'ASC' | 'DESC' | null => {
    const sort = sorts.find(s => s.property === property)
    return sort?.direction ?? null
  }, [sorts])

  /**
   * Get sort index for a column (1-based, for multi-column indicator)
   * Returns -1 if not sorted
   */
  const getSortIndex = useCallback((property: string): number => {
    const index = sorts.findIndex(s => s.property === property)
    return index >= 0 ? index + 1 : -1
  }, [sorts])

  return {
    sorts,
    toggleSort,
    setSort,
    removeSort,
    clearSorts,
    resetToDefault,
    getSortDirection,
    getSortIndex,
  }
}
