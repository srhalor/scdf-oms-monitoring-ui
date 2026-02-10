/**
 * PaginatedDataTable Types
 *
 * Type definitions for the generic PaginatedDataTable component.
 * All features (filter, sort, pagination) are opt-in via configuration objects.
 */

import type { TableColumn, SortDirection } from '../DataTable/types'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

/**
 * Operating mode for features
 * - 'client': Component manages state internally
 * - 'server': Parent controls state, component emits events
 */
export type OperatingMode = 'client' | 'server'

/**
 * Filter configuration (opt-in)
 * Add this prop to enable filtering capability
 */
export interface FilterConfig {
  /** Current filter value */
  value: string
  /** Filter change handler */
  onChange: (value: string) => void
  /** Search handler (optional, for explicit search button) */
  onSearch?: () => void
  /** Placeholder text */
  placeholder?: string
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number
  /** Show loading spinner */
  loading?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Operating mode (default: 'client') */
  mode?: OperatingMode
}

/**
 * Single-column sort configuration
 */
export interface SingleSortConfig {
  /** Type of sorting */
  type: 'single'
  /** Current sort column */
  column: string | null
  /** Current sort direction */
  direction: SortDirection
  /** Sort change handler */
  onSort: (column: string, direction: SortDirection) => void
  /** Operating mode */
  mode?: OperatingMode
}

/**
 * Multi-column sort state (for complex tables like Document Request search)
 */
export interface MultiSortState {
  column: string
  direction: Exclude<SortDirection, null>
  priority: number // 0 = primary, 1 = secondary, etc.
}

/**
 * Multi-column sort configuration
 */
export interface MultiSortConfig {
  /** Type of sorting */
  type: 'multi'
  /** Current sort states (ordered by priority) */
  sorts: MultiSortState[]
  /** Sort change handler */
  onSort: (sorts: MultiSortState[]) => void
  /** Operating mode */
  mode?: OperatingMode
  /** Maximum number of sort columns (default: 3) */
  maxSorts?: number
}

/**
 * Sort configuration (opt-in)
 * Add this prop to enable sorting capability
 */
export type SortConfig = SingleSortConfig | MultiSortConfig

/**
 * Pagination configuration (opt-in)
 * Add this prop to enable pagination capability
 */
export interface PaginationConfig {
  /** Current page (1-indexed) */
  currentPage: number
  /** Total number of items */
  totalItems: number
  /** Items per page */
  pageSize: number
  /** Page change handler */
  onPageChange: (page: number) => void
  /** Page size change handler */
  onPageSizeChange?: (pageSize: number) => void
  /** Available page sizes */
  pageSizeOptions?: number[]
  /** Show page size selector */
  showPageSizeSelector?: boolean
  /** Show item count info */
  showInfo?: boolean
  /** Maximum number of page buttons to show */
  maxPageButtons?: number
  /** Operating mode */
  mode?: OperatingMode
}

/**
 * Loading state configuration
 */
export interface LoadingState {
  /** Is data loading */
  loading: boolean
  /** Loading message (optional) */
  message?: string
}

/**
 * Error state configuration
 */
export interface ErrorState {
  /** Error occurred */
  error: boolean
  /** Error message */
  message: string
  /** Retry handler (optional) */
  onRetry?: () => void
}

/**
 * Empty state configuration
 */
export interface EmptyStateConfig {
  /** Message to display when no data */
  message?: string
  /** Submessage or description */
  description?: string
  /** Custom icon (FontAwesome IconDefinition) */
  icon?: IconDefinition
  /** Action button (optional) */
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * Row actions configuration
 */
export interface RowActionsConfig<T> {
  /** Render function for row actions */
  render: (row: T) => React.ReactNode
  /** Width of actions column */
  width?: string
  /** Header label for actions column */
  header?: string
}

/**
 * Bulk selection configuration (opt-in)
 */
export interface SelectionConfig<T> {
  /** Currently selected row IDs */
  selectedIds: (string | number)[]
  /** Selection change handler */
  onSelectionChange: (selectedIds: (string | number)[]) => void
  /** Get unique ID from row data */
  getRowId: (row: T) => string | number
  /** Bulk actions render function (optional) */
  renderBulkActions?: (selectedIds: (string | number)[]) => React.ReactNode
}

/**
 * PaginatedDataTable Props
 *
 * Generic table component with opt-in features.
 * All features are DISABLED by default.
 */
export interface PaginatedDataTableProps<T> {
  /** Table data */
  data: T[]
  /** Column definitions */
  columns: TableColumn<T>[]

  /** Unique key for each row (default: 'id') */
  rowKey?: keyof T | ((row: T) => string | number)

  /** Filter configuration (opt-in) */
  filter?: FilterConfig

  /** Sort configuration (opt-in) */
  sort?: SortConfig

  /** Pagination configuration (opt-in) */
  pagination?: PaginationConfig

  /** Row actions configuration (opt-in) */
  rowActions?: RowActionsConfig<T>

  /** Selection configuration (opt-in) */
  selection?: SelectionConfig<T>

  /** Loading state */
  loading?: boolean | LoadingState

  /** Error state */
  error?: ErrorState

  /** Empty state configuration */
  emptyState?: EmptyStateConfig

  /** Additional className for table container */
  className?: string

  /** Additional className for table element */
  tableClassName?: string
}

/**
 * Type guard for single sort config
 */
export function isSingleSort(sort: SortConfig): sort is SingleSortConfig {
  return sort.type === 'single'
}

/**
 * Type guard for multi sort config
 */
export function isMultiSort(sort: SortConfig): sort is MultiSortConfig {
  return sort.type === 'multi'
}

/**
 * Type guard for loading state object
 */
export function isLoadingStateObject(
  loading: boolean | LoadingState
): loading is LoadingState {
  return typeof loading === 'object'
}
