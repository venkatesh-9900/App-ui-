"use client"

import { MessagesSquareIcon } from "lucide-react"

export default function ChatStarter() {
  return (
    <div className="bg-background flex flex-col items-center justify-center text-center px-4 gap-6 pb-8 -mt-20">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-secondary/50 border border-secondary-foreground/10 mb-2">
            <MessagesSquareIcon className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">
            Start a conversation
          </h1>
          <p className="text-sm text-muted-foreground/70">
            Ask questions, inspect activities, or query systems.
          </p>
        </div>
      </div>
    </div>
  )
}
