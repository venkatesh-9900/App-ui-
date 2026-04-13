import { ENDPOINTS } from "@/config/config";
import { app_name } from "@/constants/constants";
import { reauthenticationStep, refreshAccessToken } from "@/hooks/auth-service";
import { buildHeaderJSON } from "@/utils/axios/auth-axios";
import { ApiService } from "@/types/operator";
import { BaseServiceParams } from "@/hooks/operator/operator-service-types";

export interface CreateApiServiceParams extends BaseServiceParams {
    request: Partial<ApiService>;
}
export interface UpdateApiServiceParams extends BaseServiceParams {
    id: number;
    request: Partial<ApiService>;
}
export interface DeleteApiServiceParams extends BaseServiceParams {
    id: number;
}

export const fetchApiServices = async ({ successTask, failureTask, errorTask, forbiddenTask, page, limit, search, retry = false }: BaseServiceParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }
        
        const queryParams = new URLSearchParams();
        if (page !== undefined) queryParams.append("page", (page - 1).toString());
        if (limit !== undefined) queryParams.append("limit", limit.toString());
        if (search) queryParams.append("search", search);
        
        const url = queryParams.toString() 
            ? `${ENDPOINTS.OPERATOR.SERVICES}?${queryParams.toString()}`
            : ENDPOINTS.OPERATOR.SERVICES;

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(url, { method: 'GET', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await fetchApiServices({ retry: true, successTask, failureTask, errorTask, forbiddenTask, page, limit, search });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status === 200 || response.ok) {
            const data = await response.json();
            successTask(data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const createApiService = async ({ request, successTask, failureTask, errorTask, forbiddenTask, retry = false }: CreateApiServiceParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }
        
        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(ENDPOINTS.OPERATOR.SERVICES, { 
            method: 'POST', 
            headers, 
            body: JSON.stringify(request) 
        });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await createApiService({ retry: true, request, successTask, failureTask, errorTask, forbiddenTask });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status === 201 || response.ok) {
            const data = await response.json();
            successTask(data.data || data);
        } else {
            failureTask();
        }
    } catch (error) {
        errorTask();
    }
};

export const updateApiService = async ({ id, request, successTask, failureTask, errorTask, forbiddenTask, retry = false }: UpdateApiServiceParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }
        
        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(`${ENDPOINTS.OPERATOR.SERVICES}?id=${id}`, { 
            method: 'PUT', 
            headers, 
            body: JSON.stringify(request) 
        });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await updateApiService({ retry: true, id, request, successTask, failureTask, errorTask, forbiddenTask });
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

export const deleteApiService = async ({ id, successTask, failureTask, errorTask, forbiddenTask, retry = false }: DeleteApiServiceParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }
        
        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(`${ENDPOINTS.OPERATOR.SERVICES}?id=${id}`, { method: 'DELETE', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await deleteApiService({ retry: true, id, successTask, failureTask, errorTask, forbiddenTask });
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
