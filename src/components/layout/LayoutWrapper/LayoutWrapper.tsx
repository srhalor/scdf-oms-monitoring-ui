'use client'

import { useState, ReactNode, useEffect } from 'react'
import { config } from '@fortawesome/fontawesome-svg-core'
import { TokenRefresher } from '@/components/auth/TokenRefresher'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import styles from './LayoutWrapper.module.css'
import type { User } from '@/types/auth'

// Prevent FontAwesome from auto-adding CSS
config.autoAddCss = false

export interface LayoutWrapperProps {
  children: ReactNode
  user: User
}

export function LayoutWrapper({ children, user }: Readonly<LayoutWrapperProps>) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Register FontAwesome icons on client side only
  useEffect(() => {
    import('@/lib/fontawesome')
  }, [])

  return (
    <div className={styles.layoutContainer}>
      <TokenRefresher />
      <Sidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
      <div
        className={`${styles.sidebarSpacer} ${sidebarOpen ? styles.expanded : styles.collapsed}`}
      />
      <div className={styles.contentArea}>
        <Header user={user} />
        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  )
}
