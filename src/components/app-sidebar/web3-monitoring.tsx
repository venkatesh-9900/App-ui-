"use client"

import Link from "next/link"
import { ChevronRight, Activity, Group, Network } from "lucide-react"
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
import { useEffect, useState } from "react"

const menuItems = [
  {
    name: "Explorer",
    url: "/web3/explorer",
    icon: Activity,
  },
  {
    name: "Address Activity",
    url: "/web3/address-activity",
    icon: Activity,
  },
  {
    name: "Address Group",
    url: "/web3/address-group",
    icon: Group,
  },
  {
    name: "Address Analytics",
    url: "/web3/address",
    icon: Network
  }
]

export function Web3Monitoring() {

  const pathname = usePathname()

  const isActive = (url: string) => {
    if (url === "/web3/explorer" && pathname === "/web3/explorer") {
      return true
    }
    if (url === "/web3/monitoring" && pathname === "/web3/monitoring") {
      return true
    }
    if (url === "/web3/address-activity" && pathname === "/web3/address-activity") {
      return true
    }
    if (url === "/web3/address-group" && pathname === "/web3/address-group") {
      return true
    }
    if (url === "/web3/address" && pathname === "/web3/address") {
      return true
    }
    return false
  }
  const isAnySubmenuActive = menuItems.some(item => isActive(item.url));
  const [open, setOpen] = useState(isAnySubmenuActive);

  // Auto-open when route changes
  useEffect(() => {
    if (isAnySubmenuActive) setOpen(true);
  }, [isAnySubmenuActive]);
  
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip="Alerts and Monitoring" className="cursor-pointer">
            <Activity className="h-4 w-4" />
            <span>Alerts and Monitoring</span>
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
