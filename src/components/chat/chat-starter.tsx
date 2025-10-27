"use client"

import { MessagesSquareIcon } from "lucide-react"

export default function ChatStarter() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <MessagesSquareIcon className="h-24 w-24 text-primary relative z-10" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Start a conversation
          </h1>
          <p className="text-lg text-muted-foreground">
            Ask Argus Intelligence anything.
          </p>
          <p className="text-sm text-muted-foreground/70">
            Type your message below to begin.
          </p>
        </div>

        {/* Status */}
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-secondary-foreground/10">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">Argus Intelligence</span>
          </div>
        </div>
      </div>
    </div>
  )
}
