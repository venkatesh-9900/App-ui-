"use client"

import Link from "next/link"
import { useState, useEffect, Fragment, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ChevronRight, MessageSquare, Clock } from "lucide-react"
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
import { fetchUserChatSessions, removeChat, pauseSchedule, resumeSchedule, deleteSchedule, extractScheduleId, isScheduledChat, fetchUserSchedules, canPauseSchedule, canResumeSchedule, updateChatTitle } from "@/hooks/chat-service"
import { ChatSessions } from "@/types/chat-types"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { IconDots, IconFolder, IconShare3, IconTrash, IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react"
import { toast } from "sonner"
import { onChatHistoryUpdate, onChatMovedToGroup } from "@/utils/eventBus"
import { Input } from "../ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function ChatSessionsList() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentSessionId = searchParams.get('sessionId')
  const { open, toggleSidebar } = useSidebar();
  const isEditingRef = useRef(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const editContainerRef = useRef<HTMLDivElement | null>(null)
  const [chatSessions, setChatSessions] = useState<ChatSessions[]>([])
  const [isLoadingChats, setIsLoadingChats] = useState(false)
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)
  const [scheduleActionSessionId, setScheduleActionSessionId] = useState<string | null>(null)
  // Map of scheduleId -> status for showing pause/resume conditionally
  const [scheduleStatusMap, setScheduleStatusMap] = useState<Map<string, string>>(new Map())
  const { isMobile } = useSidebar()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredChatSessions, setFilteredChatSessions] = useState<ChatSessions[]>([])
  const [draggingSessionId, setDraggingSessionId] = useState<string | null>(null)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [accessDenied, setAccessDenied] = useState(false)

  // Load chat sessions on mount since collapsible is open by default
  useEffect(() => {
    loadChatSessions()
    loadSchedules()
    const unsubscribe = onChatHistoryUpdate((payload) => {
      const tempSession = {
        session_id: payload?.sessionId || `temp-${Date.now()}`,
        initial_text: payload?.initialText || "New chat",
        is_sharable: false
      }

      setChatSessions(prev => {
        return [tempSession, ...prev]
      })
    })

    const unsubscribeMove = onChatMovedToGroup((payload) => {
      setChatSessions(prev => prev.filter(s => s.session_id !== payload.sessionId))
    })

    return () => {
      unsubscribe();
      unsubscribeMove();
    };
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filteredSessions = chatSessions.filter((session) =>
        session.initial_text.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredChatSessions(filteredSessions)
    } else {
      setFilteredChatSessions(chatSessions)
    }
  }, [searchTerm, chatSessions])


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
      forbiddenTask: () => {
        setAccessDenied(true)
        setIsLoadingChats(false)
      },
    })
  }

  const loadSchedules = () => {
    fetchUserSchedules({
      successTask: (schedules) => {
        console.log("Schedules loaded", schedules)
        // Create a map of scheduleId -> status
        const statusMap = new Map<string, string>()
        schedules.forEach((schedule) => {
          statusMap.set(schedule.id.toString(), schedule.status)
        })
        setScheduleStatusMap(statusMap)
      },
      failureTask: () => {
        console.error("Failed to load schedules")
      },
      errorTask: () => {
        console.error("Error loading schedules")
      },
    })
  }

  const handleDeleteChat = (sessionId: string) => {
    setDeletingSessionId(sessionId)
    
    // If it's a scheduled chat, also stop the scheduler
    if (isScheduledChat(sessionId)) {
      const scheduleId = extractScheduleId(sessionId)
      if (scheduleId) {
        // Stop the scheduler first, then delete the chat
        deleteSchedule({
          scheduleId,
          successTask: () => {
            console.log("Schedule stopped successfully")
          },
          failureTask: (message) => {
            console.warn("Failed to stop schedule:", message)
            // Continue with chat deletion even if schedule stop fails
          },
          errorTask: () => {
            console.warn("Error stopping schedule")
            // Continue with chat deletion even if schedule stop fails
          },
          forbiddenTask: () => {
            toast.error("Access denied")
          }
        })
      }
    }
    
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
      forbiddenTask: () => {
        toast.error("Access denied")
        setDeletingSessionId(null)
      },
      group_id: null
    })
  }

  const handleOpenChat = (sessionId: string) => {
    router.push(`/chat?sessionId=${sessionId}`)
  }

  const handlePauseSchedule = (sessionId: string) => {
    const scheduleId = extractScheduleId(sessionId)
    if (!scheduleId) {
      toast.error("Invalid scheduled chat")
      return
    }
    setScheduleActionSessionId(sessionId)
    pauseSchedule({
      scheduleId,
      successTask: () => {
        toast.success("Schedule paused successfully")
        setScheduleActionSessionId(null)
        // Update local status map to PAUSED
        setScheduleStatusMap(prev => {
          const newMap = new Map(prev)
          newMap.set(scheduleId, 'PAUSED')
          return newMap
        })
      },
      failureTask: (message) => {
        toast.error(message || "Failed to pause schedule")
        setScheduleActionSessionId(null)
      },
      errorTask: () => {
        toast.error("Error pausing schedule")
        setScheduleActionSessionId(null)
      },
      forbiddenTask: () => {
        toast.error("Access denied")
        setScheduleActionSessionId(null)
      }
    })
  }

  const handleResumeSchedule = (sessionId: string) => {
    const scheduleId = extractScheduleId(sessionId)
    if (!scheduleId) {
      toast.error("Invalid scheduled chat")
      return
    }
    setScheduleActionSessionId(sessionId)
    resumeSchedule({
      scheduleId,
      successTask: () => {
        toast.success("Schedule resumed successfully")
        setScheduleActionSessionId(null)
        // Update local status map to PENDING (will become RUNNING when picked up)
        setScheduleStatusMap(prev => {
          const newMap = new Map(prev)
          newMap.set(scheduleId, 'PENDING')
          return newMap
        })
      },
      failureTask: (message) => {
        toast.error(message || "Failed to resume schedule")
        setScheduleActionSessionId(null)
      },
      errorTask: () => {
        toast.error("Error resuming schedule")
        setScheduleActionSessionId(null)
      },
      forbiddenTask: () => {
        toast.error("Access denied")
        setScheduleActionSessionId(null)
      }
    })
  }

  function subMenuExpansion() {
    if( !open ) {
      toggleSidebar();
    }
  }

  const handleDragStart = (e: React.DragEvent, session: ChatSessions) => {
    e.dataTransfer.setData("application/chat-session-id", session.session_id)
    e.dataTransfer.setData("application/chat-session-text", session.initial_text)
    e.dataTransfer.effectAllowed = "move"
    setDraggingSessionId(session.session_id)
  }

  const handleDragEnd = () => {
    setDraggingSessionId(null)
  }

  const startEditing = (session: ChatSessions, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    isEditingRef.current = true
    setEditingSessionId(session.session_id)
    setEditingTitle(extractUserMessage(session.initial_text))
  }

  const saveTitle = (sessionId: string) => {
    const newTitle = (inputRef.current?.value || editingTitle).trim()

    if (!newTitle) {
      setEditingSessionId(null)
      return
    }
    setChatSessions(prev =>
      prev.map(s =>
        s.session_id === sessionId
          ? { ...s, initial_text: newTitle }
          : s
      )
    )

    updateChatTitle({
      request: {
        session_id: sessionId,
        title: newTitle
      },
      successTask: () => {
        // setChatSessions(prev =>
        //   prev.map(s =>
        //     s.session_id === sessionId
        //       ? { ...s, initial_text: newTitle }
        //       : s
        //   )
        // )
        setEditingSessionId(null)
      },
      failureTask: () => {
        toast.error("Failed to update title")
        setEditingSessionId(null)
      },
      errorTask: () => {
        toast.error("Error updating title")
        setEditingSessionId(null)
      },
      forbiddenTask: () => {
        toast.error("Access denied")
        setEditingSessionId(null)
      }
    })
  }

  const cancelEditing = () => {
    setEditingSessionId(null)
  }

  useEffect(() => {
    if (!editingSessionId) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        editContainerRef.current &&
        editContainerRef.current.contains(event.target as Node)
      ) {
        return
      }

      saveTitle(editingSessionId)
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [editingSessionId])

  return (
    <Collapsible
      asChild
      defaultOpen={false}
      className="group/collapsible"
      onOpenChange={(open) => {
        if (open && chatSessions.length === 0 && !accessDenied) {
          loadChatSessions()
        }
      }}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip="All Chats" className="cursor-pointer" data-testid="all-chats-sidebar-button">
            <MessageSquare onClick={subMenuExpansion} className="h-4 w-4" />
            <span>All Chats</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent data-testid="all-chats-collapsible-content">
          <SidebarMenuSub>
            {accessDenied ? (
              <SidebarMenuSubItem data-testid="chat-sessions-access-denied">
                <div className="px-2 py-1.5 text-xs text-muted-foreground">Access denied</div>
              </SidebarMenuSubItem>
            ) : isLoadingChats ? (
              <SidebarMenuSubItem data-testid="chat-sessions-list-loading-state">
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
                  <span>Loading...</span>
                </div>
              </SidebarMenuSubItem>
            ) : chatSessions.length > 0 ? (
                <Fragment>
                  <SidebarMenuSubItem>
                    <Input
                      placeholder="Search chats"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />

                  </SidebarMenuSubItem>
                  {filteredChatSessions.length > 0 ? filteredChatSessions.map((session) => (
                    <SidebarMenuSubItem
                      key={session.session_id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, session)}
                      onDragEnd={handleDragEnd}
                      style={{ opacity: draggingSessionId === session.session_id ? 0.5 : 1, cursor: 'grab' }}
                    >
                      {editingSessionId === session.session_id ? (

                        <div className="flex items-center px-2 py-1 w-full" ref={editContainerRef}>
                          {/* {session.session_id.includes("scheduled-chat") && (
                            <Clock className="h-3 w-3 shrink-0 text-muted-foreground" />
                          )} */}

                          <Input
                            ref={inputRef}
                            autoFocus
                            value={editingTitle}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            onBlur={() => {
                              if (isEditingRef.current) return
                              saveTitle(session.session_id)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveTitle(session.session_id)
                              if (e.key === "Escape") cancelEditing()
                            }}
                            className="h-7 text-sm w-full px-1"
                          />
                        </div>

                      ) : (

                        <SidebarMenuSubButton
                          asChild
                          isActive={currentSessionId === session.session_id}
                          data-testid={`chat-session-list-item-button`}
                        >
                            <Link
                              href={`/chat?sessionId=${session.session_id}`}
                              className="flex items-center gap-2 w-full"
                              onDoubleClick={(e) => {
                                startEditing(session, e)
                              }}
                            >
                              {session.session_id.includes("scheduled-chat") && (
                                <Clock className="h-3 w-3 shrink-0 text-muted-foreground" />
                              )}

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className="truncate"
                                >
                                  {extractUserMessage(session.initial_text)}
                                </span>
                              </TooltipTrigger>

                              <TooltipContent side="top">
                                {extractUserMessage(session.initial_text)}
                              </TooltipContent>
                            </Tooltip>
                          </Link>
                        </SidebarMenuSubButton>

                      )}

                      {editingSessionId !== session.session_id && (

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuAction
                              showOnHover
                              className="cursor-pointer data-[state=open]:bg-accent rounded-sm"
                              data-testid={`chat-session-list-item-action-button`}
                            >
                              <IconDots />
                              <span className="sr-only">More</span>
                            </SidebarMenuAction>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="w-36 rounded-lg"
                            side={isMobile ? "bottom" : "right"}
                            align={isMobile ? "end" : "start"}
                          >
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => handleOpenChat(session.session_id)}
                              data-testid={`chat-session-list-item-open-button`}
                            >
                              <IconFolder />
                              <span>Open</span>
                            </DropdownMenuItem>

                            {isScheduledChat(session.session_id) && (() => {
                              const scheduleId = extractScheduleId(session.session_id)
                              const status = scheduleId ? scheduleStatusMap.get(scheduleId) : undefined
                              const showPause = status && canPauseSchedule(status)
                              const showResume = status && canResumeSchedule(status)

                              return (
                                <>
                                  {(showPause || showResume) && <DropdownMenuSeparator />}

                                  {showPause && (
                                    <DropdownMenuItem
                                      data-testid={`chat-session-list-item-pause-button`}
                                      className="cursor-pointer"
                                      disabled={scheduleActionSessionId === session.session_id}
                                      onClick={() => handlePauseSchedule(session.session_id)}
                                    >
                                      <IconPlayerPause />
                                      <span>Pause</span>
                                    </DropdownMenuItem>
                                  )}

                                  {showResume && (
                                    <DropdownMenuItem
                                      data-testid={`chat-session-list-item-resume-button`}
                                      className="cursor-pointer"
                                      disabled={scheduleActionSessionId === session.session_id}
                                      onClick={() => handleResumeSchedule(session.session_id)}
                                    >
                                      <IconPlayerPlay />
                                      <span>Resume</span>
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )
                            })()}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="cursor-pointer"
                              data-testid={`chat-session-list-item-delete-button`}
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
                      )}
                    </SidebarMenuSubItem>
                  )) : (
                    <SidebarMenuSubItem>
                      <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
                        <span>No chats found</span>
                      </div>
                    </SidebarMenuSubItem>
                  )}
                </Fragment>
            ) : (
              <SidebarMenuSubItem data-testid="chat-sessions-list-empty-state">
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
