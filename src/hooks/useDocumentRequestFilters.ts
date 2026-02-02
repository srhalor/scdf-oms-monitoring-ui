'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  DocumentRequestFilters,
  MetadataChip,
  EMPTY_FILTERS,
  FILTER_LIMITS,
} from '@/types/documentRequest'

/**
 * Validation result for filter fields
 */
export interface FilterValidation {
  isValid: boolean
  errors: {
    requestIds?: string
    batchIds?: string
    metadataChips?: string
    dateRange?: string
  }
}

/**
 * Hook return type
 */
export interface UseDocumentRequestFiltersReturn {
  filters: DocumentRequestFilters
  validation: FilterValidation
  setRequestIds: (ids: number[]) => void
  setBatchIds: (ids: number[]) => void
  setSourceSystems: (ids: number[]) => void
  setDocumentTypes: (ids: number[]) => void
  setDocumentNames: (ids: number[]) => void
  setDocumentStatuses: (ids: number[]) => void
  setFromDate: (date: string | null) => void
  setToDate: (date: string | null) => void
  setMetadataChips: (chips: MetadataChip[]) => void
  addMetadataChip: (chip: MetadataChip) => boolean
  removeMetadataChip: (keyId: number) => void
  resetFilters: () => void
  hasActiveFilters: boolean
}

/**
 * useDocumentRequestFilters hook
 *
 * Manages filter state for document request search with validation.
 * Enforces limits: max 100 requestIds/batchIds, max 10 metadata chips.
 *
 * @param initialFilters - Optional initial filter state
 * @returns Filter state and setter functions with validation
 *
 * @example
 * const { filters, setSourceSystems, validation, resetFilters } = useDocumentRequestFilters()
 */
export function useDocumentRequestFilters(
  initialFilters: DocumentRequestFilters = EMPTY_FILTERS
): UseDocumentRequestFiltersReturn {
  const [filters, setFilters] = useState<DocumentRequestFilters>(initialFilters)

  // Validate filters
  const validation = useMemo((): FilterValidation => {
    const errors: FilterValidation['errors'] = {}
    let isValid = true

    // Validate requestIds limit
    if (filters.requestIds.length > FILTER_LIMITS.maxRequestIds) {
      errors.requestIds = `Maximum ${FILTER_LIMITS.maxRequestIds} request IDs allowed`
      isValid = false
    }

    // Validate batchIds limit
    if (filters.batchIds.length > FILTER_LIMITS.maxBatchIds) {
      errors.batchIds = `Maximum ${FILTER_LIMITS.maxBatchIds} batch IDs allowed`
      isValid = false
    }

    // Validate metadata chips limit
    if (filters.metadataChips.length > FILTER_LIMITS.maxMetadataChips) {
      errors.metadataChips = `Maximum ${FILTER_LIMITS.maxMetadataChips} metadata filters allowed`
      isValid = false
    }

    // Validate date range
    if (filters.fromDate && filters.toDate) {
      const from = new Date(filters.fromDate)
      const to = new Date(filters.toDate)
      if (from > to) {
        errors.dateRange = 'From date must be before To date'
        isValid = false
      }
    }

    return { isValid, errors }
  }, [filters])

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.requestIds.length > 0 ||
      filters.batchIds.length > 0 ||
      filters.sourceSystems.length > 0 ||
      filters.documentTypes.length > 0 ||
      filters.documentNames.length > 0 ||
      filters.documentStatuses.length > 0 ||
      filters.fromDate !== null ||
      filters.toDate !== null ||
      filters.metadataChips.length > 0
    )
  }, [filters])

  // Setter functions
  const setRequestIds = useCallback((ids: number[]) => {
    const limitedIds = ids.slice(0, FILTER_LIMITS.maxRequestIds)
    setFilters(prev => ({ ...prev, requestIds: limitedIds }))
  }, [])

  const setBatchIds = useCallback((ids: number[]) => {
    const limitedIds = ids.slice(0, FILTER_LIMITS.maxBatchIds)
    setFilters(prev => ({ ...prev, batchIds: limitedIds }))
  }, [])

  const setSourceSystems = useCallback((ids: number[]) => {
    setFilters(prev => ({ ...prev, sourceSystems: ids }))
  }, [])

  const setDocumentTypes = useCallback((ids: number[]) => {
    setFilters(prev => ({ ...prev, documentTypes: ids }))
  }, [])

  const setDocumentNames = useCallback((ids: number[]) => {
    setFilters(prev => ({ ...prev, documentNames: ids }))
  }, [])

  const setDocumentStatuses = useCallback((ids: number[]) => {
    setFilters(prev => ({ ...prev, documentStatuses: ids }))
  }, [])

  const setFromDate = useCallback((date: string | null) => {
    setFilters(prev => ({ ...prev, fromDate: date }))
  }, [])

  const setToDate = useCallback((date: string | null) => {
    setFilters(prev => ({ ...prev, toDate: date }))
  }, [])

  const setMetadataChips = useCallback((chips: MetadataChip[]) => {
    const limitedChips = chips.slice(0, FILTER_LIMITS.maxMetadataChips)
    setFilters(prev => ({ ...prev, metadataChips: limitedChips }))
  }, [])

  const addMetadataChip = useCallback((chip: MetadataChip): boolean => {
    // Check if we're at the limit
    if (filters.metadataChips.length >= FILTER_LIMITS.maxMetadataChips) {
      return false
    }
    // Check if key already exists
    if (filters.metadataChips.some(c => c.keyId === chip.keyId)) {
      return false
    }
    setFilters(prev => ({
      ...prev,
      metadataChips: [...prev.metadataChips, chip],
    }))
    return true
  }, [filters.metadataChips])

  const removeMetadataChip = useCallback((keyId: number) => {
    setFilters(prev => ({
      ...prev,
      metadataChips: prev.metadataChips.filter(c => c.keyId !== keyId),
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS)
  }, [])

  return {
    filters,
    validation,
    setRequestIds,
    setBatchIds,
    setSourceSystems,
    setDocumentTypes,
    setDocumentNames,
    setDocumentStatuses,
    setFromDate,
    setToDate,
    setMetadataChips,
    addMetadataChip,
    removeMetadataChip,
    resetFilters,
    hasActiveFilters,
  }
}
