'use client'

import { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  title?: string
  children: ReactNode
  className?: string
  actions?: ReactNode
}

export function Card({ title, children, className = '', actions }: Readonly<CardProps>) {
  return (
    <div className={`${styles.card} ${className}`}>
      {(title || actions) && (
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            {title && <h3 className={styles.title}>{title}</h3>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  )
}
