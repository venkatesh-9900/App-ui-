import { ENDPOINTS } from "@/config/config";
import { app_name } from "@/constants/constants";
import { reauthenticationStep, refreshAccessToken } from "@/hooks/auth-service";
import { buildHeaderJSON } from "@/utils/axios/auth-axios";
import { Api } from "@/types/operator";
import { BaseServiceParams } from "@/hooks/operator/operator-service-types";

export interface CreateApiParams extends BaseServiceParams {
    request: Partial<Api>;
}
export interface UpdateApiParams extends BaseServiceParams {
    id: number;
    request: Partial<Api>;
}
export interface DeleteApiParams extends BaseServiceParams {
    id: number;
}

export interface FetchApisParams extends BaseServiceParams {
    serviceId?: number;
    search?: string;
}

export const fetchApis = async ({ successTask, failureTask, errorTask, forbiddenTask, page, limit, serviceId, search, retry = false }: FetchApisParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }
        
        const queryParams = new URLSearchParams();
        if (page !== undefined) queryParams.append("page", (page - 1).toString());
        if (limit !== undefined) queryParams.append("limit", limit.toString());
        if (serviceId !== undefined) queryParams.append("service_id", serviceId.toString());
        if (search) queryParams.append("search", search);

        const url = queryParams.toString() 
            ? `${ENDPOINTS.OPERATOR.APIS}?${queryParams.toString()}`
            : ENDPOINTS.OPERATOR.APIS;

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(url, { method: 'GET', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await fetchApis({ retry: true, successTask, failureTask, errorTask, forbiddenTask, page, limit, serviceId, search });
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

export const fetchUnboundApis = async ({ successTask, failureTask, errorTask, forbiddenTask, page, limit, search, retry = false }: BaseServiceParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }

        const queryParams = new URLSearchParams();
        if (page !== undefined) queryParams.append("page", (page - 1).toString());
        if (limit !== undefined) queryParams.append("limit", limit.toString());
        if (search) queryParams.append("search", search);

        const url = queryParams.toString()
            ? `${ENDPOINTS.OPERATOR.UNBOUND_APIS}?${queryParams.toString()}`
            : ENDPOINTS.OPERATOR.UNBOUND_APIS;

        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(url, { method: 'GET', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await fetchUnboundApis({ retry: true, successTask, failureTask, errorTask, forbiddenTask, page, limit, search });
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

export const createApi = async ({ request, successTask, failureTask, errorTask, forbiddenTask, retry = false }: CreateApiParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }
        
        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(ENDPOINTS.OPERATOR.APIS, { 
            method: 'POST', 
            headers, 
            body: JSON.stringify(request) 
        });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await createApi({ retry: true, request, successTask, failureTask, errorTask, forbiddenTask });
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

export const updateApi = async ({ id, request, successTask, failureTask, errorTask, forbiddenTask, retry = false }: UpdateApiParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }
        
        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(`${ENDPOINTS.OPERATOR.APIS}?id=${id}`, { 
            method: 'PUT', 
            headers, 
            body: JSON.stringify(request) 
        });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await updateApi({ retry: true, id, request, successTask, failureTask, errorTask, forbiddenTask });
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

export const deleteApi = async ({ id, successTask, failureTask, errorTask, forbiddenTask, retry = false }: DeleteApiParams) => {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }
        
        const headers = { ...buildHeaderJSON(false), "x-app-name": app_name };
        const response = await fetch(`${ENDPOINTS.OPERATOR.APIS}?id=${id}`, { method: 'DELETE', headers });

        if (response.status === 401) {
            if (retry) {
                await reauthenticationStep(errorTask);
            } else {
                await deleteApi({ retry: true, id, successTask, failureTask, errorTask, forbiddenTask });
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
