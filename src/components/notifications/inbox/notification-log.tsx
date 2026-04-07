"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { NotificationLog as NotificationLogType } from "@/types/notifcation-log"
import { Mail, MailOpen, Trash2, Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Props {
  data: NotificationLogType[]
  loading: boolean
  onRowClick: (n: NotificationLogType) => void
  onToggleRead: (id: number, readStatus: boolean) => void
  onDelete: (id: number) => void
}

export function NotificationLog({
  data,
  loading,
  onRowClick,
  onToggleRead,
  onDelete,
}: Props) {
  const formatDate = (utc: string) =>
    new Date(utc.endsWith("Z") ? utc : `${utc}Z`).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })

  const getNotificationType = (type: string) => {
    switch (type) {
      case "WEB3_ADDRESS_ACTIVITY":
        return "Address Activity"
      case "WEB3_ADDRESS_ACTIVITY_AIRDROP":
        return "Address Activity Airdrop"
      case "SCHEDULED_CHAT":
        return "Scheduled Chat"
      case "SCEDULED_EMAIL":
        return "Scheduled Email"
      default:
                return "General" // Keep default for unknown types
    }
  }

  /* -------- Loader -------- */
  if (loading) {
    return (
      <div className="flex flex-col divide-y">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="flex flex-col divide-y">
      {data.map((n) => (
        <div
          key={n.id}
          onClick={() => onRowClick(n)}
          className={cn(
            "group grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
            "hover:bg-muted/50",
            !n.read_status && "bg-muted/30"
          )}
        >
          {/* Description */}
          <div
            className={cn(
              "min-w-0 pr-4",
              n.read_status
                ? "text-muted-foreground"
                : "text-foreground font-medium"
            )}
          >
            <span className="block truncate">{n.description}</span>
          </div>

                    {/* Type badge */}
                    <div className="shrink-0">
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-xs whitespace-nowrap",
                                n.read_status
                                    ? "text-muted-foreground"
                                    : "text-foreground"
                            )}
                        >
            {getNotificationType(n.notification_type)}
          </Badge>
                    </div>

          {/* Recipients */}
                    <div
                        className="shrink-0"
                        onClick={(e) => e.stopPropagation()}
                    >
            {n.emails?.length > 0 && (
              <TooltipProvider>
                                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                                        <div
                                            className={cn(
                                                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs cursor-pointer",
                                                n.read_status
                                                    ? "text-muted-foreground border-muted"
                                                    : "text-foreground border-border"
                                            )}
                                        >
                      <Users className="h-3.5 w-3.5" />
                                            <span>
                                                {n.emails.length} recipient
                                                {n.emails.length > 1 ? "s" : ""}
                                            </span>
                    </div>
                  </TooltipTrigger>

                                    <TooltipContent
                                        side="top"
                                        align="start"
                                        className="w-64 p-2"
                                    >
                                        <div className="space-y-1">
                                            {n.emails.slice(0, 3).map((email, idx) => (
                                                <div
                                                    key={idx}
                                                    className="text-xs truncate"
                                                    title={email}
                                                >
                                                    {email}
                      </div>
                    ))}

                    {n.emails.length > 3 && (
                                                <div className="text-xs  font-medium">
                        +{n.emails.length - 3} more
                      </div>
                    )}
                                        </div>
                  </TooltipContent>

                </Tooltip>
              </TooltipProvider>
            )}
          </div>


                    {/* Time + hover actions */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className={cn("text-xs", n.read_status ? "text-muted-foreground" : "text-foreground")}>
                            {formatDate(n.created_at)}
                        </div>

                        <TooltipProvider delayDuration={100}>
            <div
                                className={cn(
                                    "flex items-center gap-2 transition-opacity",
                                    "opacity-0 pointer-events-none",
                                    "group-hover:opacity-100 group-hover:pointer-events-auto"
                                )}
              onClick={(e) => e.stopPropagation()}
            >
                                {/* Mark read / unread */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
              <button
                                            className="p-1 rounded hover:bg-muted cursor-pointer"
                onClick={() => onToggleRead(n.id, !n.read_status)}
              >
                {n.read_status ? (
                  <MailOpen className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Mail className="h-4 w-4 text-primary" />
                )}
              </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        {n.read_status ? "Mark as unread" : "Mark as read"}
                                    </TooltipContent>
                                </Tooltip>

                                {/* Delete */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
              <button
                                            className="p-1 rounded hover:bg-destructive/10 cursor-pointer"
                onClick={() => onDelete(n.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        Delete notification
                                    </TooltipContent>
                                </Tooltip>
            </div>
                        </TooltipProvider>

          </div>
        </div>
      ))}

            {/* Empty state */}
            {data.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                    No notifications found
                </div>
            )}            
    </div>
  )
}
