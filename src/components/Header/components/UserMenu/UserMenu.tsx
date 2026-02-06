'use client'

import { useState, useRef, useEffect } from 'react'
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/shared/Button'
import { useApiMutation } from '@/hooks/useApiMutation'
import type { User } from '@/types/auth'
import styles from './UserMenu.module.css'

interface UserMenuProps {
  user: User
}

interface LogoutResponse {
  redirectUrl?: string
}

export function UserMenu({ user }: Readonly<UserMenuProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const { mutate: logout, loading: isLoggingOut } = useApiMutation<LogoutResponse, void>({
    mutationFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASEPATH || ''}/api/auth/logout`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Logout failed')
      }
      return response.json()
    },
    onSuccess: (data) => {
      // Use globalThis.location for hard redirect (important for SSO logout)
      globalThis.location.href = data.redirectUrl || '/login'
    },
  })

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleLogout = () => {
    logout(undefined)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className={styles.container} ref={menuRef}>
      <button
        type="button"
        className={styles.avatarButton}
        onClick={toggleMenu}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="avatar avatar--40 avatar--interactive">
          <span className="avatar-initials">{user.initials}</span>
        </div>
      </button>

      {isOpen && (
        <div
          className="dropdown dropdown--right"
          style={{ top: 'calc(100% + var(--spacing-sm))', width: '280px' }}
        >
          <div className={styles.userInfo}>
            <div className="avatar avatar--40">
              <span className="avatar-initials">{user.initials}</span>
            </div>
            <div className={styles.userDetails}>
              <div className={`${styles.userName} text-ellipsis`}>{user.name}</div>
              <div className={`${styles.userEmail} text-ellipsis`}>{user.email}</div>
            </div>
            <Button
              icon={faRightFromBracket}
              label="Logout"
              hierarchy="tertiary"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
            />
          </div>
        </div>
      )}
    </div>
  )
}
