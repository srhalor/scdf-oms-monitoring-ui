'use client'

import { Tooltip } from '@/components/shared/Tooltip'
import {
  DOCUMENT_REQUEST_STATUS_COLORS,
  BATCH_STATUS_COLORS,
  type DocumentRequestStatus,
  type BatchStatusType,
} from '@/types/documentRequest'
import styles from './StatusBadge.module.css'

export interface StatusBadgeProps {
  /** Status value (e.g., 'COMPLETED', 'FAILED', 'PROCESSING_OMS') */
  status: string
  /** Description shown in tooltip on hover */
  description?: string
  /** Type of status to determine color mapping */
  type?: 'documentRequest' | 'batch'
  /** Additional CSS class */
  className?: string
}

/**
 * Get the color for a status value based on type
 */
function getStatusColor(status: string, type: 'documentRequest' | 'batch'): string {
  if (type === 'documentRequest') {
    return (
      DOCUMENT_REQUEST_STATUS_COLORS[status as DocumentRequestStatus] ?? 'var(--color-gray-400)'
    )
  }
  return BATCH_STATUS_COLORS[status as BatchStatusType] ?? 'var(--color-gray-400)'
}

/**
 * StatusBadge component
 *
 * Displays a status with a colored dot indicator and optional tooltip.
 * Follows the design from documentation/table.svg for status column styling.
 *
 * @example
 * // Document request status
 * <StatusBadge status="COMPLETED" description="Request completed successfully" type="documentRequest" />
 *
 * // Batch status
 * <StatusBadge status="FAILED_THUNDERHEAD" description="Failed in Thunderhead" type="batch" />
 */
export function StatusBadge({
  status,
  description,
  type = 'documentRequest',
  className,
}: Readonly<StatusBadgeProps>) {
  const color = getStatusColor(status, type)

  const content = (
    <span className={`${styles.badge} ${className ?? ''}`}>
      <span className={styles.dot} style={{ backgroundColor: color }} aria-hidden="true" />
      <span className={styles.text}>{status}</span>
    </span>
  )

  // If description provided, wrap in tooltip
  if (description) {
    return (
      <Tooltip message={description} position="top" hasInteractiveChild={false}>
        {content}
      </Tooltip>
    )
  }

  return content
}
