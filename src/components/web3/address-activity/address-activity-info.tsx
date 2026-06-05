import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Info } from "lucide-react"
import { useState } from "react"
import {
  Activity,
  Bell,
  Users,
  Layers,
  Send,
  X,
} from "lucide-react"
import { ReactNode } from "react"

interface InfoRowProps {
  icon: ReactNode
  title: string
  description: string
}

export function AddressWatcherInfo() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="info"
        className="pt-1 cursor-pointer text-muted-foreground hover:text-foreground"
      >
        <Info className="w-5 h-5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg [&_[data-radix-dialog-close]]:cursor-pointer">
          <DialogHeader>
            <DialogTitle>Address Activity Watcher</DialogTitle>
            <DialogDescription>
              Monitors blockchain address activity and sends notifications when
              activity is detected.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium">How it works</h4>
              <ul className="mt-2 space-y-2 text-muted-foreground">
                <li>
                  <strong>Watcher Name:</strong> Identify this watcher easily.
                </li>
                <li>
                  <strong>Address Groups:</strong> Wallet addresses to monitor.
                </li>
                <li>
                  <strong>Notification Groups:</strong> Notification groups triggered on activity.
                </li>
                <li>
                  <strong>Subscribers:</strong> Who receives notifications.
                </li>
                <li>
                  <strong>Notification Channels:</strong> Email, Slack, webhook, etc.
                </li>
              </ul>
            </div>

            <div className="rounded-md border bg-muted p-3 text-xs">
              When any address in the selected groups has on-chain activity,
              notifications are sent automatically through the configured channels.
            </div>
          </div>
        </DialogContent>
      </Dialog><Dialog open={open} onOpenChange={setOpen}>
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
                Address Activity Watcher
              </DialogTitle>
              <DialogDescription className="text-sm">
                Monitors blockchain address activity and sends notifications
                when activity is detected.
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
              description="Give this watcher a recognizable name."
            />
            <InfoRow
              icon={<Layers className="h-4 w-4" />}
              title="Address Groups"
              description="Wallet addresses you want to monitor."
            />
            <InfoRow
              icon={<Bell className="h-4 w-4" />}
              title="Notification Groups"
              description="Groups of subscribers that will receive notifications when activity is detected."
            />
            <InfoRow
              icon={<Users className="h-4 w-4" />}
              title="Subscribers"
              description="Select individual subscribers to notify."
            />
            <InfoRow
              icon={<Send className="h-4 w-4" />}
              title="Notification Channels"
              description="Email."
            />
          </div>
        </div>

        {/* Summary Callout */}
        <div className="mt-6 rounded-lg border bg-muted/50 p-4 text-sm">
          <strong>Summary:</strong>  
          <p className="mt-1 text-muted-foreground">
            When any address in the selected groups has on-chain activity,
            notifications are automatically sent to the selected subscribers
            via the configured channels.
          </p>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}

/* Small reusable row */
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