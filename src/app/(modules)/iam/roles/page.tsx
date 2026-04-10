"use client"

import React, { Suspense } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardNavbar } from "@/components/web3/explorer/dashboard-navbar"
import { RolesManagement } from "@/components/iam/roles/roles-management"

function RolesPageContent() {
  return (
    <ProtectedRoute>
      <DashboardNavbar />
      <div className="flex-1 p-4 pt-4 space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <h2 className="text-2xl font-bold tracking-tight">Roles</h2>
        </div>
        <RolesManagement />
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
