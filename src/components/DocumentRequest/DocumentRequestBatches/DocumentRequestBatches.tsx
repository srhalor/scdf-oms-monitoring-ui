'use client'

import { useMemo, useState, useCallback } from 'react'
import { faEye, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@/components/shared/Button'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { useClientSidePagination } from '@/hooks'
import { Batch } from '@/types/documentRequest'
import { formatDisplayDateTime } from '@/utils/dateUtils'
import type { TableColumn } from '@/types/referenceData'
import styles from './DocumentRequestBatches.module.css'

export interface DocumentRequestBatchesProps {
  /** Batches to display */
  batches: Batch[]
  /** Loading state */
  loading?: boolean
  /** Callback when viewing batch details */
  onViewDetails: (batch: Batch) => void
}

/**
 * Filter batches by search text
 */
function filterBatches(batches: Batch[], searchText: string): Batch[] {
  if (!searchText.trim()) {
    return batches
  }
  const searchLower = searchText.toLowerCase()
  return batches.filter(
    (batch) =>
      String(batch.batchId).includes(searchLower) ||
      batch.batchName.toLowerCase().includes(searchLower) ||
      batch.batchStatus.refDataValue.toLowerCase().includes(searchLower) ||
      (batch.dmsDocumentId !== null && String(batch.dmsDocumentId).includes(searchLower)) ||
      String(batch.id).includes(searchLower)
  )
}

/**
 * DocumentRequestBatches component
 *
 * Displays batches for a document request in a table with:
 * - Client-side filtering
 * - Client-side pagination
 * - Status badges with colors
 * - View details links
 *
 * @example
 * <DocumentRequestBatches
 *   batches={batches}
 *   loading={isLoadingBatches}
 *   onViewDetails={handleViewBatch}
 * />
 */
export function DocumentRequestBatches({
  batches,
  loading = false,
  onViewDetails,
}: Readonly<DocumentRequestBatchesProps>) {
  // Filter state
  const [filterText, setFilterText] = useState('')

  // Filter batches
  const filteredBatches = useMemo(() => {
    return filterBatches(batches, filterText)
  }, [batches, filterText])

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
    items: filteredBatches,
    pageSize: 10,
  })

  // Handle filter clear
  const handleClearFilter = useCallback(() => {
    setFilterText('')
  }, [])

  // Column definitions
  const columns: TableColumn<Batch>[] = useMemo(
    () => [
      {
        key: 'batchId',
        header: 'Batch ID',
        width: '100px',
      },
      {
        key: 'batchName',
        header: 'Batch Name',
      },
      {
        key: 'batchStatus',
        header: 'Status',
        width: '140px',
        render: (_value: unknown, row: Batch) => (
          <StatusBadge
            status={row.batchStatus.refDataValue}
            description={row.batchStatus.description}
            type="batch"
          />
        ),
      },
      {
        key: 'dmsDocumentId',
        header: 'DMS Doc ID',
        render: (_value: unknown, row: Batch) =>
          row.dmsDocumentId === null ? '-' : String(row.dmsDocumentId),
      },
      {
        key: 'syncStatus',
        header: 'Sync',
        width: '70px',
        render: (_value: unknown, row: Batch) => (
          <span className={row.syncStatus ? styles.statusYes : styles.statusNo}>
            {row.syncStatus ? 'Yes' : 'No'}
          </span>
        ),
      },
      {
        key: 'eventStatus',
        header: 'Event',
        width: '70px',
        render: (_value: unknown, row: Batch) => (
          <span className={row.eventStatus ? styles.statusYes : styles.statusNo}>
            {row.eventStatus ? 'Yes' : 'No'}
          </span>
        ),
      },
      {
        key: 'retryCount',
        header: 'Retries',
        width: '80px',
      },
      {
        key: 'createdDat',
        header: 'Created',
        render: (value: unknown) => formatDisplayDateTime(value),
      },
    ],
    []
  )

  // Render row actions
  const renderRowActions = useCallback(
    (row: Batch) => (
      <Button
        hierarchy="tertiary"
        size="sm"
        icon={faEye}
        label="View details"
        onClick={() => onViewDetails(row)}
        tooltipPosition="left"
      />
    ),
    [onViewDetails]
  )

  // Empty state for no batches at all
  if (!loading && batches.length === 0) {
    return (
      <div className={styles.empty}>
        No batches found for this request.
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Filter Input */}
      <div className={styles.filterContainer}>
        <div className={styles.filterInput}>
          <FontAwesomeIcon icon={faSearch} className={styles.filterIcon} />
          <input
            type="text"
            placeholder="Filter batches by ID, name, or status..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className={styles.input}
            aria-label="Filter batches"
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
          {filteredBatches.length} of {batches.length} batches
        </span>
      </div>

      {/* Empty filter result */}
      {!loading && filteredBatches.length === 0 ? (
        <div className={styles.noResults}>
          No batches match your filter. Try a different search term.
        </div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <DataTable
              columns={columns}
              data={pageItems}
              getRowKey={(row) => row.id}
              loading={loading}
              emptyMessage="No batches found"
              renderRowActions={renderRowActions}
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
                pageSizeOptions={[5, 10, 20]}
                compact
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
