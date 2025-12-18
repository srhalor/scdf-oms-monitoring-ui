import styles from './page.module.css'

export default function DocumentRequestPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Document Request</h1>
      <p className={styles.description}>
        Track and manage document requests with advanced filtering, sorting, and status monitoring.
      </p>
    </div>
  )
}
