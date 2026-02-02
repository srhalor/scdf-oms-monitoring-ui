'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { BatchErrors } from '@/components/DocumentRequest/BatchErrors'
import { Batch, BatchError, FAILED_BATCH_STATUSES, BatchStatusType } from '@/types/documentRequest'
import { formatDisplayDateTime } from '@/utils/dateUtils'
import { getCachedBatch, clearBatchCache } from '@/utils/documentRequestCache'
import styles from './BatchDetails.module.css'

export interface BatchDetailsProps {
  /** Request ID (parent document request) */
  requestId: number
  /** Batch ID to display (the `id` field, not `batchId`) */
  batchId: number
}

/**
 * BatchDetails component
 *
 * Displays detailed information for a single batch including:
 * - Breadcrumb navigation
 * - Header with status
 * - Basic information card
 * - Error details section (only for failed batches)
 */
export function BatchDetails({
  requestId,
  batchId,
}: Readonly<BatchDetailsProps>) {
  const router = useRouter()

  // State
  const [batch, setBatch] = useState<Batch | null>(null)
  const [errors, setErrors] = useState<BatchError[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingErrors, setIsLoadingErrors] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Determine if batch status is a failed status
  const isFailedStatus = batch
    ? FAILED_BATCH_STATUSES.includes(batch.batchStatus.refDataValue as BatchStatusType)
    : false

  // Fetch batch details (use cache if available)
  useEffect(() => {
    async function fetchBatch() {
      setIsLoading(true)
      setError(null)

      // Try to use cached data from batches list navigation
      const cached = getCachedBatch(batchId)
      if (cached) {
        setBatch(cached)
        setIsLoading(false)
        clearBatchCache() // Clear after use
        return
      }

      // Fallback to API call (e.g., direct URL access, page refresh)
      try {
        // Fetch all batches for the request and find the one we need
        const response = await fetch(`/api/document-requests/${requestId}/batches`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Batch not found')
          }
          throw new Error('Failed to fetch batch details')
        }
        const batchesData: Batch[] = await response.json()
        const foundBatch = batchesData.find((b) => b.id === batchId)

        if (!foundBatch) {
          throw new Error('Batch not found')
        }

        setBatch(foundBatch)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBatch()
  }, [requestId, batchId])

  // Fetch batch errors (only for failed batches)
  useEffect(() => {
    if (!batch || !isFailedStatus) {
      setIsLoadingErrors(false)
      return
    }

    async function fetchErrors() {
      setIsLoadingErrors(true)

      try {
        const response = await fetch(`/api/batches/${batchId}/errors`)
        if (response.ok) {
          const data = await response.json()
          setErrors(data)
        }
      } catch (err) {
        console.error('Failed to fetch batch errors:', err)
      } finally {
        setIsLoadingErrors(false)
      }
    }

    fetchErrors()
  }, [batch, batchId, isFailedStatus])

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.push(`/document-request/${requestId}`)
  }, [router, requestId])

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Document Requests', href: '/document-request' },
    { label: `Request #${requestId}`, href: `/document-request/${requestId}` },
    { label: batch ? `Batch #${batch.batchId}` : 'Loading...' },
  ]

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading batch details...</div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={styles.container}>
        <Breadcrumb items={breadcrumbItems} />
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
          <Button hierarchy="secondary" onClick={handleBack}>
            Back to Request
          </Button>
        </div>
      </div>
    )
  }

  // No data state
  if (!batch) {
    return (
      <div className={styles.container}>
        <Breadcrumb items={breadcrumbItems} />
        <div className={styles.error}>
          <h2>Batch Not Found</h2>
          <p>The requested batch could not be found.</p>
          <Button hierarchy="secondary" onClick={handleBack}>
            Back to Request
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            hierarchy="tertiary"
            size="md"
            icon={faArrowLeft}
            label="Back to request"
            onClick={handleBack}
          />
          <h1 className={styles.title}>Batch #{batch.batchId}</h1>
          <StatusBadge
            status={batch.batchStatus.refDataValue}
            description={batch.batchStatus.description}
            type="batch"
          />
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Basic Information Card */}
        <Card title="Batch Information">
          <div className={styles.infoGrid}>
            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>Identification</h4>
              <dl className={styles.infoList}>
                <div className={styles.infoItem}>
                  <dt>Internal ID</dt>
                  <dd>{batch.id}</dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>Batch ID</dt>
                  <dd>{batch.batchId}</dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>Batch Name</dt>
                  <dd>{batch.batchName}</dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>Request ID</dt>
                  <dd>{batch.requestId}</dd>
                </div>
              </dl>
            </div>

            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>DMS Information</h4>
              <dl className={styles.infoList}>
                <div className={styles.infoItem}>
                  <dt>DMS Document ID</dt>
                  <dd>{batch.dmsDocumentId ?? 'N/A'}</dd>
                </div>
              </dl>
            </div>

            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>Status Flags</h4>
              <dl className={styles.infoList}>
                <div className={styles.infoItem}>
                  <dt>Sync Status</dt>
                  <dd>
                    <span className={batch.syncStatus ? styles.statusYes : styles.statusNo}>
                      {batch.syncStatus ? 'Yes' : 'No'}
                    </span>
                  </dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>Event Status</dt>
                  <dd>
                    <span className={batch.eventStatus ? styles.statusYes : styles.statusNo}>
                      {batch.eventStatus ? 'Yes' : 'No'}
                    </span>
                  </dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>Retry Count</dt>
                  <dd>{batch.retryCount}</dd>
                </div>
              </dl>
            </div>

            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>Timestamps</h4>
              <dl className={styles.infoList}>
                <div className={styles.infoItem}>
                  <dt>Created</dt>
                  <dd>{formatDisplayDateTime(batch.createdDat)}</dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>Last Updated</dt>
                  <dd>{formatDisplayDateTime(batch.lastUpdateDat)}</dd>
                </div>
              </dl>
            </div>

            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>Audit</h4>
              <dl className={styles.infoList}>
                <div className={styles.infoItem}>
                  <dt>Created By (Header)</dt>
                  <dd>{batch.createUidHeader}</dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>Created By (Token)</dt>
                  <dd>{batch.createUidToken}</dd>
                </div>
              </dl>
            </div>
          </div>
        </Card>

        {/* Error Details Section - Only for failed batches */}
        {isFailedStatus && (
          <Card title="Error Details">
            <BatchErrors errors={errors} loading={isLoadingErrors} />
          </Card>
        )}
      </div>
    </div>
  )
}
