"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NotificationLog as NotificationLogType } from "@/types/notifcation-log"
import { Mail, MailOpen, Trash2, Users } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface Props {
    data: NotificationLogType[]
    loading: boolean
    page: number
    limit: number
    totalCount: number
    onPrev: () => void
    onNext: () => void
    onRowClick: (n: NotificationLogType) => void
    onToggleRead: (id: number, readStatus: boolean) => void
    onDelete: (id: number) => void
}

export function NotificationLog({
    data,
    loading,
    page,
    limit,
    totalCount,
    onPrev,
    onNext,
    onRowClick,
    onToggleRead,
    onDelete,
}: Props) {
    const totalPages = Math.ceil(totalCount / limit)
    const start = (page - 1) * limit + 1
    const end = Math.min(page * limit, totalCount)

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
            default:
                return "General"
        }
    }

    /* -------- Loader -------- */
    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-primary" />
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
                                                    className="text-sm text-muted-foreground truncate"
                                                    title={email}
                                                >
                                                    {email}
                                                </div>
                                            ))}

                                            {n.emails.length > 3 && (
                                                <div className="text-sm text-muted-foreground font-medium">
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
                                            className="p-1 rounded hover:bg-muted"
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
                                            className="p-1 rounded hover:bg-destructive/10"
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center px-4 py-3 text-sm text-muted-foreground border-t">
                    <span>
                        Showing {start}–{end} of {totalCount}
                    </span>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onPrev}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>

                        <span className="font-medium">
                            Page {page} of {totalPages}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onNext}
                            disabled={page >= totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
