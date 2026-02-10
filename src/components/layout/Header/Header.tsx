'use client'

import { APP_CONFIG } from '@/config/app.config'
import { GlobalControls } from './components/GlobalControls'
import { UserMenu } from './components/UserMenu'
import styles from './Header.module.css'
import { Logo } from './Logo/Logo'
import type { User } from '@/types/auth'

export interface HeaderProps {
  user: User
}

export function Header({ user }: Readonly<HeaderProps>) {
  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <div className={styles.logoWrapper}>
          <Logo />
        </div>
        <div className={styles.appName}>
          <span className={styles.appNameText}>{APP_CONFIG.appName}</span>
        </div>
      </div>
      <div className={styles.rightSection}>
        <GlobalControls />
        <UserMenu user={user} />
      </div>
    </header>
  )
}
