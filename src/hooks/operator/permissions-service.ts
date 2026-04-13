import { ENDPOINTS } from "@/config/config";
import { app_name } from "@/constants/constants";
import { reauthenticationStep, refreshAccessToken } from "@/hooks/auth-service";
import { buildHeaderJSON } from "@/utils/axios/auth-axios";
import { Permission } from "@/types/operator";
import { BaseServiceParams } from "@/hooks/operator/operator-service-types";

export interface CreatePermissionParams extends BaseServiceParams {
    request: Partial<Permission>;
}
export interface UpdatePermissionParams extends BaseServiceParams {
    id: number;
    request: Partial<Permission>;
}
export interface DeletePermissionParams extends BaseServiceParams {
    id: number;
}

export const fetchPermissions = async ({ successTask, failureTask, errorTask, forbiddenTask, page, limit, search, retry = false }: BaseServiceParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }
        
        const queryParams = new URLSearchParams();
        if (page !== undefined) queryParams.append("page", (page - 1).toString());
        if (limit !== undefined) queryParams.append("limit", limit.toString());
        if (search) queryParams.append("search", search);

        const url = queryParams.toString() 
            ? `${ENDPOINTS.OPERATOR.PERMISSIONS}?${queryParams.toString()}`
            : ENDPOINTS.OPERATOR.PERMISSIONS;

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(url, { method: 'GET', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await fetchPermissions({ retry: true, successTask, failureTask, errorTask, forbiddenTask, page, limit, search });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const createPermission = async ({ request, successTask, failureTask, errorTask, forbiddenTask, retry = false }: CreatePermissionParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }
        
        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(ENDPOINTS.OPERATOR.PERMISSIONS, { 
            method: 'POST', 
            headers, 
            body: JSON.stringify(request) 
        });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await createPermission({ retry: true, request, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data.data || data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const updatePermission = async ({ id, request, successTask, failureTask, errorTask, forbiddenTask, retry = false }: UpdatePermissionParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }
        
        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(`${ENDPOINTS.OPERATOR.PERMISSIONS}?id=${id}`, { 
            method: 'PUT', 
            headers, 
            body: JSON.stringify(request) 
        });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await updatePermission({ retry: true, id, request, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            const data = await response.json();
            successTask(data.data || data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const deletePermission = async ({ id, successTask, failureTask, errorTask, forbiddenTask, retry = false }: DeletePermissionParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }
        
        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(`${ENDPOINTS.OPERATOR.PERMISSIONS}?id=${id}`, { method: 'DELETE', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await deletePermission({ retry: true, id, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.ok) {
            successTask(null);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};
