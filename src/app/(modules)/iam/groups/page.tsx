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
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 px-2 py-2 md:gap-6 md:py-4 md:px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
              <h2 className="text-sm sm:text-2xl font-bold tracking-tight">Groups & SubGroups</h2>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="flex-wrap">
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
        </div>
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
