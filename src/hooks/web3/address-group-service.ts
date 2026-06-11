import { 
    CreateAddressGroupRequest, 
    AddressGroupResponse, 
    ListAddressGroupsResponse,
    UpdateAddressGroupRequest,
    DeleteAddressGroupResponse 
} from '@/types/address-group';
import { refreshAccessToken, reauthenticationStep } from '@/hooks/auth-service';
import { buildHeaderJSON } from '@/utils/axios/auth-axios';

interface BaseServiceParams {
    successTask: (data: any) => void;
    failureTask: (duplicate?: boolean) => void;
    errorTask: () => void;
    forbiddenTask?: () => void;
    retry?: boolean;
    groupId?: number;
}

interface CreateAddressGroupParams extends BaseServiceParams {
    request: CreateAddressGroupRequest;
}

interface UpdateAddressGroupParams extends BaseServiceParams {
    id: number;
    request: UpdateAddressGroupRequest;
}

interface DeleteAddressGroupParams extends BaseServiceParams {
    id: number;
}

const ADDRESS_GROUP_ENDPOINTS = {
    CREATE: '/api/monitoring/address-group',
    LIST: '/api/monitoring/address-group',
    UPDATE: (id: number) => `/api/monitoring/address-group?id=${id}`,
    DELETE: (id: number) => `/api/monitoring/address-group?id=${id}`,
};

/**
 * Create a new address group
 */
export const createAddressGroup = async ({
    request,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false,
    groupId
}: CreateAddressGroupParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }
        
        const response = await fetch(ADDRESS_GROUP_ENDPOINTS.CREATE, {
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
                await createAddressGroup({
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
            const data: AddressGroupResponse = await response.json();
            successTask(data);
        } else if (response.status === 409) {
            console.log("Name conflict detected while listing address groups.");
            failureTask(true);
        } else {
            console.error("Failed to create address group with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to create address group:", error);
        errorTask();
    }
};

/**
 * List all address groups for the current user
 */
export const listAddressGroups = async ({
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

        const url = ADDRESS_GROUP_ENDPOINTS.LIST;

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
                await listAddressGroups({
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
            const data: ListAddressGroupsResponse = await response.json();
            successTask(data);
        } else {
            console.error("Failed to list address groups with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to list address groups:", error);
        errorTask();
    }
};

/**
 * Update an address group
 */
export const updateAddressGroup = async ({
    id,
    request,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false
}: UpdateAddressGroupParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(ADDRESS_GROUP_ENDPOINTS.UPDATE(id), {
            method: 'PUT',
            headers: buildHeaderJSON(false),
            body: JSON.stringify(request),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await updateAddressGroup({
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
            const data: AddressGroupResponse = await response.json();
            successTask(data);
        } else if (response.status === 409) {
            console.log("Name conflict detected while listing address groups.");
            failureTask(true);
        } else {
            console.error("Failed to update address group with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to update address group:", error);
        errorTask();
    }
};

/**
 * Delete an address group
 */
export const deleteAddressGroup = async ({
    id,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false
}: DeleteAddressGroupParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(ADDRESS_GROUP_ENDPOINTS.DELETE(id), {
            method: 'DELETE',
            headers: buildHeaderJSON(false),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await deleteAddressGroup({
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
            const data: DeleteAddressGroupResponse = await response.json();
            successTask(data);
        } else {
            console.error("Failed to delete address group with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to delete address group   :", error);
        errorTask();
    }
};