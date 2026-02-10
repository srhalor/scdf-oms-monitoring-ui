'use client'

import { useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { DocumentRequest, DocumentRequestStatus } from '@/types/documentRequest'
import { TableColumn, SortState } from '@/types/referenceData'
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
  /** Whether all visible rows are selected */
  isAllSelected: boolean
  /** Whether some but not all visible rows are selected */
  isPartiallySelected: boolean
  /** Toggle selection for a row */
  onToggleSelection: (id: number) => void
  /** Toggle select all for visible rows */
  onToggleSelectAll: () => void
  /** Empty state message */
  emptyMessage?: string
}

/**
 * DocumentRequestTable component
 *
 * Displays document requests in a sortable table with:
 * - Row selection checkboxes
 * - Sortable column headers
 * - Status badges with colors
 * - View details link
 *
 * @example
 * <DocumentRequestTable
 *   data={requests}
 *   sorts={sorts}
 *   onSortChange={toggleSort}
 *   getSortDirection={getSortDirection}
 *   selectedIds={selectedIds}
 *   onToggleSelection={toggleSelection}
 *   onToggleSelectAll={toggleSelectAll}
 *   isAllSelected={isAllSelected}
 *   isPartiallySelected={isPartiallySelected}
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
  isAllSelected: _isAllSelected,
  isPartiallySelected: _isPartiallySelected,
  onToggleSelection,
  onToggleSelectAll: _onToggleSelectAll,
  emptyMessage = 'No document requests found. Try adjusting your filters.',
}: Readonly<DocumentRequestTableProps>) {
  const router = useRouter()

  // Handle view details - cache request data and navigate
  const handleViewDetails = useCallback((request: DocumentRequest) => {
    cacheDocumentRequest(request)
    router.push(`/document-request/${request.id}`)
  }, [router])

  // Handle selection change from DataTable
  const handleSelectionChange = useCallback(
    (keys: Set<string | number>) => {
      // DataTable returns Set<string | number>, but we need to sync with parent's onToggleSelection
      // Find which keys changed and toggle them
      const currentKeys = selectedIds
      
      // Find added keys
      keys.forEach((key) => {
        if (!currentKeys.has(key as number)) {
          onToggleSelection(key as number)
        }
      })
      
      // Find removed keys  
      currentKeys.forEach((key) => {
        if (!keys.has(key)) {
          onToggleSelection(key)
        }
      })
    },
    [selectedIds, onToggleSelection]
  )

  // Convert selectedIds to selectedKeys for DataTable
  const selectedKeys = useMemo(
    () => new Set<string | number>(selectedIds),
    [selectedIds]
  )

  // Convert parent's sort state to DataTable's SortState format
  // DataTable expects { column: string, direction: 'asc' | 'desc' | null }
  // Parent provides getSortDirection(property) => 'ASC' | 'DESC' | null
  // For multi-column sort, we show the LAST added sort column in the DataTable UI
  const sortState = useMemo((): SortState => {
    // Check sortable columns in reverse order to find the most recently added sort
    // This ensures clicking a new column shows it as the "active" sorted column
    const sortableColumns = ['id', 'sourceSystem', 'documentType', 'documentName', 'documentStatus', 'createdDat', 'lastUpdateDat']
    
    // Find all columns that have a sort direction
    const sortedColumns: { col: string; dir: 'ASC' | 'DESC' }[] = []
    for (const col of sortableColumns) {
      const dir = getSortDirection(col)
      if (dir) {
        sortedColumns.push({ col, dir })
      }
    }
    
    // Return the last sorted column (most recently added) for DataTable display
    const last = sortedColumns.at(-1)
    if (last) {
      return { column: last.col, direction: last.dir.toLowerCase() as 'asc' | 'desc' }
    }
    
    return { column: '', direction: null }
  }, [getSortDirection])

  // Handle DataTable sort change - convert back to parent's format
  const handleDataTableSortChange = useCallback((newSort: SortState) => {
    // DataTable cycles: asc -> desc -> null (with column: '' when null)
    // Parent's toggleSort handles its own cycling: null -> DESC -> ASC -> null
    // We just need to tell parent which column was clicked
    
    // If newSort has a column, use it
    // If newSort.column is empty (cycling to null), use current sortState.column
    const columnClicked = newSort.column || sortState.column
    if (columnClicked) {
      onSortChange(columnClicked)
    }
  }, [onSortChange, sortState.column])

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
      render: (_value: unknown, row: DocumentRequest) => row.sourceSystem.refDataValue,
      width: '140px',
    },
    {
      key: 'documentType',
      header: 'Document Type',
      render: (_value: unknown, row: DocumentRequest) => row.documentType.refDataValue,
      width: '140px',
    },
    {
      key: 'documentName',
      header: 'Document Name',
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
    }),
    createDateTimeColumn<DocumentRequest>('createdDat', 'Created', { width: '160px' }),
    createDateTimeColumn<DocumentRequest>('lastUpdateDat', 'Last Updated', { width: '160px' }),
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

  // Handle error state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
      </div>
    )
  }

  return (
    <div className={styles.tableContainer}>
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(row: DocumentRequest) => row.id}
        loading={isLoading}
        emptyMessage={emptyMessage}
        className={styles.table}
        selectable
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
        sort={sortState}
        onSortChange={handleDataTableSortChange}
        getColumnSortDirection={getSortDirection}
        getColumnSortIndex={getSortIndex}
      />
    </div>
  )
}
