import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Activity,
  Bell,
  Users,
  Layers,
  Send,
  Info,
} from "lucide-react"
import { useState, ReactNode } from "react"

interface InfoRowProps {
  icon: ReactNode
  title: string
  description: string
}

export function AddressAirdropWatcherInfo() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Info icon */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="About Address Airdrop Watcher"
        className="pt-1 cursor-pointer text-muted-foreground hover:text-foreground"
      >
        <Info className="w-5 h-5" />
      </button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="
            sm:max-w-xl
            p-6
            [&_button[aria-label='Close']]:cursor-pointer
          "
        >
          {/* Header */}
          <DialogHeader className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>

              <div>
                <DialogTitle className="text-lg">
                  Address Airdrop Activity Watcher
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Detects airdrop-related token transfers and notifies selected
                  recipients when an airdrop is received.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* How it works */}
          <div className="mt-6 space-y-4">
            <h4 className="text-sm font-semibold text-foreground">
              How it works
            </h4>

            <div className="grid gap-3">
              <InfoRow
                icon={<Activity className="h-4 w-4" />}
                title="Watcher Name"
                description="Give this airdrop watcher a recognizable name."
              />
              <InfoRow
                icon={<Layers className="h-4 w-4" />}
                title="Address Groups"
                description="Wallet addresses that should be monitored for airdrop activity."
              />
              <InfoRow
                icon={<Bell className="h-4 w-4" />}
                title="Notification Groups"
                description="Groups of subscribers who will be notified when an airdrop is detected."
              />
              <InfoRow
                icon={<Users className="h-4 w-4" />}
                title="Subscribers"
                description="Individual subscribers who should receive airdrop notifications."
              />
              <InfoRow
                icon={<Send className="h-4 w-4" />}
                title="Notification Channels"
                description="How notifications are delivered (Email, Slack, Webhook, etc.)."
              />
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 rounded-lg border bg-muted/50 p-4 text-sm">
            <strong>Summary</strong>
            <p className="mt-1 text-muted-foreground">
              When an address in the selected groups receives an airdrop
              (unsolicited or zero-value token transfer), notifications are
              automatically sent to all selected notification groups and
              individual subscribers through the configured channels.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* Reusable row */
function InfoRow({ icon, title, description }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-md border p-3">
      <div className="mt-0.5 text-muted-foreground">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}
