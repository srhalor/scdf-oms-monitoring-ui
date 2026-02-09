'use client'

import { useMemo, useState, useCallback } from 'react'
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DataTable } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { useClientSidePagination } from '@/hooks'
import { BatchError } from '@/types/documentRequest'
import type { SortState, TableColumn } from '@/types/referenceData'
import styles from './BatchErrors.module.css'

export interface BatchErrorsProps {
  /** Errors to display */
  errors: BatchError[]
  /** Whether errors are loading */
  loading?: boolean
}

/**
 * Filter errors by search text
 */
function filterErrors(errors: BatchError[], searchText: string): BatchError[] {
  if (!searchText.trim()) {
    return errors
  }
  const searchLower = searchText.toLowerCase()
  return errors.filter(
    (err) =>
      err.category.toLowerCase().includes(searchLower) ||
      err.description.toLowerCase().includes(searchLower) ||
      String(err.id).includes(searchLower)
  )
}

/**
 * BatchErrors component
 *
 * Displays a table of batch errors with client-side filtering, sorting, and pagination.
 * Only shown when batch status is FAILED_OMS or FAILED_THUNDERHEAD.
 *
 * @example
 * <BatchErrors
 *   errors={batchErrors}
 *   loading={isLoadingErrors}
 * />
 */
export function BatchErrors({
  errors,
  loading = false,
}: Readonly<BatchErrorsProps>) {
  // Filter state
  const [filterText, setFilterText] = useState('')

  // Sort state
  const [sort, setSort] = useState<SortState>({ column: 'id', direction: 'asc' })

  // Filter errors
  const filteredErrors = useMemo(() => {
    return filterErrors(errors, filterText)
  }, [errors, filterText])

  // Client-side pagination
  const {
    page,
    pageSize,
    totalItems,
    totalPages,
    pageItems,
    goToPage,
    setPageSize,
  } = useClientSidePagination({
    items: filteredErrors,
    pageSize: 10,
  })

  // Handle filter clear
  const handleClearFilter = useCallback(() => {
    setFilterText('')
  }, [])

  // Handle sort change
  const handleSortChange = useCallback((newSort: SortState) => {
    setSort(newSort)
  }, [])

  // Column definitions
  const columns: TableColumn<BatchError>[] = useMemo(
    () => [
      {
        key: 'id',
        header: 'ID',
        width: '80px',
        sortable: true,
      },
      {
        key: 'category',
        header: 'Category',
        width: '200px',
        sortable: true,
        render: (_value: unknown, row: BatchError) => (
          <span className={styles.category}>{row.category}</span>
        ),
      },
      {
        key: 'description',
        header: 'Description',
        sortable: true,
      },
    ],
    []
  )

  // Empty state (no errors at all)
  if (!loading && errors.length === 0) {
    return <div className={styles.empty}>No errors recorded for this batch.</div>
  }

  return (
    <div className={styles.container}>
      {/* Filter Input */}
      <div className={styles.filterContainer}>
        <div className={styles.filterInput}>
          <FontAwesomeIcon icon={faSearch} className={styles.filterIcon} />
          <input
            type="text"
            placeholder="Filter errors by category or description..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className={styles.input}
            aria-label="Filter errors"
          />
          {filterText && (
            <button
              type="button"
              onClick={handleClearFilter}
              className={styles.clearButton}
              aria-label="Clear filter"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
        <span className={styles.resultCount}>
          {filteredErrors.length} of {errors.length} errors
        </span>
      </div>

      {/* Empty filter result */}
      {!loading && filteredErrors.length === 0 ? (
        <div className={styles.noResults}>
          No errors match your filter. Try a different search term.
        </div>
      ) : (
        <>
          {/* Table */}
          <div className={styles.tableWrapper}>
            <DataTable
              columns={columns}
              data={pageItems}
              getRowKey={(row) => row.id}
              loading={loading}
              emptyMessage="No errors found"
              sort={sort}
              onSortChange={handleSortChange}
            />
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className={styles.paginationContainer}>
              <Pagination
                currentPage={page}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={goToPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[5, 10, 20, 50]}
                compact
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
