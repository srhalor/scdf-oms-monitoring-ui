import { PageLayout } from '@/components/shared/PageLayout/PageLayout'
import { BatchDetails } from '@/components/DocumentRequest/BatchDetails'

interface BatchDetailsPageProps {
  params: Promise<{
    id: string
    batchId: string
  }>
}

export default async function BatchDetailsPage({
  params,
}: Readonly<BatchDetailsPageProps>) {
  const { id, batchId } = await params
  const requestId = Number.parseInt(id, 10)
  const batchIdNum = Number.parseInt(batchId, 10)

  // Validate IDs
  if (Number.isNaN(requestId) || Number.isNaN(batchIdNum)) {
    return (
      <PageLayout title="Invalid Request">
        <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
          <h2>Invalid ID</h2>
          <p>The request ID or batch ID is not valid.</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <BatchDetails requestId={requestId} batchId={batchIdNum} />
    </PageLayout>
  )
}
