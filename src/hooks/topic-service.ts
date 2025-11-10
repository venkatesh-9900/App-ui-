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
    topicKey: string;
    request: UpdateTopicRequest;
}

interface DeleteTopicParams extends BaseServiceParams {
    topicKey: string;
}

interface GetTopicParams extends BaseServiceParams {
    topicKey: string;
}

interface ListTopicsParams extends BaseServiceParams {
    page?: number;
    pageSize?: number;
    key?: string;
}

const TOPIC_ENDPOINTS = {
    CREATE: '/api/topics',
    GET: (topicKey: string) => `/api/topics/${encodeURIComponent(topicKey)}`,
    UPDATE: (topicKey: string) => `/api/topics/${encodeURIComponent(topicKey)}`,
    DELETE: (topicKey: string) => `/api/topics/${encodeURIComponent(topicKey)}`,
    LIST: '/api/topics',
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
    topicKey,
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

        const response = await fetch(TOPIC_ENDPOINTS.UPDATE(topicKey), {
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
                    topicKey,
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
    topicKey,
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

        const response = await fetch(TOPIC_ENDPOINTS.DELETE(topicKey), {
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
                    topicKey,
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
    key,
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
        if (key) params.append('key', key);

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
                    key,
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

