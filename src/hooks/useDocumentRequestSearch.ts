'use client'

import { useState, useCallback, useRef } from 'react'
import {
  DocumentRequest,
  DocumentRequestFilters,
  DocumentRequestSearchRequest,
  DocumentRequestSearchResponse,
  SortItem,
  PAGINATION_DEFAULTS,
  DEFAULT_SORT,
} from '@/types/documentRequest'

/**
 * Search state
 */
export interface SearchState {
  isLoading: boolean
  error: string | null
  data: DocumentRequest[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  sorts: SortItem[]
}

/**
 * Hook return type
 */
export interface UseDocumentRequestSearchReturn {
  state: SearchState
  search: (
    filters: DocumentRequestFilters,
    page?: number,
    size?: number,
    sorts?: SortItem[]
  ) => Promise<void>
  goToPage: (page: number) => Promise<void>
  changePageSize: (size: number) => Promise<void>
  refresh: () => Promise<void>
  reset: () => void
}

const INITIAL_STATE: SearchState = {
  isLoading: false,
  error: null,
  data: [],
  page: PAGINATION_DEFAULTS.page,
  size: PAGINATION_DEFAULTS.size,
  totalElements: 0,
  totalPages: 0,
  sorts: DEFAULT_SORT,
}

/**
 * Build search request payload from filters
 */
function buildSearchRequest(
  filters: DocumentRequestFilters,
  sorts: SortItem[]
): DocumentRequestSearchRequest {
  const request: DocumentRequestSearchRequest = {}

  // Only include non-empty arrays
  if (filters.requestIds.length > 0) request.requestIds = filters.requestIds
  if (filters.batchIds.length > 0) request.batchIds = filters.batchIds
  if (filters.sourceSystems.length > 0) request.sourceSystems = filters.sourceSystems
  if (filters.documentTypes.length > 0) request.documentTypes = filters.documentTypes
  if (filters.documentNames.length > 0) request.documentNames = filters.documentNames
  if (filters.documentStatuses.length > 0) request.documentStatuses = filters.documentStatuses

  // Include dates if set
  if (filters.fromDate) request.fromDate = filters.fromDate
  if (filters.toDate) request.toDate = filters.toDate

  // Include metadata chips if any (strip keyLabel for API - only send keyId and value)
  if (filters.metadataChips.length > 0) {
    request.metadataChips = filters.metadataChips.map(({ keyId, value }) => ({
      keyId,
      value,
    }))
  }

  // Always include sorts
  request.sorts = sorts

  return request
}

/**
 * useDocumentRequestSearch hook
 *
 * Manages document request search API calls with pagination.
 * Uses 1-based page numbers as per API spec.
 *
 * @returns Search state and control functions
 *
 * @example
 * const { state, search, goToPage } = useDocumentRequestSearch()
 *
 * // Initial search
 * await search(filters)
 *
 * // Pagination
 * await goToPage(2)
 *
 * // Access data
 * state.data.map(request => ...)
 */
export function useDocumentRequestSearch(): UseDocumentRequestSearchReturn {
  const [state, setState] = useState<SearchState>(INITIAL_STATE)

  // Store last search params for refresh/pagination
  const lastSearchRef = useRef<{
    filters: DocumentRequestFilters
    page: number
    size: number
    sorts: SortItem[]
  } | null>(null)

  /**
   * Perform search with given filters and pagination
   */
  const search = useCallback(async (
    filters: DocumentRequestFilters,
    page: number = PAGINATION_DEFAULTS.page,
    size: number = PAGINATION_DEFAULTS.size,
    sorts: SortItem[] = DEFAULT_SORT
  ): Promise<void> => {
    // Store search params for refresh
    lastSearchRef.current = { filters, page, size, sorts }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const requestBody = buildSearchRequest(filters, sorts)

      const response = await fetch(
        `/api/document-requests/search?page=${page}&size=${size}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Search failed: ${response.status}`)
      }

      const data: DocumentRequestSearchResponse = await response.json()

      setState({
        isLoading: false,
        error: null,
        data: data.content,
        page: data.page,
        size: data.size,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        sorts: data.sorts,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
        data: [],
      }))
    }
  }, [])

  /**
   * Navigate to a specific page
   */
  const goToPage = useCallback(async (page: number): Promise<void> => {
    if (!lastSearchRef.current) return

    const { filters, size, sorts } = lastSearchRef.current
    await search(filters, page, size, sorts)
  }, [search])

  /**
   * Change page size and reset to page 1
   */
  const changePageSize = useCallback(async (size: number): Promise<void> => {
    if (!lastSearchRef.current) return

    const { filters, sorts } = lastSearchRef.current
    await search(filters, 1, size, sorts)
  }, [search])

  /**
   * Refresh current search (same filters, page, size)
   */
  const refresh = useCallback(async (): Promise<void> => {
    if (!lastSearchRef.current) return

    const { filters, page, size, sorts } = lastSearchRef.current
    await search(filters, page, size, sorts)
  }, [search])

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    lastSearchRef.current = null
    setState(INITIAL_STATE)
  }, [])

  return {
    state,
    search,
    goToPage,
    changePageSize,
    refresh,
    reset,
  }
}
