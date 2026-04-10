import { 
    CreateAddressActivityAirdropRequest, 
    AddressActivityAirdropResponse, 
    ListAddressAirdropActivitiesResponse,
    UpdateAddressActivityAirdropRequest,
    DeleteAddressActivityAirdropResponse 
} from '@/types/address-activity-airdrop';
import { refreshAccessToken, reauthenticationStep } from '@/hooks/auth-service';
import { buildHeaderJSON } from '@/utils/axios/auth-axios';

interface BaseServiceParams {
    successTask: (data: any) => void;
    failureTask: () => void;
    errorTask: () => void;
    forbiddenTask?: () => void;
    retry?: boolean;
}

interface CreateAddressActivityAirdropParams extends BaseServiceParams {
    request: CreateAddressActivityAirdropRequest;
}

interface UpdateAddressActivityAirdropParams extends BaseServiceParams {
    id: number;
    request: UpdateAddressActivityAirdropRequest;
}

interface DeleteAddressActivityAirdropParams extends BaseServiceParams {
    id: number;
}

interface ToggleAddressActivityAirdropParams extends BaseServiceParams {
    id: number;
    active: boolean;
}

const ADDRESS_ACTIVITY_AIRDROP_ENDPOINTS = {
    CREATE: '/api/monitoring/address-activity-airdrop',
    LIST: '/api/monitoring/address-activity-airdrop',
    UPDATE: (id: number) => `/api/monitoring/address-activity-airdrop?id=${id}`,
    DELETE: (id: number) => `/api/monitoring/address-activity-airdrop?id=${id}`,
    TOGGLE: (id: number) => `/api/monitoring/address-activity-airdrop?id=${id}`,
};

/**
 * Create a new address activity tracker
 */
export const createAddressActivityAirdrop = async ({
    request,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false
}: CreateAddressActivityAirdropParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(ADDRESS_ACTIVITY_AIRDROP_ENDPOINTS.CREATE, {
            method: 'POST',
            headers: buildHeaderJSON(false),
            body: JSON.stringify(request),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await createAddressActivityAirdrop({
                    retry: true,
                    request,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status === 201 || response.status === 200) { 
            const data: AddressActivityAirdropResponse = await response.json();
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
export const listAddressAirdropActivities = async ({
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false
}: BaseServiceParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(ADDRESS_ACTIVITY_AIRDROP_ENDPOINTS.LIST, {
            method: 'GET',
            headers: buildHeaderJSON(false),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await listAddressAirdropActivities({
                    retry: true,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status === 200) {
            const data: ListAddressAirdropActivitiesResponse = await response.json();
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
export const updateAddressActivityAirdrop = async ({
    id,
    request,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false
}: UpdateAddressActivityAirdropParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(ADDRESS_ACTIVITY_AIRDROP_ENDPOINTS.UPDATE(id), {
            method: 'PUT',
            headers: buildHeaderJSON(false),
            body: JSON.stringify(request),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await updateAddressActivityAirdrop({
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
            const data: AddressActivityAirdropResponse = await response.json();
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
export const deleteAddressActivityAirdrop = async ({
    id,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false
}: DeleteAddressActivityAirdropParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(ADDRESS_ACTIVITY_AIRDROP_ENDPOINTS.DELETE(id), {
            method: 'DELETE',
            headers: buildHeaderJSON(false),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await deleteAddressActivityAirdrop({
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
            const data: DeleteAddressActivityAirdropResponse = await response.json();
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
export const toggleAddressActivityAirdrop = async ({
    id,
    active,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false
}: ToggleAddressActivityAirdropParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(ADDRESS_ACTIVITY_AIRDROP_ENDPOINTS.TOGGLE(id), {
            method: 'PUT',
            headers: buildHeaderJSON(false),
            body: JSON.stringify({ active: active }),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await toggleAddressActivityAirdrop({
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
            const data: AddressActivityAirdropResponse = await response.json();
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

