'use client'

import { useCallback, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faPlus, faRefresh, faSearch, faTrash } from '@fortawesome/free-solid-svg-icons'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { Button } from '@/components/shared/Button'
import { formatDisplayDate } from '@/utils/dateUtils'
import type { ReferenceData, SortState, TableColumn } from '@/types/referenceData'
import styles from '@/styles/tabContent.module.css'

/**
 * Props for ReferenceDataValuesTab
 */
export interface ReferenceDataValuesTabProps {
  /** Available reference data types for dropdown */
  refDataTypes: ReferenceData[]
  /** Loading state for types dropdown */
  typesLoading?: boolean
  /** Reference data values array */
  data: ReferenceData[]
  /** Loading state for data */
  loading?: boolean
  /** Error message */
  error?: string | null
  /** Currently selected reference data type */
  selectedType: string
  /** Handler for type selection change */
  onTypeChange: (type: string) => void
  /** Refresh data handler */
  onRefresh?: () => void
  /** Create handler */
  onCreate?: () => void
  /** Edit handler */
  onEdit?: (item: ReferenceData) => void
  /** Delete handler */
  onDelete?: (item: ReferenceData) => void
}

/**
 * Reference Data Values Tab Component
 *
 * Displays a dropdown to select reference data type,
 * then shows a table of values for the selected type
 * with search, sorting, pagination, and CRUD actions.
 */
export function ReferenceDataValuesTab({
  refDataTypes,
  typesLoading = false,
  data,
  loading = false,
  error = null,
  selectedType,
  onTypeChange,
  onRefresh,
  onCreate,
  onEdit,
  onDelete,
}: Readonly<ReferenceDataValuesTabProps>) {
  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Sort state
  const [sort, setSort] = useState<SortState>({ column: '', direction: null })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return data
    }

    const query = searchQuery.toLowerCase()
    return data.filter(item => {
      const value = item.refDataValue?.toLowerCase() ?? ''
      const description = item.description?.toLowerCase() ?? ''
      const type = item.refDataType?.toLowerCase() ?? ''

      return value.includes(query) || description.includes(query) || type.includes(query)
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

  // Handle type selection change
  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value
    onTypeChange(newType)
    setSearchQuery('')
    setCurrentPage(1)
  }, [onTypeChange])

  // Column definitions
  const columns: TableColumn<ReferenceData>[] = useMemo(
    () => [
      {
        key: 'refDataType',
        header: 'Ref Data Type',
        sortable: true,
        width: '200px',
      },
      {
        key: 'refDataValue',
        header: 'Value',
        sortable: true,
        width: '200px',
      },
      {
        key: 'description',
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
      {
        key: 'lastUpdateUid',
        header: 'Updated By',
        sortable: true,
        width: '120px',
      },
    ],
    []
  )

  // Render row actions
  const renderRowActions = useCallback(
    (row: ReferenceData) => {
      if (!row.editable) {
        return <span className={styles.readOnlyLabel}>Read Only</span>
      }

      return (
        <>
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => onEdit?.(row)}
            aria-label={`Edit ${row.refDataValue}`}
            title="Edit"
          >
            <FontAwesomeIcon icon={faPen} size="sm" />
          </button>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.danger}`}
            onClick={() => onDelete?.(row)}
            aria-label={`Delete ${row.refDataValue}`}
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
          <div className={styles.errorText}>Failed to load reference data</div>
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
          {/* Type Selector Dropdown */}
          <div className={styles.typeSelector}>
            <label htmlFor="refDataTypeSelect" className={styles.typeSelectorLabel}>
              Reference Data Type:
            </label>
            <select
              id="refDataTypeSelect"
              className={styles.typeSelectorSelect}
              value={selectedType}
              onChange={handleTypeChange}
              disabled={typesLoading}
              aria-label="Select reference data type"
            >
              <option value="">-- Select Type --</option>
              {refDataTypes.map(type => (
                <option key={type.id} value={type.refDataValue}>
                  {type.refDataValue}
                </option>
              ))}
            </select>
          </div>

          {/* Search - only show when a type is selected */}
          {selectedType && (
            <div className={styles.searchContainer}>
              <span className={styles.searchIcon}>
                <FontAwesomeIcon icon={faSearch} size="sm" />
              </span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by value or description..."
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label="Search reference data"
              />
            </div>
          )}
        </div>

        <div className={styles.toolbarRight}>
          {/* Refresh button */}
          <Button
            hierarchy="tertiary"
            icon={faRefresh}
            label="Refresh"
            onClick={onRefresh}
            disabled={!selectedType}
          />
          {/* Create button */}
          <Button
            hierarchy="primary"
            iconBefore={faPlus}
            onClick={onCreate}
            disabled={!selectedType}
          >
            Add New
          </Button>
        </div>
      </div>

      {/* Table - only show when a type is selected */}
      {selectedType ? (
        <div className={styles.tableWrapper}>
          <DataTable
            columns={columns}
            data={paginatedData}
            getRowKey={row => row.id}
            loading={loading}
            emptyMessage="No reference data values found"
            emptySubtext={
              searchQuery
                ? 'Try adjusting your search query'
                : 'Add a new reference data value to get started'
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
      ) : (
        <div className={styles.tableWrapper}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <div className={styles.emptyText}>Select a Reference Data Type</div>
            <div className={styles.emptySubtext}>
              Choose a type from the dropdown above to view and manage its values.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
