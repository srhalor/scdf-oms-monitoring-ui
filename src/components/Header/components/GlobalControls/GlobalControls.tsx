'use client'

import { faBell } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/shared/Button'
import styles from './GlobalControls.module.css'

export function GlobalControls() {
  const handleNotificationsClick = () => {
    // Notifications functionality will be implemented in Phase 2
  }

  return (
    <div className={styles.container}>
      <Button
        icon={faBell}
        label="Notifications"
        hierarchy="tertiary"
        size="md"
        onClick={handleNotificationsClick}
      />
    </div>
  )
}
