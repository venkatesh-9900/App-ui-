import { DataTable } from "@/components/web3/explorer/data-table"
import { DashboardNavbar } from "@/components/web3/explorer/dashboard-navbar"
import { ProtectedRoute } from "@/components/protected-route"

export default function Page() {
  return (
    <ProtectedRoute>
      <DashboardNavbar />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <DataTable data={[]} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
