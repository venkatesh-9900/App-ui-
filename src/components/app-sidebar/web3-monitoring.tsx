"use client"

import Link from "next/link"
import { ChevronRight, Activity, TrendingUp } from "lucide-react"
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { usePathname } from "next/navigation"

const menuItems = [
  {
    name: "On-Chain Activity",
    url: "/web3/activity",
    icon: Activity,
  },
  {
    name: "Market Trends",
    url: "/web3/trends",
    icon: TrendingUp,
  },
]

export function Web3Monitoring() {

  const pathname = usePathname()

  const isActive = (url: string) => {
    if (url === "/web3/activity" && pathname === "/web3/activity") {
      return true
    }
    if (url === "/web3/trends" && pathname === "/web3/trends") {
      return true
    }
    return false
  }

  return (
    <Collapsible
      defaultOpen={false}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip="Web3 Monitoring" className="cursor-pointer">
            <Activity className="h-4 w-4" />
            <span>Web3 Monitoring</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {menuItems.map((item) => (
              <SidebarMenuSubItem key={item.name}>
                <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}
