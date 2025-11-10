"use client"

import { Settings } from "lucide-react"

export default function Web3TrendsPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <Settings className="h-24 w-24 text-primary relative z-10" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Web3 Trends
          </h1>
          <p className="text-lg text-muted-foreground">
            This feature is currently under construction
          </p>
          <p className="text-sm text-muted-foreground/70">
            We're building something amazing. Check back soon!
          </p>
        </div>

        {/* Status */}
        <div className="pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-secondary-foreground/10">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
            <span className="text-sm font-medium text-muted-foreground">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  )
}
