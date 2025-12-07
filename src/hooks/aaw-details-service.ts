import { refreshAccessToken, reauthenticationStep } from '@/hooks/auth-service';
import { buildHeaderJSON } from '@/utils/axios/auth-axios';
import { AAWDetails, mockApiResponse } from '@/types/aaw-details';

interface BaseServiceParams {
    successTask: (data: any) => void;
    failureTask: (duplicate?: boolean) => void;
    errorTask: () => void;
    retry?: boolean;
}

interface listAAWDetailsQueryParams extends BaseServiceParams {
    watcher_id: number;
    start_cursor: number;
    end_cursor: number;
}

const AAWDETAILS_ENDPOINTS = {
    LIST: (watcherId: number, start_cursor: number, end_cursor: number) => `/api/monitoring/aaw-details?watcher_id=${watcherId}&start_cursor=${start_cursor}&end_cursor=${end_cursor}`,
};



/**
 * List all address groups for the current user
 */
export const listAAWDetails = async ({
    watcher_id,
    start_cursor,
    end_cursor,
    successTask,
    failureTask,
    errorTask,
    retry = false
}: listAAWDetailsQueryParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(AAWDETAILS_ENDPOINTS.LIST(watcher_id, start_cursor, end_cursor), {
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
                    retry: true,
                    successTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status === 200) {
            const data: AAWDetails = await response.json();
            successTask(mockApiResponse); // Replace with 'data' when backend is ready
        } else {
            successTask(mockApiResponse); // TODO: Remove this line when backend is ready
            // console.error("Failed to list address groups with status code:", response.status);
            // failureTask();
        }
    } catch (error) {
        successTask(mockApiResponse); // TODO: Remove this line when backend is ready
        console.error("Failed to list address groups:", error);
        // errorTask();
    }
};