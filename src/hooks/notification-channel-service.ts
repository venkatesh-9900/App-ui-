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
}
interface ListNotificationChannelParams extends BaseServiceParams {
    novu_supported: boolean
}

const ENDPOINTS = {
    LIST: (novu_supported: boolean) => `/api/notification-channels?novu_supported=${novu_supported}`,
}

export const listNotificationChannel = async ({
    novu_supported,
    successTask,
    failureTask,
    errorTask,
    retry = false,
}: ListNotificationChannelParams) => {
    try {
        if (retry) await refreshAccessToken({ failureTask, errorTask })
      
        const res = await fetch(ENDPOINTS.LIST(novu_supported), {
            method: 'GET',
            headers: buildHeaderJSON(false),
        })

        if (res.status === 401) {
            retry
                ? await reauthenticationStep(errorTask)
                : await listNotificationChannel({ retry: true, novu_supported, successTask, failureTask, errorTask })
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