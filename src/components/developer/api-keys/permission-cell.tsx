"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Props = {
  permissions: string[]
}

export function PermissionsCell({ permissions }: Props) {
  const [open, setOpen] = useState(false)

  const MAX_VISIBLE = 3
  const visible = permissions.slice(0, MAX_VISIBLE)
  const hiddenCount = permissions.length - MAX_VISIBLE

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Table cell content */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen(true)
        }}
        className="flex flex-wrap gap-1 cursor-pointer"
        title="Click to view all permissions"
      >
        {visible.map((perm) => (
          <span
            key={perm}
            className="rounded-full bg-muted px-2 py-0.5 text-xs"
          >
            {perm}
          </span>
        ))}

        {hiddenCount > 0 && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
            +{hiddenCount} more
          </span>
        )}
      </div>

      {/* Popup */}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Permission list</DialogTitle>
        </DialogHeader>

        <div className="mt-2 flex flex-wrap gap-2">
          {permissions.map((perm) => (
            <span
              key={perm}
              className="rounded-full bg-muted px-2 py-0.5 text-xs"
            >
              {perm}
            </span>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}