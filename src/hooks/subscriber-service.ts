import {
    CreateSubscriberRequest,
    CreateSubscriberResponse,
    GetSubscriberResponse,
    UpdateSubscriberRequest,
    SearchSubscribersRequest,
    SearchSubscribersResponse,
    DeleteSubscriberResponse
} from "@/types/subscriber";
import { buildHeaderJSON } from "@/utils/axios/auth-axios";
import { refreshAccessToken, reauthenticationStep } from "@/hooks/auth-service";

// API Endpoints for subscriber management
const SUBSCRIBER_ENDPOINTS = {
    CREATE: '/api/subscribers',
    GET: (subscriberId: string) => `/api/subscribers/${encodeURIComponent(subscriberId)}`,
    UPDATE: (subscriberId: string) => `/api/subscribers/${encodeURIComponent(subscriberId)}`,
    DELETE: (subscriberId: string) => `/api/subscribers/${encodeURIComponent(subscriberId)}`,
    SEARCH: '/api/subscribers',
    GET_ME: '/api/subscribers/me',
};

interface BaseServiceParams {
    retry?: boolean;
    successTask: (data: any) => void;
    failureTask: () => void;
    errorTask: () => void;
}

interface CreateSubscriberParams extends BaseServiceParams {
    request: CreateSubscriberRequest;
}

interface GetSubscriberParams extends BaseServiceParams {
    subscriberId: string;
}

interface UpdateSubscriberParams extends BaseServiceParams {
    subscriberId: string;
    request: UpdateSubscriberRequest;
}

interface DeleteSubscriberParams extends BaseServiceParams {
    subscriberId: string;
}

interface SearchSubscribersParams extends BaseServiceParams {
    params?: SearchSubscribersRequest;
}

/**
 * Create a new subscriber with retry logic for 401 errors
 */
export const createSubscriber = async ({
    request,
    successTask,
    failureTask,
    errorTask,
    retry = false
}: CreateSubscriberParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(SUBSCRIBER_ENDPOINTS.CREATE, {
            method: 'POST',
            headers: buildHeaderJSON(false),
            body: JSON.stringify(request),
        });

        console.log(response);
        
        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await createSubscriber({
                    retry: true,
                    request,
                    successTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status === 201 || response.status === 200) {
            const data = await response.json();
            successTask(data);
        } else {
            console.error("Failed to create subscriber with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to create subscriber:", error);
        errorTask();
    }
};

/**
 * Retrieve a subscriber by ID with retry logic for 401 errors
 */
export const getSubscriber = async ({
    subscriberId,
    successTask,
    failureTask,
    errorTask,
    retry = false
}: GetSubscriberParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(SUBSCRIBER_ENDPOINTS.GET(subscriberId), {
            method: 'GET',
            headers: buildHeaderJSON(false),
        });

        console.log(response);
        
        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await getSubscriber({
                    retry: true,
                    subscriberId,
                    successTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status === 200) {
            const data = await response.json();
            successTask(data);
        } else {
            console.error("Failed to get subscriber with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to get subscriber:", error);
        errorTask();
    }
};

/**
 * Update an existing subscriber with retry logic for 401 errors
 */
export const updateSubscriber = async ({
    subscriberId,
    request,
    successTask,
    failureTask,
    errorTask,
    retry = false
}: UpdateSubscriberParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(SUBSCRIBER_ENDPOINTS.UPDATE(subscriberId), {
            method: 'PATCH',
            headers: buildHeaderJSON(false),
            body: JSON.stringify(request),
        });

        console.log(response);
        
        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await updateSubscriber({
                    retry: true,
                    subscriberId,
                    request,
                    successTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status === 200) {
            const data = await response.json();
            successTask(data);
        } else {
            console.error("Failed to update subscriber with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to update subscriber:", error);
        errorTask();
    }
};

/**
 * Delete a subscriber with retry logic for 401 errors
 */
export const deleteSubscriber = async ({
    subscriberId,
    successTask,
    failureTask,
    errorTask,
    retry = false
}: DeleteSubscriberParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(SUBSCRIBER_ENDPOINTS.DELETE(subscriberId), {
            method: 'DELETE',
            headers: buildHeaderJSON(false),
        });

        console.log(response);
        
        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await deleteSubscriber({
                    retry: true,
                    subscriberId,
                    successTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status === 200) {
            const data = await response.json();
            successTask(data);
        } else {
            console.error("Failed to delete subscriber with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to delete subscriber:", error);
        errorTask();
    }
};

/**
 * Search subscribers with pagination and retry logic for 401 errors
 */
export const searchSubscribers = async ({
    params,
    successTask,
    failureTask,
    errorTask,
    retry = false
}: SearchSubscribersParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const queryParams = new URLSearchParams();
        
        if (params?.page !== undefined) {
            queryParams.append('page', params.page.toString());
        }
        if (params?.limit !== undefined) {
            queryParams.append('limit', params.limit.toString());
        }
        if (params?.query) {
            queryParams.append('query', params.query);
        }

        const url = params && Object.keys(params).length > 0
            ? `${SUBSCRIBER_ENDPOINTS.SEARCH}?${queryParams.toString()}`
            : SUBSCRIBER_ENDPOINTS.SEARCH;

        const response = await fetch(url, {
            method: 'GET',
            headers: buildHeaderJSON(false),
        });

        console.log(response);
        
        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await searchSubscribers({
                    retry: true,
                    params,
                    successTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status === 200) {
            const data = await response.json();
            successTask(data);
        } else {
            console.error("Failed to search subscribers with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to search subscribers:", error);
        errorTask();
    }
};

/**
 * Get current user's subscriber(s) with retry logic for 401 errors
 */
export const getCurrentUserSubscriber = async ({
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

        const response = await fetch(SUBSCRIBER_ENDPOINTS.GET_ME, {
            method: 'GET',
            headers: buildHeaderJSON(false),
        });

        console.log(response);
        
        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await getCurrentUserSubscriber({
                    retry: true,
                    successTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status === 200) {
            const data = await response.json();
            successTask(data);
        } else {
            console.error("Failed to get current user subscriber with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to get current user subscriber:", error);
        errorTask();
    }
};
