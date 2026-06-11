"use client"

import React, { useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Plus, Webhook } from "lucide-react"
import {
    createNotificationChannelInstance,
    listNotificationChannelInstances,
    deleteNotificationChannelInstance,
    updateNotificationChannelInstance,
} from "@/hooks/notification-channel-instance"
import {
    NotificationChannelInstance,
    CreateNotificationChannelInstanceRequest,
    UpdateNotificationChannelInstanceRequest,
} from "@/types/notification-channel-instance"
import {
    NotificationChannelInstanceFormDialog,
    NotificationChannelInstanceFormData,
} from "@/components/notifications/notification-channel-instance/notification-channel-instance-form-dialog"
import { NotificationChannel } from "@/types/notification-channel"
import { listNotificationChannel } from "@/hooks/notification-channel-service"
import { NotificationChannelInstanceTable } from "@/components/notifications/notification-channel-instance/notification-channel-instance-table"
import { AccessDenied } from "@/components/access-denied"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardNavbar } from "@/components/web3/explorer/dashboard-navbar"
import { Pagination } from "@/components/common/pagination"
import { useRouter, useSearchParams } from "next/navigation"
import { useSpace } from "@/contexts/space-context"

export default function NotificationChannelInstancesPage() {
    const [instances, setInstances] = useState<NotificationChannelInstance[]>([])
    const [channels, setChannels] = useState<NotificationChannel[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [accessDenied, setAccessDenied] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedInstance, setSelectedInstance] =
        useState<NotificationChannelInstance | null>(null)

    // ---------------- Pagination state ----------------
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalCount, setTotalCount] = useState(0)
    const searchParams = useSearchParams()
    const router = useRouter()
    const { selectedGroupId } = useSpace()
    // ---------------- Fetch ----------------
    const fetchInstances = async () => {
        setIsLoading(true)

        await listNotificationChannelInstances({
            page,
            limit: pageSize,
            groupId: selectedGroupId,
            successTask: (response) => {
                if (Array.isArray(response?.data)) {
                    setInstances(response.data)
                    setTotalCount(response.count ?? 0)
                }
                setIsLoading(false)
            },
            failureTask: () => {
                toast.error("Failed to load notification channels")
                setIsLoading(false)
            },
            errorTask: () => {
                toast.error("Something went wrong")
                setIsLoading(false)
            },
            forbiddenTask: () => {
                setAccessDenied(true)
                setIsLoading(false)
            },
        })
    }

    // ---------------- Fetch ----------------
    const fetchChannels = async () => {
        setIsLoading(true)

        await listNotificationChannel({
            listing: true,
            successTask: (response) => {
                if (Array.isArray(response?.data)) {
                    setChannels(response.data)
                }
                setIsLoading(false)
            },
            failureTask: () => {
                toast.error("Failed to load notification channels")
                setIsLoading(false)
            },
            errorTask: () => {
                toast.error("Something went wrong")
                setIsLoading(false)
            },
        })
    }

    useEffect(() => {
        fetchInstances()
    }, [page, pageSize, selectedGroupId])

    useEffect(() => {
        fetchChannels()
        handleParams()
    }, [])

    const handleParams = () => {
        const query = Object.fromEntries(searchParams.entries())
        const { openChannel } = query
        if (openChannel) {
            setDialogOpen(true)
        }
    }
    // ---------------- Create ----------------
    const handleCreateFromForm = async (
        data: NotificationChannelInstanceFormData
    ) => {
        setIsSubmitting(true)

        const request: CreateNotificationChannelInstanceRequest = {
            name: data.name,
            description: data.description,
            channel_id: data.channel_id,
            publish_type: data.publish_type,
            payload: {
                webhook_url: data.webhook_url,
            },
        }

        await createNotificationChannelInstance({
            request,
            groupId: selectedGroupId,
            successTask: () => {
                toast.success("Channel created successfully")
                setDialogOpen(false)
                setIsSubmitting(false)
                const query = Object.fromEntries(searchParams.entries())
                const { returnUrl } = query
                if (returnUrl) {
                    router.push(returnUrl);
                    return;
                }
                fetchInstances()
            },
            failureTask: () => {
                toast.error("Failed to create channel")
                setIsSubmitting(false)
            },
            errorTask: () => {
                toast.error("Something went wrong")
                setIsSubmitting(false)
            },
            forbiddenTask: () => {
                toast.error("Access denied")
                setIsSubmitting(false)
            },
        })
    }

    // ---------------- Update ----------------
    const handleUpdateFromForm = async (
        id: number,
        data: NotificationChannelInstanceFormData
    ) => {
        setIsSubmitting(true)

        const request: UpdateNotificationChannelInstanceRequest = {
            name: data.name,
            description: data.description,
            publish_type: data.publish_type,
            payload: {
                webhook_url: data.webhook_url,
            },
        }

        await updateNotificationChannelInstance({
            id,
            request,
            groupId: selectedGroupId,
            successTask: () => {
                toast.success("Channel updated successfully")
                setDialogOpen(false)
                setSelectedInstance(null)
                setIsSubmitting(false)
                fetchInstances()
            },
            failureTask: () => {
                toast.error("Failed to update channel")
                setIsSubmitting(false)
            },
            errorTask: () => {
                toast.error("Something went wrong")
                setIsSubmitting(false)
            },
            forbiddenTask: () => {
                toast.error("Access denied")
                setIsSubmitting(false)
            },
        })
    }

    // ---------------- Delete ----------------
    const handleDelete = async (id: number) => {
        await deleteNotificationChannelInstance({
            id,
            groupId: selectedGroupId,
            successTask: () => {
                toast.success("Channel deleted successfully")
                fetchInstances()
            },
            failureTask: () => {
                toast.error("Failed to delete channel")
            },
            errorTask: () => {
                toast.error("Something went wrong")
            },
            forbiddenTask: () => {
                toast.error("Access denied")
            },
        })
    }

    const handleDialogChange = useCallback((open: boolean) => {
        if (!open) setSelectedInstance(null)
        setDialogOpen(open)
    }, [])

    if (accessDenied) {
        return (
            <ProtectedRoute>
                <DashboardNavbar />
                <AccessDenied />
            </ProtectedRoute>
        )
    }

    return (
        <ProtectedRoute>
            <DashboardNavbar />

            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 px-2 py-2 md:gap-6 md:py-4 md:px-4">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Webhook className="w-6 h-6 text-primary" />
                                        </div>
                                        <CardTitle className="text-sm sm:text-2xl">
                                            Notification Channel Instances
                                        </CardTitle>
                                    </div>

                                    <Button
                                        size="lg"
                                        onClick={() => setDialogOpen(true)}
                                        className="cursor-pointer"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Channel
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <NotificationChannelInstanceTable
                                    instances={instances}
                                    isLoading={isLoading}
                                    onEdit={(instance) => {
                                        setSelectedInstance(instance)
                                        setDialogOpen(true)
                                    }}
                                    onDelete={handleDelete}
                                />

                                {/* ---------- Pagination ---------- */}
                                {!isLoading && totalCount > pageSize && (
                                    <Pagination
                                        page={page}
                                        pageSize={pageSize}
                                        totalCount={totalCount}
                                        loading={isLoading}
                                        onPageChange={setPage}
                                        onPageSizeChange={setPageSize}
                                    />

                                )}
                            </CardContent>
                        </Card>

                        {/* Create / Update Dialog */}
                        <NotificationChannelInstanceFormDialog
                            open={dialogOpen}
                            onOpenChange={handleDialogChange}
                            isSubmitting={isSubmitting}
                            mode={selectedInstance ? "edit" : "create"}
                            channels={channels}
                            initialData={
                                selectedInstance
                                    ? {
                                        id: selectedInstance.id,
                                        name: selectedInstance.name,
                                        description: selectedInstance.description,
                                        channel_id: selectedInstance.channel_id,
                                        payload: selectedInstance.payload,
                                        publish_type: selectedInstance.publish_type,
                                    }
                                    : undefined
                            }
                            onSubmit={(formData) => {
                                if (selectedInstance) {
                                    handleUpdateFromForm(selectedInstance.id, formData)
                                } else {
                                    handleCreateFromForm(formData)
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
