import {
    ListNotificationChannelResponse
} from '@/types/notification-channel'
import { refreshAccessToken, reauthenticationStep } from '@/hooks/auth-service'
import { buildHeaderJSON } from '@/utils/axios/auth-axios'

interface BaseServiceParams {
    successTask: (data: any) => void;
    failureTask: () => void;
    errorTask: () => void;
    retry?: boolean;
    forbiddenTask?: () => void;
}
interface ListNotificationChannelParams extends BaseServiceParams {
    listing: boolean
}

const ENDPOINTS = {
    LIST: (listing: boolean) => `/api/notification-channels?listing=${listing}`,
}

export const listNotificationChannel = async ({
    listing,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false,
}: ListNotificationChannelParams) => {
    try {
        if (retry) await refreshAccessToken({ failureTask, errorTask })

        const res = await fetch(ENDPOINTS.LIST(listing), {
            method: 'GET',
            headers: buildHeaderJSON(false),
        })

        if (res.status === 401) {
            retry
                ? await reauthenticationStep(errorTask)
                : await listNotificationChannel({ retry: true, listing, successTask, failureTask, errorTask, forbiddenTask })
            return
        }

        if (res.status === 403) {
            forbiddenTask?.()
            return
        }

        if (res.status === 200) {
            const data: ListNotificationChannelResponse = await res.json();
            successTask(data)
        } else {
            failureTask()
        }
    } catch {
        errorTask()
    }
}