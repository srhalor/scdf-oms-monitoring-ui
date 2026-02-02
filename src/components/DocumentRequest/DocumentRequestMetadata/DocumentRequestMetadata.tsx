'use client'

import { DocumentRequestMetadata as MetadataType } from '@/types/documentRequest'
import styles from './DocumentRequestMetadata.module.css'

export interface DocumentRequestMetadataProps {
  /** Metadata items to display */
  metadata: MetadataType[]
  /** Loading state */
  loading?: boolean
}

/**
 * DocumentRequestMetadata component
 *
 * Displays metadata for a document request in a grid format.
 * Shows key-value pairs matching the Request Information section styling.
 *
 * @example
 * <DocumentRequestMetadata
 *   metadata={metadataItems}
 *   loading={isLoadingMetadata}
 * />
 */
export function DocumentRequestMetadata({
  metadata,
  loading = false,
}: Readonly<DocumentRequestMetadataProps>) {
  // Loading state
  if (loading) {
    return (
      <div className={styles.loading}>
        Loading metadata...
      </div>
    )
  }

  // Empty state
  if (metadata.length === 0) {
    return (
      <div className={styles.empty}>
        No metadata available for this request.
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <dl className={styles.infoGrid}>
        {metadata.map((item) => (
          <div key={item.id} className={styles.infoItem}>
            <dt>
              {item.metadataKey.description || item.metadataKey.refDataValue}
            </dt>
            <dd>{item.metadataValue}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
