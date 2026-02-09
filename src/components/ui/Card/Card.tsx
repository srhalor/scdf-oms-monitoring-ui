'use client'

import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  readonly title?: string
  readonly children: ReactNode
  readonly className?: string
  readonly actions?: ReactNode
}

interface CardSubcomponentProps {
  readonly children: ReactNode
  readonly className?: string
}

/**
 * Card - Container component with optional header and actions
 * Use subcomponents (Card.Header, Card.Body, etc.) for structured layouts
 */
export function Card({ title, children, className = '', actions }: CardProps) {
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

/**
 * Card.Header - Structured header for complex card layouts
 * Use instead of title prop when you need more control
 */
Card.Header = function CardHeader({ children, className = '' }: CardSubcomponentProps) {
  return <div className={`${styles.header} ${className}`}>{children}</div>
}

/**
 * Card.Title - Title element for use within Card.Header
 */
Card.Title = function CardTitle({ children, className = '' }: CardSubcomponentProps) {
  return <h3 className={`${styles.title} ${className}`}>{children}</h3>
}

/**
 * Card.Body - Main content area with standard padding
 */
Card.Body = function CardBody({ children, className = '' }: CardSubcomponentProps) {
  return <div className={`${styles.body} ${className}`}>{children}</div>
}

/**
 * Card.Section - Subsection within card body with divider
 */
Card.Section = function CardSection({ children, className = '' }: CardSubcomponentProps) {
  return <div className={`${styles.section} ${className}`}>{children}</div>
}

/**
 * Card.Footer - Footer area with standard padding and top border
 */
Card.Footer = function CardFooter({ children, className = '' }: CardSubcomponentProps) {
  return <div className={`${styles.footer} ${className}`}>{children}</div>
}
