"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ChevronRight, MessageSquare } from "lucide-react"
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuAction,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { fetchUserChatSessions, removeChat } from "@/hooks/chat-service"
import { ChatSessions } from "@/types/chat-types"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { IconDots, IconFolder, IconShare3, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"

export function ChatSessionsList() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentSessionId = searchParams.get('sessionId')
  const { open, toggleSidebar } = useSidebar();

  const [chatSessions, setChatSessions] = useState<ChatSessions[]>([])
  const [isLoadingChats, setIsLoadingChats] = useState(false)
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)
  const { isMobile } = useSidebar()

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
        toast.error("Failed to load chat sessions")
        setIsLoadingChats(false)
      },
      errorTask: () => {
        console.error("Error loading chat sessions")
        toast.error("Error loading chat sessions")
        setIsLoadingChats(false)
      },
    })
  }

  const handleDeleteChat = (sessionId: string) => {
    setDeletingSessionId(sessionId)
    removeChat({
      sessionId,
      successTask: () => {
        console.log("Chat deleted successfully")
        toast.success("Chat deleted successfully")
        setDeletingSessionId(null)
        // Remove the deleted chat from the UI
        setChatSessions((prevSessions) => 
          prevSessions.filter((session) => session.session_id !== sessionId)
        )
      },
      failureTask: () => {
        console.error("Failed to delete chat")
        toast.error("Failed to delete chat")
        setDeletingSessionId(null)
      },
      errorTask: () => {
        console.error("Error deleting chat")
        toast.error("Error deleting chat")
        setDeletingSessionId(null)
      },
      group_id: null
    })
  }

  const handleOpenChat = (sessionId: string) => {
    router.push(`/chat?sessionId=${sessionId}`)
  }

  function subMenuExpansion() {
    if( !open ) {
      toggleSidebar();
    }
  }

  return (
    <Collapsible
      asChild
      defaultOpen={false}
      className="group/collapsible"
      onOpenChange={(open) => {
        if (open && chatSessions.length === 0) {
          loadChatSessions()
        }
      }}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip="All Chats" className="cursor-pointer">
            <MessageSquare onClick={subMenuExpansion} className="h-4 w-4" />
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction
                        showOnHover
                        className="cursor-pointer data-[state=open]:bg-accent rounded-sm"
                      >
                        <IconDots />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-24 rounded-lg"
                      side={isMobile ? "bottom" : "right"}
                      align={isMobile ? "end" : "start"}
                    >
                      <DropdownMenuItem className="cursor-pointer"
                        onClick={() => handleOpenChat(session.session_id)}
                      >
                        <IconFolder />
                        <span>Open</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer"
                        variant="destructive"
                        disabled={deletingSessionId === session.session_id}
                        onClick={() => handleDeleteChat(session.session_id)}
                      >
                        <IconTrash />
                        <span>
                          {deletingSessionId === session.session_id ? "Deleting..." : "Delete"}
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
