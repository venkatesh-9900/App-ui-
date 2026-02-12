"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Plus, Users } from 'lucide-react'
import { createTopic, listTopics, updateTopic, deleteTopic } from '@/hooks/topic-service'
import { NotificationGroup, CreateTopicRequest } from '@/types/topic'
import { GroupFormDialog } from '@/components/notifications/groups/group-form-dialog'
import { GroupsTable } from '@/components/notifications/groups/groups-table'
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardNavbar } from '@/components/web3/explorer/dashboard-navbar'
import { useRouter, useSearchParams } from 'next/navigation'

export default function NotificationGroupsPage() {
    const [groups, setGroups] = useState<NotificationGroup[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
    const [selectedGroup, setSelectedGroup] = useState<Partial<NotificationGroup> | null>(null)
    const searchParams = useSearchParams();
    const router = useRouter();

    // Guard onOpenChange to prevent infinite loops
    const handleDialogOpenChange = React.useCallback((next: boolean) => {
        if (dialogOpen !== next) {
            setDialogOpen(next)
        }
    }, [dialogOpen])

    // Fetch groups on mount
    useEffect(() => {
        fetchGroups()
        handleParams();
    }, [])

    const fetchGroups = async () => {
        setIsLoading(true)
        await listTopics({
            successTask: (response) => {
                console.log('API Response:', response)
                if (response.data && response.data) {
                    console.log('Setting groups:', response.data)
                    setGroups(response.data)
                }
                setIsLoading(false)
            },
            failureTask: () => {
                toast.error('Failed to load groups', {
                    description: 'Could not fetch notification groups. Please try again.',
                })
                setIsLoading(false)
            },
            errorTask: () => {
                toast.error('An error occurred', {
                    description: 'Please check your connection and try again.',
                })
                setIsLoading(false)
            },
        })
    }

    const handleCreateGroup = () => {
        setDialogMode('create')
        setSelectedGroup(null)
        setDialogOpen(true)
    }

    const handleEditGroup = (group: NotificationGroup) => {
        setDialogMode('edit')
        setSelectedGroup(group)
        setDialogOpen(true)
    }

    const handleFormSubmit = async (formData: CreateTopicRequest) => {
        setIsSubmitting(true)

        if (dialogMode === 'create') {
            await createTopic({
                request: formData,
                successTask: (data) => {
                    toast.success('Group created successfully!', {
                        description: `${formData.name} has been created.`,
                    })
                    setDialogOpen(false)
                    setIsSubmitting(false)
                    const query = Object.fromEntries(searchParams.entries());
                    if (query.returnUrl) {
                        router.push(query.returnUrl)
                        return;
                    }
                    fetchGroups() // Refresh the list
                },
                failureTask: () => {
                    toast.error('Failed to create group', {
                        description: 'Please try again.',
                    })
                    setIsSubmitting(false)
                },
                errorTask: () => {
                    toast.error('An error occurred', {
                        description: 'Please check your connection and try again.',
                    })
                    setIsSubmitting(false)
                },
            })
        } else if (selectedGroup && selectedGroup.novu_topic_key) {
            await updateTopic({
                topicKey: selectedGroup.novu_topic_key,
                request: {
                    name: formData.name,
                    description: formData.description,
                    channel_instance_ids: formData.channel_instance_ids ?? []
                },
                successTask: (data) => {
                    toast.success('Group updated successfully!', {
                        description: `${formData.name} has been updated.`,
                    })
                    setDialogOpen(false)
                    setIsSubmitting(false)
                    fetchGroups() // Refresh the list
                },
                failureTask: () => {
                    toast.error('Failed to update group', {
                        description: 'Please try again.',
                    })
                    setIsSubmitting(false)
                },
                errorTask: () => {
                    toast.error('An error occurred', {
                        description: 'Please check your connection and try again.',
                    })
                    setIsSubmitting(false)
                },
            })
        }
    }

    const handleDeleteGroup = async (topicKey: string) => {
        const groupToDelete = groups.find(g => g.novu_topic_key === topicKey)

        await deleteTopic({
            topicKey,
            successTask: () => {
                toast.success('Group deleted successfully!', {
                    description: `${groupToDelete?.name || 'The group'} has been deleted.`,
                })
                fetchGroups() // Refresh the list
            },
            failureTask: () => {
                toast.error('Failed to delete group', {
                    description: 'Please try again.',
                })
            },
            errorTask: () => {
                toast.error('An error occurred', {
                    description: 'Please check your connection and try again.',
                })
            },
        })
    }

    const handleParams = () => {
        const query = Object.fromEntries(searchParams.entries());
        let { openGroup, name, description, channelInstanceIds, returnUrl } = query;
        if (openGroup && !returnUrl) {
            const initialData = {
                name: name,
                description: description,
                channel_instance_ids: channelInstanceIds ? channelInstanceIds.split(',').map((id) => Number(id)) : []
            }
            setSelectedGroup(prevData => ({ ...prevData, ...initialData }))
            window.history.replaceState({}, '', '/notifications/groups');
        }
        if (openGroup) {
            setDialogOpen(true)
        }
    }
    const handleCopyKey = (topicKey: string) => {
        navigator.clipboard.writeText(topicKey)
        toast.success('Key copied!', {
            description: 'Topic key has been copied to clipboard.',
        })
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
                                            <Users className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm sm:text-2xl">Notification Groups</CardTitle>
                                        </div>
                                    </div>
                                    <Button onClick={handleCreateGroup} size="lg" className="cursor-pointer">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Group
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <GroupsTable
                                    groups={groups}
                                    isLoading={isLoading}
                                    onEdit={handleEditGroup}
                                    onDelete={handleDeleteGroup}
                                    onCopyKey={handleCopyKey}
                                />

                                {!isLoading && groups.length > 0 && (
                                    <div className="mt-4 text-sm text-muted-foreground text-center">
                                        {groups.length} {groups.length === 1 ? 'group' : 'groups'} total
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Create/Edit Dialog */}
                        <GroupFormDialog
                            open={dialogOpen}
                            onOpenChange={handleDialogOpenChange}
                            onSubmit={handleFormSubmit}
                            isSubmitting={isSubmitting}
                            mode={dialogMode}
                            initialData={
                                selectedGroup
                                    ? {
                                        name: selectedGroup.name || '',
                                        description: selectedGroup.description || "",
                                        topicKey: selectedGroup.novu_topic_key,
                                        channel_instance_ids: selectedGroup.channel_instance_ids ?? [],
                                    }
                                    : undefined
                            }
                        />

                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}

