import { PageLayout } from '@/components/layout/PageLayout'
import { DocumentRequestDetails } from '@/components/DocumentRequest/DocumentRequestDetails'

interface DocumentRequestDetailsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DocumentRequestDetailsPage({
  params,
}: Readonly<DocumentRequestDetailsPageProps>) {
  const { id } = await params
  const requestId = Number.parseInt(id, 10)

  // Validate ID
  if (Number.isNaN(requestId)) {
    return (
      <PageLayout title="Invalid Request">
        <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
          <h2>Invalid Request ID</h2>
          <p>The request ID &quot;{id}&quot; is not valid.</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <DocumentRequestDetails requestId={requestId} />
    </PageLayout>
  )
}
