"use client"

import React, { useState, useEffect, useCallback} from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Users, Check, X } from 'lucide-react'
import { CreateTopicRequest } from '@/types/topic'
import { NotificationSubscriber } from '@/types/subscriber'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { getActiveHumanSubscribers } from '@/hooks/subscriber-service'
import { addSubscriptionsToTopic, listTopicSubscriptions, removeSubscriptionsFromTopic } from '@/hooks/topic-service'
import { toast } from 'sonner'

interface GroupFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateTopicRequest) => void
  isSubmitting: boolean
  mode: 'create' | 'edit'
  initialData?: CreateTopicRequest & { topicKey?: string }
}

export function GroupFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  mode,
  initialData,
}: GroupFormDialogProps) {
  const [formData, setFormData] = useState<CreateTopicRequest>({
    name: '',
    description: '',
  })
  const [errors, setErrors] = useState<{
    name?: string
    description?: string
  }>({})
  const [subscribers, setSubscribers] = useState<NotificationSubscriber[]>([])
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([])
  const [existingSubscriberIds, setExistingSubscriberIds] = useState<string[]>([]) // Already mapped subscribers
  const [loadingSubscribers, setLoadingSubscribers] = useState(false)
  const [addingSubscriptions, setAddingSubscriptions] = useState(false)
  const [removingSubscriberId, setRemovingSubscriberId] = useState<string | null>(null) // Track which subscriber is being removed

  // Load existing subscriptions for the group
  const loadExistingSubscriptions = useCallback((topicKey: string) => {
    listTopicSubscriptions({
      topicKey,
      successTask: (response) => {
        // Response format: { status: "Success", data: [...subscribers], count: X }
        if (response.data && Array.isArray(response.data)) {
          // Extract novu_subscriber_id from each subscriber object
          const subscriberIds = response.data.map((sub: any) => sub.novu_subscriber_id).filter(Boolean)
          setExistingSubscriberIds(subscriberIds)
        }
      },
      failureTask: () => {
        console.error('Failed to load existing subscriptions')
      },
      errorTask: () => {
        console.error('Error loading existing subscriptions')
      }
    })
  }, [])

  // Load subscribers callback - wrapped in useCallback to prevent infinite loops
  const loadSubscribers = useCallback(() => {
    setLoadingSubscribers(true)
    getActiveHumanSubscribers({
      successTask: (data) => {
        if (data.data && Array.isArray(data.data)) {
          setSubscribers(data.data)
        }
        setLoadingSubscribers(false)
      },
      failureTask: () => {
        toast.error('Failed to load subscribers')
        setLoadingSubscribers(false)
      },
      errorTask: () => {
        toast.error('Error loading subscribers')
        setLoadingSubscribers(false)
      }
    })
  }, [])

  useEffect(() => {
    // Only run when dialog opens, not when closing
    if (!open) return

    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData({ name: '', description: '' })
    }
    setErrors({})
    setSelectedSubscribers([])
    setExistingSubscriberIds([])

    // Load subscribers and existing subscriptions only in edit mode
    if (mode === 'edit') {
      loadSubscribers()
      
      // Load existing subscriptions if we have a topicKey
      if (initialData && 'topicKey' in initialData && initialData.topicKey) {
        loadExistingSubscriptions(initialData.topicKey)
      }
    }
  }, [open, mode, initialData, loadSubscribers, loadExistingSubscriptions])

  const validateForm = useCallback((): boolean => {
    const newErrors: {
      name?: string
      description?: string
    } = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Group name must be at least 3 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData.name])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }, [formData, onSubmit, validateForm])

  const handleInputChange = useCallback((field: keyof CreateTopicRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    setErrors(prev => {
      if (prev[field]) {
        return { ...prev, [field]: undefined }
      }
      return prev
    })
  }, [])

  const handleSubscriberToggle = useCallback((novuSubscriberId: string) => {
    setSelectedSubscribers((prev) => {
      let prevSubscribers = [...prev]
      if (prevSubscribers.includes(novuSubscriberId)) {
        prevSubscribers = prevSubscribers.filter(id => id !== novuSubscriberId)
      } else {
        prevSubscribers.push(novuSubscriberId)
      }
      return prevSubscribers
    })
  }, [])

  const handleAddSubscribers = useCallback(async () => {
    if (selectedSubscribers.length === 0) {
      toast.info('No subscribers selected')
      return
    }

    if (!initialData || !('topicKey' in initialData) || !initialData.topicKey) {
      toast.error('Group topic key not found')
      return
    }

    setAddingSubscriptions(true)
    addSubscriptionsToTopic({
      topicKey: initialData.topicKey,
      subscriberIds: selectedSubscribers,
      successTask: () => {
        toast.success(`Added ${selectedSubscribers.length} subscriber(s) to the group!`)
        
        // Add newly selected subscribers to existingSubscriberIds (keep them checked)
        setExistingSubscriberIds(prev => [...new Set([...prev, ...selectedSubscribers])])
        
        // Clear the selectedSubscribers since they're now part of existingSubscriberIds
        setSelectedSubscribers([])
        
        // Reload existing subscriptions to get the latest state
        loadExistingSubscriptions(initialData.topicKey)
        
        setAddingSubscriptions(false)
      },
      failureTask: () => {
        toast.error('Failed to add subscribers')
        setAddingSubscriptions(false)
      },
      errorTask: () => {
        toast.error('Error adding subscribers')
        setAddingSubscriptions(false)
      }
    })
  }, [selectedSubscribers, initialData, loadExistingSubscriptions])

  const handleRemoveSubscriber = useCallback(async (subscriberId: string) => {
    if (!initialData || !('topicKey' in initialData) || !initialData.topicKey) {
      toast.error('Group topic key not found')
      return
    }

    setRemovingSubscriberId(subscriberId)
    removeSubscriptionsFromTopic({
      topicKey: initialData.topicKey,
      subscriberIds: [subscriberId],
      successTask: () => {
        toast.success('Subscriber removed from group')
        
        // Remove from existingSubscriberIds
        setExistingSubscriberIds(prev => prev.filter(id => id !== subscriberId))
        
        // Reload existing subscriptions to get the latest state
        loadExistingSubscriptions(initialData.topicKey)
        
        setRemovingSubscriberId(null)
      },
      failureTask: () => {
        toast.error('Failed to remove subscriber')
        setRemovingSubscriberId(null)
      },
      errorTask: () => {
        toast.error('Error removing subscriber')
        setRemovingSubscriberId(null)
      }
    })
  }, [initialData, loadExistingSubscriptions])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Create Notification Group' : 'Edit Notification Group'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? 'Create a new notification group to organize your subscribers.'
                : 'Update the details of your notification group.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Name Field */}
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-left">
                Group Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Daily Updates, Weekly Digest"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-destructive' : ''}
                disabled={isSubmitting || addingSubscriptions}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Description Field */}
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-left">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose of this notification group..."
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={errors.description ? 'border-destructive' : ''}
                disabled={isSubmitting || addingSubscriptions}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            {/* Subscribers Selection - Only in Edit Mode */}
            {mode === 'edit' && (
              <div className="grid gap-2 border-t pt-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <Label className="text-left font-semibold">
                    Add Subscribers to Group
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Select subscribers to add to this notification group
                </p>

                {loadingSubscribers ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : subscribers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No active subscribers available
                  </p>
                ) : (
                  <div className="border rounded-lg p-3 bg-muted/30 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {subscribers.map((subscriber) => {
                        const isAlreadyMapped = existingSubscriberIds.includes(subscriber.novu_subscriber_id)
                        const isChecked = isAlreadyMapped || selectedSubscribers.includes(subscriber.novu_subscriber_id)
                        const isRemoving = removingSubscriberId === subscriber.novu_subscriber_id
                        
                        return (
                          <div
                            key={subscriber.id}
                            className="flex items-center gap-2 p-2 hover:bg-muted rounded group relative"
                          >
                            <Checkbox
                              id={`sub-${subscriber.id}`}
                              checked={isChecked}
                              disabled={isAlreadyMapped || isRemoving}
                              onCheckedChange={() => handleSubscriberToggle(subscriber.novu_subscriber_id)}
                            />
                            <Label
                              htmlFor={`sub-${subscriber.id}`}
                              className={`flex-1 cursor-pointer text-sm ${isAlreadyMapped ? 'opacity-60' : ''}`}
                            >
                              <div className="font-medium flex items-center gap-2">
                                {subscriber.first_name} {subscriber.last_name}
                                {isRemoving && (
                                  <span className="text-xs text-orange-600 font-normal">(Removing...)</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {subscriber.email}
                              </div>
                            </Label>
                            
                            {/* Delete button - shows for already mapped subscribers */}
                            {isAlreadyMapped && !isRemoving && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                onClick={() => handleRemoveSubscriber(subscriber.novu_subscriber_id)}
                                title="Remove from group"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {/* Loading spinner while removing */}
                            {isRemoving && (
                              <div className="h-7 w-7 flex items-center justify-center">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {selectedSubscribers.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddSubscribers}
                    disabled={addingSubscriptions || isSubmitting}
                    className="w-full cursor-pointer"
                  >
                    {addingSubscriptions ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding {selectedSubscribers.length} subscriber(s)...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Add {selectedSubscribers.length} Subscriber(s) to Group
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
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
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                <>{mode === 'create' ? 'Create Group' : 'Update Group'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

