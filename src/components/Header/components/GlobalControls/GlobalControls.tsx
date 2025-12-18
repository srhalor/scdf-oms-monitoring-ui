'use client'

import { faBell } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/shared/Button'
import styles from './GlobalControls.module.css'

export function GlobalControls() {
  return (
    <div className={styles.container}>
      <Button
        icon={faBell}
        label="Notifications"
        hierarchy="tertiary"
        size="md"
        onClick={() => console.log('Notifications clicked')}
      />
    </div>
  )
}
