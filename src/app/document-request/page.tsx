import { PageLayout } from '@/components/shared/PageLayout/PageLayout'
import { Card } from '@/components/shared/Card/Card'

export default function DocumentRequestPage() {
  return (
    <PageLayout
      title="Document Request"
      description="Track and manage document requests with advanced filtering, sorting, and status monitoring."
    >
      <Card title="Requests">
        <p>No document requests found.</p>
      </Card>
    </PageLayout>
  )
}
