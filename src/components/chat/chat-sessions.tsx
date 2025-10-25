"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ChevronRight, MessageSquare } from "lucide-react"
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
import { fetchUserChatSessions } from "@/hooks/chat-service"
import { ChatSessions } from "@/types/chat-types"

export function ChatSessionsList() {
  const searchParams = useSearchParams()
  const currentSessionId = searchParams.get('sessionId')
  
  const [chatSessions, setChatSessions] = useState<ChatSessions[]>([])
  const [isLoadingChats, setIsLoadingChats] = useState(false)

  // Load chat sessions on mount since collapsible is open by default
  useEffect(() => {
    loadChatSessions()
  }, [])

  const extractUserMessage = (text: string) => {
    const match = text.match(/User Request:\s*(.+?)(?:\n|$)/)
    return match ? match[1].trim() : text
  }

  const loadChatSessions = () => {
    setIsLoadingChats(true)
    fetchUserChatSessions({
      successTask: (sessions) => {
        console.log("Chat sessions loaded", sessions)
        setChatSessions(sessions)
        setIsLoadingChats(false)
      },
      failureTask: () => {
        console.error("Failed to load chat sessions")
        setIsLoadingChats(false)
      },
      errorTask: () => {
        console.error("Error loading chat sessions")
        setIsLoadingChats(false)
      },
    })
  }

  return (
    <Collapsible
      asChild
      defaultOpen={true}
      className="group/collapsible"
      onOpenChange={(open) => {
        if (open && chatSessions.length === 0) {
          loadChatSessions()
        }
      }}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip="All Chats">
            <MessageSquare className="h-4 w-4" />
            <span>All Chats</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {isLoadingChats ? (
              <SidebarMenuSubItem>
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
                  <span>Loading...</span>
                </div>
              </SidebarMenuSubItem>
            ) : chatSessions.length > 0 ? (
              chatSessions.map((session) => (
                <SidebarMenuSubItem key={session.session_id}>
                  <SidebarMenuSubButton 
                    asChild
                    isActive={currentSessionId === session.session_id}
                  >
                    <Link href={`/chat?sessionId=${session.session_id}`}>
                      <span className="truncate">{extractUserMessage(session.initial_text)}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))
            ) : (
              <SidebarMenuSubItem>
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
                  <span>No chats yet</span>
                </div>
              </SidebarMenuSubItem>
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}
