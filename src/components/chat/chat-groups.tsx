"use client"

import Link from "next/link"
import { useState, useEffect, use, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ChevronRight, MessageSquare, MessageSquarePlus, Folder, FolderOpen, FolderPlus, ComponentIcon, X } from "lucide-react"
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
// import { fetchUserChatSessions, removeChat } from "@/hooks/chat-service"
import { ChatGroup } from "@/types/chat-types"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { IconDots, IconFolder, IconTrash } from "@tabler/icons-react"
import { createChatGroup, deleteGroup, fetchChatGroupSessions, fetchUserChatGroups, removeChat, moveChatToGroup } from "@/hooks/chat-service"
import { toast } from "sonner"
import { triggerChatMovedToGroup } from "@/utils/eventBus"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { onChatHistoryUpdate } from "@/utils/eventBus"
import { useSpace } from "@/contexts/space-context"

interface ChatGroupWithCollapseState extends ChatGroup {
  is_collapsed: boolean
}


// Ticket #356
// Improves the visual hierarchy of Analysis Groups while
// preserving all existing sidebar behaviour.
export function ChatGroupsList() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentSessionId = searchParams.get('sessionId')
  const isNewChat = searchParams.get('new') === 'true' // Ticket #355
  const groupId = searchParams.get('groupId') // Ticket #355

  const [addGroupName, setAddGroupName] = useState("")
  const [chatGroups, setChatGroups] = useState<ChatGroupWithCollapseState[]>([])
  const [isLoadingChats, setIsLoadingChats] = useState(false)
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null)
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)
  const [openAddGroupDialog, setOpenAddGroupDialog] = useState(false)
  const { isMobile } = useSidebar()
  const { open, toggleSidebar } = useSidebar();
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null)
  const { selectedSpace } = useSpace()

  useEffect(() => {
    if (openAddGroupDialog) {
      setAddGroupName("")
    }
  }, [openAddGroupDialog])

  const extractUserMessage = (text: string) => {
    const match = text.match(/User Request:\s*(.+?)(?:\n|$)/)
    return match ? match[1].trim() : text
  }

  const loadChatGroups = useCallback(() => {
    setIsLoadingChats(true)
    fetchUserChatGroups({
        iamGroupId: selectedSpace?.id ?? null,
        successTask: (groups) => {
          console.log("Chat groups loaded", groups)
          setChatGroups(groups.map((group) => {
            return {
              ...group,
              is_collapsed: true
            }
          }));
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
    });
    setIsLoadingChats(false)
  }, [selectedSpace])

  // Load chat groups on mount and whenever the selected space changes
  useEffect(() => {
    loadChatGroups()
  }, [loadChatGroups])

  useEffect(() => {
    const unsubscribe = onChatHistoryUpdate(() => {
      void loadChatGroups();
    });
    return () => { unsubscribe() }
  }, [loadChatGroups])

  const handleDeleteGroup = (groupId: string) => {
    setDeletingGroupId(groupId)
    deleteGroup({
      groupId,
      successTask: () => {
        console.log("Chat group deleted successfully")
        toast.success("Chat group deleted successfully")
        setDeletingGroupId(null)
        // Remove the deleted chat from the UI
        setChatGroups((prevGroups) =>
          prevGroups.filter((group) => group.group_id !== groupId)
        )
      },
      failureTask: () => {
        console.error("Failed to delete chat")
        toast.error("Failed to delete chat")
        setDeletingGroupId(null)
      },
      errorTask: () => {
        console.error("Error deleting chat")
        toast.error("Error deleting chat")
        setDeletingGroupId(null)
      },
      forbiddenTask: () => {
        toast.error("Access denied")
        setDeletingGroupId(null)
      },
    })
  }

  const handleDeleteChat = (sessionId: string, group_id: string) => {
    setDeletingSessionId(sessionId)
    removeChat({
      sessionId,
      successTask: () => {
        console.log("Chat deleted successfully")
        toast.success("Chat deleted successfully")
        setDeletingSessionId(null)
        // Remove the deleted chat from the UI
        fetchChatGroupSessions({
          groupId: group_id,
          successTask: (sessions) => {
            setChatGroups(prevGroups => {
              return prevGroups.map(group => {
                if (group.group_id === group_id) {
                  return {
                    ...group,
                    sessions: sessions
                  }
                }
                return group;
              });
            });
          },
          failureTask: () => {
            console.error("Failed to load chat sessions for group_id: " + group_id)
          },
          errorTask: () => {
            console.error("Error loading chat sessions for group_id: " + group_id)
          },
        });
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
      group_id: group_id
    })
  }

  const handleAddGroup = () => {
    if (!addGroupName.trim()) return toast.error("Group name cannot be empty")
    const validPattern = /^[A-Za-z0-9_ ]+$/
    if (!validPattern.test(addGroupName.trim())) {
      toast.error(
        "Group name can only contain letters (A-Z, a-z), numbers (0-9), spaces, and underscore (_). No special characters allowed."
      )
      return
    }

    const duplicate = chatGroups.some(g =>
      g.group_name.toLowerCase() === addGroupName.trim().toLowerCase()
    )
    if (duplicate) {
      toast.error("Already exists. Please try with a different name.")
      return
    }

    createChatGroup({
      groupName: addGroupName,
      iamGroupId: selectedSpace?.id ?? null,
      successTask: () => {
        console.log("Chat group created successfully")
        toast.success("Chat group created successfully")
        setAddGroupName("")
        setOpenAddGroupDialog(false)
        loadChatGroups()
      },
      failureTask: () => {
        console.error("Failed to create chat group")
        toast.error("Failed to create chat group")
      },
      errorTask: () => {
        console.error("Error creating chat group")
        toast.error("Error creating chat group")
      },
      forbiddenTask: () => {
        toast.error("Access denied")
      },
    });
  }

  const handleOpenNewChat = (groupId: string, groupName?: string) => {
    localStorage.setItem("groupName", groupName || "")
    router.push(`/chat?new=true&groupId=${groupId}`)
  }

  const handleOpenChat = (sessionId: string) => {
    router.push(`/chat?sessionId=${sessionId}`)
  }

  const handleOpenGroup = (groupId: string) => {
    router.push(`/chat-group?groupId=${groupId}`)
  }

  function subMenuExpansion() {
    if( !open ) {
      toggleSidebar();
    }
  }

  const setCollapsed = (open: boolean, index: number) => {
    setChatGroups(currentChatGroups =>
      currentChatGroups.map((group, i) =>
        i === index ? { ...group, is_collapsed: !open } : group
      )
    )
  }

  const handleDragOver = (e: React.DragEvent, groupId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverGroupId(groupId)
  }

  const handleDragLeave = () => {
    setDragOverGroupId(null)
  }

  const handleDrop = (e: React.DragEvent, groupId: string) => {
    e.preventDefault()
    setDragOverGroupId(null)
    const sessionId = e.dataTransfer.getData("application/chat-session-id")
    const sessionText = e.dataTransfer.getData("application/chat-session-text")
    if (!sessionId) return

    // Optimistically add session to this group
    setChatGroups(prev => prev.map(group => {
      if (group.group_id === groupId) {
        // Avoid duplicate
        if (group.sessions.some(s => s.session_id === sessionId)) return group
        return {
          ...group,
          sessions: [...group.sessions, { session_id: sessionId, initial_text: sessionText, is_sharable: false }]
        }
      }
      return group
    }))

    moveChatToGroup({
      sessionId,
      groupId,
      successTask: () => {
        toast.success("Chat moved to group")
        triggerChatMovedToGroup({ sessionId, sessionText, groupId })
      },
      failureTask: () => {
        toast.error("Failed to move chat to group")
        // Revert optimistic update
        setChatGroups(prev => prev.map(group => {
          if (group.group_id === groupId) {
            return { ...group, sessions: group.sessions.filter(s => s.session_id !== sessionId) }
          }
          return group
        }))
      },
      errorTask: () => {
        toast.error("Error moving chat to group")
        // Revert optimistic update
        setChatGroups(prev => prev.map(group => {
          if (group.group_id === groupId) {
            return { ...group, sessions: group.sessions.filter(s => s.session_id !== sessionId) }
          }
          return group
        }))
      },
      forbiddenTask: () => {
        toast.error("Access denied")
        setChatGroups(prev => prev.map(group => {
          if (group.group_id === groupId) {
            return { ...group, sessions: group.sessions.filter(s => s.session_id !== sessionId) }
          }
          return group
        }))
      }
    })
  }

  return (
    <Collapsible
      asChild
      defaultOpen={false}
      className="group/collapsible"
      onOpenChange={(open) => {
        if (open && chatGroups.length === 0) {
          loadChatGroups()
        }
      }}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip="Analysis Groups" className="cursor-pointer">
            <ComponentIcon onClick={subMenuExpansion} className="h-4 w-4" />
            <span>Analysis Groups</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            <SidebarMenuSubItem key={"new-group"}>
              <Dialog open={openAddGroupDialog} onOpenChange={setOpenAddGroupDialog}>
                <DialogTrigger asChild>
                  <SidebarMenuSubButton className="cursor-pointer">
                    <FolderPlus className="h-4 w-4" />
                    <span>New Group</span>
                  </SidebarMenuSubButton>
                </DialogTrigger>
                <DialogContent data-testid="chat-groups-new-group-dialog" className="sm:max-w-md flex flex-col gap-8" showCloseButton={false}>
                  <DialogHeader>
                    <DialogTitle className="flex items-center justify-between"><div>Add a New Group</div><div><X className="h-4 w-4 cursor-pointer" onClick={() => setOpenAddGroupDialog(false)} /></div></DialogTitle>
                  </DialogHeader>
                  <div className="flex items-center gap-2">
                    <div className="grid flex-1 gap-2">
                      <Label htmlFor="link" className="sr-only">
                        Group Name
                      </Label>
                      <Input
                        id="link"
                        value={addGroupName}
                        onChange={(e) => setAddGroupName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter className="sm:justify-end">
                    <DialogClose asChild>
                      <Button className="cursor-pointer" type="button" variant="secondary">
                        Close
                      </Button>
                    </DialogClose>
                    <Button disabled={addGroupName.trim() === ""} className="cursor-pointer" data-testid="chat-groups-new-group-add-button" type="submit" onClick={() => { handleAddGroup() }}>Create Group</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

            </SidebarMenuSubItem>
            {isLoadingChats ? (
              <SidebarMenuSubItem>
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
                  <span data-testid="chat-groups-list-loading">Loading...</span>
                </div>
              </SidebarMenuSubItem>
            ) : chatGroups.map((group, idx) => (
                <Collapsible data-testid="chat-groups-list-items" open={!group.is_collapsed} onOpenChange={(open) => {setCollapsed(open, idx)}} key={group.group_id}>
                  {/* <SidebarMenuSubItem> */}
                    <CollapsibleTrigger asChild>
                  <SidebarMenuSubItem
                    className="mb-1"
                    onDragOver={(e) => handleDragOver(e, group.group_id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, group.group_id)}
                    style={{
                      outline: dragOverGroupId === group.group_id ? '2px dashed hsl(var(--primary))' : 'none',
                      borderRadius: '6px',
                      transition: 'outline 0.15s ease',
                    }}
                  >
                      <SidebarMenuButton data-testid="chat-groups-list-items-button" tooltip={group.group_name} className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
                        {group.is_collapsed ? <Folder className="h-4 w-4 shrink-0" /> : <FolderOpen className="h-4 w-4 shrink-0" />}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate">{group.group_name}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {group.group_name}
                          </TooltipContent>
                        </Tooltip>
                        <ChevronRight className="ml-auto shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuAction
                                  showOnHover
                                  className="cursor-pointer data-[state=open]:bg-accent rounded-sm"
                                  data-testid="chat-groups-list-items-action-button"
                                >
                                  <IconDots />
                                  <span className="sr-only">More</span>
                                </SidebarMenuAction>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                data-testid="chat-groups-list-items-action-dropdown-content"
                                className="w-24 rounded-lg"
                                side={isMobile ? "bottom" : "right"}
                                align={isMobile ? "end" : "start"}
                              >
                                <DropdownMenuItem className="cursor-pointer"
                                  data-testid="chat-groups-list-items-action-dropdown-delete-button"
                                  variant="destructive"
                                  disabled={deletingGroupId === group.group_id}
                                  onClick={() => handleDeleteGroup(group.group_id)}
                                >
                                  <IconTrash />
                                  <span>
                                    {deletingGroupId === group.group_id ? "Deleting..." : "Delete"}
                                  </span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                      </SidebarMenuSubItem>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="ml-4 border-l pl-2 py-1 flex flex-col gap-1">
                  <SidebarMenuSubItem className="cursor-pointer" key={`${group.group_id}-new-session`}>
                    <SidebarMenuSubButton 
                      isActive={isNewChat && groupId === group.group_id} 
                      className="text-muted-foreground hover:text-foreground" 
                      onClick={() => { handleOpenNewChat(group.group_id, group.group_name) }}
                    >
                            <MessageSquarePlus className="h-4 w-4" />
                            <span>New Chat</span>
                          </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      {group.sessions.map((session) => (
                        <SidebarMenuSubItem key={session.session_id}>
                          <SidebarMenuSubButton
                            data-testid="chat-groups-list-items-session-button"
                            asChild
                            isActive={currentSessionId === session.session_id}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Link href={`/chat?sessionId=${session.session_id}`} className="w-37">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="truncate">{extractUserMessage(session.initial_text)}</span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  {extractUserMessage(session.initial_text)}
                                </TooltipContent>
                              </Tooltip>
                            </Link>
                          </SidebarMenuSubButton>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <SidebarMenuAction
                                data-testid="chat-groups-list-items-session-action-button"
                                showOnHover
                                className="cursor-pointer data-[state=open]:bg-accent rounded-sm"
                              >
                                <IconDots />
                                <span className="sr-only">More</span>
                              </SidebarMenuAction>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              data-testid="chat-groups-list-items-session-action-dropdown-content"
                              className="w-24 rounded-lg"
                              side={isMobile ? "bottom" : "right"}
                              align={isMobile ? "end" : "start"}
                            >
                              <DropdownMenuItem className="cursor-pointer"
                                data-testid="chat-groups-list-items-session-action-open-button"
                                onClick={() => handleOpenChat(session.session_id)}
                              >
                                <IconFolder />
                                <span>Open</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer"
                                data-testid="chat-groups-list-items-session-action-delete-button"
                                variant="destructive"
                                disabled={deletingSessionId === session.session_id}
                                onClick={() => handleDeleteChat(session.session_id, group.group_id)}
                              >
                                <IconTrash />
                                <span>
                                  {deletingSessionId === session.session_id ? "Deleting..." : "Delete"}
                                </span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </SidebarMenuSubItem>
                      ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  {/* </SidebarMenuSubItem> */}
                </Collapsible>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}
