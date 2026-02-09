/**
 * DataTable Types
 *
 * Generic TypeScript interfaces for the DataTable component.
 * Colocated with the component for easy library extraction.
 */

/**
 * Sort direction for table columns
 */
export type SortDirection = 'asc' | 'desc' | null

/**
 * Sort state for a column
 */
export interface SortState {
  column: string
  direction: SortDirection
}

/**
 * Column definition for DataTable
 */
export interface TableColumn<T> {
  key: keyof T | string
  header: string
  sortable?: boolean
  width?: string
  render?: (value: unknown, row: T) => React.ReactNode
}

/**
 * Pagination state
 */
export interface PaginationState {
  currentPage: number
  pageSize: number
  totalItems: number
}
