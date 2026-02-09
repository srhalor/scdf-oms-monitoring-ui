'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { type IconDefinition } from '@fortawesome/free-solid-svg-icons'
import styles from './ActionMenu.module.css'

export interface ActionMenuItem {
  readonly id: string
  readonly label: string
  readonly icon?: IconDefinition
  readonly onClick: () => void
  readonly disabled?: boolean
  readonly destructive?: boolean
  readonly divider?: boolean
}

interface ActionMenuProps {
  readonly trigger: ReactNode
  readonly items: ActionMenuItem[]
  readonly position?: 'left' | 'right'
  readonly className?: string
}

/**
 * ActionMenu - Dropdown menu for actions
 * Handles click outside, keyboard navigation, and positioning
 * 
 * @example
 * <ActionMenu
 *   trigger={<Button icon={faEllipsisV} label="Actions" />}
 *   items={[
 *     { id: 'edit', label: 'Edit', icon: faEdit, onClick: handleEdit },
 *     { id: 'delete', label: 'Delete', icon: faTrash, onClick: handleDelete, destructive: true }
 *   ]}
 *   position="right"
 * />
 */
export const ActionMenu = ({
  trigger,
  items,
  position = 'right',
  className = '',
}: ActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const handleItemClick = (item: ActionMenuItem) => {
    if (item.disabled) return

    item.onClick()
    setIsOpen(false)
  }

  const containerClassNames = [styles.container, className].filter(Boolean).join(' ')

  const menuClassNames = [
    styles.menu,
    styles[`position-${position}`],
    isOpen && styles.open,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClassNames}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </button>

      {isOpen && (
        <div ref={menuRef} className={menuClassNames} role="menu">
          {items.map((item) => (
            <div key={item.id}>
              {item.divider && <hr className={styles.divider} />}

              <button
                type="button"
                className={`${styles.menuItem} ${item.destructive ? styles.destructive : ''} ${item.disabled ? styles.disabled : ''}`}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                role="menuitem"
              >
                {item.icon && (
                  <FontAwesomeIcon icon={item.icon} className={styles.icon} aria-hidden="true" />
                )}
                <span className={styles.label}>{item.label}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
