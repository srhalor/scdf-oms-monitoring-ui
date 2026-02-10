'use client'

import { useState } from 'react'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/Button'
import { PaginatedDataTable } from '@/components/ui/PaginatedDataTable'
import { Batch } from '@/types/documentRequest'
import {
  createTextColumn,
  createStatusColumn,
  createNumericColumn,
  createBooleanColumn,
  createDateTimeColumn,
} from '@/utils/tableUtils'
import styles from './DocumentRequestBatches.module.css'
import type { TableColumn } from '@/components/ui/DataTable/types'

export interface DocumentRequestBatchesProps {
  /** Batches to display */
  batches: Batch[]
  /** Loading state */
  loading?: boolean
  /** Callback when viewing batch details */
  onViewDetails: (batch: Batch) => void
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
  // Filter and pagination state
  const [filterText, setFilterText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Reset to page 1 when filter changes
  const handleFilterChange = (value: string) => {
    setFilterText(value)
    setCurrentPage(1)
  }

  // Reset to page 1 when page size changes
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

  // Column definitions
  const columns: TableColumn<Batch>[] = [
    createTextColumn<Batch>('batchId', 'Batch ID', { width: '100px' }),
    createTextColumn<Batch>('batchName', 'Batch Name'),
    createStatusColumn<Batch>({
      key: 'batchStatus',
      header: 'Status',
      type: 'batch',
      getStatus: (batch) => batch.batchStatus.refDataValue,
      getDescription: (batch) => batch.batchStatus.description,
      width: '140px',
    }),
    createNumericColumn<Batch>('dmsDocumentId', 'DMS Doc ID', { fallback: '-' }),
    createBooleanColumn<Batch>('syncStatus', 'Sync', { width: '70px' }),
    createBooleanColumn<Batch>('eventStatus', 'Event', { width: '70px' }),
    createNumericColumn<Batch>('retryCount', 'Retries', { width: '80px' }),
    createDateTimeColumn<Batch>('createdDat', 'Created'),
  ]

  // Empty state for no batches at all
  if (!loading && batches.length === 0) {
    return <div className={styles.empty}>No batches found for this request.</div>
  }

  return (
    <div className={styles.container}>
      <PaginatedDataTable
        data={batches}
        columns={columns}
        rowKey="id"
        filter={{
          value: filterText,
          onChange: handleFilterChange,
          placeholder: 'Filter batches by ID, name, or status...',
          mode: 'client',
        }}
        pagination={{
          currentPage,
          totalItems: batches.length,
          pageSize,
          onPageChange: setCurrentPage,
          onPageSizeChange: handlePageSizeChange,
          pageSizeOptions: [5, 10, 20],
          showPageSizeSelector: true,
          showInfo: true,
          mode: 'client',
        }}
        rowActions={{
          width: '100px',
          render: (batch) => (
            <Button
              hierarchy="tertiary"
              size="sm"
              icon={faEye}
              label="View details"
              onClick={() => onViewDetails(batch)}
              tooltipPosition="left"
            />
          ),
        }}
        loading={loading}
        emptyState={{
          message: 'No batches match your filter',
          description: 'Try a different search term.',
        }}
      />
    </div>
  )
}

