import {
    CreateNotificationChannelInstanceRequest,
    UpdateNotificationChannelInstanceRequest,
    NotificationChannelInstanceResponse,
    ListNotificationChannelInstanceResponse,
    DeleteNotificationChannelInstanceResponse,
    NotificationSubscriberInfoResponse
} from '@/types/notification-channel-instance'
import { refreshAccessToken, reauthenticationStep } from '@/hooks/auth-service'
import { buildHeaderJSON } from '@/utils/axios/auth-axios'

interface BaseServiceParams {
    successTask: (data: any) => void;
    failureTask: () => void;
    errorTask: () => void;
    retry?: boolean;
    forbiddenTask?: () => void;
}

interface CreateNotificationChannelInstanceParams extends BaseServiceParams {
    request: CreateNotificationChannelInstanceRequest;
}

interface UpdateNotificationChannelInstanceParams extends BaseServiceParams {
    id: number;
    request: UpdateNotificationChannelInstanceRequest;
}

interface DeleteNotificationChannelInstanceParams extends BaseServiceParams {
    id: number;
}

interface ListNotificationChannelInstanceParams extends BaseServiceParams {
    page?: number;
    limit?: number;
    groupId?: number;
}

const ENDPOINTS = {
    CREATE: '/api/notification-channel-instances',
    LIST: `/api/notification-channel-instances`,
    SUBSCRIBER_INFO: '/api/notification-channel-instances/subscriber-info',
    UPSERT: '/api/notification-channel-instances/upsert',
    UPDATE: (id: number) => `/api/notification-channel-instances?id=${id}`,
    DELETE: (id: number) => `/api/notification-channel-instances?id=${id}`,
}


/** CREATE */
export const createNotificationChannelInstance = async ({
    request,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false,
}: CreateNotificationChannelInstanceParams) => {
    try {
        if (retry) await refreshAccessToken({ failureTask, errorTask })

        const res = await fetch(ENDPOINTS.CREATE, {
            method: 'POST',
            headers: buildHeaderJSON(false),
            body: JSON.stringify(request),
        })

        if (res.status === 401) {
            retry
                ? await reauthenticationStep(errorTask)
                : await createNotificationChannelInstance({ retry: true, request, successTask, failureTask, errorTask, forbiddenTask })
            return
        }

        if (res.status === 403) {
            forbiddenTask?.()
            return
        }

        if (res.status === 201 || res.status === 200) {
            const data: NotificationChannelInstanceResponse = await res.json();
            successTask(data)
        } else {
            failureTask()
        }
    } catch {
        errorTask()
    }
}

/** CREATE */
export const upsertNotificationChannelInstance = async ({
    request,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false,
}: CreateNotificationChannelInstanceParams) => {
    try {
        if (retry) await refreshAccessToken({ failureTask, errorTask })

        const res = await fetch(ENDPOINTS.UPSERT, {
            method: 'POST',
            headers: buildHeaderJSON(false),
            body: JSON.stringify(request),
        })

        if (res.status === 401) {
            retry
                ? await reauthenticationStep(errorTask)
                : await upsertNotificationChannelInstance({ retry: true, request, successTask, failureTask, errorTask, forbiddenTask })
            return
        }

        if (res.status === 403) {
            forbiddenTask?.()
            return
        }

        if (res.status === 201 || res.status === 200) {
            const data: NotificationChannelInstanceResponse = await res.json();
            successTask(data)
        } else {
            failureTask()
        }
    } catch {
        errorTask()
    }
}

/** LIST */
export const listNotificationChannelInstances = async ({
    page,
    limit,
    groupId,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false,
}: ListNotificationChannelInstanceParams) => {
    try {
        if (retry) await refreshAccessToken({ failureTask, errorTask })
        const params = new URLSearchParams()
        if (page !== undefined) params.append('page', String(page))
        if (limit !== undefined) params.append('limit', String(limit))
        if (groupId !== undefined) params.append('iam_group_id', String(groupId))

        const url =
            params.toString().length > 0
                ? `${ENDPOINTS.LIST}?${params.toString()}`
                : ENDPOINTS.LIST

        const res = await fetch(url, {
            method: 'GET',
            headers: buildHeaderJSON(false),
        })

        if (res.status === 401) {
            retry
                ? await reauthenticationStep(errorTask)
                : await listNotificationChannelInstances({ retry: true, page, limit, groupId, successTask, failureTask, errorTask, forbiddenTask })
            return
        }

        if (res.status === 403) {
            forbiddenTask?.()
            return
        }

        if (res.status === 200) {
            const data: ListNotificationChannelInstanceResponse = await res.json();
            successTask(data)
        } else {
            failureTask()
        }
    } catch {
        errorTask()
    }
}

export const NotificationChannelInstancesSubscriberInfo = async ({
    page,
    limit,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false,
}: ListNotificationChannelInstanceParams) => {
    try {
        if (retry) await refreshAccessToken({ failureTask, errorTask })
        const params = new URLSearchParams()
        const url =
                params.toString().length > 0
                    ? `${ENDPOINTS.SUBSCRIBER_INFO}?${params.toString()}`
                    : ENDPOINTS.SUBSCRIBER_INFO
        const res = await fetch(url, {
            method: 'GET',
            headers: buildHeaderJSON(false),
        })

        if (res.status === 401) {
            retry
                ? await reauthenticationStep(errorTask)
                : await NotificationChannelInstancesSubscriberInfo({ retry: true, page, limit, successTask, failureTask, errorTask, forbiddenTask })
            return
        }

        if (res.status === 403) {
            forbiddenTask?.()
            return
        }

        if (res.status === 200) {
            const data: NotificationSubscriberInfoResponse = await res.json();
            successTask(data)
        } else {
            failureTask()
        }
    } catch {
        errorTask()
    }
}

/** UPDATE */
export const updateNotificationChannelInstance = async ({
    id,
    request,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false,
}: UpdateNotificationChannelInstanceParams) => {
    try {
        if (retry) await refreshAccessToken({ failureTask, errorTask })

        const res = await fetch(ENDPOINTS.UPDATE(id), {
            method: 'PUT',
            headers: buildHeaderJSON(false),
            body: JSON.stringify(request),
        })

        if (res.status === 401) {
            retry
                ? await reauthenticationStep(errorTask)
                : await updateNotificationChannelInstance({ retry: true, id, request, successTask, failureTask, errorTask, forbiddenTask })
            return
        }

        if (res.status === 403) {
            forbiddenTask?.()
            return
        }

        if (res.status === 200) {
            const data: NotificationChannelInstanceResponse = await res.json();
            successTask(data)
        } else {
            failureTask()
        }
    } catch {
        errorTask()
    }
}

/** DELETE */
export const deleteNotificationChannelInstance = async ({
    id,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false,
}: DeleteNotificationChannelInstanceParams) => {
    try {
        if (retry) await refreshAccessToken({ failureTask, errorTask })

        const res = await fetch(ENDPOINTS.DELETE(id), {
            method: 'DELETE',
            headers: buildHeaderJSON(false),
        })

        if (res.status === 401) {
            retry
                ? await reauthenticationStep(errorTask)
                : await deleteNotificationChannelInstance({ retry: true, id, successTask, failureTask, errorTask, forbiddenTask })
            return
        }

        if (res.status === 403) {
            forbiddenTask?.()
            return
        }

        if (res.status === 200) {
            const data: DeleteNotificationChannelInstanceResponse = await res.json();
            successTask(data)
        } else {
            failureTask()
        }
    } catch {
        errorTask()
    }
}
