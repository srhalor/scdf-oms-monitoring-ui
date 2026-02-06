'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card } from '@/components/shared/Card'
import { Pagination } from '@/components/shared/Pagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DocumentRequestFilters } from '../DocumentRequestFilters'
import { DocumentRequestTable } from '../DocumentRequestTable'
import { DocumentRequestBulkActions } from '../DocumentRequestBulkActions'
import {
  useDocumentRequestFilters,
  useMultiColumnSort,
  useRowSelection,
  useDocumentRequestSearch,
  useSearchStatePreservation,
  useReferenceDataLookups,
} from '@/hooks'
import { useApiMutation } from '@/hooks/useApiMutation'
import { EMPTY_FILTERS, DEFAULT_SORT } from '@/types/documentRequest'
import styles from './DocumentRequestContent.module.css'

/**
 * DocumentRequestContent component
 *
 * Main content component for the Document Request page.
 * Orchestrates filters, table, pagination, and bulk actions.
 *
 * Features:
 * - Filter panel with reference data dropdowns
 * - Sortable results table with row selection
 * - Pagination controls
 * - Bulk reprocess action
 * - State preservation on navigation
 */
export function DocumentRequestContent() {
  const [hasSearched, setHasSearched] = useState(false)
  const [reprocessResult, setReprocessResult] = useState<{
    message: string
    success: boolean
  } | null>(null)

  // Reference data lookups
  const {
    sourceSystems,
    documentTypes,
    documentNames,
    documentStatuses,
    metadataKeys,
    isLoading: isLoadingRefData,
  } = useReferenceDataLookups()

  // Filter state
  const {
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
    resetFilters,
    hasActiveFilters: _hasActiveFilters,
  } = useDocumentRequestFilters()

  // Sort state
  const {
    sorts,
    toggleSort,
    getSortDirection,
    getSortIndex,
    resetToDefault: resetSorts,
  } = useMultiColumnSort()

  // Search state
  const {
    state: searchState,
    search,
    goToPage,
    changePageSize,
    refresh,
    reset: resetSearch,
  } = useDocumentRequestSearch()

  // Row selection
  const {
    selectedIds,
    selectedCount,
    isSelected: _isSelected,
    isAllSelected,
    isPartiallySelected,
    toggleSelection,
    toggleSelectAll,
    deselectAll,
    getSelectedArray,
  } = useRowSelection<number>()

  // State preservation
  const {
    saveState,
    loadState,
    clearState,
  } = useSearchStatePreservation()

  // Load preserved state on mount, or perform initial search with default filters
  useEffect(() => {
    const savedState = loadState()
    if (savedState) {
      // Restore filters
      setRequestIds(savedState.filters.requestIds)
      setBatchIds(savedState.filters.batchIds)
      setSourceSystems(savedState.filters.sourceSystems)
      setDocumentTypes(savedState.filters.documentTypes)
      setDocumentNames(savedState.filters.documentNames)
      setDocumentStatuses(savedState.filters.documentStatuses)
      setFromDate(savedState.filters.fromDate)
      setToDate(savedState.filters.toDate)
      setMetadataChips(savedState.filters.metadataChips)

      // Trigger search with saved state
      search(savedState.filters, savedState.page, savedState.size, savedState.sorts)
      setHasSearched(true)
    } else {
      // Perform initial search with default filters (empty filters, default sort)
      search(filters, 1, 10, sorts)
      setHasSearched(true)
    }
  }, []) // Only run once on mount

  // Handle filter changes from filter component
  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setRequestIds(newFilters.requestIds)
    setBatchIds(newFilters.batchIds)
    setSourceSystems(newFilters.sourceSystems)
    setDocumentTypes(newFilters.documentTypes)
    setDocumentNames(newFilters.documentNames)
    setDocumentStatuses(newFilters.documentStatuses)
    setFromDate(newFilters.fromDate)
    setToDate(newFilters.toDate)
    setMetadataChips(newFilters.metadataChips)
  }, [
    setRequestIds,
    setBatchIds,
    setSourceSystems,
    setDocumentTypes,
    setDocumentNames,
    setDocumentStatuses,
    setFromDate,
    setToDate,
    setMetadataChips,
  ])

  // Handle search
  const handleSearch = useCallback(async () => {
    deselectAll()
    await search(filters, 1, searchState.size, sorts)
    setHasSearched(true)

    // Save state for preservation
    saveState({
      filters,
      sorts,
      page: 1,
      size: searchState.size,
    })
  }, [filters, sorts, searchState.size, search, deselectAll, saveState])

  // Handle reset
  const handleReset = useCallback(async () => {
    resetFilters()
    resetSorts()
    resetSearch()
    deselectAll()
    clearState()
    // Search with default empty filters and default sort
    await search(EMPTY_FILTERS, 1, 10, DEFAULT_SORT)
    setHasSearched(true)
  }, [resetFilters, resetSorts, resetSearch, deselectAll, clearState, search])

  // Handle sort change
  const handleSortChange = useCallback(async (property: string) => {
    const newSorts = toggleSort(property)
    if (hasSearched) {
      // Re-search with new sort (use returned value since state update is async)
      await search(filters, 1, searchState.size, newSorts)
    }
  }, [toggleSort, hasSearched, search, filters, searchState.size])

  // Handle page change
  const handlePageChange = useCallback(async (page: number) => {
    await goToPage(page)
    saveState({
      filters,
      sorts,
      page,
      size: searchState.size,
    })
  }, [goToPage, saveState, filters, sorts, searchState.size])

  // Handle page size change
  const handlePageSizeChange = useCallback(async (size: number) => {
    await changePageSize(size)
    saveState({
      filters,
      sorts,
      page: 1,
      size,
    })
  }, [changePageSize, saveState, filters, sorts])

  // Handle select all for current page
  const handleToggleSelectAll = useCallback(() => {
    const currentPageIds = searchState.data.map(r => r.id)
    toggleSelectAll(currentPageIds)
  }, [searchState.data, toggleSelectAll])

  // Reprocess mutation
  const { mutate: reprocessRequests, loading: isReprocessing } = useApiMutation<
    { totalSubmitted: number; totalNotFound: number; notFoundRequestIds: number[] },
    { requestIds: number[] }
  >({
    mutationFn: async (variables) => {
      const response = await fetch('/api/document-requests/reprocess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variables),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Reprocess failed')
      }
      return response.json()
    },
    onSuccess: (data) => {
      const { totalSubmitted, totalNotFound, notFoundRequestIds } = data
      let message = `Successfully submitted ${totalSubmitted} request(s) for reprocessing.`
      
      if (totalNotFound > 0) {
        message += ` ${totalNotFound} request(s) not found (IDs: ${notFoundRequestIds.join(', ')}).`
      }

      setReprocessResult({ message, success: true })
      deselectAll()
      refresh()
    },
    onError: (error) => {
      setReprocessResult({
        message: error.message || 'An error occurred',
        success: false,
      })
    },
  })

  // Handle reprocess callback
  const handleReprocess = useCallback(async (ids: number[]) => {
    setReprocessResult(null)
    reprocessRequests({ requestIds: ids })
  }, [reprocessRequests])

  return (
    <div className={styles.container}>
      {/* Filters */}
      <DocumentRequestFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        onReset={handleReset}
        sourceSystems={sourceSystems.data}
        documentTypes={documentTypes.data}
        documentNames={documentNames.data}
        documentStatuses={documentStatuses.data}
        metadataKeys={metadataKeys.data}
        isLoading={searchState.isLoading || isLoadingRefData}
        hasErrors={!validation.isValid}
        validationErrors={validation.errors}
      />

      {/* Results */}
      <Card
        title={hasSearched ? `Search Results (${searchState.totalElements} found)` : 'Search Results'}
        className={styles.resultsCard}
      >
        <div className={styles.tableWrapper}>
          <DocumentRequestTable
            data={searchState.data}
            isLoading={searchState.isLoading}
            error={searchState.error}
            onSortChange={handleSortChange}
            getSortDirection={getSortDirection}
            getSortIndex={getSortIndex}
            selectedIds={selectedIds}
            isAllSelected={isAllSelected}
            isPartiallySelected={isPartiallySelected}
            onToggleSelection={toggleSelection}
            onToggleSelectAll={handleToggleSelectAll}
            emptyMessage={
              hasSearched
                ? 'No document requests found. Try adjusting your filters.'
                : 'Use the filters above to search for document requests.'
            }
          />

        {/* Pagination */}
        {hasSearched && searchState.totalPages > 0 && (
          <div className={styles.paginationContainer}>
            <Pagination
              currentPage={searchState.page}
              pageSize={searchState.size}
              totalItems={searchState.totalElements}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </div>
        )}
        
        </div>
      </Card>

      {/* Bulk Actions */}
      <DocumentRequestBulkActions
        selectedCount={selectedCount}
        selectedIds={getSelectedArray()}
        onReprocess={handleReprocess}
        onClearSelection={deselectAll}
        isReprocessing={isReprocessing}
      />

      {/* Reprocess Result Dialog */}
      {reprocessResult && (
        <ConfirmDialog
          isOpen={true}
          title={reprocessResult.success ? 'Reprocess Successful' : 'Reprocess Failed'}
          message={reprocessResult.message}
          confirmText="OK"
          cancelText="Close"
          onConfirm={() => {
            setReprocessResult(null)
            if (reprocessResult.success) {
              refresh()
            }
          }}
          onClose={() => {
            setReprocessResult(null)
            if (reprocessResult.success) {
              refresh()
            }
          }}
          variant={reprocessResult.success ? 'info' : 'warning'}
        />
      )}
    </div>
  )
}
