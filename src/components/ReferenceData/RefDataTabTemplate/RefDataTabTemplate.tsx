import { ReactNode, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { ConfirmDialog } from '@/components/domain'
import { faPlus, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons'
import type { UseRefDataCrudReturn } from '@/hooks/useRefDataCrud'
import type { SortState } from '@/components/ui/DataTable/types'
import commonStyles from '@/styles/common.module.css'
import refDataStyles from '@/components/ReferenceData/styles.module.css'

export interface RefDataColumn<T> {
  /** Column key */
  key: string
  /** Column label */
  label: string
  /** Optional render function */
  render?: (item: T) => ReactNode
  /** Optional width */
  width?: string
  /** Optional sortable flag (default: true) */
  sortable?: boolean
}

export interface RefDataTabTemplateProps<TData extends { id: number }, TRequest> {
  /** Title for the tab/card */
  title: string
  
  /** CRUD hook return value */
  crud: UseRefDataCrudReturn<TData, TRequest>
  
  /** Table columns configuration */
  columns: RefDataColumn<TData>[]
  
  /** Form component to render in modal */
  FormComponent: React.ComponentType<{
    readonly isOpen: boolean
    readonly onClose: () => void
    readonly onSubmit: (data: TRequest) => Promise<void>
    readonly initialData?: TData | null
    readonly mode?: 'create' | 'edit'
    readonly [key: string]: unknown
  }>
  
  /** Additional props to pass to form component */
  formProps?: Record<string, unknown>
  
  /** Optional: Custom empty state message */
  emptyMessage?: string
  
  /** Optional: Custom create button text */
  createButtonText?: string
  
  /** Optional: Custom delete confirmation message */
  deleteConfirmMessage?: (item: TData) => string
  
  /** Optional: Additional actions to render in table rows */
  renderRowActions?: (item: TData, onEdit: () => void, onDelete: () => void) => ReactNode
}

/**
 * RefDataTabTemplate Component
 *
 * Reusable template for reference data management tabs.
 * Provides table, form modal, delete confirmation, and consistent layout.
 *
 * Features:
 * - Data table with loading/error/empty states
 * - Client-side sorting, pagination, and filtering
 * - Create button
 * - Form modal for create/edit
 * - Delete confirmation dialog
 * - Standardized action buttons (Edit/Delete)
 * - Customizable via props and render functions
 *
 * @example
 * ```tsx
 * <RefDataTabTemplate
 *   title="Reference Data Types"
 *   crud={typesCrud}
 *   columns={[
 *     { key: 'refDataType', label: 'Type' },
 *     { key: 'description', label: 'Description' }
 *   ]}
 *   FormComponent={ReferenceDataForm}
 *   formProps={{ defaultRefDataType: 'TYPE' }}
 * />
 * ```
 */
export function RefDataTabTemplate<TData extends { id: number }, TRequest>({
  title,
  crud,
  columns,
  FormComponent,
  formProps = {},
  emptyMessage = 'No data found',
  createButtonText = 'Create New',
  deleteConfirmMessage,
  renderRowActions,
}: Readonly<RefDataTabTemplateProps<TData, TRequest>>) {
  const {
    data,
    loading,
    error,
    save,
    remove,
    isSaving: _isSaving,
    isDeleting,
    modalState,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModal,
  } = crud

  // Client-side filtering, sorting, and pagination state
  const [searchQuery, setSearchQuery] = useState('')
  const [sortState, setSortState] = useState<SortState>({ column: '', direction: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Reset to page 1 when search changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!data || !searchQuery) {
      return data ?? []
    }

    const query = searchQuery.toLowerCase()
    return data.filter((item) => {
      // Search across all column values
      return columns.some((col) => {
        const value = (item as Record<string, unknown>)[col.key]
        // Only search primitive values (string, number, boolean)
        const isPrimitive =
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean'
        
        if (!isPrimitive) {
          return false
        }
        
        return String(value).toLowerCase().includes(query)
      })
    })
  }, [data, searchQuery, columns])

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  // Reset page when pageSize changes
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

  // Handle form submission
  const handleFormSubmit = async (formData: TRequest): Promise<void> => {
    const isEdit = modalState.type === 'edit'
    const id = modalState.item?.id
    save(formData, isEdit, id)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (modalState.item) {
      remove(modalState.item.id)
    }
  }

  // Build table rows with actions (use paginated data)
  const tableRows = paginatedData.map((item) => {
    const row: Record<string, ReactNode> & { __id: number } = { __id: item.id }
    
    // Add column data
    columns.forEach((col) => {
      if (col.render) {
        row[col.key] = col.render(item)
      } else {
        row[col.key] = (item as Record<string, unknown>)[col.key] as ReactNode
      }
    })

    // Add actions column
    row.actions = renderRowActions
      ? renderRowActions(item, () => openEditModal(item), () => openDeleteModal(item))
      : (
          <div className={refDataStyles.actionButtons}>
            <Button
              icon={faPencil}
              label="Edit"
              hierarchy="tertiary"
              size="sm"
              onClick={() => openEditModal(item)}
              tooltipPosition="left"
            />
            <Button
              icon={faTrash}
              label="Delete"
              hierarchy="tertiary"
              size="sm"
              variant="destructive"
              onClick={() => openDeleteModal(item)}
              tooltipPosition="left"
            />
          </div>
        )

    return row
  })

  // Build table columns with actions (enable sorting by default)
  const tableColumns = [
    ...columns.map((col) => ({
      key: col.key,
      header: col.label,
      width: col.width,
      sortable: col.sortable ?? true, // Enable sorting by default
    })),
    {
      key: 'actions',
      header: 'Actions',
      width: '200px',
      sortable: false,
    },
  ]

  return (
    <>
      <Card
        title={title}
        actions={
          <Button
            hierarchy="primary"
            size="md"
            iconBefore={faPlus}
            onClick={openCreateModal}
          >
            {createButtonText}
          </Button>
        }
      >
        {/* Search Input */}
        <div className={commonStyles.searchWrapper}>
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={`Search ${title.toLowerCase()}...`}
            clearable
          />
        </div>

        {/* Table and Pagination Wrapper */}
        <div className={commonStyles.tableWrapper}>
          {/* Data Table */}
          <DataTable
            columns={tableColumns}
            data={tableRows}
            loading={loading}
            emptyMessage={error || emptyMessage}
            getRowKey={(row) => row.__id}
            sort={sortState}
            onSortChange={setSortState}
          />

          {/* Pagination */}
          {!loading && filteredData.length > 0 && (
            <div className={commonStyles.paginationWrapper}>
              <Pagination
                currentPage={currentPage}
                totalItems={filteredData.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={handlePageSizeChange}
                showPageSizeSelector
                showInfo
              />
            </div>
          )}
        </div>
      </Card>

      {/* Form Modal */}
      <FormComponent
        isOpen={modalState.type === 'create' || modalState.type === 'edit'}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        initialData={modalState.item}
        mode={modalState.type === 'edit' ? 'edit' : 'create'}
        {...formProps}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={modalState.type === 'delete'}
        title="Confirm Delete"
        message={
          deleteConfirmMessage && modalState.item
            ? deleteConfirmMessage(modalState.item)
            : 'Are you sure you want to delete this item? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onClose={closeModal}
        variant="danger"
        loading={isDeleting}
      />
    </>
  )
}
