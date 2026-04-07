import { ENDPOINTS } from "@/config/config";
import { app_name } from "@/constants/constants";
import { reauthenticationStep, refreshAccessToken } from "@/hooks/auth-service";
import { buildHeaderJSON } from "@/utils/axios/auth-axios";
import { BaseServiceParams } from "@/hooks/operator/operator-service-types";

export interface CreateMappingParams extends BaseServiceParams {
    request: { api_id: number, permission_id: number };
}
export interface UpdateMappingParams extends BaseServiceParams {
    id: number;
    request: { api_id: number, permission_id: number };
}
export interface DeleteMappingParams extends BaseServiceParams {
    apiId: number;
    permissionId: number;
}

export const fetchMappings = async ({ successTask, failureTask, errorTask, page, limit, retry = false }: BaseServiceParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }
        
        const queryParams = new URLSearchParams();
        if (page !== undefined) queryParams.append("page", (page - 1).toString());
        if (limit !== undefined) queryParams.append("limit", limit.toString());

        const url = queryParams.toString() 
            ? `${ENDPOINTS.OPERATOR.MAPPINGS}?${queryParams.toString()}`
            : ENDPOINTS.OPERATOR.MAPPINGS;

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(url, { method: 'GET', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await fetchMappings({ retry: true, successTask, failureTask, errorTask, page, limit });
            }
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

export const createMapping = async ({ request, successTask, failureTask, errorTask, retry = false }: CreateMappingParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }
        
        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(ENDPOINTS.OPERATOR.MAPPINGS, { 
            method: 'POST', 
            headers, 
            body: JSON.stringify(request) 
        });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await createMapping({ retry: true, request, successTask, failureTask, errorTask });
            }
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

export const updateMapping = async ({ id, request, successTask, failureTask, errorTask, retry = false }: UpdateMappingParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }
        
        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(`${ENDPOINTS.OPERATOR.MAPPINGS}?id=${id}`, { 
            method: 'PUT', 
            headers, 
            body: JSON.stringify(request) 
        });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await updateMapping({ retry: true, id, request, successTask, failureTask, errorTask });
            }
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

export const deleteMapping = async ({ apiId, permissionId, successTask, failureTask, errorTask, retry = false }: DeleteMappingParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }
        
        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(`${ENDPOINTS.OPERATOR.MAPPINGS}?api_id=${apiId}&permission_id=${permissionId}`, { method: 'DELETE', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await deleteMapping({ retry: true, apiId, permissionId, successTask, failureTask, errorTask });
            }
        } else if (response.ok) {
            successTask(null);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};
