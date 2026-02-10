/**
 * Table Utilities
 *
 * Helper functions for creating standardized table columns.
 * Use these helpers to ensure consistency across all DataTable implementations.
 */

import { StatusBadge, type StatusBadgeProps } from '@/components/domain'
import { formatDisplayDateTime } from './dateUtils'
import type { TableColumn } from '@/components/ui/DataTable/types'

/**
 * Create a date column with consistent formatting
 *
 * @example
 * createDateColumn<User>('createdAt', 'Created', { width: '180px' })
 */
export function createDateColumn<T>(
  key: string,
  header: string,
  options?: {
    width?: string
    sortable?: boolean
    fallback?: string
  }
): TableColumn<T> {
  return {
    key,
    header,
    width: options?.width,
    sortable: options?.sortable ?? true,
    render: (value: unknown) => formatDisplayDateTime(value, options?.fallback),
  }
}

/**
 * Create a date-time column with consistent formatting (alias for createDateColumn)
 *
 * @example
 * createDateTimeColumn<Batch>('lastUpdateDat', 'Last Updated')
 */
export function createDateTimeColumn<T>(
  key: string,
  header: string,
  options?: {
    width?: string
    sortable?: boolean
    fallback?: string
  }
): TableColumn<T> {
  return createDateColumn<T>(key, header, options)
}

/**
 * Create a status badge column with consistent styling
 *
 * @example
 * createStatusColumn<DocumentRequest>({
 *   key: 'status',
 *   header: 'Status',
 *   type: 'documentRequest',
 *   getStatus: (row) => row.documentRequestStatus.refDataValue,
 *   getDescription: (row) => row.documentRequestStatus.description
 * })
 */
export function createStatusColumn<T>(config: {
  key: string
  header: string
  type: StatusBadgeProps['type']
  getStatus: (row: T) => string
  getDescription?: (row: T) => string
  width?: string
  sortable?: boolean
}): TableColumn<T> {
  return {
    key: config.key,
    header: config.header,
    width: config.width ?? '140px',
    sortable: config.sortable ?? true,
    render: (_value: unknown, row: T) => (
      <StatusBadge
        status={config.getStatus(row)}
        description={config.getDescription?.(row)}
        type={config.type}
      />
    ),
  }
}

/**
 * Create a simple text column
 *
 * @example
 * createTextColumn<User>('name', 'Name', { width: '200px' })
 */
export function createTextColumn<T>(
  key: string,
  header: string,
  options?: {
    width?: string
    sortable?: boolean
  }
): TableColumn<T> {
  return {
    key,
    header,
    width: options?.width,
    sortable: options?.sortable ?? true,
  }
}

/**
 * Create a numeric column (right-aligned)
 *
 * @example
 * createNumericColumn<Batch>('retryCount', 'Retries', { width: '80px' })
 */
export function createNumericColumn<T>(
  key: string,
  header: string,
  options?: {
    width?: string
    sortable?: boolean
    fallback?: string
  }
): TableColumn<T> {
  return {
    key,
    header,
    width: options?.width,
    sortable: options?.sortable ?? true,
    render: (value: unknown) => {
      if (value === null || value === undefined) {
        return options?.fallback ?? '-'
      }
      return String(value)
    },
  }
}

/**
 * Create a boolean column (Yes/No display)
 *
 * @example
 * createBooleanColumn<Batch>('syncStatus', 'Sync', { width: '70px' })
 */
export function createBooleanColumn<T>(
  key: string,
  header: string,
  options?: {
    width?: string
    sortable?: boolean
    trueLabel?: string
    falseLabel?: string
  }
): TableColumn<T> {
  return {
    key,
    header,
    width: options?.width,
    sortable: options?.sortable ?? true,
    render: (value: unknown) => {
      const boolValue = Boolean(value)
      return boolValue ? (options?.trueLabel ?? 'Yes') : (options?.falseLabel ?? 'No')
    },
  }
}
