'use client'

import { useMemo, useState } from 'react'
import { PaginatedDataTable } from '@/components/ui/PaginatedDataTable'
import { BatchError } from '@/types/documentRequest'
import styles from './BatchErrors.module.css'
import type { TableColumn } from '@/components/ui/DataTable/types'

export interface BatchErrorsProps {
  /** Errors to display */
  errors: BatchError[]
  /** Whether errors are loading */
  loading?: boolean
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
export function BatchErrors({ errors, loading = false }: Readonly<BatchErrorsProps>) {
  // Filter, sort, and pagination state
  const [filterText, setFilterText] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>('id')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Reset to page 1 when filter changes
  const handleFilterChange = (value: string) => {
    setFilterText(value)
    setCurrentPage(1)
  }

  // Reset to page 1 when sort changes
  const handleSortChange = (column: string, direction: 'asc' | 'desc' | null) => {
    setSortColumn(column)
    setSortDirection(direction)
    setCurrentPage(1)
  }

  // Reset to page 1 when page size changes
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

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
      <PaginatedDataTable
        data={errors}
        columns={columns}
        rowKey="id"
        filter={{
          value: filterText,
          onChange: handleFilterChange,
          placeholder: 'Filter errors by category or description...',
          mode: 'client',
        }}
        sort={{
          type: 'single',
          column: sortColumn,
          direction: sortDirection,
          onSort: handleSortChange,
          mode: 'client',
        }}
        pagination={{
          currentPage,
          totalItems: errors.length,
          pageSize,
          onPageChange: setCurrentPage,
          onPageSizeChange: handlePageSizeChange,
          pageSizeOptions: [5, 10, 20, 50],
          showPageSizeSelector: true,
          showInfo: true,
          mode: 'client',
        }}
        loading={loading}
        emptyState={{
          message: 'No errors match your filter',
          description: 'Try a different search term.',
        }}
      />
    </div>
  )
}

