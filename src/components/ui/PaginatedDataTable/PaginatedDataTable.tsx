/**
 * PaginatedDataTable Component
 *
 * Generic, reusable table component with opt-in features:
 * - Filter: Add `filter={{...}}` to enable search functionality
 * - Sort: Add `sort={{...}}` to enable column sorting (single or multi-column)
 * - Pagination: Add `pagination={{...}}` to enable pagination
 * - Row Actions: Add `rowActions={{...}}` to show action buttons per row
 * - Selection: Add `selection={{...}}` to enable row selection with checkboxes
 *
 * All features are DISABLED by default - opt-in design.
 *
 * Supports two operating modes:
 * - Client-side: Component manages state internally (for small datasets)
 * - Server-side: Parent controls state, component emits events (for API-backed data)
 *
 * @example
 * // Simple table (no features)
 * <PaginatedDataTable
 *   data={users}
 *   columns={[
 *     { key: 'name', header: 'Name' },
 *     { key: 'email', header: 'Email' }
 *   ]}
 * />
 *
 * @example
 * // Table with client-side filter and pagination
 * <PaginatedDataTable
 *   data={users}
 *   columns={columns}
 *   filter={{
 *     value: filter,
 *     onChange: setFilter,
 *     placeholder: 'Search users...'
 *   }}
 *   pagination={{
 *     currentPage: page,
 *     totalItems: filteredUsers.length,
 *     pageSize: 10,
 *     onPageChange: setPage,
 *     mode: 'client'
 *   }}
 * />
 *
 * @example
 * // Table with server-side sort and pagination
 * <PaginatedDataTable
 *   data={users}
 *   columns={columns}
 *   sort={{
 *     type: 'single',
 *     column: sortColumn,
 *     direction: sortDirection,
 *     onSort: handleSort, // Triggers API call
 *     mode: 'server'
 *   }}
 *   pagination={{
 *     currentPage: page,
 *     totalItems: totalCount, // From API
 *     pageSize: pageSize,
 *     onPageChange: handlePageChange, // Triggers API call
 *     mode: 'server'
 *   }}
 *   loading={isLoading}
 * />
 */

'use client'

import { useMemo, useCallback } from 'react'
import { DataTable } from '../DataTable'
import { EmptyState } from '../EmptyState'
import { Pagination } from '../Pagination'
import { SearchInput } from '../SearchInput'
import styles from './PaginatedDataTable.module.css'
import { isSingleSort, isMultiSort } from './types'
import type { PaginatedDataTableProps } from './types'
import type { TableColumn } from '../DataTable/types'

