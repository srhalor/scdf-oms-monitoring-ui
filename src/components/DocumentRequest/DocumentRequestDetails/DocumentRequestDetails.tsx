'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { faArrowLeft, faCode, faFileCode, faRotate } from '@fortawesome/free-solid-svg-icons'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DocumentRequestMetadata } from '../DocumentRequestMetadata'
import { DocumentRequestBatches } from '../DocumentRequestBatches'
import { useApiQuery } from '@/hooks/useApiQuery'
import { useApiMutation } from '@/hooks/useApiMutation'
import {
  DocumentRequest,
  DocumentRequestMetadata as MetadataType,
  Batch,
} from '@/types/documentRequest'
import { formatDisplayDateTime } from '@/utils/dateUtils'
import { cacheBatch } from '@/utils/documentRequestCache'
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

  // State for reprocess dialog and result
  const [showReprocessDialog, setShowReprocessDialog] = useState(false)
  const [reprocessResult, setReprocessResult] = useState<{
    message: string
    success: boolean
  } | null>(null)

  // Fetch document request details
  const {
    data: request,
    loading: isLoading,
    error: requestError,
  } = useApiQuery<DocumentRequest>({
    queryFn: async () => {
      const response = await fetch(`/api/document-requests/${requestId}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Document request not found')
        }
        throw new Error('Failed to fetch document request')
      }
      return response.json()
    },
  })

  // Fetch metadata
  const {
    data: metadataData,
    loading: isLoadingMetadata,
  } = useApiQuery<MetadataType[]>({
    queryFn: async () => {
      const response = await fetch(`/api/document-requests/${requestId}/metadata`)
      if (!response.ok) {
        throw new Error('Failed to fetch metadata')
      }
      return response.json()
    },
  })

  const metadata = metadataData ?? []

  // Fetch batches
  const {
    data: batchesData,
    loading: isLoadingBatches,
  } = useApiQuery<Batch[]>({
    queryFn: async () => {
      const response = await fetch(`/api/document-requests/${requestId}/batches`)
      if (!response.ok) {
        throw new Error('Failed to fetch batches')
      }
      return response.json()
    },
  })

  const batches = batchesData ?? []

  // Reprocess mutation
  const { mutate: reprocessRequest, loading: isReprocessing } = useApiMutation<
    { totalSubmitted: number; totalNotFound: number; notFoundRequestIds: number[] },
    { requestIds: number[] }
  >({
    mutationFn: async (variables) => {
      const response = await fetch('/api/document-requests/reprocess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variables),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Reprocess failed')
      }
      return response.json()
    },
    onSuccess: (data) => {
      const { totalSubmitted, totalNotFound, notFoundRequestIds } = data
      let message = `Successfully submitted ${totalSubmitted} request(s) for reprocessing.`
      
      if (totalNotFound > 0) {
        message += ` ${totalNotFound} request(s) not found (IDs: ${notFoundRequestIds.join(', ')}).`
      }

      setReprocessResult({ message, success: true })
    },
    onError: (error) => {
      setReprocessResult({
        message: error.message || 'Failed to reprocess request. Please try again.',
        success: false,
      })
    },
  })

  const error = requestError?.message || null

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
  const handleReprocess = useCallback(() => {
    setShowReprocessDialog(false)
    setReprocessResult(null)
    reprocessRequest({ requestIds: [requestId] })
  }, [reprocessRequest, requestId])

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
        <Card>
          <Card.Header>
            <Card.Title>Request Information</Card.Title>
          </Card.Header>
          <Card.Body>
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
          </Card.Body>
        </Card>
      </div>

      {/* Metadata Section */}
      <Card className={styles.metadataCard}>
        <Card.Header>
          <Card.Title>Metadata</Card.Title>
        </Card.Header>
        <Card.Body>
          <DocumentRequestMetadata
            metadata={metadata}
            loading={isLoadingMetadata}
          />
        </Card.Body>
      </Card>

      {/* Batches Section */}
      <Card className={styles.batchesCard}>
        <Card.Header>
          <Card.Title>Batches</Card.Title>
        </Card.Header>
        <Card.Body>
          <DocumentRequestBatches
            batches={batches}
            loading={isLoadingBatches}
            onViewDetails={handleViewBatch}
          />
        </Card.Body>
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
