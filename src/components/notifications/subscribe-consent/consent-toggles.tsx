"use client"

import React from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Mail, Phone } from 'lucide-react'

interface ConsentTogglesProps {
  emailConsent: boolean
  smsConsent: boolean
  onEmailConsentChange: (checked: boolean) => void
  onSmsConsentChange: (checked: boolean) => void
  emailDisabled?: boolean
  smsDisabled?: boolean
}

export function ConsentToggles({
  emailConsent,
  smsConsent,
  onEmailConsentChange,
  onSmsConsentChange,
  emailDisabled = false,
  smsDisabled = false,
}: ConsentTogglesProps) {
  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-muted-foreground" />
          <div className="space-y-0.5">
            <Label htmlFor="email-consent" className="text-base font-medium">
              Email Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive updates via email
            </p>
          </div>
        </div>
        <Switch
          id="email-consent"
          checked={emailConsent}
          onCheckedChange={onEmailConsentChange}
          disabled={emailDisabled}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-muted-foreground" />
          <div className="space-y-0.5">
            <Label htmlFor="sms-consent" className="text-base font-medium">
              SMS Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive updates via SMS
            </p>
          </div>
        </div>
        <Switch
          id="sms-consent"
          checked={smsConsent}
          onCheckedChange={onSmsConsentChange}
          disabled={smsDisabled}
        />
      </div>
    </div>
  )
}

