'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { ContentViewer } from '@/components/shared/ContentViewer'
import { DocumentContentResponse } from '@/types/documentRequest'
import styles from './content.module.css'

export default function JsonContentPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = Number.parseInt(params.id as string, 10)

  const [content, setContent] = useState<DocumentContentResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/document-requests/${requestId}/json-content`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('JSON content not found')
          }
          throw new Error('Failed to fetch JSON content')
        }
        const data = await response.json()
        setContent(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    if (!Number.isNaN(requestId)) {
      fetchContent()
    }
  }, [requestId])

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
          { label: 'JSON Content' },
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
        <h1 className={styles.title}>JSON Content - Request #{requestId}</h1>
      </div>

      {/* Content */}
      <Card className={styles.contentCard}>
        {isLoading && (
          <div className={styles.loading}>Loading JSON content...</div>
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
            contentType="JSON"
            requestId={requestId}
          />
        )}

        {!isLoading && !error && !content && (
          <div className={styles.empty}>
            No JSON content available for this request.
          </div>
        )}
      </Card>
    </div>
  )
}
