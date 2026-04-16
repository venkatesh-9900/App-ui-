"use client"

import React, { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardNavbar } from "@/components/web3/explorer/dashboard-navbar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Building2, KeyRound, Link2 } from "lucide-react"
import { OrganizationTab } from "@/components/iam/oauth-setup/organization-tab"
import { IdentityProvidersTab } from "@/components/iam/oauth-setup/identity-providers-tab"
import { OrgIdpLinkTab } from "@/components/iam/oauth-setup/org-idp-link-tab"

function OAuthSetupPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get("tab") || "organization"

  const handleTabChange = (value: string) => {
    router.push(`/iam/oauth-setup?tab=${value}`)
  }

  return (
    <ProtectedRoute>
      <DashboardNavbar />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 px-2 py-2 md:gap-6 md:py-4 md:px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
              <h2 className="text-sm sm:text-2xl font-bold tracking-tight">OAuth Setup</h2>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="flex-wrap">
                <TabsTrigger value="organization" className="cursor-pointer">
                  <Building2 className="w-4 h-4 mr-2" />
                  Organization
                </TabsTrigger>
                <TabsTrigger value="identity-providers" className="cursor-pointer">
                  <KeyRound className="w-4 h-4 mr-2" />
                  Identity Providers
                </TabsTrigger>
                <TabsTrigger value="link-idp" className="cursor-pointer">
                  <Link2 className="w-4 h-4 mr-2" />
                  Link IDP
                </TabsTrigger>
              </TabsList>

              <TabsContent value="organization">
                <OrganizationTab />
              </TabsContent>

              <TabsContent value="identity-providers">
                <IdentityProvidersTab />
              </TabsContent>

              <TabsContent value="link-idp">
                <OrgIdpLinkTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default function OAuthSetupPage() {
  return (
    <Suspense>
      <OAuthSetupPageContent />
    </Suspense>
  )
}
