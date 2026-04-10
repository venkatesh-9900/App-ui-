"use client"

import React, { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardNavbar } from "@/components/web3/explorer/dashboard-navbar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Users, Shield, UserPlus } from "lucide-react"
import { GroupManagementTab } from "@/components/iam/groups/management-tab"
import { GroupRoleMappingsTab } from "@/components/iam/groups/role-mappings-tab"
import { GroupUserMappingsTab } from "@/components/iam/groups/user-mappings-tab"

function GroupsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get("tab") || "management"

  const handleTabChange = (value: string) => {
    router.push(`/iam/groups?tab=${value}`)
  }

  return (
    <ProtectedRoute>
      <DashboardNavbar />
      <div className="flex-1 p-4 pt-4 space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <h2 className="text-2xl font-bold tracking-tight">Groups & SubGroups</h2>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="management" className="cursor-pointer">
              <Users className="w-4 h-4 mr-2" />
              Management
            </TabsTrigger>
            <TabsTrigger value="role-mappings" className="cursor-pointer">
              <Shield className="w-4 h-4 mr-2" />
              Role Mappings
            </TabsTrigger>
            <TabsTrigger value="user-mappings" className="cursor-pointer">
              <UserPlus className="w-4 h-4 mr-2" />
              User Mappings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="management">
            <GroupManagementTab />
          </TabsContent>

          <TabsContent value="role-mappings">
            <GroupRoleMappingsTab />
          </TabsContent>

          <TabsContent value="user-mappings">
            <GroupUserMappingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}

export default function GroupsPage() {
  return (
    <Suspense>
      <GroupsPageContent />
    </Suspense>
  )
}
