import { HealthCard } from '@/components/Dashboard/HealthCard'
import { PageLayout } from '@/components/layout/PageLayout'

export default function Dashboard() {
  return (
    <PageLayout
      title="Dashboard"
      description="Monitor OMS service health and performance"
    >
      <HealthCard />
    </PageLayout>
  )
}
