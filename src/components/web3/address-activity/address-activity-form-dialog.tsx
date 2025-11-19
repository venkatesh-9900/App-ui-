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
import { toast } from 'sonner'

interface AddressActivityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateAddressActivityRequest) => void
  isSubmitting: boolean
  groups: NotificationGroup[]
  subscribers: NotificationSubscriber[]
  loadingGroups: boolean
  loadingSubscribers: boolean
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
  subscribers,
  loadingGroups,
  loadingSubscribers,
}: AddressActivityFormDialogProps) {
  const [addresses, setAddresses] = useState<string[]>([''])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([])
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [errors, setErrors] = useState<{
    addresses?: string
    groups?: string
    subscribers?: string
    channels?: string
  }>({})

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setAddresses([''])
      setSelectedGroups([])
      setSelectedSubscribers([])
      setSelectedChannels([])
      setErrors({})
    }
  }, [open])

  const handleAddAddress = useCallback(() => {
    setAddresses(prev => [...prev, ''])
  }, [])

  const handleRemoveAddress = useCallback((index: number) => {
    setAddresses(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleAddressChange = useCallback((index: number, value: string) => {
    setAddresses(prev => {
      const newAddresses = [...prev]
      newAddresses[index] = value
      return newAddresses
    })
    if (errors.addresses) {
      setErrors(prev => ({ ...prev, addresses: undefined }))
    }
  }, [errors.addresses])

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

    // Validate addresses
    const validAddresses = addresses.filter(addr => addr.trim() !== '')
    if (validAddresses.length === 0) {
      newErrors.addresses = 'At least one valid address is required'
    } else {
      // Basic Ethereum address validation
      const invalidAddresses = validAddresses.filter(addr => {
        return !addr.match(/^0x[a-fA-F0-9]{40}$/)
      })
      if (invalidAddresses.length > 0) {
        newErrors.addresses = 'All addresses must be valid Ethereum addresses (0x...)'
      }
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
  }, [addresses, selectedGroups, selectedSubscribers, selectedChannels])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      const validAddresses = addresses.filter(addr => addr.trim() !== '')
      onSubmit({
        addresses: validAddresses,
        topics: selectedGroups,
        subscriber_ids: selectedSubscribers,
        channel_ids: selectedChannels,
      })
    }
  }, [validateForm, addresses, selectedGroups, selectedSubscribers, selectedChannels, onSubmit])

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
            {/* Addresses Section */}
            <div className="grid gap-3">
              <Label className="text-left font-semibold">
                Ethereum Addresses <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground -mt-2">
                Add one or more Ethereum addresses to monitor
              </p>
              <div className="space-y-2">
                {addresses.map((address, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="0x..."
                      value={address}
                      onChange={(e) => handleAddressChange(index, e.target.value)}
                      className={errors.addresses ? 'border-destructive' : ''}
                      disabled={isSubmitting}
                    />
                    {addresses.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveAddress(index)}
                        disabled={isSubmitting}
                        className="cursor-pointer shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAddress}
                disabled={isSubmitting}
                className="w-full cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Address
              </Button>
              {errors.addresses && (
                <p className="text-sm text-destructive">{errors.addresses}</p>
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

