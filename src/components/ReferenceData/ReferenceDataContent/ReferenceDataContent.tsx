'use client'

import { useCallback, useEffect, useState } from 'react'
import { Tabs, type TabItem } from '@/components/shared/Tabs'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ReferenceDataTypesTab } from '@/components/ReferenceData/ReferenceDataTypesTab'
import { ReferenceDataForm } from '@/components/ReferenceData/ReferenceDataForm'
import type { ReferenceData, ReferenceDataRequest } from '@/types/referenceData'

/**
 * Tab configuration for Reference Data page
 */
const TABS: TabItem[] = [
  { id: 'reference-data-types', label: 'Reference Data Types' },
  { id: 'reference-data-values', label: 'Reference Data Values' },
  { id: 'document-configurations', label: 'Document Configurations' },
]

/**
 * Modal state for create/edit/delete operations
 */
interface ModalState {
  type: 'create' | 'edit' | 'delete' | null
  item: ReferenceData | null
}

/**
 * Reference Data Page Content
 *
 * Client component that handles the tab navigation and data fetching
 * for the Reference Data management page.
 */
export function ReferenceDataContent() {
  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const [referenceDataTypes, setReferenceDataTypes] = useState<ReferenceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [modalState, setModalState] = useState<ModalState>({ type: null, item: null })
  const [deleteLoading, setDeleteLoading] = useState(false)

  /**
   * Fetch reference data types from API
   */
  const fetchReferenceDataTypes = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/reference-data/types')

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`)
      }

      const data = await response.json()
      setReferenceDataTypes(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch data on mount and tab change
  useEffect(() => {
    if (activeTab === 'reference-data-types') {
      fetchReferenceDataTypes()
    }
  }, [activeTab, fetchReferenceDataTypes])

  /**
   * Close any open modal
   */
  const closeModal = useCallback(() => {
    setModalState({ type: null, item: null })
  }, [])

  /**
   * Handle create new reference data type
   */
  const handleCreate = useCallback(() => {
    setModalState({ type: 'create', item: null })
  }, [])

  /**
   * Handle edit reference data type
   */
  const handleEdit = useCallback((item: ReferenceData) => {
    setModalState({ type: 'edit', item })
  }, [])

  /**
   * Handle delete reference data type
   */
  const handleDelete = useCallback((item: ReferenceData) => {
    setModalState({ type: 'delete', item })
  }, [])

  /**
   * Submit create/edit form
   */
  const handleFormSubmit = useCallback(
    async (data: ReferenceDataRequest) => {
      const isEdit = modalState.type === 'edit' && modalState.item !== null
      const editItem = modalState.item

      const url = isEdit && editItem
        ? `/api/reference-data/types/${editItem.id}`
        : '/api/reference-data/types'

      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error ?? `Failed to ${isEdit ? 'update' : 'create'} reference data`)
      }

      // Refresh data after successful create/edit
      await fetchReferenceDataTypes()
    },
    [modalState, fetchReferenceDataTypes]
  )

  /**
   * Confirm delete action
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!modalState.item) return

    setDeleteLoading(true)

    try {
      const response = await fetch(`/api/reference-data/types/${modalState.item.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error ?? 'Failed to delete reference data')
      }

      // Refresh data after successful delete
      await fetchReferenceDataTypes()
      closeModal()
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setDeleteLoading(false)
    }
  }, [modalState.item, fetchReferenceDataTypes, closeModal])

  /**
   * Render tab content based on active tab
   */
  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case 'reference-data-types':
        return (
          <ReferenceDataTypesTab
            data={referenceDataTypes}
            loading={loading}
            error={error}
            onRefresh={fetchReferenceDataTypes}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )
      case 'reference-data-values':
        return (
          <div style={{ padding: '24px', color: 'var(--color-gray-500)' }}>
            Reference Data Values tab content coming soon...
          </div>
        )
      case 'document-configurations':
        return (
          <div style={{ padding: '24px', color: 'var(--color-gray-500)' }}>
            Document Configurations tab content coming soon...
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Tabs
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="underline"
      >
        {renderTabContent}
      </Tabs>

      {/* Create/Edit Form Modal */}
      <ReferenceDataForm
        isOpen={modalState.type === 'create' || modalState.type === 'edit'}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        initialData={modalState.item}
        defaultRefDataType="REF_DATA_TYPE"
        mode={modalState.type === 'edit' ? 'edit' : 'create'}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={modalState.type === 'delete'}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
        title="Delete Reference Data"
        message={
          <>
            Are you sure you want to delete{' '}
            <strong>{modalState.item?.refDataValue}</strong>?
          </>
        }
        details="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />
    </>
  )
}
