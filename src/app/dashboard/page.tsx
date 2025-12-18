import { PageLayout } from '@/components/shared/PageLayout/PageLayout'
import { HealthCard } from '@/components/Dashboard/HealthCard'

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
