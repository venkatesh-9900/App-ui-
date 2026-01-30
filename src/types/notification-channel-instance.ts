export type PublishType = "batch" | "realtime"

export interface CreateNotificationChannelInstanceRequest {
  name: string
  channel_id: number          // 3 = Custom Webhook, 4 = Teams Webhook
  description?: string
  publish_type: string        // e.g. "batch" | "real-time"
  payload: {
    webhook_url: string
  }
}

export interface UpdateNotificationChannelInstanceRequest {
  name?: string
  description?: string
  publish_type?: string
  payload?: {
    webhook_url: string
  }
}

export interface NotificationChannelInstance {
  id: number
  name: string
  channel_id: number
  description?: string
  publish_type: string
  payload: {
    webhook_url: string
  }
  created_at: string
  updated_at: string
}

export interface NotificationChannelInstanceResponse {
  status?: string
  message?: string
  data?: NotificationChannelInstance
}

export interface ListNotificationChannelInstanceResponse {
  status: string
  count: number
  data: NotificationChannelInstance[]
}

export interface DeleteNotificationChannelInstanceResponse {
  message: string
}
