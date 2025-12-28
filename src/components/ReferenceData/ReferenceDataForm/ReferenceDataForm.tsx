'use client'

import { useCallback, useEffect, useState } from 'react'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import {
  TextInput,
  TextArea,
  DateInput,
  Checkbox,
} from '@/components/shared/FormField'
import { formatInputDate, getCurrentDate, DEFAULT_END_DATE } from '@/utils/dateUtils'
import type { ReferenceData, ReferenceDataRequest } from '@/types/referenceData'
import styles from './ReferenceDataForm.module.css'

export interface ReferenceDataFormProps {
  /** Whether the form modal is open */
  isOpen: boolean

  /** Callback to close the form */
  onClose: () => void

  /** Callback when form is submitted successfully */
  onSubmit: (data: ReferenceDataRequest) => Promise<void>

  /** Existing data for edit mode (null for create) */
  initialData?: ReferenceData | null

  /** Default reference data type (for create mode) */
  defaultRefDataType?: string

  /** Form mode label override */
  mode?: 'create' | 'edit'
}

interface FormErrors {
  refDataType?: string
  refDataValue?: string
  description?: string
  effectFromDat?: string
  effectToDat?: string
}

/**
 * ReferenceDataForm Component
 *
 * Reusable form modal for creating and editing reference data items.
 * Includes validation and loading states.
 */
export function ReferenceDataForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultRefDataType = '',
  mode,
}: Readonly<ReferenceDataFormProps>) {
  const isEditMode = mode === 'edit' || Boolean(initialData)
  const title = isEditMode ? 'Edit Reference Data' : 'Create Reference Data'

  // Form state
  const [formData, setFormData] = useState<ReferenceDataRequest>({
    refDataType: initialData?.refDataType ?? defaultRefDataType,
    refDataValue: initialData?.refDataValue ?? '',
    description: initialData?.description ?? '',
    editable: initialData?.editable ?? true,
    effectFromDat: formatInputDate(initialData?.effectFromDat) || getCurrentDate(),
    effectToDat: formatInputDate(initialData?.effectToDat) || DEFAULT_END_DATE,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  // Sync form data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        refDataType: initialData?.refDataType ?? defaultRefDataType,
        refDataValue: initialData?.refDataValue ?? '',
        description: initialData?.description ?? '',
        editable: initialData?.editable ?? true,
        effectFromDat: formatInputDate(initialData?.effectFromDat) || getCurrentDate(),
        effectToDat: formatInputDate(initialData?.effectToDat) || DEFAULT_END_DATE,
      })
      setErrors({})
    }
  }, [isOpen, initialData, defaultRefDataType])

  // Reset form when modal opens/closes or initialData changes
  const resetForm = useCallback(() => {
    setFormData({
      refDataType: initialData?.refDataType ?? defaultRefDataType,
      refDataValue: initialData?.refDataValue ?? '',
      description: initialData?.description ?? '',
      editable: initialData?.editable ?? true,
      effectFromDat: formatInputDate(initialData?.effectFromDat) || getCurrentDate(),
      effectToDat: formatInputDate(initialData?.effectToDat) || DEFAULT_END_DATE,
    })
    setErrors({})
  }, [initialData, defaultRefDataType])

  // Handle field change
  const handleChange = useCallback(
    (field: keyof ReferenceDataRequest, value: string | boolean) => {
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

    if (!formData.refDataType.trim()) {
      newErrors.refDataType = 'Reference data type is required'
    }

    if (!formData.refDataValue.trim()) {
      newErrors.refDataValue = 'Value is required'
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
        await onSubmit(formData)
        onClose()
        resetForm()
      } catch (error) {
        // Error handling is done by parent component
        console.error('Form submission error:', error)
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
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      size="md"
      footer={footer}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Reference Data Type - Always readonly */}
        <TextInput
          label="Reference Data Type"
          name="refDataType"
          value={formData.refDataType}
          readOnly
          disabled
        />

        {/* Value */}
        <TextInput
          label="Value"
          name="refDataValue"
          value={formData.refDataValue}
          onChange={(e) => handleChange('refDataValue', e.target.value)}
          placeholder="Enter value..."
          required
          error={errors.refDataValue}
        />

        {/* Description (optional) */}
        <TextArea
          label="Description"
          name="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter description (optional)..."
          rows={3}
          error={errors.description}
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

        {/* Editable Checkbox */}
        <div className={styles.checkboxRow}>
          <Checkbox
            label="Allow editing after creation"
            name="editable"
            checked={formData.editable}
            onChange={(e) => handleChange('editable', e.target.checked)}
          />
        </div>
      </form>
    </Modal>
  )
}
