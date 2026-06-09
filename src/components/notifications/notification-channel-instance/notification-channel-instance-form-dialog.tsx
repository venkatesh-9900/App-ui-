"use client"

import React, { useEffect, useState, useCallback } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import { Loader2, Webhook } from "lucide-react"
import { NotificationChannel } from "@/types/notification-channel"

export interface NotificationChannelInstanceFormData {
    name: string
    description?: string
    channel_id: number
    webhook_url: string
    publish_type: string
}

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: NotificationChannelInstanceFormData) => void
    isSubmitting: boolean
    channels: NotificationChannel[]
    mode?: "create" | "edit"
    initialData?: {
        id?: number
        name?: string
        description?: string
        channel_id?: number
        payload?: {
            webhook_url?: string
        },
        publish_type?: string
    }
}

const CHANNEL_OPTIONS = [
    { id: 3, label: "Custom Webhook" },
    { id: 4, label: "Teams Webhook" },
]


export function NotificationChannelInstanceFormDialog({
    open,
    onOpenChange,
    onSubmit,
    isSubmitting,
    channels,
    mode = "create",
    initialData,
}: Props) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [channelId, setChannelId] = useState<number | undefined>()
    const [webhookUrl, setWebhookUrl] = useState("")
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [publishType, setPublishType] = useState<string>("batch")


    useEffect(() => {
        if (open) {
            if (initialData) {
                setName(initialData.name || "")
                setDescription(initialData.description || "")
                setChannelId(initialData.channel_id)
                setWebhookUrl(initialData.payload?.webhook_url || "")
                setPublishType(initialData.publish_type || "batch")
            } else {
                // CREATE
                setName("")
                setDescription("")
                setChannelId(3)               // default Custom Webhook
                setWebhookUrl("")
                setPublishType("batch")       // default
            }
            setErrors({})
        }

        if (!open) {
            setName("")
            setDescription("")
            setChannelId(undefined)
            setWebhookUrl("")
            setPublishType("batch")
            setErrors({})
        }
    }, [open, initialData])

    useEffect(() => {
        if (channelId === 4) {
            // Teams Webhook
            setPublishType("batch")
        }
    }, [channelId])



    const validate = useCallback(() => {
        const e: Record<string, string> = {}

        if (!name.trim()) e.name = "Name is required"
        if (!channelId) e.channel_id = "Channel type is required"
        if (!webhookUrl.trim()) {
            e.webhook_url = "Webhook URL is required"
        } else if (!/^https?:\/\//i.test(webhookUrl)) {
            e.webhook_url = "Invalid URL"
        }

        setErrors(e)
        return Object.keys(e).length === 0
    }, [name, channelId, webhookUrl])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return

        onSubmit({
            name: name.trim(),
            description: description || undefined,
            channel_id: channelId!,
            publish_type: publishType,
            webhook_url: webhookUrl.trim(),
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {mode === "edit"
                                ? "Update Notification Channel"
                                : "Create Notification Channel"}
                        </DialogTitle>
                        <DialogDescription>
                            Configure webhook-based delivery channels.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label>Name <span className="text-destructive">*</span></Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isSubmitting}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <Input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Channel Type <span className="text-destructive">*</span></Label>
                            <Select
                                value={channelId?.toString()}
                                onValueChange={(v) => setChannelId(Number(v))}
                                disabled={mode === "edit" || isSubmitting}
                            >
                                <SelectTrigger
                                    className={`w-full ${errors.channel_id ? "border-destructive" : ""
                                        }`}
                                >
                                    <SelectValue
                                        placeholder="Select channel type"
                                        className="text-muted-foreground data-[placeholder]:text-muted-foreground"
                                    />

                                </SelectTrigger>

                                <SelectContent>
                                    {channels.map((c) => (
                                        <SelectItem key={c.id} value={c.id.toString()} disabled={c.id == 5 || c.id == 1}>
                                            {c.display_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                        </div>

                        <div className="grid gap-2">
                            <Label>
                                Publish Type <span className="text-destructive">*</span>
                            </Label>

                            <Select
                                value={publishType}
                                onValueChange={(v) =>
                                    setPublishType(v as "batch" | "realtime")
                                }
                                disabled={channelId === 4 || isSubmitting}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="batch">Batch</SelectItem>
                                    <SelectItem value="realtime">Realtime</SelectItem>
                                </SelectContent>
                            </Select>

                            {channelId === 4 && (
                                <p className="text-xs text-muted-foreground">
                                    Teams Webhook only supports batch delivery
                                </p>
                            )}
                        </div>


                        <div className="grid gap-2">
                            <Label>Webhook URL <span className="text-destructive">*</span></Label>
                            <div className="relative">
                                <Webhook className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={webhookUrl}
                                    onChange={(e) => setWebhookUrl(e.target.value)}
                                    disabled={isSubmitting}
                                    className={`pl-9 placeholder:text-muted-foreground ${errors.webhook_url ? "border-destructive" : ""
                                        }`}
                                    placeholder="https://example.com/webhook"
                                />

                            </div>
                            {errors.webhook_url && (
                                <p className="text-sm text-destructive">
                                    {errors.webhook_url}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {mode === "edit" ? "Updating..." : "Creating..."}
                                </>
                            ) : mode === "edit" ? (
                                "Update Channel"
                            ) : (
                                "Create Channel"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
