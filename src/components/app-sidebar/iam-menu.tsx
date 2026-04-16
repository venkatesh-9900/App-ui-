"use client"

import Link from "next/link"
import { ChevronRight, KeyRound, Users, ShieldCheck, UserCog, Globe } from "lucide-react"
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
  { name: "Groups", url: "/iam/groups", icon: Users },
  { name: "Roles", url: "/iam/roles", icon: ShieldCheck },
  { name: "Users", url: "/iam/users", icon: UserCog },
  { name: "OAuth Setup", url: "/iam/oauth-setup", icon: Globe, requireRoot: true },
]

export function IamMenu() {
  const { isAuthenticated, isRootUser, isSuperAdmin, isGroupAdmin } = useAuth()
  const pathname = usePathname()
  const isAnySubmenuActive = pathname.startsWith("/iam");
  const [open, setOpen] = useState(isAnySubmenuActive);
  const { open: sidebarOpen, toggleSidebar } = useSidebar();

  useEffect(() => {
    if (isAnySubmenuActive) setOpen(true);
  }, [isAnySubmenuActive]);

  if (!isAuthenticated || (!isRootUser && !isSuperAdmin && !isGroupAdmin)) {
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
            <SidebarMenuButton tooltip="IAM" className="cursor-pointer w-full">
              <KeyRound onClick={subMenuExpansion} className="h-4 w-4" />
              <span>IAM</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {menuItems
              .filter((item) => !item.requireRoot || isRootUser || isSuperAdmin)
              .map((item) => (
              <SidebarMenuSubItem key={item.name}>
                <SidebarMenuSubButton asChild isActive={pathname.startsWith(item.url)}>
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
