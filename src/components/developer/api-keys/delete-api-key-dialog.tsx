"use client"

import React, { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  // AlertDialogTrigger // not used; we open programmatically per-row
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteApiKey } from "@/hooks/api-keys-service"
import { DeleteApiKeyResponse } from "@/types/api-keys"
import { toast } from "sonner"

type Props = {
  tokenKey: string
  tokenName?: string
  onDeleted: (key: string) => void
}

export default function DeleteApiKeyDialog({ tokenKey, tokenName, onDeleted }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirmDelete = async () => {
    setError(null)
    setLoading(true)

    try {
      await deleteApiKey({
        data: { key: tokenKey },
        retry: false,
        successTask: (res: DeleteApiKeyResponse) => {
          // remove from list
          onDeleted(tokenKey)
          setLoading(false)
          setOpen(false)
        },
        failureTask: () => {
          setLoading(false)
          setError("Failed to delete API key.")
        },
        errorTask: () => {
          setLoading(false)
          setError("Unexpected error while deleting API key.")
        },
        forbiddenTask: () => {
          toast.error("Access denied")
          setLoading(false)
        },
      })
    } catch (err: any) {
      console.error("deleteApiKey threw:", err)
      setLoading(false)
      setError(err?.message || "Unexpected error")
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {/* trigger button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-destructive/10 text-destructive cursor-pointer"
        aria-label="Delete API key"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this key?</AlertDialogTitle>
          <AlertDialogDescription>
            Any applications or scripts using this key will no longer be able to access the API.
            You cannot undo this action.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="text-sm text-destructive px-4">{error}</div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="ghost" className="cursor-pointer" onClick={() => setOpen(false)}>Cancel</Button>
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button
              className="ml-2 cursor-pointer"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "I understand, delete key"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}