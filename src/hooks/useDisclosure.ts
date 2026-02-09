/**
 * useDisclosure Hook
 * 
 * Manages open/close state for modals, dropdowns, panels, and other UI elements.
 * Provides a consistent API for disclosure components across the application.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const modal = useDisclosure()
 *   const dropdown = useDisclosure({ defaultOpen: false })
 *   
 *   return (
 *     <>
 *       <Button onClick={modal.open}>Open Modal</Button>
 *       <Modal isOpen={modal.isOpen} onClose={modal.close}>
 *         Modal content
 *       </Modal>
 *       
 *       <Button onClick={dropdown.toggle}>
 *         {dropdown.isOpen ? 'Close' : 'Open'} Dropdown
 *       </Button>
 *       {dropdown.isOpen && <Dropdown onClose={dropdown.close} />}
 *     </>
 *   )
 * }
 * ```
 */

import { useState, useCallback } from 'react'

export interface UseDisclosureOptions {
  /** Initial open state (default: false) */
  defaultOpen?: boolean
  /** Callback when opened */
  onOpen?: () => void
  /** Callback when closed */
  onClose?: () => void
}

export interface UseDisclosureReturn {
  /** Current open state */
  isOpen: boolean
  /** Open the disclosure */
  open: () => void
  /** Close the disclosure */
  close: () => void
  /** Toggle the disclosure */
  toggle: () => void
}

/**
 * Hook for managing disclosure state (modals, dropdowns, etc.)
 */
export function useDisclosure(options: UseDisclosureOptions = {}): UseDisclosureReturn {
  const { defaultOpen = false, onOpen, onClose } = options
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const open = useCallback(() => {
    setIsOpen(true)
    onOpen?.()
  }, [onOpen])

  const close = useCallback(() => {
    setIsOpen(false)
    onClose?.()
  }, [onClose])

  const toggle = useCallback(() => {
    if (isOpen) {
      close()
    } else {
      open()
    }
  }, [isOpen, open, close])

  return {
    isOpen,
    open,
    close,
    toggle,
  }
}
