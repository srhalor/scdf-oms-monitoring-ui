'use client'

import { ReactNode } from 'react'
import styles from './PageLayout.module.css'

export interface PageLayoutProps {
  title?: string
  label?: string
  description?: string
  children: ReactNode
}

export function PageLayout({
  title,
  label,
  description,
  children
}: Readonly<PageLayoutProps>) {
  const showHeader = title || label || description

  return (
    <div className={styles.container}>

      {showHeader && (
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <div className={styles.titleRow}>
              {title && <h1 className={styles.title}>{title}</h1>}
              {label && <span className={styles.label}>{label}</span>}
            </div>
            {description && <p className={styles.description}>{description}</p>}
          </div>
        </div>
      )}

      <div className={styles.content}>{children}</div>
    </div>
  )
}
