import { ProtectedRoute } from "@/components/protected-route"
import { TopAccountsTable } from "@/components/web3/top-accounts/top-account-table"
import { Separator } from "@radix-ui/react-dropdown-menu"

export const maxDuration = 600;

export default function Page() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col p-4">

            {/* Header */}
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                Top Accounts
              </h1>
              <p className="text-sm text-muted-foreground">
                Provides insight into account details across all addresses currently under active monitoring.
              </p>
            </div>
            <Separator className="my-4 bg-muted-foreground/40 h-px" />
            {/* Table */}
            <TopAccountsTable />

          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
