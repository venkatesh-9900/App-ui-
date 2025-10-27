
"use client"

import { Share2, Copy, Check, Lock, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModelSelector } from "./model-selector"
import { useState, useContext } from "react"
import { toggleChatSharability } from "@/hooks/chat-service"
import { ChatContext } from "@/contexts"
import { toast } from "sonner"

interface ChatNavbarProps {
  chatTitle?: string
  selectedModel?: string
  onModelChange?: (modelId: string) => void
  chatId?: string
  agents?: any[]
  isLoadingAgents?: boolean
  sessionId?: string | null
}

export function ChatNavbar({
  chatTitle = "New Chat",
  selectedModel = "genesis",
  onModelChange,
  chatId,
  agents = [],
  isLoadingAgents = false,
  sessionId,
}: ChatNavbarProps) {
  const [isToggling, setIsToggling] = useState(false)
  const { isShared, setIsShared, shareableLink, setShareableLink } = useContext(ChatContext)

  const handleToggleShare = async () => {
    if (!sessionId) {
      console.error("No session ID available")
      return
    }

    setIsToggling(true)
    try {
      await toggleChatSharability({
        sessionId,
        isSharable: !isShared,
        successTask: (link?: string) => {
          if (!isShared && link) {
            // Now making sharable, we have a link
            setShareableLink(link)
            setIsShared(true)
            // Auto copy the link
            const fullUrl = `${window.location.origin}${link}`
            navigator.clipboard.writeText(fullUrl)
            toast.success("Link copied successfully!")
          } else if (isShared) {
            // Now making non-sharable
            setIsShared(false)
            setShareableLink("")
          }
        },
        failureTask: () => {
          console.error("Failed to toggle share")
        },
        errorTask: () => {
          console.error("Error toggling share")
        },
      })
    } finally {
      setIsToggling(false)
    }
  }

  const handleCopyLink = () => {
    if (shareableLink) {
      const fullUrl = `${window.location.origin}${shareableLink}`
      navigator.clipboard.writeText(fullUrl)
      toast.success("Link copied successfully!")
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-background">
      <div className="flex items-center gap-2">
        <p className="text-xs text-muted-foreground">Conversation with Argus Intelligence</p>
        <div className="h-2 w-2 rounded-full bg-green-500"></div>
      </div>

      <div className="flex items-center gap-3 cursor-pointer">
        <ModelSelector
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          agents={agents}
          isLoadingAgents={isLoadingAgents}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild className="cursor-pointer">
            <Button 
              variant="outline" 
              size="icon" 
              disabled={!sessionId || isToggling}
              className={isShared ? "!text-white !bg-green-500 !hover:bg-green-600 !border-green-500 dark:!bg-green-600 dark:!hover:bg-green-700" : ""}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* Toggle Sharability */}
            <DropdownMenuItem 
              onClick={handleToggleShare} 
              className="cursor-pointer"
              disabled={isToggling}
            >
              {isShared ? (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  Stop sharing
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Make shareable
                </>
              )}
            </DropdownMenuItem>

            {/* Copy Link - only show if shared */}
            {isShared && shareableLink && (
              <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
                <Copy className="h-4 w-4 mr-2" />
                Copy share link
              </DropdownMenuItem>
            )}

            {/* Display share link */}
            {isShared && shareableLink && (
              <div className="px-2 py-2 text-xs text-muted-foreground border-t">
                <p className="font-semibold mb-1">Share link:</p>
                <p className="break-all font-mono text-xs bg-muted p-2 rounded max-h-16 overflow-y-auto">
                  {window.location.origin}{shareableLink}
                </p>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
