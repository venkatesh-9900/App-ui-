"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Bell } from 'lucide-react'
import { ConsentToggles } from '@/components/notifications/subscribe-consent/consent-toggles'
import { SubscriptionForm } from '@/components/notifications/subscribe-consent/subscription-form'
import { EmptyState } from '@/components/notifications/subscribe-consent/empty-state'
import { AccessDenied } from "@/components/access-denied"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardNavbar } from '@/components/web3/explorer/dashboard-navbar'
import { CreateNotificationChannelInstanceRequest, NotificationSubscriberInfo } from '@/types/notification-channel-instance'
import { NotificationChannelInstancesSubscriberInfo, upsertNotificationChannelInstance, deleteNotificationChannelInstance } from '@/hooks/notification-channel-instance'

export default function SubscribeConsentPage() {
  // Page-level state management
  const [emailConsent, setEmailConsent] = useState(false)
  const [smsConsent, setSmsConsent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUnsubscribing, setIsUnsubscribing] = useState(false)
  const [existingSubscriber, setExistingSubscriber] = useState<NotificationSubscriberInfo | null>(null)
  const [accessDenied, setAccessDenied] = useState(false)

  const showForm = emailConsent || smsConsent

  // Fetch existing subscriber on mount
  useEffect(() => {
    const fetchExistingSubscriber = async () => {
      await NotificationChannelInstancesSubscriberInfo({
        successTask: (data) => {
          if (data.data) {
            // Get the first subscriber (most recent or active one)
            const subscriber = data.data
            setExistingSubscriber(subscriber)
            console.log('Existing subscriber found:', subscriber)
            // Set consent toggles based on saved preferences
            setEmailConsent(subscriber.email_preference || false)
            setSmsConsent(subscriber.sms_preference || false)
            toast.info('Existing subscription found', {
              description: 'Your saved preferences have been loaded.',
            })
          }
          setIsLoading(false)
        },
        failureTask: () => {
          console.log('No existing subscriber found')
          setIsLoading(false)
        },
        errorTask: () => {
          console.error('Error fetching subscriber')
          setIsLoading(false)
        },
        forbiddenTask: () => {
          setAccessDenied(true)
          setIsLoading(false)
        }
      })
    }

    fetchExistingSubscriber()
  }, [])

  // Refetch subscriber data after successful creation/update
  const refetchSubscriber = async () => {
    await NotificationChannelInstancesSubscriberInfo({
      successTask: (data) => {
        if (data.data) {
          const subscriber = data.data
          setExistingSubscriber(subscriber)
        }
      },
      failureTask: () => {
        console.log('Failed to refetch subscriber')
      },
      errorTask: () => {
        console.error('Error refetching subscriber')
      }
    })
  }

  // Handle form submission with API call
  const handleSubscriberCreation = async (payload: CreateNotificationChannelInstanceRequest) => {
    setIsSubmitting(true)

    await upsertNotificationChannelInstance({
      request: payload,
      successTask: async (data) => {
        // Success
        setIsSuccess(true)
        toast.success('Subscription successful!', {
          description: 'Your notification preferences have been saved.',
        })

        // Refetch subscriber data to update the form with latest saved data
        await refetchSubscriber()

        // Reset success state after 2 seconds but keep form data
        setTimeout(() => {
          setIsSuccess(false)
          setIsSubmitting(false)
        }, 2000)
      },
      failureTask: () => {
        console.error('Subscription failed')
        toast.error('Subscription failed', {
          description: 'Failed to create subscriber. Please try again.',
        })
        setIsSubmitting(false)
      },
      errorTask: () => {
        console.error('Subscription error occurred')
        toast.error('Subscription failed', {
          description: 'An unexpected error occurred. Please try again.',
        })
        setIsSubmitting(false)
      },
      forbiddenTask: () => {
        toast.error("Access denied")
        setIsSubmitting(false)
      }
    })
  }

  const handleEmailConsentChange = async (checked: boolean) => {
    if (!checked && existingSubscriber) {
      // user turning OFF
      setIsUnsubscribing(true)
      await deleteNotificationChannelInstance({
        id: existingSubscriber.id,
        successTask: () => {
          toast.success('Unsubscribed successfully', {
            description: 'You have been unsubscribed from all notifications.',
          })
          // Reset state
          setEmailConsent(false)
          setExistingSubscriber(null)
          setIsUnsubscribing(false)
        },
        failureTask: () => {
          toast.error("Failed to delete channel")
          setIsUnsubscribing(false)
        },
        errorTask: () => {
          toast.error("Something went wrong")
          setIsUnsubscribing(false)
        },
        forbiddenTask: () => {
          toast.error("Access denied")
          setIsUnsubscribing(false)
        },
      })
    } else {
      // user turning ON
      setEmailConsent(true)
    }
  }

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
      <div className="container max-w-2xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-xl sm:text-2xl">Notification Preferences</CardTitle>
                <CardDescription className="mt-1 sm:mt-1.5 text-sm">
                  Choose how you&apos;d like to receive notifications from us
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Consent Toggles */}
            <ConsentToggles
              emailConsent={emailConsent}
              smsConsent={smsConsent}
              onEmailConsentChange={handleEmailConsentChange}
              onSmsConsentChange={setSmsConsent}
              emailDisabled={false}
              smsDisabled={existingSubscriber?.sms_preference || false}
            />

            {/* Subscription Form or Empty State */}
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : showForm ? (
              <SubscriptionForm
                emailConsent={emailConsent}
                smsConsent={smsConsent}
                isSubmitting={isSubmitting}
                isSuccess={isSuccess}
                existingSubscriber={existingSubscriber}
                onSubmit={handleSubscriberCreation}
              />
            ) : (
              <EmptyState />
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
