import { CreateNotificationGroupRequest, UpdateNotificationGroupRequest, NotificationGroupResponse, ListNotificationGroupsResponse, DeleteNotificationGroupResponse } from '@/types/notification-group';
import { refreshAccessToken, reauthenticationStep } from '@/hooks/auth-service';
import { buildHeaderJSON } from '@/utils/axios/auth-axios';

interface BaseServiceParams {
    successTask: (data: any) => void;
    failureTask: () => void;
    errorTask: () => void;
    retry?: boolean;
    forbiddenTask?: () => void;
}

interface CreateNotificationGroupParams extends BaseServiceParams {
    request: CreateNotificationGroupRequest;
    groupId?: number;
}

interface UpdateNotificationGroupParams extends BaseServiceParams {
    id: number;
    request: UpdateNotificationGroupRequest;
    groupId?: number;
}

interface DeleteNotificationGroupParams extends BaseServiceParams {
    id: number;
    groupId?: number;
}

interface ListNotificationGroupsParams extends BaseServiceParams {
    page?: number;
    pageSize?: number;
    groupId?: number;
}

const NOTIFICATION_GROUP_ENDPOINTS = {
    CREATE: '/api/notification-groups',
    UPDATE: (id: number) => `/api/notification-groups/update?id=${encodeURIComponent(id)}`,
    DELETE: (id: number) => `/api/notification-groups/delete?id=${encodeURIComponent(id)}`,
    LIST: '/api/notification-groups',
};

/**
 * Create a new notification group
 */
export const createNotificationGroup = async ({
    request,
    groupId,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false
}: CreateNotificationGroupParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(NOTIFICATION_GROUP_ENDPOINTS.CREATE, {
            method: 'POST',
            headers: {
                ...buildHeaderJSON(false),
                ...(groupId !== undefined ? { 'x-iam-group-id': String(groupId) } : {})
            },
            body: JSON.stringify(request),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await createNotificationGroup({
                    retry: true,
                    request,
                    groupId,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status === 201 || response.status === 200) {
            const data: NotificationGroupResponse = await response.json();
            successTask(data);
        } else {
            console.error("Failed to create notification group with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to create notification group:", error);
        errorTask();
    }
};

/**
 * Update a notification group
 */
export const updateNotificationGroup = async ({
    id,
    request,
    groupId,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false
}: UpdateNotificationGroupParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(NOTIFICATION_GROUP_ENDPOINTS.UPDATE(id), {
            method: 'PATCH',
            headers: {
                ...buildHeaderJSON(false),
                ...(groupId !== undefined ? { 'x-iam-group-id': String(groupId) } : {})
            },
            body: JSON.stringify(request),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await updateNotificationGroup({
                    retry: true,
                    id,
                    request,
                    groupId,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status === 200) {
            const data: NotificationGroupResponse = await response.json();
            successTask(data);
        } else {
            console.error("Failed to update notification group with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to update notification group:", error);
        errorTask();
    }
};

/**
 * Delete a notification group
 */
export const deleteNotificationGroup = async ({
    id,
    groupId,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false
}: DeleteNotificationGroupParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(NOTIFICATION_GROUP_ENDPOINTS.DELETE(id), {
            method: 'DELETE',
            headers: {
                ...buildHeaderJSON(false),
                ...(groupId !== undefined ? { 'x-iam-group-id': String(groupId) } : {})
            },
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await deleteNotificationGroup({
                    retry: true,
                    id,
                    groupId,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status === 200) {
            const data: DeleteNotificationGroupResponse = await response.json();
            successTask(data);
        } else {
            console.error("Failed to delete notification group with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to delete notification group:", error);
        errorTask();
    }
};

/**
 * List all notification groups with optional filtering and pagination
 */
export const listNotificationGroups = async ({
    page,
    pageSize,
    groupId,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false
}: ListNotificationGroupsParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (pageSize) params.append('pageSize', pageSize.toString());

        const url = `${NOTIFICATION_GROUP_ENDPOINTS.LIST}${params.toString() ? '?' + params.toString() : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                ...buildHeaderJSON(false),
                ...(groupId !== undefined ? { 'x-iam-group-id': String(groupId) } : {})
            },
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await listNotificationGroups({
                    retry: true,
                    page,
                    pageSize,
                    groupId,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status === 200) {
            const data: ListNotificationGroupsResponse = await response.json();
            successTask(data);
        } else {
            console.error("Failed to list notification groups with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to list notification groups:", error);
        errorTask();
    }
};
