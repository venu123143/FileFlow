import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { DeletedFilesPage } from "@/pages/deleted-files-page"

export default function DeletedFiles() {
  return (
    <DashboardLayout>
      <DeletedFilesPage />
    </DashboardLayout>
  )
}
