import { CreateTopicRequest, UpdateTopicRequest, TopicResponse, ListTopicsResponse, DeleteTopicResponse } from '@/types/topic';
import { refreshAccessToken, reauthenticationStep } from '@/hooks/auth-service';
import { buildHeaderJSON } from '@/utils/axios/auth-axios';

interface BaseServiceParams {
    successTask: (data: any) => void;
    failureTask: () => void;
    errorTask: () => void;
    retry?: boolean;
}

interface CreateTopicParams extends BaseServiceParams {
    request: CreateTopicRequest;
}

interface UpdateTopicParams extends BaseServiceParams {
    id: number;
    request: UpdateTopicRequest;
}

interface DeleteTopicParams extends BaseServiceParams {
    id: number;
}

interface GetTopicParams extends BaseServiceParams {
    topicKey: string;
}

interface ListTopicsParams extends BaseServiceParams {
    page?: number;
    pageSize?: number
}

interface AddSubscriptionsParams extends BaseServiceParams {
    topicKey: string;
    subscriberIds: string[];
}

interface RemoveSubscriptionsParams extends BaseServiceParams {
    topicKey: string;
    subscriberIds: string[];
}

interface ListSubscriptionsParams extends BaseServiceParams {
    topicKey: string;
}

const TOPIC_ENDPOINTS = {
    CREATE: '/api/topics',
    GET: (topicKey: string) => `/api/topics/retrieve?topicKey=${encodeURIComponent(topicKey)}`,
    UPDATE: (id: number) => `/api/topics/update?id=${encodeURIComponent(id)}`,
    DELETE: (id: number) => `/api/topics/delete?id=${encodeURIComponent(id)}`,
    LIST: '/api/topics',
    ADD_SUBSCRIPTIONS: (topicKey: string) => `/api/topics/subscriptions/create?topicKey=${encodeURIComponent(topicKey)}`,
    REMOVE_SUBSCRIPTIONS: (topicKey: string) => `/api/topics/subscriptions/delete?topicKey=${encodeURIComponent(topicKey)}`,
    LIST_SUBSCRIPTIONS: (topicKey: string) => `/api/topics/subscriptions?topicKey=${encodeURIComponent(topicKey)}`,
};

/**
 * Create a new topic/group
 */
