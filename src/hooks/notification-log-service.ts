import { refreshAccessToken, reauthenticationStep } from '@/hooks/auth-service';
import { buildHeaderJSON } from '@/utils/axios/auth-axios';
import { DeleteNotificationLogResponse, ListNotificationLogResponse, NotificationLog, UpdateNotificationLogRequest } from '@/types/notifcation-log';

interface BaseServiceParams {
    successTask: (data: any) => void;
    failureTask: () => void;
    errorTask: () => void;
    retry?: boolean;
}

interface listNotificationLog extends BaseServiceParams {
    page: number;
    limit: number;
    filter_by?: boolean;
}

interface updateNotificationLog extends BaseServiceParams {
    id: number;
    request: UpdateNotificationLogRequest;
}

interface DeleteNotificationLogParams extends BaseServiceParams {
    id: number;
}



const NOTIFICATION_LOG_ENDPOINTS = {
    GET: (page: number, limit: number, filter_by?: boolean) => `/api/notifications/log?page=${page}&limit=${limit}${filter_by !== undefined ? `&filter_by=${filter_by}` : ''    }`,
    UPDATE: (id: number) => `/api/notifications/log?id=${id}`,
    DELETE: (id: number) => `/api/notifications/log?id=${id}`,
};


export const listNotificationLog = async ({
    page,
    limit,
    filter_by,
    successTask,
    failureTask,
    errorTask,
    retry = false
}: listNotificationLog) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(NOTIFICATION_LOG_ENDPOINTS.GET(page, limit, filter_by), {
            method: 'GET',
            headers: buildHeaderJSON(false),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await listNotificationLog({
                    page,
                    limit,
                    retry: true,
                    successTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status === 200) {
            const data: ListNotificationLogResponse = await response.json();
            successTask(data); // Replace with 'data' when backend is ready
        } else {
            console.error("Failed to list notification logs with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to list notification logs:", error);
        errorTask();
    }
};

export const updateNotificationLog = async ({
    id,
    request,
    successTask,
    failureTask,
    errorTask,
    retry = false
}: updateNotificationLog) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(NOTIFICATION_LOG_ENDPOINTS.UPDATE(id), {
            method: 'PUT',
            headers: buildHeaderJSON(false),
            body: JSON.stringify(request),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await updateNotificationLog({
                    retry: true,
                    id,
                    request,
                    successTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status === 200) {
            const data: NotificationLog = await response.json();
            successTask(data);
        } else {
            console.error("Failed to update notification log with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to update notification log:", error);
        errorTask();
    }
};

export const deleteNotificationLog = async ({
    id,
    successTask,
    failureTask,
    errorTask,
    retry = false
}: DeleteNotificationLogParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(NOTIFICATION_LOG_ENDPOINTS.DELETE(id), {
            method: 'DELETE',
            headers: buildHeaderJSON(false),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await deleteNotificationLog({
                    retry: true,
                    id,
                    successTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status === 200) {
            const data: DeleteNotificationLogResponse = await response.json();
            successTask(data);
        } else {
            console.error("Failed to delete notification log with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to delete notification log:", error);
        errorTask();
    }
};