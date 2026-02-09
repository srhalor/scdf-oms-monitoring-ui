'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/Button'
import { NAV_ITEMS } from '@/config/navigation.config'
import styles from './Sidebar.module.css'

export interface SidebarProps {
  isOpen: boolean
  onToggle: (open: boolean) => void
}

export function Sidebar({ isOpen, onToggle }: Readonly<SidebarProps>) {
  const pathname = usePathname()

  const toggleSidebar = () => {
    onToggle(!isOpen)
  }

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      {/* Hamburger toggle button */}
      <Button
        icon={isOpen ? faXmark : faBars}
        label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        onClick={toggleSidebar}
        hierarchy="tertiary"
        size="md"
        tooltipPosition="bottom right"
        aria-expanded={isOpen}
      />

      {/* Navigation items */}
      <nav className={styles.nav} role="navigation" aria-label="Main navigation">
        <ul className={styles.navList}>
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.path
            return (
              <li key={item.id} className={styles.navItem}>
                <Link
                  href={item.path}
                  className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="icon">
                    <FontAwesomeIcon icon={item.icon} />
                  </span>
                  <span className={styles.label}>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
