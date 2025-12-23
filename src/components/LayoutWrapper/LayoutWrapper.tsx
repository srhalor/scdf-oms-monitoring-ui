'use client'

import { useState, ReactNode, useEffect } from 'react'
import { config } from '@fortawesome/fontawesome-svg-core'
import { Sidebar } from '@components/Sidebar'
import { Header } from '@components/Header'
import type { User } from '@/types/auth'
import styles from './LayoutWrapper.module.css'

import { TokenRefresher } from '@/components/auth/TokenRefresher'

// Prevent FontAwesome from auto-adding CSS
config.autoAddCss = false

interface LayoutWrapperProps {
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
      <div className={styles.contentArea}>
        <Header user={user} />
        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  )
}
