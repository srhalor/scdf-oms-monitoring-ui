import { ReactNode } from 'react'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
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

  // Build table rows with actions
  const tableRows = (data ?? []).map((item) => {
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
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button
              hierarchy="secondary"
              size="sm"
              onClick={() => openEditModal(item)}
            >
              Edit
            </Button>
            <Button
              hierarchy="secondary"
              size="sm"
              variant="destructive"
              onClick={() => openDeleteModal(item)}
            >
              Delete
            </Button>
          </div>
        )

    return row
  })

  // Build table columns with actions
  const tableColumns = [
    ...columns.map((col) => ({
      key: col.key,
      header: col.label,
      width: col.width,
      sortable: false,
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
        <DataTable
          columns={tableColumns}
          data={tableRows}
          loading={loading}
          emptyMessage={error || emptyMessage}
          getRowKey={(row) => row.__id}
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
