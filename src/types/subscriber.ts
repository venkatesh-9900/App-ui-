import { GenericResponse } from "./teams";

/**
 * Subscriber data structure based on notification-engine API
 */
export interface CreateSubscriberRequest {
    subscriberId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    timezone?: string;
    locale?: string;
    data?: Record<string, any>;
}

export interface UpdateSubscriberRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    timezone?: string;
    locale?: string;
    data?: Record<string, any>;
}

export interface SubscriberResponse {
    _id: string;
    subscriberId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    locale?: string;
    timezone?: string;
    channels?: any[];
    topics?: string[];
    isOnline?: boolean;
    lastOnlineAt?: string;
    data?: Record<string, any>;
    _organizationId: string;
    _environmentId: string;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSubscriberResponse extends GenericResponse {
    data: SubscriberResponse;
}

export interface GetSubscriberResponse extends GenericResponse {
    data: SubscriberResponse;
}

export interface SearchSubscribersRequest {
    page?: number;
    limit?: number;
    query?: string;
}

export interface SearchSubscribersResponse extends GenericResponse {
    data: {
        data: SubscriberResponse[];
        page: number;
        pageSize: number;
        totalCount: number;
    };
}

export interface DeleteSubscriberResponse extends GenericResponse {
    message: string;
}

export interface GetCurrentUserSubscriberResponse {
    status: 'Success' | 'Error';
    data: NotificationSubscriber[];
    count: number;
}

export interface NotificationSubscriber {
    id: number;
    novu_subscriber_id: string;
    first_name?: string;
    last_name?: string;
    email: string | null;
    phone: string | null;
    type: string;
    active: boolean;
    email_preference: boolean;
    sms_preference: boolean;
    user_id: string;
    organization_id: string;
    created_at: string;
    updated_at: string;
}

