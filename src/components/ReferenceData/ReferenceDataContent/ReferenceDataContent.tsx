'use client'

import { useCallback, useEffect, useState } from 'react'
import { Tabs, type TabItem } from '@/components/shared/Tabs'
import { logger } from '@/lib/logger'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ReferenceDataTypesTab } from '@/components/ReferenceData/ReferenceDataTypesTab'
import { ReferenceDataValuesTab } from '@/components/ReferenceData/ReferenceDataValuesTab'
import { ReferenceDataForm } from '@/components/ReferenceData/ReferenceDataForm'
import { DocumentConfigurationsTab } from '@/components/ReferenceData/DocumentConfigurationsTab'
import { DocumentConfigurationForm } from '@/components/ReferenceData/DocumentConfigurationForm'
import type { ReferenceData, ReferenceDataRequest } from '@/types/referenceData'
import type { DocumentConfiguration, DocumentConfigurationRequest } from '@/types/documentConfiguration'

/**
 * Tab configuration for Reference Data page
 */
const TAB_IDS = {
  TYPES: 'reference-data-types',
  VALUES: 'reference-data-values',
  CONFIGURATIONS: 'document-configurations',
} as const

const TABS: TabItem[] = [
  { id: TAB_IDS.TYPES, label: 'Reference Data Types' },
  { id: TAB_IDS.VALUES, label: 'Reference Data Values' },
  { id: TAB_IDS.CONFIGURATIONS, label: 'Document Configurations' },
]

// Shared message fragments
const FETCH_FAILED_PREFIX = 'Failed to fetch: '
const FAILED_LOAD_MSG = 'Failed to load data'

/**
 * Modal state for create/edit/delete operations
 */
/**
 * Modal actions (use enum to avoid large union literal types)
 */
enum ModalAction {
  Create = 'create',
  Edit = 'edit',
  Delete = 'delete',
}

interface ModalState {
  type: ModalAction | null
  item: ReferenceData | null
  /** Context for which tab the modal is from */
  context: 'types' | 'values' | 'configurations'
}

/**
 * Modal state for document configuration operations
 */
interface DocConfigModalState {
  type: ModalAction | null
  item: DocumentConfiguration | null
}

/**
 * Reference Data Page Content
 *
 * Client component that handles the tab navigation and data fetching
 * for the Reference Data management page.
 */
