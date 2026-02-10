'use client'

import { useCallback, useMemo } from 'react'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './Pagination.module.css'

/**
 * Pagination component props
 */
export interface PaginationProps {
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
  /** Compact variant */
  compact?: boolean
  /** Alignment */
  align?: 'left' | 'center' | 'right'
  /** Additional class */
  className?: string
}

type PageItem = 
  | { type: 'page'; value: number }
  | { type: 'ellipsis'; position: 'start' | 'end' }

/**
 * Generate page numbers to display with ellipsis
 */
function getPageNumbers(
  currentPage: number,
  totalPages: number,
  maxButtons: number
): PageItem[] {
  if (totalPages <= maxButtons) {
    return Array.from({ length: totalPages }, (_, i) => ({
      type: 'page' as const,
      value: i + 1,
    }))
  }

  const pages: PageItem[] = []
  const halfButtons = Math.floor((maxButtons - 3) / 2) // Reserve 3 for first, last, and one ellipsis

  // Always show first page
  pages.push({ type: 'page', value: 1 })

  let startPage = Math.max(2, currentPage - halfButtons)
  let endPage = Math.min(totalPages - 1, currentPage + halfButtons)

  // Adjust if we're near the beginning
  if (currentPage <= halfButtons + 2) {
    endPage = Math.min(totalPages - 1, maxButtons - 2)
  }

  // Adjust if we're near the end
  if (currentPage >= totalPages - halfButtons - 1) {
    startPage = Math.max(2, totalPages - maxButtons + 3)
  }

  // Add ellipsis before middle pages if needed
  if (startPage > 2) {
    pages.push({ type: 'ellipsis', position: 'start' })
  }

  // Add middle pages
  for (let i = startPage; i <= endPage; i++) {
    pages.push({ type: 'page', value: i })
  }

  // Add ellipsis after middle pages if needed
  if (endPage < totalPages - 1) {
    pages.push({ type: 'ellipsis', position: 'end' })
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push({ type: 'page', value: totalPages })
  }

  return pages
}

/**
 * Pagination Component
 *
 * A flexible pagination component with page navigation,
 * page size selection, and item count display.
 *
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={1}
 *   totalItems={100}
 *   pageSize={10}
 *   onPageChange={setCurrentPage}
 *   onPageSizeChange={setPageSize}
 * />
 * ```
 */
export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = true,
  showInfo = true,
  maxPageButtons = 7,
  compact = false,
  align = 'left',
  className,
}: Readonly<PaginationProps>) {
  const totalPages = Math.ceil(totalItems / pageSize)
  const _startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems)
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const pageNumbers = useMemo(
    () => getPageNumbers(currentPage, totalPages, maxPageButtons),
    [currentPage, totalPages, maxPageButtons]
  )

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange(page)
      }
    },
    [currentPage, totalPages, onPageChange]
  )

  const handlePageSizeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newPageSize = Number.parseInt(event.target.value, 10)
      onPageSizeChange?.(newPageSize)
      // Reset to first page when changing page size
      onPageChange(1)
    },
    [onPageChange, onPageSizeChange]
  )

  if (totalItems === 0) {
    return null
  }

  const containerClasses = [
    styles.paginationContainer,
    compact ? styles.compact : '',
    align === 'right' ? styles.alignRight : '',
    align === 'center' ? styles.alignCenter : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <nav className={containerClasses} aria-label="Pagination">
      {/* Info section - EXTREME LEFT */}
      {showInfo && (
        <div className={styles.paginationInfo}>
          Showing {currentPage} of {totalPages} ({endItem} of {totalItems} results)
        </div>
      )}

      {/* Controls section - EXTREME RIGHT */}
      <div className={styles.paginationControls}>
        {/* Previous button */}
        <button
          type="button"
          className={`${styles.pageButton} ${styles.navButton}`}
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Go to previous page"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
          <span>Previous</span>
        </button>

        {/* Page numbers */}
        {pageNumbers.map((item) => {
          if (item.type === 'ellipsis') {
            return (
              <span key={`ellipsis-${item.position}`} className={styles.ellipsis}>
                ...
              </span>
            )
          }
          return (
            <button
              key={`page-${item.value}`}
              type="button"
              className={`${styles.pageButton} ${currentPage === item.value ? styles.active : ''}`}
              onClick={() => goToPage(item.value)}
              aria-label={`Go to page ${item.value}`}
              aria-current={currentPage === item.value ? 'page' : undefined}
            >
              {item.value}
            </button>
          )
        })}

        {/* Next button */}
        <button
          type="button"
          className={`${styles.pageButton} ${styles.navButton}`}
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Go to next page"
        >
          <span>Next</span>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>

        {/* Page size selector */}
        {showPageSizeSelector && onPageSizeChange && (
          <div className={styles.pageSizeContainer}>
            <select
              className={styles.pageSizeSelect}
              value={pageSize}
              onChange={handlePageSizeChange}
              aria-label="Items per page"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className={styles.pageSizeLabel}>results per page</span>
          </div>
        )}
      </div>
    </nav>
  )
}
