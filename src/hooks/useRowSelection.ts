'use client'

import { useState, useCallback, useMemo } from 'react'

/**
 * Hook return type
 */
export interface UseRowSelectionReturn<T> {
  selectedIds: Set<T>
  selectedCount: number
  isSelected: (id: T) => boolean
  isAllSelected: boolean
  isPartiallySelected: boolean
  toggleSelection: (id: T) => void
  selectAll: (ids: T[]) => void
  deselectAll: () => void
  toggleSelectAll: (ids: T[]) => void
  getSelectedArray: () => T[]
}

/**
 * useRowSelection hook
 *
 * Manages row selection state for table components.
 * Supports single selection, multi-selection, and select all.
 *
 * @param initialSelected - Optional initial selected IDs
 * @returns Selection state and manipulation functions
 *
 * @example
 * const {
 *   selectedIds,
 *   isSelected,
 *   toggleSelection,
 *   toggleSelectAll,
 *   isAllSelected
 * } = useRowSelection<number>()
 *
 * // Header checkbox
 * <input
 *   type="checkbox"
 *   checked={isAllSelected}
 *   onChange={() => toggleSelectAll(allRowIds)}
 * />
 *
 * // Row checkbox
 * <input
 *   type="checkbox"
 *   checked={isSelected(row.id)}
 *   onChange={() => toggleSelection(row.id)}
 * />
 */
export function useRowSelection<T = number>(
  initialSelected: T[] = []
): UseRowSelectionReturn<T> {
  const [selectedIds, setSelectedIds] = useState<Set<T>>(new Set(initialSelected))

  // Track the current page's visible IDs for select all logic
  const [currentPageIds, setCurrentPageIds] = useState<T[]>([])

  const selectedCount = useMemo(() => selectedIds.size, [selectedIds])

  const isSelected = useCallback((id: T): boolean => {
    return selectedIds.has(id)
  }, [selectedIds])

  // Check if all current page items are selected
  const isAllSelected = useMemo(() => {
    if (currentPageIds.length === 0) return false
    return currentPageIds.every(id => selectedIds.has(id))
  }, [selectedIds, currentPageIds])

  // Check if some but not all current page items are selected
  const isPartiallySelected = useMemo(() => {
    if (currentPageIds.length === 0) return false
    const selectedOnPage = currentPageIds.filter(id => selectedIds.has(id))
    return selectedOnPage.length > 0 && selectedOnPage.length < currentPageIds.length
  }, [selectedIds, currentPageIds])

  const toggleSelection = useCallback((id: T) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const selectAll = useCallback((ids: T[]) => {
    setCurrentPageIds(ids)
    setSelectedIds(prev => {
      const next = new Set(prev)
      ids.forEach(id => next.add(id))
      return next
    })
  }, [])

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const toggleSelectAll = useCallback((ids: T[]) => {
    setCurrentPageIds(ids)
    setSelectedIds(prev => {
      const allSelected = ids.every(id => prev.has(id))
      if (allSelected) {
        // Deselect all visible items
        const next = new Set(prev)
        ids.forEach(id => next.delete(id))
        return next
      } else {
        // Select all visible items
        const next = new Set(prev)
        ids.forEach(id => next.add(id))
        return next
      }
    })
  }, [])

  const getSelectedArray = useCallback((): T[] => {
    return Array.from(selectedIds)
  }, [selectedIds])

  return {
    selectedIds,
    selectedCount,
    isSelected,
    isAllSelected,
    isPartiallySelected,
    toggleSelection,
    selectAll,
    deselectAll,
    toggleSelectAll,
    getSelectedArray,
  }
}