export function ReferenceDataContent() {
  const basePath = process.env.NEXT_PUBLIC_BASEPATH || ''
  const [activeTab, setActiveTab] = useState<string>(TAB_IDS.CONFIGURATIONS)

  // Reference Data Types tab state
  const [referenceDataTypes, setReferenceDataTypes] = useState<ReferenceData[]>([])
  const [typesLoading, setTypesLoading] = useState(true)
  const [typesError, setTypesError] = useState<string | null>(null)

  // Reference Data Values tab state
  const [selectedRefDataType, setSelectedRefDataType] = useState('')
  const [referenceDataValues, setReferenceDataValues] = useState<ReferenceData[]>([])
  const [valuesLoading, setValuesLoading] = useState(false)
  const [valuesError, setValuesError] = useState<string | null>(null)

  // Modal state
  const [modalState, setModalState] = useState<ModalState>({ type: null, item: null, context: 'types' })
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Document Configurations tab state
  const [documentConfigurations, setDocumentConfigurations] = useState<DocumentConfiguration[]>([])
  const [configsLoading, setConfigsLoading] = useState(false)
  const [configsError, setConfigsError] = useState<string | null>(null)

  // Document Configuration modal state
  const [docConfigModalState, setDocConfigModalState] = useState<DocConfigModalState>({
    type: null,
    item: null,
  })
  const [docConfigDeleteLoading, setDocConfigDeleteLoading] = useState(false)

  // Dropdown options for document configuration form
  const [footerOptions, setFooterOptions] = useState<ReferenceData[]>([])
  const [appDocSpecOptions, setAppDocSpecOptions] = useState<ReferenceData[]>([])
  const [codeOptions, setCodeOptions] = useState<ReferenceData[]>([])
  const [optionsLoading, setOptionsLoading] = useState(false)

  /**
   * Fetch reference data types from API
   */
  const fetchReferenceDataTypes = useCallback(async () => {
    setTypesLoading(true)
    setTypesError(null)

    try {
      const response = await fetch(`${basePath}/api/reference-data/types`)

      if (!response.ok) {
        throw new Error(`${FETCH_FAILED_PREFIX}${response.statusText}`)
      }

      const data = await response.json()
      setReferenceDataTypes(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : FAILED_LOAD_MSG
      setTypesError(message)
    } finally {
      setTypesLoading(false)
    }
  }, [])

  /**
   * Fetch reference data values by type from API
   */
  const fetchReferenceDataValues = useCallback(async (type: string) => {
    if (!type) {
      setReferenceDataValues([])
      return
    }

    setValuesLoading(true)
    setValuesError(null)

    try {
      const response = await fetch(`${basePath}/api/reference-data/types?refDataType=${encodeURIComponent(type)}`)

      if (!response.ok) {
        throw new Error(`${FETCH_FAILED_PREFIX}${response.statusText}`)
      }

      const data = await response.json()
      setReferenceDataValues(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : FAILED_LOAD_MSG
      setValuesError(message)
    } finally {
      setValuesLoading(false)
    }
  }, [])

  /**
   * Fetch document configurations from API
   */
  const fetchDocumentConfigurations = useCallback(async () => {
    setConfigsLoading(true)
    setConfigsError(null)

    try {
      const response = await fetch(`${basePath}/api/document-configurations`)

      if (!response.ok) {
        throw new Error(`${FETCH_FAILED_PREFIX}${response.statusText}`)
      }

      const data = await response.json()
      setDocumentConfigurations(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : FAILED_LOAD_MSG
      setConfigsError(message)
    } finally {
      setConfigsLoading(false)
    }
  }, [])

  /**
   * Fetch dropdown options for document configuration form
   */
  const fetchDocConfigOptions = useCallback(async () => {
    setOptionsLoading(true)

    try {
      const [footerRes, appDocSpecRes, codeRes] = await Promise.all([
        fetch(`${basePath}/api/reference-data/types?refDataType=FOOTER_ID`),
        fetch(`${basePath}/api/reference-data/types?refDataType=APP_DOC_SPEC`),
        fetch(`${basePath}/api/reference-data/types?refDataType=DOC_CONFIG_CODE`),
      ])

      if (footerRes.ok) {
        setFooterOptions(await footerRes.json())
      }
      if (appDocSpecRes.ok) {
        setAppDocSpecOptions(await appDocSpecRes.json())
      }
      if (codeRes.ok) {
        setCodeOptions(await codeRes.json())
      }
    } catch (err) {
      logger.error('ReferenceDataContent', 'Failed to fetch dropdown options', err)
    } finally {
      setOptionsLoading(false)
    }
  }, [])

  // Fetch types on mount and when switching to types tab
  useEffect(() => {
    if (activeTab === TAB_IDS.TYPES) {
      fetchReferenceDataTypes()
    }
  }, [activeTab, fetchReferenceDataTypes])

  // Fetch types for dropdown when switching to values tab
  useEffect(() => {
    if (activeTab === TAB_IDS.VALUES && referenceDataTypes.length === 0) {
      fetchReferenceDataTypes()
    }
  }, [activeTab, referenceDataTypes.length, fetchReferenceDataTypes])

  // Fetch values when selected type changes
  useEffect(() => {
    if (activeTab === TAB_IDS.VALUES && selectedRefDataType) {
      fetchReferenceDataValues(selectedRefDataType)
    }
  }, [activeTab, selectedRefDataType, fetchReferenceDataValues])

  // Fetch document configurations when switching to configurations tab
  useEffect(() => {
    if (activeTab === TAB_IDS.CONFIGURATIONS) {
      fetchDocumentConfigurations()
    }
  }, [activeTab, fetchDocumentConfigurations])

  // Fetch dropdown options when opening document configuration form
  useEffect(() => {
    if (docConfigModalState.type === ModalAction.Create || docConfigModalState.type === ModalAction.Edit) {
      fetchDocConfigOptions()
    }
  }, [docConfigModalState.type, fetchDocConfigOptions])

  /**
   * Handle type selection change in values tab
   */
  const handleTypeChange = useCallback((type: string) => {
    setSelectedRefDataType(type)
  }, [])

  /**
   * Close any open modal
   */
  const closeModal = useCallback(() => {
    setModalState({ type: null, item: null, context: 'types' })
  }, [])

  /**
   * Handle create new reference data (types tab)
   */
  const handleCreateType = useCallback(() => {
    setModalState({ type: ModalAction.Create, item: null, context: 'types' })
  }, [])

  /**
   * Handle create new reference data (values tab)
   */
  const handleCreateValue = useCallback(() => {
    setModalState({ type: ModalAction.Create, item: null, context: 'values' })
  }, [])

  /**
   * Handle edit reference data (types tab)
   */
  const handleEditType = useCallback((item: ReferenceData) => {
    setModalState({ type: ModalAction.Edit, item, context: 'types' })
  }, [])

  /**
   * Handle edit reference data (values tab)
   */
  const handleEditValue = useCallback((item: ReferenceData) => {
    setModalState({ type: ModalAction.Edit, item, context: 'values' })
  }, [])

  /**
   * Handle delete reference data (types tab)
   */
  const handleDeleteType = useCallback((item: ReferenceData) => {
    setModalState({ type: ModalAction.Delete, item, context: 'types' })
  }, [])

  /**
   * Handle delete reference data (values tab)
   */
  const handleDeleteValue = useCallback((item: ReferenceData) => {
    setModalState({ type: ModalAction.Delete, item, context: 'values' })
  }, [])

  /**
   * Submit create/edit form
   */
  const handleFormSubmit = useCallback(
    async (data: ReferenceDataRequest) => {
      const isEdit = modalState.type === 'edit' && modalState.item !== null
      const editItem = modalState.item
      const isValuesContext = modalState.context === 'values'

      const url = isEdit && editItem
        ? `${basePath}/api/reference-data/types/${editItem.id}`
        : `${basePath}/api/reference-data/types`

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
      if (isValuesContext) {
        await fetchReferenceDataValues(selectedRefDataType)
      } else {
        await fetchReferenceDataTypes()
      }
    },
    [modalState, fetchReferenceDataTypes, fetchReferenceDataValues, selectedRefDataType]
  )

  /**
   * Confirm delete action
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!modalState.item) {
      return
    }

    setDeleteLoading(true)
    const isValuesContext = modalState.context === 'values'

    try {
      const response = await fetch(`${basePath}/api/reference-data/types/${modalState.item.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error ?? 'Failed to delete reference data')
      }

      // Refresh data after successful delete
      if (isValuesContext) {
        await fetchReferenceDataValues(selectedRefDataType)
      } else {
        await fetchReferenceDataTypes()
      }
      closeModal()
    } catch (err) {
      logger.error('ReferenceDataContent', 'Delete error', err)
    } finally {
      setDeleteLoading(false)
    }
  }, [modalState.item, modalState.context, fetchReferenceDataTypes, fetchReferenceDataValues, selectedRefDataType, closeModal])

  /**
   * Close document configuration modal
   */
  const closeDocConfigModal = useCallback(() => {
    setDocConfigModalState({ type: null, item: null })
  }, [])

  /**
   * Handle create new document configuration
   */
  const handleCreateDocConfig = useCallback(() => {
    setDocConfigModalState({ type: ModalAction.Create, item: null })
  }, [])

  /**
   * Handle edit document configuration
   */
  const handleEditDocConfig = useCallback((item: DocumentConfiguration) => {
    setDocConfigModalState({ type: ModalAction.Edit, item })
  }, [])

  /**
   * Handle delete document configuration
   */
  const handleDeleteDocConfig = useCallback((item: DocumentConfiguration) => {
    setDocConfigModalState({ type: ModalAction.Delete, item })
  }, [])

  /**
   * Submit document configuration create/edit form
   */
  const handleDocConfigFormSubmit = useCallback(
    async (data: DocumentConfigurationRequest) => {
      const isEdit = docConfigModalState.type === 'edit' && docConfigModalState.item !== null
      const editItem = docConfigModalState.item

      const url = isEdit && editItem
        ? `${basePath}/api/document-configurations/${editItem.id}`
        : `${basePath}/api/document-configurations`

      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error ?? `Failed to ${isEdit ? 'update' : 'create'} document configuration`
        )
      }

      // Refresh data after successful create/edit
      await fetchDocumentConfigurations()
    },
    [docConfigModalState, fetchDocumentConfigurations]
  )

  /**
   * Confirm delete document configuration
   */
  const handleConfirmDeleteDocConfig = useCallback(async () => {
    if (!docConfigModalState.item) {
      return
    }

    setDocConfigDeleteLoading(true)

    try {
      const response = await fetch(`${basePath}/api/document-configurations/${docConfigModalState.item.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error ?? 'Failed to delete document configuration')
      }

      // Refresh data after successful delete
      await fetchDocumentConfigurations()
      closeDocConfigModal()
    } catch (err) {
      logger.error('ReferenceDataContent', 'Delete error', err)
    } finally {
      setDocConfigDeleteLoading(false)
    }
  }, [docConfigModalState.item, fetchDocumentConfigurations, closeDocConfigModal])

  /**
   * Render tab content based on active tab
   */
  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case TAB_IDS.TYPES:
        return (
          <ReferenceDataTypesTab
            data={referenceDataTypes}
            loading={typesLoading}
            error={typesError}
            onRefresh={fetchReferenceDataTypes}
            onCreate={handleCreateType}
            onEdit={handleEditType}
            onDelete={handleDeleteType}
          />
        )
      case TAB_IDS.VALUES:
        return (
          <ReferenceDataValuesTab
            refDataTypes={referenceDataTypes}
            typesLoading={typesLoading}
            data={referenceDataValues}
            loading={valuesLoading}
            error={valuesError}
            selectedType={selectedRefDataType}
            onTypeChange={handleTypeChange}
            onRefresh={() => fetchReferenceDataValues(selectedRefDataType)}
            onCreate={handleCreateValue}
            onEdit={handleEditValue}
            onDelete={handleDeleteValue}
          />
        )
      case TAB_IDS.CONFIGURATIONS:
        return (
          <DocumentConfigurationsTab
            data={documentConfigurations}
            loading={configsLoading}
            error={configsError}
            onRefresh={fetchDocumentConfigurations}
            onCreate={handleCreateDocConfig}
            onEdit={handleEditDocConfig}
            onDelete={handleDeleteDocConfig}
          />
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
        defaultRefDataType={modalState.context === 'values' ? selectedRefDataType : 'REF_DATA_TYPE'}
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

      {/* Document Configuration Create/Edit Form Modal */}
      <DocumentConfigurationForm
        isOpen={docConfigModalState.type === 'create' || docConfigModalState.type === 'edit'}
        onClose={closeDocConfigModal}
        onSubmit={handleDocConfigFormSubmit}
        initialData={docConfigModalState.item}
        mode={docConfigModalState.type === 'edit' ? 'edit' : 'create'}
        footerOptions={footerOptions}
        appDocSpecOptions={appDocSpecOptions}
        codeOptions={codeOptions}
        optionsLoading={optionsLoading}
      />

      {/* Document Configuration Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={docConfigModalState.type === 'delete'}
        onClose={closeDocConfigModal}
        onConfirm={handleConfirmDeleteDocConfig}
        title="Delete Document Configuration"
        message={
          <>
            Are you sure you want to delete document configuration{' '}
            <strong>{docConfigModalState.item?.value}</strong>?
          </>
        }
        details="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={docConfigDeleteLoading}
      />
    </>
  )
}
