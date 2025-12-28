'use client'

import { useCallback, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faPlus, faRefresh, faSearch, faTrash } from '@fortawesome/free-solid-svg-icons'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { Button } from '@/components/shared/Button'
import { formatDisplayDate } from '@/utils/dateUtils'
import type { DocumentConfiguration } from '@/types/documentConfiguration'
import type { SortState, TableColumn } from '@/types/referenceData'
import styles from '@/styles/tabContent.module.css'

/**
 * Props for DocumentConfigurationsTab
 */
export interface DocumentConfigurationsTabProps {
  /** Document configurations array */
  data: DocumentConfiguration[]
  /** Loading state */
  loading?: boolean
  /** Error message */
  error?: string | null
  /** Refresh data handler */
  onRefresh?: () => void
  /** Create handler */
  onCreate?: () => void
  /** Edit handler */
  onEdit?: (item: DocumentConfiguration) => void
  /** Delete handler */
  onDelete?: (item: DocumentConfiguration) => void
}

/**
 * Document Configurations Tab Component
 *
 * Displays a table of document configurations with search,
 * sorting, pagination, and CRUD actions.
 */
export function DocumentConfigurationsTab({
  data,
  loading = false,
  error = null,
  onRefresh,
  onCreate,
  onEdit,
  onDelete,
}: Readonly<DocumentConfigurationsTabProps>) {
  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Sort state
  const [sort, setSort] = useState<SortState>({ column: '', direction: null })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data

    const query = searchQuery.toLowerCase()
    return data.filter(item => {
      const value = item.value?.toLowerCase() ?? ''
      const desc = item.desc?.toLowerCase() ?? ''
      const footer = item.footer?.refDataValue?.toLowerCase() ?? ''
      const appDocSpec = item.appDocSpec?.refDataValue?.toLowerCase() ?? ''
      const code = item.code?.refDataValue?.toLowerCase() ?? ''

      return (
        value.includes(query) ||
        desc.includes(query) ||
        footer.includes(query) ||
        appDocSpec.includes(query) ||
        code.includes(query)
      )
    })
  }, [data, searchQuery])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredData.slice(startIndex, startIndex + pageSize)
  }, [filteredData, currentPage, pageSize])

  // Reset to first page when search changes
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }, [])

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }, [])

  // Column definitions
  const columns: TableColumn<DocumentConfiguration>[] = useMemo(
    () => [
      {
        key: 'footer',
        header: 'Footer',
        sortable: true,
        width: '150px',
        render: (value: unknown) => {
          const footer = value as DocumentConfiguration['footer']
          return <span>{footer?.refDataValue ?? '-'}</span>
        },
      },
      {
        key: 'appDocSpec',
        header: 'App Doc Spec',
        sortable: true,
        width: '150px',
        render: (value: unknown) => {
          const appDocSpec = value as DocumentConfiguration['appDocSpec']
          return <span>{appDocSpec?.refDataValue ?? '-'}</span>
        },
      },
      {
        key: 'code',
        header: 'Code',
        sortable: true,
        width: '150px',
        render: (value: unknown) => {
          const code = value as DocumentConfiguration['code']
          return <span>{code?.refDataValue ?? '-'}</span>
        },
      },
      {
        key: 'value',
        header: 'Value',
        sortable: true,
        width: '150px',
      },
      {
        key: 'desc',
        header: 'Description',
        sortable: true,
      },
      {
        key: 'effectFromDat',
        header: 'Effective From',
        sortable: true,
        width: '140px',
        render: (value: unknown) => (
          <span className={styles.dateCell}>{formatDisplayDate(value)}</span>
        ),
      },
      {
        key: 'effectToDat',
        header: 'Effective To',
        sortable: true,
        width: '140px',
        render: (value: unknown) => (
          <span className={styles.dateCell}>{formatDisplayDate(value)}</span>
        ),
      },
    ],
    []
  )

  // Render row actions
  const renderRowActions = useCallback(
    (row: DocumentConfiguration) => {
      return (
        <>
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => onEdit?.(row)}
            aria-label={`Edit ${row.value}`}
            title="Edit"
          >
            <FontAwesomeIcon icon={faPen} size="sm" />
          </button>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.danger}`}
            onClick={() => onDelete?.(row)}
            aria-label={`Delete ${row.value}`}
            title="Delete"
          >
            <FontAwesomeIcon icon={faTrash} size="sm" />
          </button>
        </>
      )
    },
    [onEdit, onDelete]
  )

  // Error state
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <div className={styles.errorText}>Failed to load document configurations</div>
          <div className={styles.errorSubtext}>{error}</div>
          <Button hierarchy="secondary" onClick={onRefresh}>
            <FontAwesomeIcon icon={faRefresh} />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          {/* Search */}
          <div className={styles.searchContainer}>
            <span className={styles.searchIcon}>
              <FontAwesomeIcon icon={faSearch} size="sm" />
            </span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by value, description, footer, code..."
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search document configurations"
            />
          </div>
        </div>

        <div className={styles.toolbarRight}>
          {/* Refresh button */}
          <Button
            hierarchy="tertiary"
            icon={faRefresh}
            label="Refresh"
            onClick={onRefresh}
          />
          {/* Create button */}
          <Button hierarchy="primary" iconBefore={faPlus} onClick={onCreate}>
            Add New
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <DataTable
          columns={columns}
          data={paginatedData}
          getRowKey={row => row.id}
          loading={loading}
          emptyMessage="No document configurations found"
          emptySubtext={
            searchQuery
              ? 'Try adjusting your search query'
              : 'Add a new document configuration to get started'
          }
          sort={sort}
          onSortChange={setSort}
          renderRowActions={renderRowActions}
        />

        {/* Pagination - hide during loading */}
        {!loading && filteredData.length > 0 && (
          <div className={styles.paginationWrapper}>
            <Pagination
              currentPage={currentPage}
              totalItems={filteredData.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[10, 20, 50]}
            />
          </div>
        )}
      </div>
    </div>
  )
}
