import { PageLayout } from '@/components/shared/PageLayout/PageLayout'
import { Card } from '@/components/shared/Card/Card'

export default function ReferenceDataPage() {
  return (
    <PageLayout
      title="Reference Data"
      description="Manage and configure reference data for the application."
    >
        <Card title="Data Sets">
            <p>Reference data filtering and configuration controls will appear here.</p>
        </Card>
    </PageLayout>
  )
}
