import {
   unsubscribeScheduleResponse
} from '@/types/schedule'
import { refreshAccessToken, reauthenticationStep } from '@/hooks/auth-service'
import { buildHeaderJSON } from '@/utils/axios/auth-axios'

interface BaseServiceParams {
    successTask: (data: any) => void;
    failureTask: () => void;
    errorTask: () => void;
    retry?: boolean;
}

interface UnSubscribeNotificationChannelInstanceParams extends BaseServiceParams {
    id: number;
}

const ENDPOINTS = {
    UNSUBSCRIBE: (id: number) => `/api/schedules/unsubscribe?scheduleId=${id}`,
}

/* Unsubscribe */
export const unsubscribeSchedule = async ({
    id,
    successTask,
    failureTask,
    errorTask,
    retry = false,
}: UnSubscribeNotificationChannelInstanceParams) => {
    try {
        if (retry) await refreshAccessToken({ failureTask, errorTask })

        const res = await fetch(ENDPOINTS.UNSUBSCRIBE(id), {
            method: 'PATCH',
            headers: buildHeaderJSON(false),
        })

        if (res.status === 401) {
            retry
                ? await reauthenticationStep(errorTask)
                : await unsubscribeSchedule({ retry: true, id, successTask, failureTask, errorTask })
            return
        }

        if (res.status === 200) {
            const data: unsubscribeScheduleResponse = await res.json();
            successTask(data)
        } else {
            failureTask()
        }
    } catch {
        errorTask()
    }
}