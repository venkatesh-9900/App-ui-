"use client"

import React, { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, Bell, BellOff } from 'lucide-react'
import { CreateSubscriberRequest, NotificationSubscriber } from '@/types/subscriber'

interface SubscriberFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface FormErrors {
  email?: string
  phone?: string
}

interface SubscriptionFormProps {
  emailConsent: boolean
  smsConsent: boolean
  isSubmitting: boolean
  isSuccess: boolean
  existingSubscriber: NotificationSubscriber | null
  onSubmit: (payload: CreateSubscriberRequest) => void
  onUnsubscribe?: () => void
  isUnsubscribing?: boolean
}

export function SubscriptionForm({
  emailConsent,
  smsConsent,
  isSubmitting,
  isSuccess,
  existingSubscriber,
  onSubmit,
  onUnsubscribe,
  isUnsubscribing = false,
}: SubscriptionFormProps) {
  const [formData, setFormData] = useState<SubscriberFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // Prefill form data when existing subscriber is loaded or updated
  useEffect(() => {
    if (existingSubscriber) {
      setFormData({
        firstName: existingSubscriber.first_name || '',
        lastName: existingSubscriber.last_name || '',
        email: existingSubscriber.email || '',
        phone: existingSubscriber.phone || '',
      })
    }
  }, [
    existingSubscriber,
    existingSubscriber?.first_name,
    existingSubscriber?.last_name,
    existingSubscriber?.email,
    existingSubscriber?.phone,
  ])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (emailConsent && !formData.email.trim()) {
      newErrors.email = 'Email is required when email notifications are enabled'
    } else if (emailConsent && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (smsConsent && !formData.phone.trim()) {
      newErrors.phone = 'Phone number is required when SMS notifications are enabled'
    } else if (smsConsent && formData.phone && !/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number (e.g., +1234567890)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof SubscriberFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Generate a unique subscriber ID using email or phone
    const subscriberId = formData.email || formData.phone || `subscriber_${Date.now()}`
    
    // Prepare the request payload
    const payload: CreateSubscriberRequest = {
      subscriberId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      locale: navigator.language || 'en-US',
      data: {
        emailConsent,
        smsConsent,
      }
    }

    // Only include email if email consent is given
    if (emailConsent && formData.email) {
      payload.email = formData.email
    }

    // Only include phone if SMS consent is given
    if (smsConsent && formData.phone) {
      payload.phone = formData.phone
    }

    onSubmit(payload)
  }

  // Reset form when submission is successful
  React.useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
        })
        setErrors({})
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess])

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-4">
        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
        <span>Please fill in your details below</span>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Email Field - Only show if email consent is given */}
      {emailConsent && (
        <div className="space-y-2">
          <Label htmlFor="email">
            Email Address <span className="text-destructive">*</span>
            <Badge variant="secondary" className="ml-2 text-xs">Required for email notifications</Badge>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john.doe@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            aria-invalid={!!errors.email}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>
      )}

      {/* Phone Field - Only show if SMS consent is given */}
      {smsConsent && (
        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone Number <span className="text-destructive">*</span>
            <Badge variant="secondary" className="ml-2 text-xs">Required for SMS notifications</Badge>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1234567890"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            aria-invalid={!!errors.phone}
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Include country code (e.g., +1 for US)
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-4">
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || isSuccess}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Subscribing...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Subscribed!
            </>
          ) : (
            <>
              <Bell className="w-4 h-4 mr-2" />
              Subscribe to Notifications
            </>
          )}
        </Button>

        {/* Unsubscribe Button - Hidden for now */}
        {/* {existingSubscriber && existingSubscriber.active && onUnsubscribe && (
          <div className="pt-2 border-t mt-3">
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={onUnsubscribe}
              disabled={isUnsubscribing}
              size="lg"
            >
              <BellOff className="w-4 h-4 mr-2" />
              {isUnsubscribing ? 'Unsubscribing...' : 'Unsubscribe from All Notifications'}
            </Button>
            <p className="text-sm text-muted-foreground text-center mt-2">
              This will stop all email and SMS notifications
            </p>
          </div>
        )} */}
      </div>
    </form>
  )
}

