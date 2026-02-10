'use client'

import Link from 'next/link'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './Breadcrumb.module.css'

export interface BreadcrumbItem {
  /** Display label for the breadcrumb item */
  label: string
  /** URL to navigate to. If undefined, item is rendered as current page (non-clickable) */
  href?: string
}

export interface BreadcrumbProps {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[]
  /** Additional CSS class */
  className?: string
}

/**
 * Breadcrumb navigation component
 *
 * Displays a navigation trail following the design from documentation/ui-shell.svg.
 * The last item (or any item without href) is rendered as the current page.
 *
 * @example
 * <Breadcrumb items={[
 *   { label: 'Document Requests', href: '/document-request' },
 *   { label: 'Request #101', href: '/document-request/101' },
 *   { label: 'Batch #3' }  // Current page, no href
 * ]} />
 */
export function Breadcrumb({ items, className }: Readonly<BreadcrumbProps>) {
  if (items.length === 0) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className={`${styles.breadcrumb} ${className ?? ''}`}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isCurrent = !item.href || isLast

          return (
            <li key={`${item.label}-${index}`} className={styles.item}>
              {isCurrent ? (
                <span className={styles.current} aria-current="page">
                  {item.label}
                </span>
              ) : (
                <>
                  <Link href={item.href!} className={styles.link}>
                    {item.label}
                  </Link>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className={styles.separator}
                    aria-hidden="true"
                  />
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
