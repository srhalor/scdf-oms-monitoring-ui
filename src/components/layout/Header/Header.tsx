'use client'

import { Logo } from './Logo/Logo'
import { GlobalControls } from './components/GlobalControls'
import { UserMenu } from './components/UserMenu'
import { APP_CONFIG } from '@/config/app.config'
import type { User } from '@/types/auth'
import styles from './Header.module.css'

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
