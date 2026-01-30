"use client"

import Link from "next/link"
import { ChevronRight, Bell, UserPlus, Settings, Users, Inbox, Webhook } from "lucide-react"
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

const menuItems = [
  {
    name: "Subscribe",
    url: "/notifications/subscribe-consent",
    icon: UserPlus,
  },
  {
    name: "Groups",
    url: "/notifications/groups",
    icon: Users,
  },
   {
    name: "Inbox",
    url: "/notifications/inbox",
    icon: Inbox,
  },
  {
    name: "Channels",
    url: "/notifications/channels",
    icon: Webhook,
  }
]

export function NotificationsMenu() {
  const pathname = usePathname()

  const isActive = (url: string) => {
    return pathname === url
  }
  const { open, toggleSidebar } = useSidebar();

  function subMenuExpansion() {
    if( !open ) {
      toggleSidebar();
    }
  }

  return (
    <Collapsible
      defaultOpen={false}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip="Notifications" className="cursor-pointer">
            <Bell onClick={subMenuExpansion} className="h-4 w-4" />
            <span>Notifications</span>
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

