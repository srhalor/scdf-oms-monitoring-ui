import { DocumentRequestContent } from '@/components/DocumentRequest'
import { PageLayout } from '@/components/layout/PageLayout'

export default function DocumentRequestPage() {
  return (
    <PageLayout
      title="Document Request"
      description="Track and manage document requests with advanced filtering, sorting, and status monitoring."
    >
      <DocumentRequestContent />
    </PageLayout>
  )
}
