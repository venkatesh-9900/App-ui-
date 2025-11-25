
"use client"

import { useEffect, useRef, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowDown, Loader2 } from "lucide-react"
import { ChatMessage } from "./chat-message"
import { FileDetails } from "@/types/files"
import ChatStarter from "./chat-starter"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  attachments: FileDetails[]
}

interface ChatMessagesProps {
  messages: Message[]
  isLoading?: boolean
  isLoadingSession?: boolean
  sessionId: string | null
  readOnly: boolean
}

export function ChatMessages({ messages, isLoading = false, isLoadingSession = false, sessionId, readOnly }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)

  useEffect(() => {
    if (!scrollRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setShowScrollButton(!entry.isIntersecting) // hide if visible
      },
      { threshold: 0.1 }
    )

    observer.observe(scrollRef.current)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Auto-scroll to bottom
    let lastMessage = messages[messages.length - 1] ?? null;
    if (!showScrollButton) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" })
    } else if (lastMessage?.role === 'user' && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading])

  if (messages.length === 0 && !isLoadingSession) {
    return (
      <ChatStarter></ChatStarter>
    )
  }

  return (
    <ScrollArea className="flex-1 bg-background pt-10 overflow-hidden">
      <div className="w-full flex flex-col">
        <div className="space-y-4 py-6 w-full">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
              attachments={message.attachments}
              sessionId={sessionId}
              readOnly={readOnly}
            />
          ))}

          {isLoading && (
            <div className="py-4 px-3">
              <div className="flex gap-3">
                <div className="h-8 w-8 flex-shrink-0" />
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          { showScrollButton && (
            <button
              onClick={() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }) }}
              className="absolute left-1/2 -translate-x-1/2 bottom-0 z-50 flex items-center gap-2 rounded-full bg-muted/90 px-2 py-2 border-2 border-zinc-300/60 dark:border-zinc-700/60 text-sm text-foreground shadow-lg backdrop-blur hover:bg-muted/100 focus:outline-none cursor-pointer"
              aria-label="Scroll to bottom" >
              <ArrowDown className="h-4 w-4" strokeWidth={2.5} />
            </button>
          )}
          <div ref={scrollRef} className="h-1" />
        </div>
      </div>
    </ScrollArea>
  )
}
