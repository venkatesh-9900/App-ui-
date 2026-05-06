"use client"

import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Trash2, Calendar, Clock, Activity, Edit2, Group, UserRound } from 'lucide-react'
import { AddressGroup, CreateAddressGroupRequest } from '@/types/address-group'
import { format } from 'date-fns'
import { truncateText } from '@/utils/formatting'
import { AddressGroupFormDialog } from '@/components/web3/address-group/address-group-form-dialog'
import { updateAddressGroup } from '@/hooks/web3/address-group-service'
import { toast } from 'sonner'
import { Chain } from '@/types/matadata'
import { useAuth } from '@/contexts';

interface AddressGroupTableProps {
  web3Networks: Chain[]
  groups: AddressGroup[]
  isLoading: boolean
  onDelete: (id: number) => void
}

export function AddressGroupTable({
  web3Networks,
  groups,
  isLoading,
  onDelete,
}: AddressGroupTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<AddressGroup | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false);
  const { userInfo } = useAuth()

  useEffect(() => {
    if (!dialogOpen) {
      const index = groups.findIndex(g => g.id === selectedGroup?.id);
      if (index !== -1) {
        setSelectedGroup(groups[index]);
      }
    }
  }, [dialogOpen])

  const handleDeleteClick = (group: AddressGroup) => {
    setSelectedGroup(group)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedGroup) {
      onDelete(selectedGroup.id)
    }
    setDeleteDialogOpen(false)
    setSelectedGroup(null)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(dateString), 'MMM d, yyyy')
    } catch {
      return 'N/A'
    }
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return ''
    try {
      const isoDate = dateString.endsWith('Z') ? dateString : `${dateString}Z`
      const date = new Date(isoDate)
      const now = new Date()
      const diffInMs = now.getTime() - date.getTime()

      if (diffInMs < 0 || isNaN(diffInMs)) {
        return 'Just now'
      }

      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

      if (diffInMinutes < 1) {
        return 'Just now'
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
      } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
      } else {
        return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
      }
    } catch {
      return ''
    }
  }

  const getAddresses = (group: AddressGroup): string[] => {
    return group.addresses || []
  }

  async function handleUpdateGroup(id: number, formData: CreateAddressGroupRequest) {
    setIsUpdating(true)
    const updatedGroup: AddressGroup = {
      id: id,
      name: formData.name || selectedGroup?.name || '',
      description: formData.description || selectedGroup?.description || '',
      addresses: formData.addresses || selectedGroup?.addresses || [],
      web3_network_id: formData.web3_network_id || selectedGroup?.web3_network_id || 0,
      organization_id: selectedGroup?.organization_id || '',
      user_id: selectedGroup?.user_id || '',
      created_at: selectedGroup?.created_at || '',
      updated_at: new Date().toISOString(),
    }
    setSelectedGroup(updatedGroup);
    await updateAddressGroup({
      id: id,
      request: formData,
      successTask: (data) => {
        toast.success('Updating group successful!', {
          description: `Updates to the address group have been saved.`,
        })
        const index = groups.findIndex(g => g.id === id);
        if (index !== -1) {
          groups[index] = updatedGroup;
        }
        setDialogOpen(false)
        setIsUpdating(false)
      },
      failureTask: (duplicateName) => {
        if (duplicateName) {
          toast.error('Group name already exists', {
            description: 'Please choose a different name.',
          })
          setSelectedGroup(updatedGroup);
        } else {
          toast.error('Failed to update group', {
            description: 'Please try again.',
          })
        }
        setIsUpdating(false)
      },
      errorTask: () => {
        toast.error('An error occurred', {
          description: 'Please check your connection and try again.',
        })
        setIsUpdating(false)
      },
      forbiddenTask: () => {
        toast.error("Access denied")
        setIsUpdating(false)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <Group className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No address group found.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first group address.
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
                <TableHead className="px-4 py-2 text-left w-1/6 min-w-max">
                  <div className="flex items-center gap-1">
                    <span>Name</span>
                  </div>
                </TableHead>
                {/* <TableHead className="px-4 py-2 text-left w-1/6 min-w-max">
                  <div className="flex items-center gap-1">
                    <span>Chain</span>
                  </div>
                </TableHead>
                <TableHead className="px-4 py-2 text-left w-1/6 min-w-max">
                  <div className="flex items-center gap-1">
                    <span>Network</span>
                  </div>
                </TableHead> */}
                <TableHead className="px-4 py-2 text-left w-2/5 min-w-max">
                  <div className="flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    <span>Addresses</span>
                  </div>
                </TableHead>
                <TableHead className="px-4 py-2 text-left w-1/6 min-w-max">
                  <div className="flex items-center gap-1">
                    <UserRound className="w-4 h-4" />
                    <span>Created By</span>
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
                    <span>Updated</span>
                  </div>
                </TableHead>
                <TableHead className="px-4 py-2 text-right w-20 min-w-max">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => {
                const addresses = getAddresses(group)
                return (
                  <TableRow key={group.id} className="hover:bg-muted/50">
                    <TableCell className="px-4 py-3 w-1/6 min-w-max">
                      <div className="flex items-center gap-2">
                        {group.name}
                      </div>
                    </TableCell>
                    {/* <TableCell className="px-4 py-3 w-1/6 min-w-max">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="default"
                          className="text-xs"
                          title={group.chain}
                        >
                          {truncateText(group.chain)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 w-1/6 min-w-max">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="default"
                          className="text-xs"
                          title={group.network}
                        >
                          {truncateText(group.network)}
                        </Badge>
                      </div>
                    </TableCell> */}
                    <TableCell className="px-4 py-3 w-2/5 min-w-max">
                      <div className="flex flex-wrap gap-1">
                        {addresses.length > 0 ? (
                          addresses.slice(0, 3).map((addr, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="font-mono text-xs"
                              title={addr}
                            >
                              {truncateText(addr)}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No addresses</span>
                        )}
                        {addresses.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{addresses.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 w-1/6 min-w-max">
                      <div className="flex items-center gap-2">
                        {group.user_id}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 w-1/6 min-w-max text-sm">
                      {formatDate(group.created_at)}
                    </TableCell>
                    <TableCell className="px-4 py-3 w-1/6 min-w-max text-sm text-muted-foreground">
                      {formatTime(group.updated_at)}
                    </TableCell>
                    <TableCell className="px-4 py-3 w-20 min-w-max text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0 cursor-pointer"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedGroup(group);
                              setDialogOpen(true);
                            }}
                            disabled={group.user_id !== userInfo?.email}
                            className="cursor-pointer"
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(group)}
                            className="text-destructive focus:text-destructive cursor-pointer"
                            disabled={group.user_id !== userInfo?.email}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the address group (ID: {selectedGroup?.id}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="cursor-pointer bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Address Group Dialog */}
      {selectedGroup && (
        <AddressGroupFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          mode="edit"
          initialData={{
            name: selectedGroup.name,
            description: selectedGroup.description,
            addresses: selectedGroup.addresses,
            web3NetworkId: selectedGroup.web3_network_id,
            web3Networks: web3Networks,
          }}
          isSubmitting={isUpdating}
          onSubmit={(data) => handleUpdateGroup(selectedGroup.id, data)}
        />
      )}


    </div>
  )
}