export function PaginatedDataTable<T>({
  data,
  columns,
  rowKey = 'id' as keyof T,
  filter,
  sort,
  pagination,
  rowActions,
  selection,
  loading = false,
  error,
  emptyState,
  className = '',
  tableClassName = '',
}: Readonly<PaginatedDataTableProps<T>>) {
  // ============================================================================
  // Row Key Extractor
  // ============================================================================
  const getRowKey = useCallback(
    (row: T): string | number => {
      if (typeof rowKey === 'function') {
        return rowKey(row)
      }
      return row[rowKey] as string | number
    },
    [rowKey]
  )

  // ============================================================================
  // Client-Side Filtering
  // ============================================================================
  const filteredData = useMemo(() => {
    if (!filter) return data

    // If filter is empty, return all data
    if (!filter.value.trim()) return data

    // Check if filter mode is client (do filtering here)
    // If server mode, parent handles filtering
    const isClientFilter = !filter.mode || filter.mode === 'client'
    if (!isClientFilter) return data

    // Simple text-based filtering across all column values
    const searchTerm = filter.value.toLowerCase()

    return data.filter((row) => {
      // Search in all column values
      return columns.some((column) => {
        const value = row[column.key as keyof T]
        if (value === null || value === undefined) return false

        const stringValue = String(value).toLowerCase()
        return stringValue.includes(searchTerm)
      })
    })
  }, [data, filter, columns, pagination])

  // ============================================================================
  // Client-Side Sorting
  // ============================================================================
  const sortedData = useMemo(() => {
    if (!sort) return filteredData

    // If server mode, parent handles sorting
    const isClientSort = !sort.mode || sort.mode === 'client'
    if (!isClientSort) return filteredData

    // Handle single-column sort
    if (isSingleSort(sort)) {
      if (!sort.column || !sort.direction) return filteredData

      const sorted = [...filteredData].sort((a, b) => {
        const aValue = a[sort.column as keyof T]
        const bValue = b[sort.column as keyof T]

        // Handle null/undefined
        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1

        // Compare values
        if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1
        return 0
      })

      return sorted
    }

    // Handle multi-column sort
    if (isMultiSort(sort)) {
      if (sort.sorts.length === 0) return filteredData

      const sorted = [...filteredData].sort((a, b) => {
        // Sort by each column in priority order
        const sortedStates = sort.sorts.toSorted((x, y) => x.priority - y.priority)
        for (const sortState of sortedStates) {
          const aValue = a[sortState.column as keyof T]
          const bValue = b[sortState.column as keyof T]

          // Handle null/undefined
          if (aValue === null || aValue === undefined) return 1
          if (bValue === null || bValue === undefined) return -1

          // Compare values
          if (aValue < bValue) return sortState.direction === 'asc' ? -1 : 1
          if (aValue > bValue) return sortState.direction === 'asc' ? 1 : -1

          // Values are equal, continue to next sort column
        }

        return 0
      })

      return sorted
    }

    return filteredData
  }, [filteredData, sort])

  // ============================================================================
  // Client-Side Pagination
  // ============================================================================
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData

    // If server mode, parent handles pagination
    const isClientPagination = pagination.mode === 'client'
    if (!isClientPagination) return sortedData

    // Calculate start and end indices
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize
    const endIndex = startIndex + pagination.pageSize

    return sortedData.slice(startIndex, endIndex)
  }, [sortedData, pagination])

  // ============================================================================
  // Final Display Data
  // ============================================================================
  const displayData = paginatedData

  // ============================================================================
  // DataTable Props Construction
  // ============================================================================
  const dataTableColumns: TableColumn<T>[] = useMemo(() => {
    // Add row actions column if configured
    if (rowActions) {
      return [
        ...columns,
        {
          key: '__actions',
          header: rowActions.header || 'Actions',
          sortable: false,
          width: rowActions.width || '120px',
          render: (_, row) => rowActions.render(row),
        },
      ]
    }

    return columns
  }, [columns, rowActions])

  // Handle sort for DataTable
  const handleDataTableSort = useCallback(
    (newSort: { column: string; direction: 'asc' | 'desc' | null }) => {
      if (!sort) return

      if (isSingleSort(sort)) {
        sort.onSort(newSort.column, newSort.direction)
      } else if (isMultiSort(sort)) {
        // Multi-column sort logic
        const existingSort = sort.sorts.find((s) => s.column === newSort.column)

        if (!newSort.direction) {
          // Remove sort for this column
          const newSorts = sort.sorts.filter((s) => s.column !== newSort.column)
          // Re-prioritize
          newSorts.forEach((s, index) => {
            s.priority = index
          })
          sort.onSort(newSorts)
        } else if (existingSort) {
          // Update existing sort
          const newSorts = sort.sorts.map((s) =>
            s.column === newSort.column ? { ...s, direction: newSort.direction as 'asc' | 'desc' } : s
          )
          sort.onSort(newSorts)
        } else {
          // Add new sort
          const newSorts = [
            ...sort.sorts,
            {
              column: newSort.column,
              direction: newSort.direction,
              priority: sort.sorts.length,
            },
          ]

          // Limit to maxSorts
          const maxSorts = sort.maxSorts || 3
          if (newSorts.length > maxSorts) {
            newSorts.shift() // Remove oldest sort
            // Re-prioritize
            newSorts.forEach((s, index) => {
              s.priority = index
            })
          }

          sort.onSort(newSorts)
        }
      }
    },
    [sort]
  )

  // Get current sort state for DataTable
  const currentSort = useMemo(() => {
    if (!sort) return null

    if (isSingleSort(sort)) {
      return sort.column && sort.direction
        ? { column: sort.column, direction: sort.direction }
        : null
    }

    // For multi-sort, return primary sort (priority 0)
    if (isMultiSort(sort)) {
      const primarySort = sort.sorts.find((s) => s.priority === 0)
      return primarySort
        ? { column: primarySort.column, direction: primarySort.direction }
        : null
    }

    return null
  }, [sort])

  // ============================================================================
  // Selection State Conversion
  // ============================================================================
  // Convert selectedIds array to Set for DataTable
  const selectedKeysSet = useMemo(() => {
    if (!selection) return undefined
    return new Set(selection.selectedIds)
  }, [selection])

  // Handle selection change from DataTable (Set) and convert to array
  const handleSelectionChange = useCallback(
    (keys: Set<string | number>) => {
      if (!selection) return
      selection.onSelectionChange(Array.from(keys))
    },
    [selection]
  )

  // ============================================================================
  // Loading State
  // ============================================================================
  const loadingState = useMemo(() => {
    if (typeof loading === 'boolean') {
      return { loading, message: undefined }
    }
    return loading
  }, [loading])

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Filter Section */}
      {filter && (
        <div className={styles.filterSection}>
          <SearchInput
            value={filter.value}
            onChange={filter.onChange}
            onSearch={filter.onSearch}
            placeholder={filter.placeholder || 'Search...'}
            debounceMs={filter.debounceMs}
            loading={filter.loading}
            disabled={filter.disabled}
            clearable
          />
        </div>
      )}

      {/* Bulk Actions Section */}
      {selection && selection.selectedIds.length > 0 && selection.renderBulkActions && (
        <div className={styles.bulkActionsSection}>
          {selection.renderBulkActions(selection.selectedIds)}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={styles.errorContainer}>
          <EmptyState
            illustration="error"
            title="Error Loading Data"
            description={error.message}
            action={
              error.onRetry
                ? {
                    label: 'Retry',
                    onClick: error.onRetry,
                  }
                : undefined
            }
          />
        </div>
      )}

      {/* Table or Empty State */}
      {!error && (
        <>
          {displayData.length === 0 && !loadingState.loading ? (
            <div className={styles.emptyContainer}>
              <EmptyState
                illustration="noResults"
                title={emptyState?.message || 'No data found'}
                description={emptyState?.description}
                action={emptyState?.action}
                icon={emptyState?.icon}
              />
            </div>
          ) : (
            <div className={styles.tableAndPaginationWrapper}>
              <div className={styles.tableWrapper}>
                <DataTable
                  data={displayData}
                  columns={dataTableColumns}
                  getRowKey={getRowKey}
                  sort={currentSort || undefined}
                  onSortChange={sort ? handleDataTableSort : undefined}
                  loading={loadingState.loading}
                  className={tableClassName}
                  selectable={!!selection}
                  selectedKeys={selectedKeysSet}
                  onSelectionChange={selection ? handleSelectionChange : undefined}
                />
              </div>

              {/* Pagination Section */}
              {pagination && (
                <div className={styles.paginationSection}>
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalItems={pagination.totalItems}
                    pageSize={pagination.pageSize}
                    onPageChange={pagination.onPageChange}
                    onPageSizeChange={pagination.onPageSizeChange}
                    pageSizeOptions={pagination.pageSizeOptions}
                    showPageSizeSelector={pagination.showPageSizeSelector}
                    showInfo={pagination.showInfo}
                    maxPageButtons={pagination.maxPageButtons}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
