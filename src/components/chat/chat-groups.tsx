"use client"

import Link from "next/link"
import { useState, useEffect, use } from "react"
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
import { createChatGroup, deleteGroup, fetchChatGroupSessions, fetchUserChatGroups, removeChat } from "@/hooks/chat-service"
import { toast } from "sonner"
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
import { Button } from "@/components/ui/button"
import { onChatHistoryUpdate } from "@/utils/eventBus"

interface ChatGroupWithCollapseState extends ChatGroup {
  is_collapsed: boolean
}
  

export function ChatGroupsList() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentSessionId = searchParams.get('sessionId')

  const [addGroupName, setAddGroupName] = useState("")
  const [chatGroups, setChatGroups] = useState<ChatGroupWithCollapseState[]>([])
  const [isLoadingChats, setIsLoadingChats] = useState(false)
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null)
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)
  const [openAddGroupDialog, setOpenAddGroupDialog] = useState(false)
  const { isMobile } = useSidebar()
  const { open, toggleSidebar } = useSidebar();

  // Load chat sessions on mount since collapsible is open by default
  useEffect(() => {
    loadChatGroups()
  }, [])

  useEffect(() => {
    const unsubscribe = onChatHistoryUpdate(() => {
      void loadChatGroups();
    });

    return () => {
      unsubscribe();
    };
  }, [])

  useEffect(() => {
    if (openAddGroupDialog) {
      setAddGroupName("")
    }
  }, [openAddGroupDialog])

  const extractUserMessage = (text: string) => {
    const match = text.match(/User Request:\s*(.+?)(?:\n|$)/)
    return match ? match[1].trim() : text
  }

  const loadChatGroups = () => {
    setIsLoadingChats(true)
    fetchUserChatGroups({
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
    // setChatGroups([
    //   {
    //     group_id: "371e2a04-ab03-4050-8adf-9dda95fb6cfc",
    //     group_name: "Group 1",
    //     is_collapsed: true,
    //     sessions: [
    //       {
    //         session_id: "371e2a04-ab03-4050-8adf-9dda95fb6dfc",
    //         initial_text: "Find out the solution of",
    //         is_sharable: false
    //       },
    //       {
    //         session_id: "371e2a04-ab03-4050-8adf-9dda95fb6efc",
    //         initial_text: "What is meant by the term",
    //         is_sharable: false
    //       }
    //     ]
    //   },
    //   {
    //     group_id: "371e2a04-ab03-4050-8adf-9dda95fb6cfd",
    //     group_name: "Group 2",
    //     is_collapsed: true,
    //     sessions: [
    //       {
    //         session_id: "371e2a04-ab03-4050-8adf-9dda95fb6efc",
    //         initial_text: "Give me 3 examples of the",
    //         is_sharable: false
    //       },
    //       {
    //         session_id: "371e2a04-ab03-4050-8adf-9dda95fb6ffc",
    //         initial_text: "Where can I find the best",
    //         is_sharable: false
    //       },
    //       {
    //         session_id: "371e2a04-ab03-4050-8adf-9dda95fb6ffc",
    //         initial_text: "I want the recipe for my fav",
    //         is_sharable: false
    //       }
    //     ]
    //   }
    // ])
    setIsLoadingChats(false)
  }

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
      group_id: group_id
    })
  }

  const handleAddGroup = () => {
    if (!addGroupName.trim()) return toast.error("Group name cannot be empty")
    const validPattern = /^[A-Za-z0-9_]+$/

    if (!validPattern.test(addGroupName.trim())) {
      toast.error(
        "Group name can only contain letters (A-Z, a-z), numbers (0-9), and underscore (_). No spaces or special characters allowed."
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
          <SidebarMenuButton tooltip="Chat Groups" className="cursor-pointer">
            <ComponentIcon onClick={subMenuExpansion} className="h-4 w-4" />
            <span>Chat Groups</span>
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
                    {/* <DialogDescription>
                      Anyone who has this link will be able to view this.
                    </DialogDescription> */}
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
                      <SidebarMenuSubItem>
                        <div className="flex flex-row gap-2">
                          <SidebarMenuButton data-testid="chat-groups-list-items-button" tooltip="Chat Groups" className="cursor-pointer">
                            {group.is_collapsed ? <Folder className="h-4 w-4" /> : <FolderOpen className="h-4 w-4" />}
                            <span>{group.group_name}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
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
                                {/* <DropdownMenuItem className="cursor-pointer"
                                  onClick={() => handleOpenGroup(group.group_id)}
                                >
                                  <IconFolder />
                                  <span>Open</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator /> */}
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
                        </div>
                      </SidebarMenuSubItem>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4">
                  <SidebarMenuSubItem className="cursor-pointer" key={`${group.group_id}-new-session`}>
                    <SidebarMenuSubButton onClick={() => { handleOpenNewChat(group.group_id, group.group_name) }}>
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
                          >
                            <Link href={`/chat?sessionId=${session.session_id}`} className="w-37">
                              <span className="truncate">{extractUserMessage(session.initial_text)}</span>
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
