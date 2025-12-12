"use client"

import React, { use, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

import { createApiKey } from "@/hooks/api-keys-service"
import { useApiKeyContext } from "@/contexts/api-key-context"
import { formatPrettyDate } from "@/utils/formatting"
import { CreateApiKeyRequest, CreatedApiKeyResponse } from "@/types/api-keys"

type ExpiryOption = "7" | "30" | "60" | "90" | "custom"

export default function CreateApiKeyPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { setApiKeyContext } = useApiKeyContext();

  const [name, setName] = useState<string>("")
  const [nameError, setNameError] = useState<string | null>(null)

  const [expiryOption, setExpiryOption] = useState<ExpiryOption>("7")
  const [customDate, setCustomDate] = useState<string>("") // YYYY-MM-DD
  const [dateError, setDateError] = useState<string | null>(null)

  // general error shown inside dialog/form
  const [error, setError] = useState<string | null>(null)

  // dialog + loading states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogLoading, setDialogLoading] = useState(false)

  // minor UI loading state for submit button (kept but dialog handles the actual create)
  const [loading, setLoading] = useState(false)

  // Parent route (remove trailing /new if present)
  const basePath = (() => {
    if (!pathname) return "/"
    const trimmed = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname
    return trimmed.endsWith("/new") ? trimmed.slice(0, -4) : trimmed
  })()

  // helpers for date min (tomorrow)
  function tomorrowLocalDateString(): string {
    const t = new Date()
    t.setDate(t.getDate() + 1)
    const yyyy = t.getFullYear()
    const mm = String(t.getMonth() + 1).padStart(2, "0")
    const dd = String(t.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }
  const minDateForInput = tomorrowLocalDateString()

  // prefill customDate with tomorrow when switching to custom
  useEffect(() => {
    if (expiryOption === "custom" && !customDate) {
      setCustomDate(minDateForInput)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiryOption])

  const handleCancel = () => {
    router.push(basePath || "/")
  }

  const computeExpiryLocal = (): string | null => {
    if (expiryOption !== "custom") {
      const days = Number(expiryOption)
      if (Number.isNaN(days) || days <= 0) return null
      const now = new Date()
      const dt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
      return dt.toISOString();
    } else {
      if (!customDate) return null
      const [yStr, mStr, dStr] = customDate.split("-")
      const year = Number(yStr)
      const month = Number(mStr)
      const day = Number(dStr)
      if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return null
      const dt = new Date(year, month - 1, day, 23, 59, 59, 0)
      return dt.toISOString();
    }
  }

  const expirySummary = (): string => {
    const expiryLocal = computeExpiryLocal();
    if (expiryLocal) {
      return `Expires: ${formatPrettyDate(expiryLocal)}`
    }
    return "No expiry selected"
  }

  function validateCustomDate(dateStr: string): string | null {
    if (!dateStr) return "Please select a date"
    if (dateStr < minDateForInput) return "Expiry must be after today"
    return null
  }

  // open dialog after client-side validation
  const openConfirmDialog = () => {
    setNameError(null)
    setDateError(null)
    setError(null)

    if (!name.trim()) {
      setNameError("Name is required")
      return
    }

    if (expiryOption === "custom") {
      const dErr = validateCustomDate(customDate)
      if (dErr) {
        setDateError(dErr)
        return
      }
    }

    setDialogOpen(true)
  }

  // perform creation using createApiKey service
  const performCreate = async () => {
    setDialogLoading(true)
    setError(null)

    const expiryLocal = computeExpiryLocal()
    const payload: CreateApiKeyRequest = { name: name.trim(), expiry: expiryLocal ?? null }

    try {
      await createApiKey({
        data: payload,
        retry: false,
        successTask: (created: CreatedApiKeyResponse) => {
          try {
            setApiKeyContext(created);
          } catch (e) {
            // ignore if flash store missing
          }
          setDialogLoading(false)
          setDialogOpen(false)
          router.push(basePath || "/")
        },
        failureTask: () => {
          setDialogLoading(false)
          setError("Failed to create API key")
        },
        errorTask: () => {
          setDialogLoading(false)
          setError("Unexpected error while creating API key")
        },
      })
    } catch (err: any) {
      console.error("createApiKey threw:", err)
      setDialogLoading(false)
      setError(err?.message || "Unexpected error")
    }
  }

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          openConfirmDialog()
        }}
        className="space-y-4"
      >
        {/* Name */}
        <div className="grid grid-cols-1 gap-1 w-80">
          <div className="flex items-center justify-between pb-1">
            <Label htmlFor="name">Name</Label>
          </div>

          <Input
            id="name"
            name="name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder="e.g. my-service-readonly"
            autoFocus
          />
          {nameError && <p className="text-xs text-destructive mt-1">{nameError}</p>}
        </div>

        {/* Expiry */}
        <div className="grid grid-cols-1 gap-1">
          <Label className="pb-1" htmlFor="expiryOption">Expiration</Label>
          <div className="flex items-center gap-3">
            <div className="flex cursor-pointer flex-col gap-2 md:w-35">
              <Select
                value={expiryOption}
                onValueChange={(v) => {
                  setExpiryOption(v as ExpiryOption)
                  setDateError(null)
                }}
              >
                <SelectTrigger id="expiry-select" className="w-full cursor-pointer">
                  <SelectValue placeholder="Select expiry" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {expiryOption !== "custom" && <div className="text-sm text-muted-foreground">{expirySummary()}</div>}
          </div>

          {expiryOption === "custom" && (
            <div className="flex flex-wrap items-end gap-4 mt-2">
              <div className="flex flex-col">
                <Label htmlFor="customDate" className="text-xs">
                  Date
                </Label>
                <Input
                  id="customDate"
                  type="date"
                  value={customDate}
                  min={minDateForInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setCustomDate(e.target.value)
                    setDateError(validateCustomDate(e.target.value))
                  }}
                  className="max-w-xs"
                />
                {dateError && <p className="text-xs text-destructive mt-1">{dateError}</p>}
              </div>

              <div className="text-sm text-muted-foreground ml-2">
                {customDate ? `${expirySummary()}` : "Please select a date"}
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-1">
            Expiry times are calculated using your laptop's local time.
          </p>
        </div>

        {/* subtle non-field error */}
        {error && <div className="rounded-md border p-2 text-sm text-destructive">{error}</div>}

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={loading} className="cursor-pointer">
            {loading ? "Generating..." : "Generate key"}
          </Button>

          <Button type="button" variant="ghost" className="bg-gray-900/10 cursor-pointer border" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </form>

      {/* Confirmation dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>New personal access key</AlertDialogTitle>
            <AlertDialogDescription>
              Your new personal access key <strong>{name || "key"}</strong> will be ready for use immediately.
              {computeExpiryLocal() && (
                <>
                  {" "}
                  It will expire on <strong>{formatPrettyDate(computeExpiryLocal() ?? '')}.</strong>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error && <div className="px-4 text-sm text-destructive">{error}</div>}

          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="ghost" className="cursor-pointer" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </AlertDialogCancel>

            <AlertDialogAction asChild>
              <Button className="ml-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer" onClick={performCreate} disabled={dialogLoading}>
                {dialogLoading ? "Generating..." : "Generate"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}