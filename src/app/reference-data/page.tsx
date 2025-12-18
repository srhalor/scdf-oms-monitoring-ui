import styles from './page.module.css'

export default function ReferenceDataPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Reference Data</h1>
      <p className={styles.description}>
        Manage and configure reference data for the application.
      </p>
    </div>
  )
}
