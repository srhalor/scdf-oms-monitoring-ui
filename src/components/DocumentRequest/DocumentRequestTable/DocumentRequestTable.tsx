'use client'

import { useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/Button'
import { PaginatedDataTable } from '@/components/ui/PaginatedDataTable'
import { MultiSortState } from '@/components/ui/PaginatedDataTable/types'
import { DocumentRequest, DocumentRequestStatus } from '@/types/documentRequest'
import { TableColumn } from '@/types/referenceData'
import { cacheDocumentRequest } from '@/utils/documentRequestCache'
import { createStatusColumn, createDateTimeColumn } from '@/utils/tableUtils'
import styles from './DocumentRequestTable.module.css'

export interface DocumentRequestTableProps {
  /** Document requests to display */
  data: DocumentRequest[]
  /** Loading state */
  isLoading?: boolean
  /** Error message */
  error?: string | null
  /** Callback when sort changes */
  onSortChange: (property: string) => void
  /** Get sort direction for a column */
  getSortDirection: (property: string) => 'ASC' | 'DESC' | null
  /** Get sort index for a column (1-based, for multi-column indicator) */
  getSortIndex: (property: string) => number
  /** Selected row IDs */
  selectedIds: Set<number>
  /** Toggle selection for a row */
  onToggleSelection: (id: number) => void
  /** Empty state message */
  emptyMessage?: string
  /** Pagination - current page */
  currentPage: number
  /** Pagination - page size */
  pageSize: number
  /** Pagination - total items */
  totalItems: number
  /** Pagination - page change handler */
  onPageChange: (page: number) => void
  /** Pagination - page size change handler */
  onPageSizeChange: (size: number) => void
}

/**
 * DocumentRequestTable component
 *
 * Displays document requests in a sortable table with:
 * - Row selection checkboxes
 * - Multi-column server-side sorting
 * - Status badges with colors
 * - View details action
 *
 * Uses PaginatedDataTable with server-side sort mode.
 *
 * @example
 * <DocumentRequestTable
 *   data={requests}
 *   onSortChange={toggleSort}
 *   getSortDirection={getSortDirection}
 *   getSortIndex={getSortIndex}
 *   selectedIds={selectedIds}
 *   onToggleSelection={toggleSelection}
 * />
 */
export function DocumentRequestTable({
  data,
  isLoading = false,
  error = null,
  onSortChange,
  getSortDirection,
  getSortIndex,
  selectedIds,
  onToggleSelection,
  emptyMessage = 'No document requests found. Try adjusting your filters.',
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: Readonly<DocumentRequestTableProps>) {
  const router = useRouter()

  // Handle view details - cache request data and navigate
  const handleViewDetails = useCallback((request: DocumentRequest) => {
    cacheDocumentRequest(request)
    router.push(`/document-request/${request.id}`)
  }, [router])

  // Convert parent's Set<number> to array of string | number for PaginatedDataTable
  const selectedIdsArray = useMemo(
    () => Array.from(selectedIds),
    [selectedIds]
  )

  // Handle selection change from PaginatedDataTable (array) back to parent (Set)
  const handleSelectionChange = useCallback(
    (newSelectedIds: (string | number)[]) => {
      const newSet = new Set<number>(newSelectedIds.map(id => Number(id)))
      const currentSet = selectedIds
      
      // Find added keys
      newSet.forEach((id) => {
        if (!currentSet.has(id)) {
          onToggleSelection(id)
        }
      })
      
      // Find removed keys  
      currentSet.forEach((id) => {
        if (!newSet.has(id)) {
          onToggleSelection(id)
        }
      })
    },
    [selectedIds, onToggleSelection]
  )

  // Convert parent's sort state to PaginatedDataTable MultiSortState format
  // Parent provides getSortDirection(property) => 'ASC' | 'DESC' | null
  // PaginatedDataTable expects MultiSortState[] with { column, direction, priority }
  const sortStates = useMemo((): MultiSortState[] => {
    const sortableColumns = ['id', 'sourceSystem', 'documentType', 'documentName', 'documentStatus', 'createdDat', 'lastUpdateDat']
    
    const sorts: MultiSortState[] = []
    
    // Build MultiSortState array from parent's sort state
    for (const col of sortableColumns) {
      const dir = getSortDirection(col)
      if (dir) {
        const priority = getSortIndex(col) - 1 // Convert 1-based to 0-based
        sorts.push({
          column: col,
          direction: dir.toLowerCase() as 'asc' | 'desc',
          priority,
        })
      }
    }
    
    // Sort by priority to ensure correct order
    return sorts.toSorted((a, b) => a.priority - b.priority)
  }, [getSortDirection, getSortIndex])

  // Handle sort change from PaginatedDataTable
  const handleSortChange = useCallback((newSorts: MultiSortState[]) => {
    // PaginatedDataTable manages the sort states array
    // We need to determine which column was clicked and notify parent
    
    // Compare new sorts with current sorts to find the changed column
    const currentSorts = sortStates
    
    // Find added or changed column
    const addedOrChanged = newSorts.find(newSort => {
      const existing = currentSorts.find(s => s.column === newSort.column)
      return !existing || existing.direction !== newSort.direction
    })
    
    // Find removed column
    const removed = currentSorts.find(currentSort => 
      !newSorts.find(s => s.column === currentSort.column)
    )
    
    // Notify parent of the column that changed
    const changedColumn = addedOrChanged?.column || removed?.column
    if (changedColumn) {
      onSortChange(changedColumn)
    }
  }, [sortStates, onSortChange])

  // Define table columns
  const columns: TableColumn<DocumentRequest>[] = useMemo(() => [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      render: (_value: unknown, row: DocumentRequest) => <span className={styles.idCell}>{row.id}</span>,
      width: '80px',
    },
    {
      key: 'sourceSystem',
      header: 'Source System',
      sortable: true,
      render: (_value: unknown, row: DocumentRequest) => row.sourceSystem.refDataValue,
      width: '140px',
    },
    {
      key: 'documentType',
      header: 'Document Type',
      sortable: true,
      render: (_value: unknown, row: DocumentRequest) => row.documentType.refDataValue,
      width: '140px',
    },
    {
      key: 'documentName',
      header: 'Document Name',
      sortable: true,
      render: (_value: unknown, row: DocumentRequest) => (
        <span className={styles.documentName} title={row.documentName.refDataValue}>
          {row.documentName.refDataValue}
        </span>
      ),
      width: '180px',
    },
    createStatusColumn<DocumentRequest>({
      key: 'documentStatus',
      header: 'Status',
      type: 'documentRequest',
      getStatus: (row) => row.documentStatus.refDataValue as DocumentRequestStatus,
      getDescription: (row) => row.documentStatus.description,
      width: '140px',
      sortable: true,
    }),
    createDateTimeColumn<DocumentRequest>('createdDat', 'Created', { width: '160px', sortable: true }),
    createDateTimeColumn<DocumentRequest>('lastUpdateDat', 'Last Updated', { width: '160px', sortable: true }),
    {
      key: 'actions',
      header: 'Actions',
      render: (_value: unknown, row: DocumentRequest) => (
        <Button
          hierarchy="tertiary"
          size="sm"
          icon={faEye}
          label="View details"
          tooltipPosition="left"
          onClick={() => handleViewDetails(row)}
        />
      ),
      width: '80px',
    },
  ], [handleViewDetails])

  return (
    <PaginatedDataTable
      data={data}
      columns={columns}
      rowKey={(row: DocumentRequest) => row.id}
      loading={isLoading}
      emptyState={{
        message: emptyMessage,
      }}
      error={error ? { error: true, message: error } : undefined}
      tableClassName={styles.table}
      selection={{
        selectedIds: selectedIdsArray,
        onSelectionChange: handleSelectionChange,
        getRowId: (row: DocumentRequest) => row.id,
      }}
      sort={{
        type: 'multi',
        sorts: sortStates,
        onSort: handleSortChange,
        mode: 'server',
        maxSorts: 3,
      }}
      pagination={{
        mode: 'server',
        currentPage,
        totalItems,
        pageSize,
        onPageChange,
        onPageSizeChange,
        pageSizeOptions: [10, 25, 50, 100],
        showPageSizeSelector: true,
        showInfo: true,
      }}
    />
  )
}
