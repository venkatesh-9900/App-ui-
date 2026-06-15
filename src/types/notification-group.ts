// Notification group related types

export interface CreateNotificationGroupRequest {
  name: string;
  description?: string;
  channel_instance_ids: number[];
  // iam_group_id is sent via the x-iam-group-id header, not the request body.
}

export interface UpdateNotificationGroupRequest {
  name?: string;
  description?: string;
  channel_instance_ids: number[];
}

// Database response for notification groups
export interface NotificationGroup {
  id: number;
  name: string;
  description?: string;
  channel_instance_ids: number[];
  user_id?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationGroupResponse {
  message: string;
  data: NotificationGroup;
}

export interface ListNotificationGroupsResponse {
  status: string;
  message: string;
  data: {
    data: NotificationGroup[];
    totalCount: number;
  };
}

export interface DeleteNotificationGroupResponse {
  message: string;
}
