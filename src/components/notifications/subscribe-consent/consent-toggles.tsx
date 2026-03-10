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
    <div className="space-y-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <Mail className="w-5 h-5 text-muted-foreground shrink-0" />
          <div className="space-y-0.5 min-w-0">
            <Label htmlFor="email-consent" className="text-sm sm:text-base font-medium">
              Email Notifications
            </Label>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Receive updates via email
            </p>
          </div>
        </div>
        <Switch
          id="email-consent"
          checked={emailConsent}
          onCheckedChange={onEmailConsentChange}
          disabled={emailDisabled}
          className="shrink-0 cursor-pointer"
        />
      </div>

      {/* <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <Phone className="w-5 h-5 text-muted-foreground shrink-0" />
          <div className="space-y-0.5 min-w-0">
            <Label htmlFor="sms-consent" className="text-sm sm:text-base font-medium">
              SMS Notifications
            </Label>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Receive updates via SMS
            </p>
          </div>
        </div>
        <Switch
          id="sms-consent"
          checked={smsConsent}
          onCheckedChange={onSmsConsentChange}
          disabled={smsDisabled}
          className="shrink-0"
        />
      </div> */}
    </div>
  )
}

