"use client"

import React, { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, X, Users, Bell, Mail } from 'lucide-react'
import { CreateAddressActivityAirdropRequest } from '@/types/address-activity-airdrop'
import { NotificationGroup } from '@/types/topic'
import { NotificationSubscriber } from '@/types/subscriber'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { AddressGroup } from '@/types/address-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'

interface AddressActivityAirdropFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateAddressActivityAirdropRequest) => void
  isSubmitting: boolean

  mode?: "create" | "edit" | "view"
  initialData?: {
    id?: number
    name?: string
    address_group_ids?: number[]
    notification_group_ids?: number[]
    notification_subscriber_ids?: number[]
    channel_ids?: string[]
  }

  groups: NotificationGroup[]
  subscribers: NotificationSubscriber[]
  addressGroups: AddressGroup[]

  loadingGroups: boolean
  loadingSubscribers: boolean
  loadingAddressGroups: boolean
}


const AVAILABLE_CHANNELS = [
  { id: 'email', label: 'Email', icon: Mail },
  // { id: 'sms', label: 'SMS', icon: Bell },
  // { id: 'in_app', label: 'In-App', icon: Bell },
  // { id: 'push', label: 'Push', icon: Bell },
]

export function AddressActivityAirdropFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  groups,
  addressGroups,
  subscribers,
  mode = "create",
  initialData,
  loadingGroups,
  loadingSubscribers,
  loadingAddressGroups,
}: AddressActivityAirdropFormDialogProps) {
  const [name, setName] = useState<string>('')
  const [selectedAddressGroups, setSelectedAddressGroups] = useState<number[]>([])
  const [selectedGroups, setSelectedGroups] = useState<number[]>([])
  const [selectedSubscribers, setSelectedSubscribers] = useState<number[]>([])
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const isReadOnly = mode === "view";
  const [errors, setErrors] = useState<{
    name?: string
    addressGroups?: string
    groups?: string
    subscribers?: string
    channels?: string
  }>({})

  const router = useRouter()

  useEffect(() => {
    if (open && initialData) {
      console.log(initialData)
      setName(initialData.name || "");
      setSelectedAddressGroups(initialData.address_group_ids || [])
      setSelectedGroups(initialData.notification_group_ids || [])
      setSelectedSubscribers(initialData.notification_subscriber_ids || [])
      setSelectedChannels(initialData.channel_ids || [])
      setErrors({}) 
    }

    if (!open) {
      // Reset form when dialog closes
      setName('')
      setSelectedAddressGroups([])
      setSelectedGroups([])
      setSelectedSubscribers([])
      setSelectedChannels([])
      setErrors({})
    }
  }, [open, mode, initialData])

  const handleAddressGroupToggle = useCallback((id: number) => {
    setSelectedAddressGroups(prev => {
      if (prev.includes(id)) {
        return prev.filter(key => key !== id)
      } else {
        return [...prev, id]
      }
    })
    if (errors.addressGroups || errors.groups || errors.subscribers) {
      setErrors(prev => ({ ...prev, addressGroups: undefined, groups: undefined, subscribers: undefined }))
    }
  }, [errors.addressGroups])

  const handleGroupToggle = useCallback((id: number) => {
    setSelectedGroups(prev => {
      if (prev.includes(id)) {
        return prev.filter(key => key !== id)
      } else {
        return [...prev, id]
      }
    })
    if ( errors.groups || errors.subscribers, errors.addressGroups) {
      setErrors(prev => ({ ...prev, groups: undefined, subscribers: undefined, addressGroups: undefined }))
    }
  }, [errors.groups])

  const handleSubscriberToggle = useCallback((subscriberId: number) => {
    setSelectedSubscribers(prev => {
      if (prev.includes(subscriberId)) {
        return prev.filter(id => id !== subscriberId)
      } else {
        return [...prev, subscriberId]
      }
    })
    if (errors.subscribers || errors.groups || errors.addressGroups) {
      setErrors(prev => ({ ...prev, subscribers: undefined, groups: undefined, addressGroups: undefined }))
    }
  }, [errors.subscribers])

  const handleChannelToggle = useCallback((channelId: string) => {
    setSelectedChannels(prev => {
      if (prev.includes(channelId)) {
        return prev.filter(id => id !== channelId)
      } else {
        return [...prev, channelId]
      }
    })
    if (errors.channels) {
      setErrors(prev => ({ ...prev, channels: undefined }))
    }
  }, [errors.channels])

  const validateForm = useCallback((): boolean => {
    const newErrors: typeof errors = {}

    if (name.trim() === '') {
      newErrors.name = 'Name is required'
    }

    // Validate address groups
    if (selectedAddressGroups.length === 0) {
      newErrors.addressGroups = 'An address group must be selected'
    }

    // Validate groups
    if (selectedGroups.length === 0 && selectedSubscribers.length === 0 ) {
      newErrors.groups = 'Select at least one group or subscriber'
      newErrors.subscribers = 'Select at least one group or subscriber'
    }

    // Validate channels
    // if (selectedChannels.length === 0) {
    //   newErrors.channels = 'Select the notification channel'
    // }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [addressGroups, selectedGroups, selectedSubscribers, selectedChannels, name])

  const handleRuntimeNavigation = (type: string) => {
    const url = type === 'group' ? '/web3/address-group' : '/notifications/groups'
    let returnUrl = "/web3/address-activity-airdrop?openActivity=true"
    if (name.trim() !== '') {
      returnUrl += `&name=${name.trim()}`
    }
    if (selectedAddressGroups.length > 0) {
      returnUrl += `&addressGroupIds=${selectedAddressGroups.join(',')}`
    }
    if (selectedGroups.length > 0) {
      returnUrl += `&groupIds=${selectedGroups.join(',')}`
    }
    if (selectedSubscribers.length > 0) {
      returnUrl += `&subscriberIds=${selectedSubscribers.join(',')}`
    }
    if (selectedChannels.length > 0) {
      returnUrl += `&channelIds=${selectedChannels.join(',')}`
    }
    router.push(url + '?openGroup=true&returnUrl=' + encodeURIComponent(returnUrl))
  }

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit({
        action: mode === "edit" ? "update" : "create",
        name: name.trim(),
        address_group_ids: selectedAddressGroups, // Placeholder, adjust as needed
        notification_group_ids: selectedGroups,
        notification_subscriber_ids: selectedSubscribers,
        channel_ids: selectedChannels,
      })
    }
  }, [validateForm, selectedAddressGroups, selectedGroups, selectedSubscribers, selectedChannels, onSubmit])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "edit" ? "Update" : mode === "create" ? "Create" : ""} Address Activity Airdrop Watcher
            </DialogTitle>
            <DialogDescription>
              Monitor blockchain addresses for activity and send notifications to selected groups and subscribers.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">

            <div className="grid gap-3">
              <Label className="text-left font-semibold">
                Watcher Name <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Watcher Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? 'border-destructive' : ''}
                disabled={isSubmitting || isReadOnly}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Address Groups Section */}
            <div className="grid gap-3 border-t pt-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <Label className="text-left font-semibold">
                  Address Groups <span className="text-destructive">*</span>
                </Label>
                <Badge className='cursor-pointer px-2 py-1' onClick={() => {
                  handleRuntimeNavigation('group')
                }} title='Create new address group'>
                  <Plus className="w-4 h-4" />
                  Create new
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground -mt-2">
                Select individual address groups to notify
              </p>

              {loadingAddressGroups ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : addressGroups.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg bg-muted/30">
                    No active address groups available
                  </p>
              ) : (
                <div className="border rounded-lg p-3 bg-muted/30 max-h-48 overflow-y-auto">
                      <div className="space-y-2">
                    {addressGroups.map((AddressGroup) => (
                      <div
                        key={AddressGroup.id}
                        className="flex items-center gap-2 p-2 hover:bg-muted rounded"
                      >
                        <Checkbox
                          id={`address-group-${AddressGroup.id}`}
                          checked={selectedAddressGroups.includes(AddressGroup.id)}
                          onCheckedChange={() => handleAddressGroupToggle(AddressGroup.id)}
                          disabled={isSubmitting || isReadOnly}
                          className='cursor-pointer'
                        />
                        <Label
                          htmlFor={`address-group-${AddressGroup.id}`}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          <div className="font-medium">{AddressGroup.name}</div>
                          {AddressGroup.description && (
                            <div className="text-xs text-muted-foreground">{AddressGroup.description}</div>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {errors.addressGroups && (
                <p className="text-sm text-destructive">{errors.addressGroups}</p>
              )}
            </div>

            {/* Groups Section */}
            <div className="grid gap-3 border-t pt-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <Label className="text-left font-semibold">
                  Notification Groups <span className="text-destructive">*</span>
                </Label>
                <Badge className='cursor-pointer px-2 py-1' onClick={() => {
                  handleRuntimeNavigation('notification')
                }} title='Create new notification group'>
                  <Plus className="w-4 h-4" />
                  Create new
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground -mt-2">
                Select groups to notify when activity is detected
              </p>

              {loadingGroups ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : groups.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg bg-muted/30">
                    No active notification groups available.
                  </p>
              ) : (
                <div className="border rounded-lg p-3 bg-muted/30 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        className="flex items-center gap-2 p-2 hover:bg-muted rounded"
                      >
                        <Checkbox
                          id={`group-${group.id}`}
                          checked={selectedGroups.includes((group.id))}
                          onCheckedChange={() => handleGroupToggle((group.id))}
                          disabled={isSubmitting || isReadOnly}
                          className='cursor-pointer'
                        />
                        <Label
                          htmlFor={`group-${group.id}`}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          <div className="font-medium">{group.name}</div>
                          {group.description && (
                            <div className="text-xs text-muted-foreground">{group.description}</div>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {errors.groups && (
                <p className="text-sm text-destructive">{errors.groups}</p>
              )}
            </div>

            {/* Subscribers Section */}
            {/* <div className="grid gap-3 border-t pt-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <Label className="text-left font-semibold">
                  Subscribers <span className="text-destructive">*</span>
                </Label>
              </div>
              <p className="text-xs text-muted-foreground -mt-2">
                Select individual subscribers to notify
              </p>

              {loadingSubscribers ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : subscribers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg bg-muted/30">
                  No active subscribers available
                </p>
              ) : (
                <div className="border rounded-lg p-3 bg-muted/30 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {subscribers.map((subscriber) => (
                      <div
                        key={subscriber.id}
                        className="flex items-center gap-2 p-2 hover:bg-muted rounded"
                      >
                        <Checkbox
                          id={`sub-${subscriber.id}`}
                          checked={selectedSubscribers.includes((subscriber.id))}
                          onCheckedChange={() => handleSubscriberToggle((subscriber.id))}
                          disabled={isSubmitting || isReadOnly}
                          className='cursor-pointer'
                        />
                        <Label
                          htmlFor={`sub-${subscriber.id}`}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          <div className="font-medium">
                            {subscriber.first_name} {subscriber.last_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {subscriber.email}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {errors.subscribers && (
                <p className="text-sm text-destructive">{errors.subscribers}</p>
              )}
            </div> */}

            {/* Channels Section */}
            {/* <div className="grid gap-3 border-t pt-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <Label className="text-left font-semibold">
                  Notification Channels <span className="text-destructive">*</span>
                </Label>
              </div>
              <p className="text-xs text-muted-foreground -mt-2">
                Select channels to send notifications through
              </p>

              <div className="flex flex-wrap gap-2">
                {AVAILABLE_CHANNELS.map((channel) => {
                  const Icon = channel.icon
                  const isSelected = selectedChannels.includes(channel.id)
                  return (
                    <Badge
                      key={channel.id}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer px-3 py-2 ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      }`}
                      onClick={() => !isSubmitting && handleChannelToggle(channel.id)}
                    >
                      <Icon className="w-3 h-3 mr-2" />
                      {channel.label}
                    </Badge>
                  )
                })}
              </div>
              {errors.channels && (
                <p className="text-sm text-destructive">{errors.channels}</p>
              )}
            </div> */}
          </div>

          {!isReadOnly && <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === "edit" ? "Updating..." : "Creating..."}
                </>
              ) : (
                mode === "edit" ? "Update Watcher" : "Create Watcher"
              )}
            </Button>
          </DialogFooter>}
        </form>
      </DialogContent>
    </Dialog>
  )
}

