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
    retry?: boolean;
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
    isActive: boolean;
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
    retry = false
}: CreateAddressActivityParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(ADDRESS_ACTIVITY_ENDPOINTS.CREATE, {
            method: 'POST',
            headers: buildHeaderJSON(false),
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
                    errorTask
                });
            }
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
    retry = false
}: BaseServiceParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(ADDRESS_ACTIVITY_ENDPOINTS.LIST, {
            method: 'GET',
            headers: buildHeaderJSON(false),
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
                    errorTask
                });
            }
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
                    errorTask
                });
            }
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
                    errorTask
                });
            }
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
    isActive,
    successTask,
    failureTask,
    errorTask,
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
            body: JSON.stringify({ is_active: isActive }),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await toggleAddressActivity({
                    retry: true,
                    id,
                    isActive,
                    successTask,
                    failureTask,
                    errorTask
                });
            }
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

