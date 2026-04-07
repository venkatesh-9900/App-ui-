"use client"

import React, { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    MoreHorizontal,
    Trash2,
    Edit2,
    Webhook,
    Calendar,
    Activity,
    Clock,
} from "lucide-react"
import { format } from "date-fns"

import { NotificationChannelInstance } from "@/types/notification-channel-instance"
import { TooltipProvider, TooltipTrigger, Tooltip, TooltipContent } from "@radix-ui/react-tooltip"
import { useAuth } from '@/contexts';

interface NotificationChannelInstanceTableProps {
    instances: NotificationChannelInstance[]
    isLoading: boolean
    onEdit: (instance: NotificationChannelInstance) => void
    onDelete: (id: number) => void
}

const CHANNEL_TYPE_MAP: Record<number, string> = {
    1: "Email",
    2: "SMS",
    3: "Custom Webhook",
    4: "Teams Webhook",
}

export function NotificationChannelInstanceTable({
    instances,
    isLoading,
    onEdit,
    onDelete,
}: NotificationChannelInstanceTableProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedInstance, setSelectedInstance] =
        useState<NotificationChannelInstance | null>(null)
      const { userInfo } = useAuth()

    const handleDeleteClick = (instance: NotificationChannelInstance) => {
        setSelectedInstance(instance)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = () => {
        if (selectedInstance) {
            onDelete(selectedInstance.id)
        }
        setDeleteDialogOpen(false)
        setSelectedInstance(null)
    }
    

    const formatDate = (date?: string | Date) => {
        if (!date) return "N/A"
        try {
            return format(new Date(date), "MMM d, yyyy")
        } catch {
            return "N/A"
        }
    }

    const isChannelEmailOrSms = (instances: NotificationChannelInstance) => {
        if ([1, 2].includes(instances.channel_id)) return true
        return false
    }

    if (isLoading) {
        return (
            <div className="overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader className="bg-muted">
                        <TableRow>
                            <TableHead className="px-4 py-2">Name</TableHead>
                            <TableHead className="px-4 py-2">Channel Type</TableHead>
                            <TableHead className="px-4 py-2">Publish Type</TableHead>
                            <TableHead className="px-4 py-2">Created</TableHead>
                            <TableHead className="px-4 py-2 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-[80px] rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-[100px] rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }

    if (instances.length === 0) {
        return (
            <div className="text-center py-12">
                <Webhook className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                    No notification channels configured.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                    Create your first webhook channel to start delivering notifications.
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-lg border relative flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <Table className="w-full border-collapse">
                        <TableHeader className="bg-muted sticky top-0 z-10">
                            <TableRow>
                                <TableHead className="px-4 py-2 text-left w-2/5 min-w-max">
                                    <div className="flex items-center gap-1">
                                        <Activity className="w-4 h-4" />
                                        <span>Name</span>
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-2 text-left w-1/6 min-w-max">
                                    <div className="flex items-center gap-1">
                                        <Activity className="w-4 h-4" />
                                        <span>Channel Type</span>
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-2 text-left w-1/6 min-w-max">
                                    <div className="flex items-center gap-1">
                                        <Activity className="w-4 h-4" />
                                        <span>Publish Type</span>
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-2 text-left w-1/6 min-w-max">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Created</span>
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-2 text-left w-1/6 min-w-max">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>Updated </span>
                                    </div>
                                </TableHead>
                                <TableHead className="px-4 py-2 text-right w-20 min-w-max">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {instances.map((instance) => (
                                <TableRow
                                    key={instance.id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell className="px-4 py-2 font-medium">
                                        {instance.name}
                                    </TableCell>

                                    <TableCell className="px-4 py-2">
                                        <Badge variant="secondary">
                                            {CHANNEL_TYPE_MAP[instance.channel_id] ??
                                                `Channel ${instance.channel_id}`}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <Badge
                                            variant={instance.publish_type === "realtime" ? "default" : "secondary"}
                                        >
                                            {instance.publish_type}
                                        </Badge>
                                    </TableCell>


                                    <TableCell className="px-4 py-2 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            {formatDate(instance.created_at)}
                                        </div>
                                    </TableCell>

                                    <TableCell className="px-4 py-2 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            {formatDate(instance.created_at)}
                                        </div>
                                    </TableCell>

                                    <TableCell className="px-4 py-2 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 p-0 cursor-pointer"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>
                                                    Actions
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />

                                                <TooltipProvider delayDuration={150}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <DropdownMenuItem
                                                                onClick={(e) => {
                                                                    if (isChannelEmailOrSms(instance)) {
                                                                        e.preventDefault()
                                                                        return
                                                                    }
                                                                    onEdit(instance)
                                                                }}
                                                                aria-disabled={isChannelEmailOrSms(instance)}
                                                                className={`cursor-pointer ${isChannelEmailOrSms(instance)
                                                                    ? "cursor-not-allowed text-muted-foreground"
                                                                    : ""
                                                                    }`}
                                                            >
                                                                <Edit2 className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                        </TooltipTrigger>

                                                        {isChannelEmailOrSms(instance) && (
                                                            <TooltipContent
                                                                side="top"
                                                                align="center"
                                                                sideOffset={6}
                                                                className="
                                                                    z-[9999]
                                                                    rounded-md
                                                                    px-3 py-1.5
                                                                    text-xs
                                                                    shadow-md
                                                                    bg-popover
                                                                    text-popover-foreground
                                                                    "
                                                            >
                                                                Please go to subscribers to edit
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </TooltipProvider>



                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteClick(instance)}
                                                    className="cursor-pointer text-destructive focus:text-destructive"
                                                    disabled={instance.user_id !== userInfo?.email}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Delete confirmation */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete channel?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the notification channel
                            <strong>
                                {" "}
                                {selectedInstance?.name}
                            </strong>
                            . This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="cursor-pointer bg-destructive hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
