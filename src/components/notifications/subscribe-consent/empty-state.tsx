"use client"

import React from 'react'
import { BellOff } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="text-center py-8 space-y-3">
      <div className="inline-flex p-3 bg-muted rounded-full">
        <BellOff className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">
        Enable at least one notification method to subscribe
      </p>
    </div>
  )
}

