'use client'

import { useCallback, useMemo, useState } from 'react'
import { faArrowUp, faInbox } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { formatValue, toComparableString } from '@/utils/formatUtils'
import styles from './DataTable.module.css'
import type { SortDirection, SortState, TableColumn } from './types'

/**
 * DataTable props
 */
export interface DataTableProps<T> {
  /** Column definitions */
  columns: TableColumn<T>[]
  /** Data array */
  data: T[]
  /** Row key extractor */
  getRowKey: (row: T) => string | number
  /** Loading state */
  loading?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** Empty state subtext */
  emptySubtext?: string
  /** Show row selection checkboxes */
  selectable?: boolean
  /** Selected row keys */
  selectedKeys?: Set<string | number>
  /** Selection change handler */
  onSelectionChange?: (keys: Set<string | number>) => void
  /** Row click handler */
  onRowClick?: (row: T) => void
  /** Row actions renderer */
  renderRowActions?: (row: T) => React.ReactNode
  /** Additional class */
  className?: string
  /** Default sort state */
  defaultSort?: SortState
  /** Controlled sort state */
  sort?: SortState
  /** Sort change handler */
  onSortChange?: (sort: SortState) => void
  /** Multi-column sort: get direction for a column (for visual indicators) */
  getColumnSortDirection?: (column: string) => 'ASC' | 'DESC' | null
  /** Multi-column sort: get sort index for a column (1-based, for multi-sort indicator) */
  getColumnSortIndex?: (column: string) => number
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

/**
 * Get aria-sort attribute value for table header
 */
function getAriaSortValue(direction: SortDirection): 'ascending' | 'descending' {
  return direction === 'asc' ? 'ascending' : 'descending'
}

/**
 * Compare strings with locale-aware sorting
 */
function compareStrings(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: 'base' })
}

/**
 * Check if value is null or undefined
 */
function isNullish(value: unknown): value is null | undefined {
  return value == null
}

/**
 * Compare two values for sorting (returns raw comparison result)
 * Null/undefined values are sorted to the end
 */
function compareValues(aValue: unknown, bValue: unknown): number {
  // Handle null/undefined - sort nullish values to end
  const aIsNull = isNullish(aValue)
  const bIsNull = isNullish(bValue)
  if (aIsNull && bIsNull) {
    return 0
  }
  if (aIsNull) {
    return 1
  }
  if (bIsNull) {
    return -1
  }

  // String comparison
  if (typeof aValue === 'string' && typeof bValue === 'string') {
    return compareStrings(aValue, bValue)
  }

  // Number comparison
  if (typeof aValue === 'number' && typeof bValue === 'number') {
    return aValue - bValue
  }

  // Date comparison
  if (aValue instanceof Date && bValue instanceof Date) {
    return aValue.getTime() - bValue.getTime()
  }

  // Default: convert to string
  return compareStrings(toComparableString(aValue), toComparableString(bValue))
}

/**
 * DataTable Component
 *
 * A reusable data table with client-side sorting, row selection,
 * and customizable actions. Designed with transparent background.
 *
 * @example
 * ```tsx
 * <DataTable
 *   columns={[
 *     { key: 'name', header: 'Name', sortable: true },
 *     { key: 'status', header: 'Status' },
 *   ]}
 *   data={items}
 *   getRowKey={(row) => row.id}
 *   onSortChange={handleSort}
 * />
 * ```
 */
