import { HealthCard } from '@/components/Dashboard/HealthCard'
import styles from './page.module.css'

export default function Dashboard() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Monitor OMS service health and performance</p>
      </div>
      
      <div className={styles.cardsGrid}>
        <HealthCard />
      </div>
    </div>
  )
}
