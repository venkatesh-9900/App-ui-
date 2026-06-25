"use client"

import Link from "next/link"
import { useSearchParams, usePathname } from "next/navigation"
import {
  ChevronRight,
  type LucideIcon,
} from "lucide-react"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChatGroupsList } from "@/components/chat/chat-groups"
import { ChatSessionsList } from "@/components/chat/chat-sessions"
import { Web3Monitoring } from "@/components/app-sidebar/web3-monitoring"
import { NotificationsMenu } from "@/components/app-sidebar/notifications-menu"
import { OperatorMenu } from "@/components/app-sidebar/operator-menu"
import { IamMenu } from "@/components/app-sidebar/iam-menu"

export function NavMain({
    menuItems,
}: {
  menuItems: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { open, toggleSidebar } = useSidebar();
  const isNewChat = searchParams.get('new') === 'true'
  const hasPrompt = searchParams.get('prompt') !== null
  const sessionId = searchParams.get('sessionId')

  // Ticket #355
  // Prevents the global "New Chat" navigation item from
  // appearing active while creating a conversation inside
  // an Analysis Group.
  const groupId = searchParams.get('groupId')

  const isActive = (url: string) => {
    if (url === "/dashboard" && pathname === "/dashboard") {
      return true
    }
    // Check for home
    if (url === "/home" && pathname === "/home") {
      return true
    }
    // Check for new chat (includes ?new=true or ?prompt=xxx)
    if (url.indexOf("/chat?new=true") != -1 && pathname === "/chat" && (isNewChat || hasPrompt) && !groupId) {
      return true
    }
    // Check for regular chat (not new, not with sessionId, not with prompt)
    if (url === "/chat" && pathname === "/chat" && !isNewChat && !sessionId && !hasPrompt && !groupId) {
      return true
    }
    return false
  }

  function itemClickHandler() {
    if( !open ) {
      toggleSidebar();
    }
  }

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Your Space</SidebarGroupLabel> */}
      <SidebarMenu>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild isActive={isActive(item.url)}>
              <Link href={item.url} data-testid={`nav-${item.name.toLowerCase().replace(" ", "-")}-link`}>
                <item.icon onClick={itemClickHandler} />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        <ChatGroupsList />
        <ChatSessionsList />
        <Web3Monitoring />
        <NotificationsMenu />
        <OperatorMenu />
        <IamMenu />
      </SidebarMenu>
    </SidebarGroup>
  )
}
