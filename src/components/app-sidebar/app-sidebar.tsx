"use client"

import * as React from "react"
import {
  LayoutGrid,
  MessageCirclePlus,
  Home,
  Activity,
  Bell,
} from "lucide-react"

import { NavMain } from "@/components/app-sidebar/nav-main"
import { NavUser } from "@/components/app-sidebar/nav-user"
import { AppSidebarHeader } from "@/components/app-sidebar/app-sidebar-header"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {  
  menuItems: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: LayoutGrid,
    },
    {
      name: "Transaction Risk Analysis",
      url: "/home",
      icon: Home,
    },
    {
      name: "Wallet Risk Scoring",
      url: "/wallet-risk",
      icon: Activity,
    },
    {
      name: "Airdrop Notifications",
      url: "/airdrop-notifications",
      icon: Bell,
    },
    {
      name: "Interacitive Analysis",
      url: "/chat?new=true",
      icon: MessageCirclePlus,
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppSidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain menuItems={data.menuItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
