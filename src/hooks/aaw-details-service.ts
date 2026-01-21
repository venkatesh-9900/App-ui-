import { refreshAccessToken, reauthenticationStep } from '@/hooks/auth-service';
import { buildHeaderJSON } from '@/utils/axios/auth-axios';
import { getAawGroupedTransactionInfo, getAawTransactionDetails } from '@/types/aaw-details';

interface BaseServiceParams {
    successTask: (data: any) => void;
    failureTask: (duplicate?: boolean) => void;
    errorTask: () => void;
    retry?: boolean;
}

interface listFilterbyAAWDetails extends BaseServiceParams {
    watcher_id: number;
    start_cursor: string;
    end_cursor: string;
    filter_by: string
}

interface listTransactionDetailsAAW extends BaseServiceParams {
    watcher_id: number;
    start_cursor: string;
    end_cursor: string;
    filter_by: string;
    filter_value: string;
    page: number;
    limit: number;
}

const AAWDETAILS_ENDPOINTS = {
    GROUP_INFO: (watcherId: number, start_cursor: string, end_cursor: string, filter_by: string) => `/api/notifications/aaw-group-txn-details?watcher_id=${watcherId}&start_cursor=${start_cursor}&end_cursor=${end_cursor}&filter_by=${filter_by}`,
    TRSACTION_DETAILS: (watcherId: number, filter_by: string, filter_value: string, start_cursor: string, end_cursor: string, page: number, limit: number) => `/api/notifications/aaw-txn-details?watcher_id=${watcherId}&start_cursor=${start_cursor}&end_cursor=${end_cursor}&filter_by=${filter_by}&filter_value=${filter_value}&page=${page}&limit=${limit}`,
};



/**
 * List all address groups for the current user
 */
export const listAAWDetails = async ({
    watcher_id,
    start_cursor,
    end_cursor,
    filter_by,
    successTask,
    failureTask,
    errorTask,
    retry = false
}: listFilterbyAAWDetails) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(AAWDETAILS_ENDPOINTS.GROUP_INFO(watcher_id, start_cursor, end_cursor, filter_by), {
            method: 'GET',
            headers: buildHeaderJSON(false),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await listAAWDetails({
                    watcher_id,
                    start_cursor,
                    end_cursor,
                    filter_by,
                    retry: true,
                    successTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status === 200) {
            const data: getAawGroupedTransactionInfo = await response.json();
            successTask(data); // Replace with 'data' when backend is ready
        } else {
            console.error("Failed to list address groups with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to list address groups:", error);
        errorTask();
    }
};

export const listTransactionDetailsAAW = async ({
    watcher_id,
    start_cursor,
    end_cursor,
    filter_by,
    filter_value,
    page,
    limit,
    successTask,
    failureTask,
    errorTask,
    retry = false
}: listTransactionDetailsAAW) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(AAWDETAILS_ENDPOINTS.TRSACTION_DETAILS(watcher_id, filter_by, filter_value, start_cursor, end_cursor, page, limit), {
            method: 'GET',
            headers: buildHeaderJSON(false),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await listTransactionDetailsAAW({
                    watcher_id,
                    start_cursor,
                    end_cursor,
                    filter_by,
                    filter_value,
                    page,
                    limit,
                    retry: true,
                    successTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status === 200) {
            const data: getAawTransactionDetails = await response.json();
            successTask(data); // Replace with 'data' when backend is ready
        } else {
            console.error("Failed to list address groups with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to list address groups:", error);
        errorTask();
    }
};