export const createTopic = async ({
    request,
    successTask,
    failureTask,
    errorTask,
    retry = false
}: CreateTopicParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(TOPIC_ENDPOINTS.CREATE, {
            method: 'POST',
            headers: buildHeaderJSON(false),
            body: JSON.stringify(request),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await createTopic({
                    retry: true,
                    request,
                    successTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status === 201 || response.status === 200) {
            const data: TopicResponse = await response.json();
            successTask(data);
        } else {
            console.error("Failed to create topic with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to create topic:", error);
        errorTask();
    }
};

/**
 * Get a topic by key
 */
export const getTopic = async ({
    topicKey,
    successTask,
    failureTask,
    errorTask,
    retry = false
}: GetTopicParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(TOPIC_ENDPOINTS.GET(topicKey), {
            method: 'GET',
            headers: buildHeaderJSON(false),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await getTopic({
                    retry: true,
                    topicKey,
                    successTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status === 200) {
            const data: TopicResponse = await response.json();
            successTask(data);
        } else {
            console.error("Failed to get topic with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to get topic:", error);
        errorTask();
    }
};

/**
 * Update a topic
 */
export const updateTopic = async ({
    id,
    request,
    successTask,
    failureTask,
    errorTask,
    retry = false
}: UpdateTopicParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(TOPIC_ENDPOINTS.UPDATE(id), {
            method: 'PATCH',
            headers: buildHeaderJSON(false),
            body: JSON.stringify(request),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await updateTopic({
                    retry: true,
                    id,
                    request,
                    successTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status === 200) {
            const data: TopicResponse = await response.json();
            successTask(data);
        } else {
            console.error("Failed to update topic with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to update topic:", error);
        errorTask();
    }
};

/**
 * Delete a topic
 */
export const deleteTopic = async ({
    id,
    successTask,
    failureTask,
    errorTask,
    retry = false
}: DeleteTopicParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(TOPIC_ENDPOINTS.DELETE(id), {
            method: 'DELETE',
            headers: buildHeaderJSON(false),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await deleteTopic({
                    retry: true,
                    id,
                    successTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status === 200) {
            const data: DeleteTopicResponse = await response.json();
            successTask(data);
        } else {
            console.error("Failed to delete topic with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to delete topic:", error);
        errorTask();
    }
};

/**
 * List all topics with optional filtering and pagination
 */
export const listTopics = async ({
    page,
    pageSize,
    successTask,
    failureTask,
    errorTask,
    retry = false
}: ListTopicsParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (pageSize) params.append('pageSize', pageSize.toString());

        const url = `${TOPIC_ENDPOINTS.LIST}${params.toString() ? '?' + params.toString() : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: buildHeaderJSON(false),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await listTopics({
                    retry: true,
                    page,
                    pageSize,
                    successTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status === 200) {
            const data: ListTopicsResponse = await response.json();
            successTask(data);
        } else {
            console.error("Failed to list topics with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to list topics:", error);
        errorTask();
    }
};

/**
 * Add subscribers to a topic/group
 */
export const addSubscriptionsToTopic = async ({
    topicKey,
    subscriberIds,
    successTask,
    failureTask,
    errorTask,
    retry = false
}: AddSubscriptionsParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(TOPIC_ENDPOINTS.ADD_SUBSCRIPTIONS(topicKey), {
            method: 'POST',
            headers: buildHeaderJSON(false),
            body: JSON.stringify({ subscriberIds }),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await addSubscriptionsToTopic({
                    retry: true,
                    topicKey,
                    subscriberIds,
                    successTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status === 201 || response.status === 200) {
            const data = await response.json();
            successTask(data);
        } else {
            console.error("Failed to add subscriptions to topic with status code:", response.status);
            failureTask();
        }
    } catch (error) {
            console.error("Failed to add subscriptions to topic:", error);
        errorTask();
    }
};

/**
 * List subscriptions for a topic/group
 */
export const listTopicSubscriptions = async ({
    topicKey,
    successTask,
    failureTask,
    errorTask,
    retry = false
}: ListSubscriptionsParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(TOPIC_ENDPOINTS.LIST_SUBSCRIPTIONS(topicKey), {
            method: 'GET',
            headers: buildHeaderJSON(false),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await listTopicSubscriptions({
                    retry: true,
                    topicKey,
                    successTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status === 200) {
            const data = await response.json();
            successTask(data);
        } else {
            console.error("Failed to list topic subscriptions with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to list topic subscriptions:", error);
        errorTask();
    }
};

/**
 * Remove subscribers from a topic/group
 */
export const removeSubscriptionsFromTopic = async ({
    topicKey,
    subscriberIds,
    successTask,
    failureTask,
    errorTask,
    retry = false
}: RemoveSubscriptionsParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const response = await fetch(TOPIC_ENDPOINTS.REMOVE_SUBSCRIPTIONS(topicKey), {
            method: 'DELETE',
            headers: buildHeaderJSON(false),
            body: JSON.stringify({ subscriberIds }),
        });

        if (response.status === 401) {
            if (retry) {
                console.log("Redirecting to login page");
                await reauthenticationStep(errorTask);
            } else {
                await removeSubscriptionsFromTopic({
                    retry: true,
                    topicKey,
                    subscriberIds,
                    successTask,
                    failureTask,
                    errorTask
                });
            }
        } else if (response.status === 200 || response.status === 204) {
            const data = response.status === 200 ? await response.json() : { message: 'Success' };
            successTask(data);
        } else {
            console.error("Failed to remove subscriptions from topic with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to remove subscriptions from topic:", error);
        errorTask();
    }
};

