"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ProtectedRoute } from "@/components/protected-route"
import { DashboardNavbar } from "@/components/web3/explorer/dashboard-navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Inbox } from "lucide-react"

import { NotificationLog } from "@/components/notifications/inbox/notification-log"
import {
  listNotificationLog,
  updateNotificationLog,
  deleteNotificationLog,
} from "@/hooks/notification-log-service"
import { NotificationLog as NotificationLogType } from "@/types/notifcation-log"

export default function NotificationsPage() {
  const router = useRouter()

  const [data, setData] = useState<NotificationLogType[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const limit = 10
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchLogs()
  }, [page])

  const fetchLogs = async () => {
    setLoading(true)

    await listNotificationLog({
      page,
      limit,
      successTask: (res) => {
        setData(res.data ?? [])
        setTotalCount(res.count ?? 0)
        setLoading(false)
      },
      failureTask: () => {
        toast.error("Failed to load notifications")
        setLoading(false)
      },
      errorTask: () => {
        toast.error("Something went wrong")
        setLoading(false)
      },
    })
  }

  const handleNotificationClick = async (n: NotificationLogType) => {
    if (!n.read_status) {
      await updateNotification(n.id, !n.read_status)
      
    }

    if (n.details_url) router.push(n.details_url)
  }

  const updateNotification = async (id: number, readStatus: boolean) => {
    setData((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, read_status: readStatus } : i
        )
      )
    await updateNotificationLog({
                id: id,
                request: { read_status: readStatus },
                successTask: () => {
                    console.log('Notification read status updated successfully')
                },
                failureTask: () => {
                    toast.error('Failed to update notification log ', {
                        description: 'Please try again.',
                    })
                },
                errorTask: () => {
                    toast.error('An error occurred', {
                        description: 'Please check your connection and try again.',
                    })
                },
    })
  }

  const deleteNotification = async (id: number) => {
    setTotalCount((prev) => prev - 1)
    await deleteNotificationLog({
                id: id,
                successTask: () => {
                    console.log('Notification log deleted successfully')
                    fetchLogs()
                },
                failureTask: () => {
                    toast.error('Failed to delete notification log ', {
                        description: 'Please try again.',
                    })
                },
                errorTask: () => {
                    toast.error('An error occurred', {
                        description: 'Please check your connection and try again.',
                    })
                },
    })
  }

  return (
    <ProtectedRoute>
      <DashboardNavbar />

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 px-2 py-2 md:gap-6 md:py-4 md:px-4">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Inbox className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-sm sm:text-2xl">
                    Inbox
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="px-0">
                <NotificationLog
                  data={data}
                  loading={loading}
                  page={page}
                  limit={limit}
                  totalCount={totalCount}
                  onPrev={() => setPage((p) => Math.max(1, p - 1))}
                  onNext={() =>
                    setPage((p) =>
                      p * limit < totalCount ? p + 1 : p
                    )
                  }
                  onRowClick={handleNotificationClick}
                  onToggleRead={updateNotification}
                  onDelete={deleteNotification}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
