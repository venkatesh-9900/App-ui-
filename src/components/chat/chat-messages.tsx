
"use client"

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import { ChatMessage } from "./chat-message"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatMessagesProps {
  messages: Message[]
  isLoading?: boolean
}

export function ChatMessages({ messages, isLoading = false }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading])

  return (
    <ScrollArea className="flex-1 bg-background pt-8 overflow-hidden">
      <div className="h-full flex flex-col py-6">
        <div className="space-y-4 flex-1 flex flex-col">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center px-4">
              <h2 className="text-2xl font-semibold mb-2">Start a conversation</h2>
              <p className="text-muted-foreground text-sm max-w-sm">
                Ask Argus Intelligence anything. Type your message below to begin.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
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

              <div ref={scrollRef} className="h-1" />
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  )
}
