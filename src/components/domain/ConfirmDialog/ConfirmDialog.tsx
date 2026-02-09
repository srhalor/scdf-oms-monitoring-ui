'use client'

import { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTrash,
  faTriangleExclamation,
  faCircleInfo,
  faCircleQuestion,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import styles from './ConfirmDialog.module.css'

export type ConfirmVariant = 'danger' | 'warning' | 'info' | 'default'

export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean

  /** Callback when dialog should close */
  onClose: () => void

  /** Callback when user confirms */
  onConfirm: () => void

  /** Dialog title */
  title: string

  /** Main message to display */
  message: string | ReactNode

  /** Additional details (optional) */
  details?: string

  /** Confirm button text */
  confirmText?: string

  /** Cancel button text */
  cancelText?: string

  /** Dialog variant (affects icon and styling) */
  variant?: ConfirmVariant

  /** Custom icon (overrides variant icon) */
  icon?: IconDefinition

  /** Loading state for confirm button */
  loading?: boolean

  /** Disable confirm button */
  confirmDisabled?: boolean
}

/** Default icons for each variant */
const VARIANT_ICONS: Record<ConfirmVariant, IconDefinition> = {
  danger: faTrash,
  warning: faTriangleExclamation,
  info: faCircleInfo,
  default: faCircleQuestion,
}

/**
 * ConfirmDialog Component
 *
 * Reusable confirmation dialog for destructive actions, warnings, and confirmations.
 * Built on top of Modal component with centered content and icon.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  details,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  icon,
  loading = false,
  confirmDisabled = false,
}: Readonly<ConfirmDialogProps>) {
  const displayIcon = icon ?? VARIANT_ICONS[variant]
  const isDestructive = variant === 'danger'

  const handleConfirm = () => {
    onConfirm()
  }

  const footer = (
    <div className={styles.footer}>
      <Button hierarchy="secondary" size="md" onClick={onClose} disabled={loading}>
        {cancelText}
      </Button>
      <Button
        hierarchy="primary"
        variant={isDestructive ? 'destructive' : 'default'}
        size="md"
        onClick={handleConfirm}
        loading={loading}
        disabled={confirmDisabled}
      >
        {confirmText}
      </Button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      variant={isDestructive ? 'destructive' : 'default'}
      footer={footer}
      footerAlign="center"
      hideCloseButton
    >
      <div className={`${styles[variant]}`}>
        <div className={styles.iconContainer}>
          <FontAwesomeIcon icon={displayIcon} />
        </div>
        <div className={styles.content}>
          {typeof message === 'string' ? (
            <p className={styles.message}>{message}</p>
          ) : (
            message
          )}
          {details && <p className={styles.details}>{details}</p>}
        </div>
      </div>
    </Modal>
  )
}
