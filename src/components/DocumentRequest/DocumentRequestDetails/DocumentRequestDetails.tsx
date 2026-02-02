'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { faArrowLeft, faCode, faFileCode, faRotate } from '@fortawesome/free-solid-svg-icons'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DocumentRequestMetadata } from '../DocumentRequestMetadata'
import { DocumentRequestBatches } from '../DocumentRequestBatches'
import {
  DocumentRequest,
  DocumentRequestMetadata as MetadataType,
  Batch,
} from '@/types/documentRequest'
import { formatDisplayDateTime } from '@/utils/dateUtils'
import { getCachedDocumentRequest, clearDocumentRequestCache, cacheBatch } from '@/utils/documentRequestCache'
import styles from './DocumentRequestDetails.module.css'

export interface DocumentRequestDetailsProps {
  /** Request ID to display */
  requestId: number
}

/**
 * DocumentRequestDetails component
 *
 * Displays detailed information for a single document request including:
 * - Breadcrumb navigation
 * - Header with status and actions
 * - Basic information card
 * - Timestamps card
 * - Metadata section
 * - Batches section
 */
export function DocumentRequestDetails({
  requestId,
}: Readonly<DocumentRequestDetailsProps>) {
  const router = useRouter()

  // State
  const [request, setRequest] = useState<DocumentRequest | null>(null)
  const [metadata, setMetadata] = useState<MetadataType[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true)
  const [isLoadingBatches, setIsLoadingBatches] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isReprocessing, setIsReprocessing] = useState(false)
  const [showReprocessDialog, setShowReprocessDialog] = useState(false)
  const [reprocessResult, setReprocessResult] = useState<{
    message: string
    success: boolean
  } | null>(null)

  // Fetch document request details (use cache if available)
  useEffect(() => {
    async function fetchDetails() {
      setIsLoading(true)
      setError(null)

      // Try to use cached data from list page navigation
      const cached = getCachedDocumentRequest(requestId)
      if (cached) {
        setRequest(cached)
        setIsLoading(false)
        clearDocumentRequestCache() // Clear after use
        return
      }

      // Fallback to API call (e.g., direct URL access, page refresh)
      try {
        const response = await fetch(`/api/document-requests/${requestId}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Document request not found')
          }
          throw new Error('Failed to fetch document request')
        }
        const data = await response.json()
        setRequest(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetails()
  }, [requestId])

  // Fetch metadata
  useEffect(() => {
    async function fetchMetadata() {
      setIsLoadingMetadata(true)

      try {
        const response = await fetch(`/api/document-requests/${requestId}/metadata`)
        if (response.ok) {
          const data = await response.json()
          setMetadata(data)
        }
      } catch {
        // Metadata fetch failure is not critical
        console.error('Failed to fetch metadata')
      } finally {
        setIsLoadingMetadata(false)
      }
    }

    fetchMetadata()
  }, [requestId])

  // Fetch batches
  useEffect(() => {
    async function fetchBatches() {
      setIsLoadingBatches(true)

      try {
        const response = await fetch(`/api/document-requests/${requestId}/batches`)
        if (response.ok) {
          const data = await response.json()
          setBatches(data)
        }
      } catch {
        // Batches fetch failure is not critical
        console.error('Failed to fetch batches')
      } finally {
        setIsLoadingBatches(false)
      }
    }

    fetchBatches()
  }, [requestId])

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.push('/document-request')
  }, [router])

  // Handle view JSON content
  const handleViewJson = useCallback(() => {
    router.push(`/document-request/${requestId}/json`)
  }, [router, requestId])

  // Handle view XML content
  const handleViewXml = useCallback(() => {
    router.push(`/document-request/${requestId}/xml`)
  }, [router, requestId])

  // Handle reprocess
  const handleReprocess = useCallback(async () => {
    setShowReprocessDialog(false)
    setIsReprocessing(true)
    setReprocessResult(null)

    try {
      const response = await fetch('/api/document-requests/reprocess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestIds: [requestId] }),
      })

      const data = await response.json()

      if (!response.ok) {
        setReprocessResult({
          message: data.error || 'Reprocess failed',
          success: false,
        })
        setIsReprocessing(false)
        return
      }

      // Show success message with details
      const { totalSubmitted, totalNotFound, notFoundRequestIds } = data
      let message = `Successfully submitted ${totalSubmitted} request(s) for reprocessing.`
      
      if (totalNotFound > 0) {
        message += ` ${totalNotFound} request(s) not found (IDs: ${notFoundRequestIds.join(', ')}).`
      }

      setReprocessResult({
        message,
        success: true,
      })
      setIsReprocessing(false)
    } catch (err) {
      console.error('Reprocess error:', err)
      setReprocessResult({
        message: 'Failed to reprocess request. Please try again.',
        success: false,
      })
      setIsReprocessing(false)
    }
  }, [requestId])

  // Handle view batch details - cache batch data and navigate
  const handleViewBatch = useCallback((batch: Batch) => {
    cacheBatch(batch)
    router.push(`/document-request/${requestId}/batch/${batch.id}`)
  }, [router, requestId])

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading document request details...</div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h3>Error</h3>
          <p>{error}</p>
          <Button hierarchy="secondary" onClick={handleBack}>
            Back to List
          </Button>
        </div>
      </div>
    )
  }

  // Not found state
  if (!request) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h3>Not Found</h3>
          <p>Document request #{requestId} was not found.</p>
          <Button hierarchy="secondary" onClick={handleBack}>
            Back to List
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Document Requests', href: '/document-request' },
          { label: `Request #${requestId}` },
        ]}
        className={styles.breadcrumb}
      />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            hierarchy="tertiary"
            icon={faArrowLeft}
            label="Back"
            onClick={handleBack}
          />
          <h1 className={styles.title}>Document Request #{requestId}</h1>
          <StatusBadge
            status={request.documentStatus.refDataValue}
            description={request.documentStatus.description}
            type="documentRequest"
          />
        </div>

        <div className={styles.headerActions}>
          <Button
            hierarchy="secondary"
            size="md"
            iconBefore={faCode}
            onClick={handleViewJson}
          >
            View JSON
          </Button>
          <Button
            hierarchy="secondary"
            size="md"
            iconBefore={faFileCode}
            onClick={handleViewXml}
          >
            View XML
          </Button>
          <Button
            hierarchy="primary"
            size="md"
            iconBefore={faRotate}
            onClick={() => setShowReprocessDialog(true)}
            disabled={isReprocessing}
          >
            {isReprocessing ? 'Reprocessing...' : 'Reprocess'}
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Request Information Card */}
        <Card title="Request Information">
          <div className={styles.infoGrid}>
            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>Identification</h4>
              <dl className={styles.infoList}>
                <div className={styles.infoItem}>
                  <dt>Request ID</dt>
                  <dd>{request.id}</dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>Source System</dt>
                  <dd>{request.sourceSystem.refDataValue}</dd>
                </div>
              </dl>
            </div>

            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>Document Details</h4>
              <dl className={styles.infoList}>
                <div className={styles.infoItem}>
                  <dt>Document Type</dt>
                  <dd>{request.documentType.refDataValue}</dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>Document Name</dt>
                  <dd>{request.documentName.refDataValue}</dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>Status</dt>
                  <dd>
                    <StatusBadge
                      status={request.documentStatus.refDataValue}
                      description={request.documentStatus.description}
                      type="documentRequest"
                    />
                  </dd>
                </div>
              </dl>
            </div>

            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>Timestamps</h4>
              <dl className={styles.infoList}>
                <div className={styles.infoItem}>
                  <dt>Created</dt>
                  <dd>{formatDisplayDateTime(request.createdDat)}</dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>Last Updated</dt>
                  <dd>{formatDisplayDateTime(request.lastUpdateDat)}</dd>
                </div>
              </dl>
            </div>

            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>Audit</h4>
              <dl className={styles.infoList}>
                <div className={styles.infoItem}>
                  <dt>Created By (Header)</dt>
                  <dd>{request.createUidHeader}</dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>Created By (Token)</dt>
                  <dd>{request.createUidToken}</dd>
                </div>
              </dl>
            </div>
          </div>
        </Card>
      </div>

      {/* Metadata Section */}
      <Card title="Metadata" className={styles.metadataCard}>
        <DocumentRequestMetadata
          metadata={metadata}
          loading={isLoadingMetadata}
        />
      </Card>

      {/* Batches Section */}
      <Card title="Batches" className={styles.batchesCard}>
        <DocumentRequestBatches
          batches={batches}
          loading={isLoadingBatches}
          onViewDetails={handleViewBatch}
        />
      </Card>

      {/* Reprocess Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showReprocessDialog}
        title="Confirm Reprocess"
        message={`Are you sure you want to reprocess document request #${requestId}? This will re-submit it for processing.`}
        confirmText="Reprocess"
        cancelText="Cancel"
        onConfirm={handleReprocess}
        onClose={() => setShowReprocessDialog(false)}
        variant="warning"
      />

      {/* Reprocess Result Dialog */}
      {reprocessResult && (
        <ConfirmDialog
          isOpen={true}
          title={reprocessResult.success ? 'Reprocess Successful' : 'Reprocess Failed'}
          message={reprocessResult.message}
          confirmText="OK"
          cancelText="Close"
          onConfirm={() => {
            setReprocessResult(null)
            if (reprocessResult.success) {
              globalThis.location.reload()
            }
          }}
          onClose={() => {
            setReprocessResult(null)
            if (reprocessResult.success) {
              globalThis.location.reload()
            }
          }}
          variant={reprocessResult.success ? 'info' : 'warning'}
        />
      )}
    </div>
  )
}
