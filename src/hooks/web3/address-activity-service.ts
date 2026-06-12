import { 
    CreateAddressActivityRequest, 
    AddressActivityResponse, 
    ListAddressActivitiesResponse,
    UpdateAddressActivityRequest,
    DeleteAddressActivityResponse 
} from '@/types/address-activity';
import { refreshAccessToken, reauthenticationStep } from '@/hooks/auth-service';
import { buildHeaderJSON } from '@/utils/axios/auth-axios';

interface BaseServiceParams {
    successTask: (data: any) => void;
    failureTask: () => void;
    errorTask: () => void;
    forbiddenTask?: () => void;
    retry?: boolean;
    groupId?: number;
}

interface CreateAddressActivityParams extends BaseServiceParams {
    request: CreateAddressActivityRequest;
}

interface UpdateAddressActivityParams extends BaseServiceParams {
    id: number;
    request: UpdateAddressActivityRequest;
}

interface DeleteAddressActivityParams extends BaseServiceParams {
    id: number;
}

interface ToggleAddressActivityParams extends BaseServiceParams {
    id: number;
    active: boolean;
}

const ADDRESS_ACTIVITY_ENDPOINTS = {
    CREATE: '/api/monitoring/address-activity',
    LIST: '/api/monitoring/address-activity',
    UPDATE: (id: number) => `/api/monitoring/address-activity?id=${id}`,
    DELETE: (id: number) => `/api/monitoring/address-activity?id=${id}`,
    TOGGLE: (id: number) => `/api/monitoring/address-activity?id=${id}`,
};

/**
 * Create a new address activity tracker
 */
export const createAddressActivity = async ({
    request,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false,
    groupId
}: CreateAddressActivityParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(ADDRESS_ACTIVITY_ENDPOINTS.CREATE, {
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
                await createAddressActivity({
                    retry: true,
                    request,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask,
                    groupId
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status === 201 || response.status === 200) {
            const data: AddressActivityResponse = await response.json();
            successTask(data);
        } else {
            console.error("Failed to create address activity with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to create address activity:", error);
        errorTask();
    }
};

/**
 * List all address activities for the current user
 */
export const listAddressActivities = async ({
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false,
    groupId
}: BaseServiceParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const url = ADDRESS_ACTIVITY_ENDPOINTS.LIST;

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
                await listAddressActivities({
                    retry: true,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask,
                    groupId
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status === 200) {
            const data: ListAddressActivitiesResponse = await response.json();
            successTask(data);
        } else {
            console.error("Failed to list address activities with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to list address activities:", error);
        errorTask();
    }
};

/**
 * Update an address activity tracker
 */
export const updateAddressActivity = async ({
    id,
    request,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false
}: UpdateAddressActivityParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(ADDRESS_ACTIVITY_ENDPOINTS.UPDATE(id), {
            method: 'PUT',
            headers: buildHeaderJSON(false),
            body: JSON.stringify(request),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await updateAddressActivity({
                    retry: true,
                    id,
                    request,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status === 200) {
            const data: AddressActivityResponse = await response.json();
            successTask(data);
        } else {
            console.error("Failed to update address activity with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to update address activity:", error);
        errorTask();
    }
};

/**
 * Delete an address activity tracker
 */
export const deleteAddressActivity = async ({
    id,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false
}: DeleteAddressActivityParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(ADDRESS_ACTIVITY_ENDPOINTS.DELETE(id), {
            method: 'DELETE',
            headers: buildHeaderJSON(false),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await deleteAddressActivity({
                    retry: true,
                    id,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status === 200) {
            const data: DeleteAddressActivityResponse = await response.json();
            successTask(data);
        } else {
            console.error("Failed to delete address activity with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to delete address activity:", error);
        errorTask();
    }
};

/**
 * Toggle an address activity tracker (activate/pause)
 */
export const toggleAddressActivity = async ({
    id,
    active,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false
}: ToggleAddressActivityParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(ADDRESS_ACTIVITY_ENDPOINTS.TOGGLE(id), {
            method: 'PUT',
            headers: buildHeaderJSON(false),
            body: JSON.stringify({ active: active }),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await toggleAddressActivity({
                    retry: true,
                    id,
                    active,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status === 200) {
            const data: AddressActivityResponse = await response.json();
            successTask(data);
        } else {
            console.error("Failed to toggle address activity with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to toggle address activity:", error);
        errorTask();
    }
};

