export interface NotificationChannel {
  id: number
  name: string
  notification_channel: string
  display_name: string
  description: string
  listing: boolean
  created_at: string
  updated_at: string
}

export interface ListNotificationChannelResponse {
  status: string
  count: number
  data: NotificationChannel[]
}