'use client'

import { useCallback, useEffect, useState } from 'react'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { TextInput, TextArea, Select, DateInput } from '@/components/shared/FormField'
import { formatInputDate, getCurrentDate, DEFAULT_END_DATE } from '@/utils/dateUtils'
import type { ReferenceData } from '@/types/referenceData'
import type {
  DocumentConfiguration,
  DocumentConfigurationRequest,
} from '@/types/documentConfiguration'
import styles from './DocumentConfigurationForm.module.css'
import { logger } from '@/lib/logger'

export interface DocumentConfigurationFormProps {
  /** Whether the form modal is open */
  isOpen: boolean

  /** Callback to close the form */
  onClose: () => void

  /** Callback when form is submitted successfully */
  onSubmit: (data: DocumentConfigurationRequest) => Promise<void>

  /** Existing data for edit mode (null for create) */
  initialData?: DocumentConfiguration | null

  /** Form mode label override */
  mode?: 'create' | 'edit'

  /** Footer options for dropdown */
  footerOptions: ReferenceData[]

  /** App Doc Spec options for dropdown */
  appDocSpecOptions: ReferenceData[]

  /** Code options for dropdown */
  codeOptions: ReferenceData[]

  /** Loading state for dropdowns */
  optionsLoading?: boolean
}

interface FormData {
  footerId: string
  appDocSpecId: string
  codeId: string
  value: string
  description: string
  effectFromDat: string
  effectToDat: string
}

interface FormErrors {
  footerId?: string
  appDocSpecId?: string
  codeId?: string
  value?: string
  effectFromDat?: string
  effectToDat?: string
}

/**
 * DocumentConfigurationForm Component
 *
 * Reusable form modal for creating and editing document configurations.
 * Includes dropdowns for footer, appDocSpec, and code selection.
 */
