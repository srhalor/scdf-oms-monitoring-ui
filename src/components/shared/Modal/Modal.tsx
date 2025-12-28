'use client'

import { ReactNode, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import styles from './Modal.module.css'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen'
export type ModalFooterAlign = 'left' | 'center' | 'right' | 'space-between'

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean

  /** Callback when modal should close */
  onClose: () => void

  /** Modal title */
  title: string

  /** Optional description below title */
  description?: string

  /** Modal content */
  children: ReactNode

  /** Footer content (typically buttons) */
  footer?: ReactNode

  /** Footer alignment */
  footerAlign?: ModalFooterAlign

  /** Modal size */
  size?: ModalSize

  /** Destructive variant (for delete confirmations) */
  variant?: 'default' | 'destructive'

  /** Whether clicking overlay closes modal */
  closeOnOverlayClick?: boolean

  /** Whether pressing Escape closes modal */
  closeOnEscape?: boolean

  /** Hide close button */
  hideCloseButton?: boolean

  /** Additional class for modal container */
  className?: string

  /** ID for accessibility */
  id?: string
}

/**
 * Modal Component
 *
 * Reusable modal dialog with overlay, header, body, and footer sections.
 * Supports keyboard navigation and focus trapping.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  footerAlign = 'right',
  size = 'md',
  variant = 'default',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  hideCloseButton = false,
  className,
  id,
}: Readonly<ModalProps>) {
  const modalRef = useRef<HTMLDialogElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose()
      }
    },
    [closeOnEscape, onClose]
  )

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget && closeOnOverlayClick) {
        onClose()
      }
    },
    [closeOnOverlayClick, onClose]
  )

  // Focus management and body scroll lock
  useEffect(() => {
    if (isOpen) {
      // Store current active element
      previousActiveElement.current = document.activeElement as HTMLElement

      // Focus the modal
      modalRef.current?.focus()

      // Lock body scroll
      document.body.style.overflow = 'hidden'

      // Add escape listener
      document.addEventListener('keydown', handleKeyDown)

      return () => {
        // Restore body scroll
        document.body.style.overflow = ''

        // Remove escape listener
        document.removeEventListener('keydown', handleKeyDown)

        // Restore focus
        previousActiveElement.current?.focus()
      }
    }
  }, [isOpen, handleKeyDown])

  // Don't render if not open
  if (!isOpen) {
    return null
  }

  const modalId = id ?? 'modal'
  const titleId = `${modalId}-title`
  const descriptionId = description ? `${modalId}-description` : undefined

  const getFooterAlignClass = () => {
    switch (footerAlign) {
      case 'left':
        return styles.footerLeft
      case 'center':
        return styles.footerCenter
      case 'space-between':
        return styles.footerSpaceBetween
      default:
        return ''
    }
  }
  const footerAlignClass = getFooterAlignClass()

  const modalContent = (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      aria-hidden="true"
    >
      <dialog
        ref={modalRef}
        open
        className={`${styles.modal} ${styles[size]} ${variant === 'destructive' ? styles.destructive : ''} ${className ?? ''}`}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            )}
          </div>
          {!hideCloseButton && (
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close modal"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className={styles.body}>{children}</div>

        {/* Footer */}
        {footer && (
          <div className={`${styles.footer} ${footerAlignClass}`}>{footer}</div>
        )}
      </dialog>
    </div>
  )

  // Render in portal
  if (globalThis.window === undefined) {
    return null
  }

  return createPortal(modalContent, document.body)
}