export function DataTable<T>({
  columns,
  data,
  getRowKey,
  loading = false,
  emptyMessage = 'No data available',
  emptySubtext = 'Try adjusting your search or filters',
  selectable = false,
  selectedKeys,
  onSelectionChange,
  onRowClick,
  renderRowActions,
  className,
  defaultSort,
  sort: controlledSort,
  onSortChange,
  getColumnSortDirection,
  getColumnSortIndex,
}: Readonly<DataTableProps<T>>) {
  const [internalSort, setInternalSort] = useState<SortState>(
    defaultSort || { column: '', direction: null }
  )

  // Use controlled sort if provided
  const sort = controlledSort ?? internalSort

  const handleSort = useCallback(
    (column: string) => {
      let newDirection: SortDirection
      if (sort.column === column) {
        // Cycle through: asc -> desc -> null
        if (sort.direction === 'asc') {
          newDirection = 'desc'
        } else if (sort.direction === 'desc') {
          newDirection = null
        } else {
          newDirection = 'asc'
        }
      } else {
        newDirection = 'asc'
      }

      const newSort: SortState = {
        column: newDirection ? column : '',
        direction: newDirection,
      }

      if (!controlledSort) {
        setInternalSort(newSort)
      }
      onSortChange?.(newSort)
    },
    [sort, controlledSort, onSortChange]
  )

  // Sort data client-side
  const sortedData = useMemo(() => {
    if (!sort.column || !sort.direction) {
      return data
    }

    const directionMultiplier = sort.direction === 'asc' ? 1 : -1
    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sort.column)
      const bValue = getNestedValue(b, sort.column)
      return compareValues(aValue, bValue) * directionMultiplier
    })
  }, [data, sort])

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) {
      return
    }

    const allKeys = new Set(data.map(getRowKey))
    const allSelectedNow = selectedKeys?.size === data.length

    if (allSelectedNow) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(allKeys)
    }
  }, [data, getRowKey, selectedKeys, onSelectionChange])

  const handleSelectRow = useCallback(
    (key: string | number) => {
      if (!onSelectionChange || !selectedKeys) {
        return
      }

      const newKeys = new Set(selectedKeys)
      if (newKeys.has(key)) {
        newKeys.delete(key)
      } else {
        newKeys.add(key)
      }
      onSelectionChange(newKeys)
    },
    [selectedKeys, onSelectionChange]
  )

  const containerClasses = [styles.tableContainer, className].filter(Boolean).join(' ')
  const allSelected = selectedKeys?.size === data.length && data.length > 0
  const someSelected = selectedKeys && selectedKeys.size > 0 && selectedKeys.size < data.length

  if (loading) {
    return (
      <div className={containerClasses}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          Loading...
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={containerClasses}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <FontAwesomeIcon icon={faInbox} />
          </div>
          <div className={styles.emptyText}>{emptyMessage}</div>
          <div className={styles.emptySubtext}>{emptySubtext}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={containerClasses}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr className={styles.headerRow}>
            {selectable && (
              <th className={styles.checkboxCell}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={allSelected}
                  ref={el => {
                    if (el) {
                      el.indeterminate = someSelected || false
                    }
                  }}
                  onChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map(column => {
              // Support multi-column sort: use getColumnSortDirection if available, fallback to single sort
              const columnKey = String(column.key)
              const multiSortDir = getColumnSortDirection?.(columnKey)
              const multiSortIndex = getColumnSortIndex?.(columnKey) ?? -1
              const isSorted = multiSortDir ? true : sort.column === column.key
              const sortDirection: SortDirection = (multiSortDir?.toLowerCase() as SortDirection) ?? sort.direction
              const isDesc = sortDirection === 'desc'
              
              const thClasses = [
                styles.th,
                column.sortable ? styles.sortable : '',
                isSorted ? styles.sorted : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <th
                  key={columnKey}
                  className={thClasses}
                  style={column.width ? { width: column.width } : undefined}
                  aria-sort={isSorted && sortDirection ? getAriaSortValue(sortDirection) : undefined}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className={styles.sortButton}
                      onClick={() => handleSort(columnKey)}
                    >
                      <span className={styles.headerContent}>
                        {column.header}
                        {multiSortIndex > 0 && (
                          <span className={styles.sortIndex}>{multiSortIndex}</span>
                        )}
                        <span
                          className={`${styles.sortIcon} ${isSorted ? styles.active : ''} ${
                            isDesc ? styles.desc : ''
                          }`}
                        >
                          <FontAwesomeIcon icon={faArrowUp} size="xs" />
                        </span>
                      </span>
                    </button>
                  ) : (
                    <div className={styles.headerContent}>
                      {column.header}
                    </div>
                  )}
                </th>
              )
            })}
            {renderRowActions && <th className={styles.actionsCell}>Actions</th>}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {sortedData.map(row => {
            const rowKey = getRowKey(row)
            const isSelected = selectedKeys?.has(rowKey)
            const rowClasses = [styles.row, isSelected ? styles.selected : '']
              .filter(Boolean)
              .join(' ')

            return (
              <tr
                key={rowKey}
                className={rowClasses}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {selectable && (
                  <td className={styles.checkboxCell}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={isSelected}
                      onChange={() => handleSelectRow(rowKey)}
                      onClick={e => e.stopPropagation()}
                      aria-label={`Select row ${rowKey}`}
                    />
                  </td>
                )}
                {columns.map(column => {
                  const value = getNestedValue(row, String(column.key))
                  const content = column.render
                    ? column.render(value, row)
                    : formatValue(value)

                  return (
                    <td key={String(column.key)} className={styles.td}>
                      {content}
                    </td>
                  )
                })}
                {renderRowActions && (
                  <td className={styles.actionsCell} onClick={e => e.stopPropagation()}>
                    <div className={styles.actionsWrapper}>{renderRowActions(row)}</div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