export function DocumentConfigurationForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  footerOptions,
  appDocSpecOptions,
  codeOptions,
  optionsLoading = false,
}: Readonly<DocumentConfigurationFormProps>) {
  const isEditMode = mode === 'edit' || Boolean(initialData)
  const title = isEditMode ? 'Edit Document Configuration' : 'Create Document Configuration'

  // Form state
  const [formData, setFormData] = useState<FormData>({
    footerId: initialData?.footer?.id?.toString() ?? '',
    appDocSpecId: initialData?.appDocSpec?.id?.toString() ?? '',
    codeId: initialData?.code?.id?.toString() ?? '',
    value: initialData?.value ?? '',
    description: initialData?.desc ?? '',
    effectFromDat: formatInputDate(initialData?.effectFromDat) || getCurrentDate(),
    effectToDat: formatInputDate(initialData?.effectToDat) || DEFAULT_END_DATE,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  // Sync form data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        footerId: initialData?.footer?.id?.toString() ?? '',
        appDocSpecId: initialData?.appDocSpec?.id?.toString() ?? '',
        codeId: initialData?.code?.id?.toString() ?? '',
        value: initialData?.value ?? '',
        description: initialData?.desc ?? '',
        effectFromDat: formatInputDate(initialData?.effectFromDat) || getCurrentDate(),
        effectToDat: formatInputDate(initialData?.effectToDat) || DEFAULT_END_DATE,
      })
      setErrors({})
    }
  }, [isOpen, initialData])

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      footerId: initialData?.footer?.id?.toString() ?? '',
      appDocSpecId: initialData?.appDocSpec?.id?.toString() ?? '',
      codeId: initialData?.code?.id?.toString() ?? '',
      value: initialData?.value ?? '',
      description: initialData?.desc ?? '',
      effectFromDat: formatInputDate(initialData?.effectFromDat) || getCurrentDate(),
      effectToDat: formatInputDate(initialData?.effectToDat) || DEFAULT_END_DATE,
    })
    setErrors({})
  }, [initialData])

  // Handle field change
  const handleChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      // Clear field error on change
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    },
    [errors]
  )

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.footerId) {
      newErrors.footerId = 'Footer is required'
    }

    if (!formData.appDocSpecId) {
      newErrors.appDocSpecId = 'App Doc Spec is required'
    }

    if (!formData.codeId) {
      newErrors.codeId = 'Code is required'
    }

    if (!formData.value.trim()) {
      newErrors.value = 'Value is required'
    }

    if (!formData.effectFromDat) {
      newErrors.effectFromDat = 'Effective from date is required'
    }

    if (formData.effectFromDat && formData.effectToDat) {
      const fromDate = new Date(formData.effectFromDat)
      const toDate = new Date(formData.effectToDat)
      if (toDate < fromDate) {
        newErrors.effectToDat = 'End date must be after start date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Handle submit
  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()

      if (!validate()) {
        return
      }

      setLoading(true)

      try {
        const requestData: DocumentConfigurationRequest = {
          footerId: Number(formData.footerId),
          appDocSpecId: Number(formData.appDocSpecId),
          codeId: Number(formData.codeId),
          value: formData.value.trim(),
          description: formData.description.trim(),
          effectFromDat: formData.effectFromDat,
          effectToDat: formData.effectToDat,
        }

        await onSubmit(requestData)
        onClose()
        resetForm()
      } catch (error) {
        logger.error('DocumentConfigurationForm', 'Form submission error', error)
      } finally {
        setLoading(false)
      }
    },
    [formData, validate, onSubmit, onClose, resetForm]
  )

  // Handle cancel
  const handleCancel = useCallback(() => {
    resetForm()
    onClose()
  }, [onClose, resetForm])

  const footer = (
    <>
      <Button hierarchy="secondary" size="md" onClick={handleCancel} disabled={loading}>
        Cancel
      </Button>
      <Button
        hierarchy="primary"
        size="md"
        type="submit"
        loading={loading}
        onClick={handleSubmit}
      >
        {isEditMode ? 'Save Changes' : 'Create'}
      </Button>
    </>
  )

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title={title} size="md" footer={footer}>
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Footer Dropdown */}
        <Select
          label="Footer"
          name="footerId"
          value={formData.footerId}
          onChange={(e) => handleChange('footerId', e.target.value)}
          required
          error={errors.footerId}
          disabled={optionsLoading}
          options={footerOptions.map((item) => ({
            value: item.id.toString(),
            label: item.refDataValue,
          }))}
          placeholder="Select footer..."
        />

        {/* App Doc Spec Dropdown */}
        <Select
          label="App Doc Spec"
          name="appDocSpecId"
          value={formData.appDocSpecId}
          onChange={(e) => handleChange('appDocSpecId', e.target.value)}
          required
          error={errors.appDocSpecId}
          disabled={optionsLoading}
          options={appDocSpecOptions.map((item) => ({
            value: item.id.toString(),
            label: item.refDataValue,
          }))}
          placeholder="Select app doc spec..."
        />

        {/* Code Dropdown */}
        <Select
          label="Code"
          name="codeId"
          value={formData.codeId}
          onChange={(e) => handleChange('codeId', e.target.value)}
          required
          error={errors.codeId}
          disabled={optionsLoading}
          options={codeOptions.map((item) => ({
            value: item.id.toString(),
            label: item.refDataValue,
          }))}
          placeholder="Select code..."
        />

        {/* Value */}
        <TextInput
          label="Value"
          name="value"
          value={formData.value}
          onChange={(e) => handleChange('value', e.target.value)}
          placeholder="Enter value..."
          required
          error={errors.value}
        />

        {/* Description (optional) */}
        <TextArea
          label="Description"
          name="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter description (optional)..."
          rows={3}
        />

        {/* Effective Dates */}
        <div className={styles.row}>
          <DateInput
            label="Effective From"
            name="effectFromDat"
            value={formData.effectFromDat}
            onChange={(e) => handleChange('effectFromDat', e.target.value)}
            required
            error={errors.effectFromDat}
          />
          <DateInput
            label="Effective To"
            name="effectToDat"
            value={formData.effectToDat}
            onChange={(e) => handleChange('effectToDat', e.target.value)}
            error={errors.effectToDat}
          />
        </div>
      </form>
    </Modal>
  )
}
