'use client'

import { useParams, useRouter } from 'next/navigation'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { Breadcrumb, Button, Card } from '@/components/ui'
import { ContentViewer } from '@/components/domain/ContentViewer'
import { useApiQuery } from '@/hooks/useApiQuery'
import { DocumentContentResponse } from '@/types/documentRequest'
import styles from './content.module.css'

export default function XmlContentPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = Number.parseInt(params.id as string, 10)

  const {
    data: content,
    loading: isLoading,
    error: apiError,
  } = useApiQuery<DocumentContentResponse>({
    queryFn: async () => {
      const response = await fetch(`/api/document-requests/${requestId}/xml-content`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('XML content not found')
        }
        throw new Error('Failed to fetch XML content')
      }
      return response.json()
    },
    enabled: !Number.isNaN(requestId),
  })

  const error = apiError?.message || null

  const handleBack = () => {
    router.push(`/document-request/${requestId}`)
  }

  if (Number.isNaN(requestId)) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h3>Invalid Request ID</h3>
          <p>The request ID is not valid.</p>
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
          { label: `Request #${requestId}`, href: `/document-request/${requestId}` },
          { label: 'XML Content' },
        ]}
        className={styles.breadcrumb}
      />

      {/* Header */}
      <div className={styles.header}>
        <Button
          hierarchy="tertiary"
          icon={faArrowLeft}
          label="Back"
          onClick={handleBack}
        />
        <h1 className={styles.title}>XML Content - Request #{requestId}</h1>
      </div>

      {/* Content */}
      <Card className={styles.contentCard}>
        {isLoading && (
          <div className={styles.loading}>Loading XML content...</div>
        )}

        {error && (
          <div className={styles.error}>
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && content && (
          <ContentViewer
            content={content.content}
            contentType="XML"
            requestId={requestId}
          />
        )}

        {!isLoading && !error && !content && (
          <div className={styles.empty}>
            No XML content available for this request.
          </div>
        )}
      </Card>
    </div>
  )
}
