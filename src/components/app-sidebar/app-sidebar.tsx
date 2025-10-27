"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  MessageCirclePlus,
  Home
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
      name: "Home",
      url: "/home",
      icon: Home,
    },
    {
      name: "New Chat",
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
