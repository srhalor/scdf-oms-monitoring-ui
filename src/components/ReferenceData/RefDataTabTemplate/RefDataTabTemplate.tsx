import { ReactNode, useState } from 'react'
import { faPlus, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons'
import { ConfirmDialog } from '@/components/domain'
import refDataStyles from '@/components/ReferenceData/styles.module.css'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PaginatedDataTable } from '@/components/ui/PaginatedDataTable'
import type { TableColumn } from '@/components/ui/DataTable/types'
import type { UseRefDataCrudReturn } from '@/hooks/useRefDataCrud'

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
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Reset to page 1 when search changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  // Reset to page 1 when sort changes
  const handleSort = (column: string, direction: 'asc' | 'desc' | null) => {
    setSortColumn(column)
    setSortDirection(direction)
    setCurrentPage(1)
  }

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

  // Convert RefDataColumn to TableColumn format
  const tableColumns: TableColumn<TData>[] = columns.map((col) => ({
    key: col.key,
    header: col.label,
    width: col.width,
    sortable: col.sortable ?? true,
    // Adapt render function: RefDataColumn uses (item) => node, TableColumn uses (value, row) => node
    render: col.render ? (_value, row) => col.render!(row) : undefined,
  }))

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
        <PaginatedDataTable
          data={data ?? []}
          columns={tableColumns}
          rowKey="id"
          filter={{
            value: searchQuery,
            onChange: handleSearchChange,
            placeholder: `Search ${title.toLowerCase()}...`,
            mode: 'client',
          }}
          sort={{
            type: 'single',
            column: sortColumn,
            direction: sortDirection,
            onSort: handleSort,
            mode: 'client',
          }}
          pagination={{
            currentPage,
            totalItems: data?.length ?? 0,
            pageSize,
            onPageChange: setCurrentPage,
            onPageSizeChange: handlePageSizeChange,
            pageSizeOptions: [10, 25, 50],
            showPageSizeSelector: true,
            showInfo: true,
            mode: 'client',
          }}
          rowActions={{
            header: 'Actions',
            width: '200px',
            render: (item) =>
              renderRowActions ? (
                renderRowActions(item, () => openEditModal(item), () => openDeleteModal(item))
              ) : (
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
              ),
          }}
          loading={loading}
          error={
            error
              ? {
                  error: true,
                  message: error,
                }
              : undefined
          }
          emptyState={{
            message: 'No Data Found',
            description: emptyMessage,
          }}
        />
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