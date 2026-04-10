"use client"

import React, { Suspense } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardNavbar } from "@/components/web3/explorer/dashboard-navbar"
import { UsersManagement } from "@/components/iam/users/users-management"

function UsersPageContent() {
  return (
    <ProtectedRoute>
      <DashboardNavbar />
      <div className="flex-1 p-4 pt-4 space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
        </div>
        <UsersManagement />
      </div>
    </ProtectedRoute>
  )
}

export default function UsersPage() {
  return (
    <Suspense>
      <UsersPageContent />
    </Suspense>
  )
}
