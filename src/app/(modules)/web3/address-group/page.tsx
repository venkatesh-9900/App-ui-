"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Plus, Group } from 'lucide-react'
import {
    createAddressGroup,
    listAddressGroups,
    deleteAddressGroup
} from '@/hooks/web3/address-group-service'
import { AddressGroup, CreateAddressGroupRequest } from '@/types/address-group'
import { AddressGroupFormDialog } from '@/components/web3/address-group/address-group-form-dialog'
import { AddressGroupTable } from '@/components/web3/address-group/address-group-table'
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardNavbar } from '@/components/web3/explorer/dashboard-navbar'
import { getChainlist } from '@/hooks/web3/metadata.service'
import { Chain, ChainListResponse } from '@/types/matadata'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AddressGroupPage() {
    const [groups, setGroups] = useState<AddressGroup[]>([])
    const [isLoadingGroups, setIsLoadingGroups] = useState(false)
    const [isLoadingWeb3Networks, setIsLoadingWewb3Network] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [web3Networks, setWeb3Networks] = useState<Chain[]>([])
    const router = useRouter();
    const searchParams = useSearchParams();

    // Fetch activities on mount
    useEffect(() => {
        fetchGroups()
        fetchChainList()
        handleParams();
    }, [])

    const handleParams = () => {
        const query = Object.fromEntries(searchParams.entries());
        let { openGroup } = query;
        if (openGroup) {
            setDialogOpen(true)
        }
    }

    const fetchGroups = async () => {
        setIsLoadingGroups(true)
        await listAddressGroups({
            successTask: (response) => {
                console.log('Groups Response:', response)
                if (response.data && Array.isArray(response.data)) {
                    setGroups(response.data)
                }
                setIsLoadingGroups(false)
            },
            failureTask: () => {
                toast.error('Failed to load address groups', {
                    description: 'Could not fetch address group watchers. Please try again.',
                })
                setIsLoadingGroups(false)
            },
            errorTask: () => {
                toast.error('An error occurred', {
                    description: 'Please check your connection and try again.',
                })
                setIsLoadingGroups(false)
            },
        })
    }

    const fetchChainList = async () => {
        setIsLoadingWewb3Network(true);
              try {
                await getChainlist({
                  successTask: (response: ChainListResponse) => {
                    // response is of type ChainListResponse
                    const apiResponse = response;
                    setIsLoadingWewb3Network(false);
                    if (apiResponse?.errors && apiResponse.errors.length > 0) {
                      setWeb3Networks([]);
                      toast.error(apiResponse.errors[0]);
                    }
        
                    const fetchedChains: Chain[] = apiResponse?.data?.chains || [];
                    setWeb3Networks(fetchedChains);
                  },
                  failureTask: () => {
                    setIsLoadingWewb3Network(false);
                    toast.error("Failed to fetch chain list");
                  },
                  errorTask: () => {
                    setIsLoadingWewb3Network(false);
                    toast.error("An error occurred while fetching chain list");
                  },
                });
              } catch (err) {
                console.error("fetchChainList: unexpected error", err);
                toast.error("Unexpected error while fetching chain list");
              }
    }

    const handleCreateClick = () => {
        setDialogOpen(true)
    }

    const handleFormSubmit = async (formData: CreateAddressGroupRequest) => {
        setIsSubmitting(true)

        await createAddressGroup({
            request: formData,
            successTask: (data) => {
                toast.success('Address group is created!')
                setDialogOpen(false)
                setIsSubmitting(false)
                fetchGroups() // Refresh the list
                const query = Object.fromEntries(searchParams.entries());
                if (query.returnUrl) {
                    router.push(query.returnUrl)
                }
            },
            failureTask: (duplicateName) => {
                if (duplicateName) {
                    toast.error('Group name already exists', {
                        description: 'Please choose a different name for the address group.',
                    })
                } else {
                    toast.error('Failed to create group', {
                        description: 'Please try again.',
                    })
                }
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

    const handleDeleteGroup = async (id: number) => {
        await deleteAddressGroup({
            id,
            successTask: () => {
                toast.success('Group deleted successfully!', {
                    description: 'The address group has been removed.',
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

    const handleDialogOpenChange = useCallback((next: boolean) => {
        if (dialogOpen !== next) {
            setDialogOpen(next)
        }
    }, [dialogOpen])

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
                                            <Group className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm sm:text-2xl">Address Groups</CardTitle>
                                        </div>
                                    </div>
                                    <Button onClick={handleCreateClick} size="lg" className="cursor-pointer">
                                        <div className='flex items-center'>
                                            <Plus className="w-4 h-4 mr-2" />
                                            <span className='text-center -mt-1'>Create Group</span>
                                        </div>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <AddressGroupTable
                                    groups={groups}
                                    web3Networks={web3Networks}
                                    isLoading={isLoadingGroups || isLoadingWeb3Networks}
                                    onDelete={handleDeleteGroup}
                                />
                            </CardContent>
                        </Card>

                        {/* Create Dialog */}
                        <AddressGroupFormDialog
                            open={dialogOpen}
                            onOpenChange={handleDialogOpenChange}
                            onSubmit={handleFormSubmit}
                            isSubmitting={isSubmitting}
                            initialData={{
                                name: "",
                                description: "",
                                addresses: [],
                                web3Networks: web3Networks,
                            }}    
                        />
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
