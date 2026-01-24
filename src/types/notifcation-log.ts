export interface NotificationLog {
    id: number;
    description: string;
    details_url: string;
    emails: string[];
    notification_type: string;
    created_at: string;
    read_status: boolean;
}

export interface ListNotificationLogResponse {
    status: string;
    count: number;
    data: NotificationLog[];
}

export interface UpdateNotificationLogRequest {
    read_status: boolean;
}

export interface DeleteNotificationLogResponse {
    message: string;
}