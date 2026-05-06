"use client"

import Link from "next/link"
import { ChevronRight, Settings, Server, Shield, Link as LinkIcon, Shapes } from "lucide-react"
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"

const menuItems = [
  {
    name: "API Services",
    url: "/operator/services",
    icon: Server,
  },
  {
    name: "APIs",
    url: "/operator/apis",
    icon: Settings,
  },
  {
    name: "Permissions",
    url: "/operator/permissions",
    icon: Shield,
  },
  {
    name: "API Mappings",
    url: "/operator/mappings",
    icon: LinkIcon
  }
]

export function OperatorMenu() {
  const { isAuthenticated, isSuperAdmin } = useAuth()
  const pathname = usePathname()

  const isActive = (url: string) => {
    return url === pathname || pathname.startsWith(url + "/");
  }

  const isAnySubmenuActive = menuItems.some(item => isActive(item.url));
  const [open, setOpen] = useState(isAnySubmenuActive);
  const { open: sidebarOpen, toggleSidebar } = useSidebar();

  useEffect(() => {
    if (isAnySubmenuActive) setOpen(true);
  }, [isAnySubmenuActive]);

  if (!isAuthenticated || !isSuperAdmin) {
    return null;
  }

  function subMenuExpansion() {
    if (!sidebarOpen) {
      toggleSidebar();
    }
  }
  
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <div className="flex w-full items-center justify-between">
            <SidebarMenuButton tooltip="Operation Tools" className="cursor-pointer w-full">
              <Settings onClick={subMenuExpansion} className="h-4 w-4" />
              <span>Operation</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {menuItems.map((item) => (
              <SidebarMenuSubItem key={item.name}>
                <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                  <Link href={item.url}>
                    <item.icon className="h-4 w-4" />
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
