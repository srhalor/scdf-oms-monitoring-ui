import { PageLayout } from '@/components/layout/PageLayout'
import { ReferenceDataContent } from '@/components/ReferenceData/ReferenceDataContent'

export default function ReferenceDataPage() {
  return (
    <PageLayout
      title="Reference Data"
      description="Manage and configure reference data for the application."
    >
      <ReferenceDataContent />
    </PageLayout>
  )
}
