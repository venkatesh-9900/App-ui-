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
import { CreateAddressActivityRequest } from '@/types/address-activity'
import { NotificationGroup } from '@/types/topic'
import { NotificationSubscriber } from '@/types/subscriber'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { AddressGroup } from '@/types/address-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AddressActivityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateAddressActivityRequest) => void
  isSubmitting: boolean
  groups: NotificationGroup[]
  subscribers: NotificationSubscriber[]
  loadingGroups: boolean
  loadingSubscribers: boolean
  addressGroups: AddressGroup[]
  loadingAddressGroups: boolean
}

const AVAILABLE_CHANNELS = [
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'sms', label: 'SMS', icon: Bell },
  { id: 'in_app', label: 'In-App', icon: Bell },
  { id: 'push', label: 'Push', icon: Bell },
]

export function AddressActivityFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  groups,
  addressGroups,
  subscribers,
  loadingGroups,
  loadingSubscribers,
  loadingAddressGroups,
}: AddressActivityFormDialogProps) {
  const [selectedAddressGroup, setSelectedAddressGroup] = useState<number>(0)
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([])
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [errors, setErrors] = useState<{
    addressGroups?: string
    groups?: string
    subscribers?: string
    channels?: string
  }>({})

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setSelectedAddressGroup(0)
      setSelectedGroups([])
      setSelectedSubscribers([])
      setSelectedChannels([])
      setErrors({})
    }
  }, [open])


  const handleAddressGroup = (value: string) => {
    setSelectedAddressGroup(Number(value))
  }

  const handleGroupToggle = useCallback((topicKey: string) => {
    setSelectedGroups(prev => {
      if (prev.includes(topicKey)) {
        return prev.filter(key => key !== topicKey)
      } else {
        return [...prev, topicKey]
      }
    })
    if (errors.groups) {
      setErrors(prev => ({ ...prev, groups: undefined }))
    }
  }, [errors.groups])

  const handleSubscriberToggle = useCallback((subscriberId: string) => {
    setSelectedSubscribers(prev => {
      if (prev.includes(subscriberId)) {
        return prev.filter(id => id !== subscriberId)
      } else {
        return [...prev, subscriberId]
      }
    })
    if (errors.subscribers) {
      setErrors(prev => ({ ...prev, subscribers: undefined }))
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

    // Validate address groups
    if (selectedAddressGroup === 0) {
      newErrors.addressGroups = 'An address group must be selected'
    }

    // Validate groups
    if (selectedGroups.length === 0) {
      newErrors.groups = 'At least one group must be selected'
    }

    // Validate subscribers
    if (selectedSubscribers.length === 0) {
      newErrors.subscribers = 'At least one subscriber must be selected'
    }

    // Validate channels
    if (selectedChannels.length === 0) {
      newErrors.channels = 'At least one channel must be selected'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [addressGroups, selectedGroups, selectedSubscribers, selectedChannels])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit({
        action: "create",
        address_group_id: selectedAddressGroup, // Placeholder, adjust as needed
        notification_group_ids: selectedGroups,
        notification_subscriber_ids: selectedSubscribers,
        channel_ids: selectedChannels,
      })
    }
  }, [validateForm, selectedAddressGroup, selectedGroups, selectedSubscribers, selectedChannels, onSubmit])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Address Activity Watcher</DialogTitle>
            <DialogDescription>
              Monitor blockchain addresses for activity and send notifications to selected groups and subscribers.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">

            {/* Address Groups Section */}
            <div className="grid gap-3 border-t pt-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <Label className="text-left font-semibold">
                  Address Groups <span className="text-destructive">*</span>
                </Label>
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
                        <Select
                          onValueChange={(value) => handleAddressGroup(value)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Address Group" />
                          </SelectTrigger>

                          <SelectContent>
                            {addressGroups.map((group) => (
                              <SelectItem
                                key={group.id}
                                value={String(group.id)}
                              >
                                {group.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

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
                  No groups available. Create a group first.
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
                          checked={selectedGroups.includes(group.novu_topic_key)}
                          onCheckedChange={() => handleGroupToggle(group.novu_topic_key)}
                          disabled={isSubmitting}
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
            <div className="grid gap-3 border-t pt-4">
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
                          checked={selectedSubscribers.includes(subscriber.novu_subscriber_id)}
                          onCheckedChange={() => handleSubscriberToggle(subscriber.novu_subscriber_id)}
                          disabled={isSubmitting}
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
            </div>

            {/* Channels Section */}
            <div className="grid gap-3 border-t pt-4">
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
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>Create Watcher</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

