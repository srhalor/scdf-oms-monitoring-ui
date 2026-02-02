'use client'

import { useState, useMemo, useCallback } from 'react'

/**
 * Hook options
 */
export interface UseClientSidePaginationOptions<T> {
  /** Items to paginate */
  items: T[]
  /** Initial page (1-based) */
  initialPage?: number
  /** Items per page */
  pageSize?: number
}

/**
 * Hook return type
 */
export interface UseClientSidePaginationReturn<T> {
  /** Current page items */
  pageItems: T[]
  /** Current page number (1-based) */
  page: number
  /** Items per page */
  pageSize: number
  /** Total number of items */
  totalItems: number
  /** Total number of pages */
  totalPages: number
  /** Whether on first page */
  isFirstPage: boolean
  /** Whether on last page */
  isLastPage: boolean
  /** Go to specific page */
  goToPage: (page: number) => void
  /** Go to next page */
  nextPage: () => void
  /** Go to previous page */
  previousPage: () => void
  /** Go to first page */
  firstPage: () => void
  /** Go to last page */
  lastPage: () => void
  /** Change page size (resets to page 1) */
  setPageSize: (size: number) => void
}

/**
 * useClientSidePagination hook
 *
 * Provides client-side pagination for arrays of items.
 * Useful for sub-tables like batches and errors where all data is loaded.
 * Uses 1-based page numbers for consistency with API pagination.
 *
 * @param options - Configuration options
 * @returns Pagination state and controls
 *
 * @example
 * const { pageItems, page, totalPages, goToPage } = useClientSidePagination({
 *   items: batches,
 *   pageSize: 5,
 * })
 *
 * // Render current page items
 * pageItems.map(batch => <BatchRow key={batch.id} batch={batch} />)
 *
 * // Pagination controls
 * <Pagination
 *   page={page}
 *   totalPages={totalPages}
 *   onPageChange={goToPage}
 * />
 */
export function useClientSidePagination<T>(
  options: UseClientSidePaginationOptions<T>
): UseClientSidePaginationReturn<T> {
  const { items, initialPage = 1, pageSize: initialPageSize = 10 } = options

  const [page, setPage] = useState(initialPage)
  const [pageSizeState, setPageSizeState] = useState(initialPageSize)

  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSizeState))

  // Ensure page is within valid range when items change
  const currentPage = useMemo(() => {
    if (page > totalPages) return totalPages
    if (page < 1) return 1
    return page
  }, [page, totalPages])

  // Get items for current page
  const pageItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSizeState
    const endIndex = startIndex + pageSizeState
    return items.slice(startIndex, endIndex)
  }, [items, currentPage, pageSizeState])

  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  const goToPage = useCallback((newPage: number) => {
    const validPage = Math.min(Math.max(1, newPage), totalPages)
    setPage(validPage)
  }, [totalPages])

  const nextPage = useCallback(() => {
    if (!isLastPage) {
      setPage(prev => prev + 1)
    }
  }, [isLastPage])

  const previousPage = useCallback(() => {
    if (!isFirstPage) {
      setPage(prev => prev - 1)
    }
  }, [isFirstPage])

  const firstPage = useCallback(() => {
    setPage(1)
  }, [])

  const lastPage = useCallback(() => {
    setPage(totalPages)
  }, [totalPages])

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size)
    setPage(1) // Reset to first page when changing page size
  }, [])

  return {
    pageItems,
    page: currentPage,
    pageSize: pageSizeState,
    totalItems,
    totalPages,
    isFirstPage,
    isLastPage,
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setPageSize,
  }
}
