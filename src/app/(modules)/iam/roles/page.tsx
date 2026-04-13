"use client"

import React, { Suspense } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardNavbar } from "@/components/web3/explorer/dashboard-navbar"
import { RolesManagement } from "@/components/iam/roles/roles-management"

function RolesPageContent() {
  return (
    <ProtectedRoute>
      <DashboardNavbar />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 px-2 py-2 md:gap-6 md:py-4 md:px-4">
            <RolesManagement />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default function RolesPage() {
  return (
    <Suspense>
      <RolesPageContent />
    </Suspense>
  )
}
