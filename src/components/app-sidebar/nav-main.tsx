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
} from "@/components/ui/sidebar"
import { ChatSessionsList } from "@/components/chat/chat-sessions"
import { Web3Monitoring } from "@/components/app-sidebar/web3-monitoring"

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
  const isNewChat = searchParams.get('new') === 'true'
  const hasPrompt = searchParams.get('prompt') !== null
  const sessionId = searchParams.get('sessionId')

  const isActive = (url: string) => {
    // Check for home
    if (url === "/home" && pathname === "/home") {
      return true
    }
    // Check for new chat (includes ?new=true or ?prompt=xxx)
    if (url === "/chat?new=true" && pathname === "/chat" && (isNewChat || hasPrompt)) {
      return true
    }
    // Check for regular chat (not new, not with sessionId, not with prompt)
    if (url === "/chat" && pathname === "/chat" && !isNewChat && !sessionId && !hasPrompt) {
      return true
    }
    return false
  }

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Your Space</SidebarGroupLabel> */}
      <SidebarMenu>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild isActive={isActive(item.url)}>
              <Link href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}

        <ChatSessionsList />
        <Web3Monitoring />
      </SidebarMenu>
    </SidebarGroup>
  )
}
