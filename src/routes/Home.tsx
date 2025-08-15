import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { HomeDashboard } from "@/pages/home-dashboard"

export default function HomePage() {
  return (
    <DashboardLayout>
      <HomeDashboard />
    </DashboardLayout>
  )
}
