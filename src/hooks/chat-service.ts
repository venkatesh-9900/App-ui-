import axiosAuthServices, {buildHeader} from "@/utils/axios/auth-axios";
import {ENDPOINTS} from "@/config/config";
import {FileDetails } from "@/types";
import { ChatSessions, ChatMessage, ChatGroup } from "@/types/chat-types";
import {extractAttachedFilesPublicLinks, extractRenderVizUrls} from "@/utils/utils";
import {reauthenticationStep, refreshAccessToken} from "@/hooks/auth-service";
import { app_name } from "@/constants/constants";
import { success } from "zod";
import { UpdateSessionTitle } from "@/types/chat-types";

interface ApiParams {
    retry?: boolean;
    iamGroupId?: number | null;
    successTask: (chat_sessions: ChatSessions[]) => void;
    failureTask: () => void;
    errorTask: () => void;
    forbiddenTask?: () => void;
}

interface GroupApiParams {
    retry?: boolean;
    iamGroupId?: number | null;
    successTask: (groups: ChatGroup[]) => void;
    failureTask: () => void;
    errorTask: () => void;
    forbiddenTask?: () => void;
}

interface ChatGroupSessionsParams {
    groupId: string;
    retry?: boolean;
    successTask: (sessions: ChatSessions[]) => void;
    failureTask: () => void;
    errorTask: () => void;
    forbiddenTask?: () => void;
}

interface CreateChatGroupParams{
    groupName: string;
    iamGroupId?: number | null;
    retry?: boolean;
    successTask: (groupId: string) => void;
    failureTask: () => void;
    errorTask: () => void;
    forbiddenTask?: () => void;
}

interface SessionDetailsParams {
    sessionId: string;
    retry?: boolean;
    successTask: (is_sharable: boolean, sharable_link: string) => void;
    failureTask: () => void;
    errorTask: () => void;
    forbiddenTask?: () => void;
}


interface fetchUserInteractionParams {
    retry?: boolean;
    sessionId: string;
    failureTask: () => void;
    errorTask: () => void;
    forbiddenTask?: () => void;
}

interface fetchCommonUserInteractionParams extends fetchUserInteractionParams {
    userid?: string | null;
}

interface fetchSharedUserInteractionParams extends fetchUserInteractionParams {
    userid: string;
}

interface removeChatParams {
    retry?: boolean;
    sessionId: string;
    successTask: () => void;
    failureTask: () => void;
    errorTask: () => void;
    forbiddenTask?: () => void;
    group_id?: string | null;
}

interface deleteGroupParams {
    retry?: boolean;
    groupId: string;
    successTask: () => void;
    failureTask: () => void;
    errorTask: () => void;
    forbiddenTask?: () => void;
}

interface moveChatToGroupParams {
    retry?: boolean;
    sessionId: string;
    groupId: string;
    successTask: () => void;
    failureTask: () => void;
    errorTask: () => void;
    forbiddenTask?: () => void;
}

interface toggleChatSharabilityParams {
    retry?: boolean;
    sessionId: string;
    isSharable: boolean;
    successTask: (chat_link?: string) => void;
    failureTask: () => void;
    errorTask: () => void;
    forbiddenTask?: () => void;
}

interface updateSessionTitleParams {
    retry?: boolean;
    request: UpdateSessionTitle
    successTask: () => void;
    failureTask: () => void;
    errorTask: () => void;
    forbiddenTask?: () => void;
}

export const fetchUserChatSessions = async ({successTask, failureTask, errorTask, forbiddenTask, iamGroupId, retry = false}: ApiParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({failureTask, errorTask});
        }
        const token = localStorage.getItem('access_token');
        const response = await fetch(ENDPOINTS.CHAT_SESSION, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'x-app-name': app_name,
                ...(iamGroupId != null ? { 'x-iam-group-id': String(iamGroupId) } : {})
            },
        });
        console.log(response);
        if (response.status == 401) {
            if (retry) {
                reauthenticationStep(errorTask);
            } else {
                await fetchUserChatSessions({
                    retry: true, 
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask,
                    iamGroupId
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status == 200) {
            const response_data = await response.json();
            const chat_sessions = response_data.data.sessions;
            console.log(chat_sessions);
            successTask(chat_sessions);
        } else {
            console.error("Failed to fetch chat sessions with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to fetch chat sessions:", error);
        errorTask();
    }
}

export const fetchSessionDetails = async ({sessionId, successTask, failureTask, errorTask, forbiddenTask, retry = false}: SessionDetailsParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({failureTask, errorTask});
        }
        const token = localStorage.getItem('access_token');
        const response = await fetch(ENDPOINTS.FETCH_SESSION_DETAILS, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'x-app-name': app_name,
                'x-session-id': sessionId
            },
        });
        console.log(response);
        if (response.status == 401) {
            if (retry) {
                reauthenticationStep(errorTask);
            } else {
                await fetchSessionDetails({
                    retry: true, 
                    sessionId,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status == 200) {
            const response_data = await response.json();
            const { data: session_details, errors: response_errors } = response_data;
            if (response_errors && response_errors.length > 0) {
                throw new Error(`Failed to load chat messages due to these error(s): ${response_errors.join(', ')}`); 
            }
            if (session_details) {
                if (session_details.is_sharable) {
                    successTask(session_details.is_sharable, session_details.sharable_link);
                } else {
                    successTask(session_details.is_sharable, "");
                }
            } else {
                failureTask();
            }
        } else {
            console.error("Failed to fetch chat sessions with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to fetch chat sessions:", error);
        errorTask();
    }
}

export async function loadChatMessages({sessionId, userid, failureTask, errorTask, forbiddenTask, retry = false}: fetchCommonUserInteractionParams): Promise<{ readonly: boolean, conversations: ChatMessage[] }> {
    try {
        
        const apiData = (userid == null || userid == undefined) ? await fetchChatMessages({sessionId, failureTask, errorTask, forbiddenTask}) : await fetchSharedUserInteraction({sessionId, userid, failureTask, errorTask, forbiddenTask});
        const { readonly, conversations: rawConversations } = apiData;

        // const mappedMessages: ChatMessage[] = await Promise.all(rawConversations.map(async (msg: ChatMessage) => {
        //     if (msg.author == "user") {
        //         // const { message: message, attachedFiles: attachmentsPublicURL } = extractAttachedFilesPublicLinks(msg.content);
        //         if (attachmentsPublicURL.length > 0) {
        //             const attachmentDetails = await getFileDetailsFromURL(attachmentsPublicURL, sessionId, userid, retry);
        //             return {
        //                 author: msg.author,
        //                 content: message,
        //                 timestamp: msg.timestamp,
        //                 attached: attachmentDetails
        //             };
        //         } else {
        //             return {
        //                 author: msg.author,
        //                 content: message,
        //                 timestamp: msg.timestamp,
        //                 attachments: []
        //             };
        //         }
        //     } else {
        //         return {
        //             author: msg.author,
        //             content: msg.content,
        //             timestamp: msg.timestamp,
        //             attachments: []
        //         }
        //     }
        // }));
        console.log(rawConversations);
        const finalChatList = rawConversations.filter((msg) => msg.author == "user" || msg.content.length > 0);
        return { readonly, conversations: finalChatList };
    } catch (error) {
        console.error(`Failed to load messages for chatId=${sessionId}`, error);
        return { readonly: true, conversations: [] };
    }
}

export async function fetchChatMessages({sessionId, failureTask, errorTask, forbiddenTask, retry = false}: fetchUserInteractionParams) : Promise<{ readonly: boolean, conversations: ChatMessage[] }> {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({failureTask, errorTask});
        }
        const access_token = localStorage.getItem('access_token');
        const response = await fetch(ENDPOINTS.CHAT_SESSION_MESSAGES, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
                'x-app-name': app_name,
                'x-session-id': sessionId
            },
        });
        console.log(response);
        if (response.status == 401) {
            if (retry) {
                reauthenticationStep(errorTask);
                return { readonly: true, conversations: [] };
            } else {
                return await fetchChatMessages({
                    sessionId,
                    failureTask,
                    errorTask,
                    forbiddenTask,
                    retry: true
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
            return { readonly: true, conversations: [] };
        } else if (response.status == 200) {
            const response_data = await response.json();
            const { data: chat_data, errors: response_errors } = response_data;
            if (response_errors && response_errors.length > 0) {
                throw new Error(`Failed to load chat messages due to these error(s): ${response_errors.join(', ')}`); 
            }
            return {
                readonly: chat_data.read_only,
                conversations: chat_data.conversations
            };
        } else {
            console.error("Failed to fetch chat sessions with status code:", response.status);
            failureTask();
            return { readonly: true, conversations: [] };
        }
    } catch (error) {
        console.error(`Failed to load messages for chatId=${sessionId}`, error);
        errorTask();
        return { readonly: true, conversations: [] };
    }
}

export async function fetchSharedUserInteraction({sessionId, failureTask, errorTask, forbiddenTask, retry = false, userid}: fetchSharedUserInteractionParams) : Promise<{ readonly: boolean, conversations: ChatMessage[] }> {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({failureTask, errorTask});
        }
        const access_token = localStorage.getItem('access_token');
        const response = await fetch(ENDPOINTS.SHARED_CHAT_SESSION_MESSAGES, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
                'x-app-name': app_name
            },
            body: JSON.stringify({
                session_id: sessionId,
                user_id: userid
            })
        });
        console.log(response);
        if (response.status == 401) {
            if (retry) {
                reauthenticationStep(errorTask);
                return { readonly: true, conversations: [] };
            } else {
                return await fetchSharedUserInteraction({
                    sessionId,
                    failureTask,
                    errorTask,
                    forbiddenTask,
                    retry: true,
                    userid
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
            return { readonly: true, conversations: [] };
        } else if (response.status == 200) {
            const response_data = await response.json();
            const { data: chat_data, errors: response_errors } = response_data;
            if (response_errors && response_errors.length > 0) {
                throw new Error(`Failed to load chat messages due to these error(s): ${response_errors.join(', ')}`); 
            }
            return {
                readonly: chat_data.read_only,
                conversations: chat_data.conversations
            };
        } else {
            console.error("Failed to fetch chat sessions with status code:", response.status);
            failureTask();
            return { readonly: true, conversations: [] };
        }
    } catch (error) {
        console.error(`Failed to load messages for chatId=${sessionId}`, error);
        errorTask();
        return { readonly: true, conversations: [] };
    }
}

export async function toggleChatSharability({sessionId, isSharable, successTask, failureTask, errorTask, forbiddenTask, retry = false}: toggleChatSharabilityParams) {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({failureTask, errorTask});
        }
        const access_token = localStorage.getItem('access_token');
        const response = await fetch(ENDPOINTS.TOGGLE_CHAT_SHARABILITY, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
                'x-app-name': app_name,
                'x-session-id': sessionId
            },
            body: JSON.stringify({ is_sharable: isSharable })
        });
        console.log(response);
        if (response.status == 401) {
            if (retry) {
                reauthenticationStep(errorTask);
            } else {
                await toggleChatSharability({
                    sessionId,
                    isSharable,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask,
                    retry: true
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status == 200) {
            const response_data = await response.json();
            const { status, sharable_link: sharable_link, errors: response_errors } = response_data;
            if (response_errors && response_errors.length > 0) {
                throw new Error(`Failed to toggle chat sharability due to these error(s): ${response_errors.join(', ')}`); 
            }
            if (status == "success") {
                if (isSharable) {
                    if (sharable_link) {
                        successTask(sharable_link);
                    } else {
                        failureTask();
                    }
                } else {
                    successTask();
                }
            } else {
                failureTask();
            }
        } else {
            console.error("Failed to toggle chat sharability with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error(`Failed to toggle chat sharability for chatId=${sessionId}`, error);
        errorTask();
    }
}

export async function getFileDetailsFromURL(urls: string[], session_id: string, user_id?: string | null, retry = false) : Promise<FileDetails[]> {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({
                failureTask: () => {
                    console.log("Failed to refresh token")
                }, 
                errorTask: () => {
                    console.log("Error encountered while refreshing token")
                }
            });
        }
        const access_token = localStorage.getItem('access_token');
        const payload = { 
            public_links: urls,
            session_id: session_id,
            ...(user_id ? { user_id: user_id } : {})
        };
        const response = await fetch(ENDPOINTS.GET_FILE_DETAILS_FROM_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
                'x-app-name': app_name
            },
            body: JSON.stringify(payload)
        });
        console.log(response);
        if (response.status == 401) {
            if (retry) {
                reauthenticationStep(() => {
                    console.log("Error encountered while fetching login URL");
                });
                return [];
            } else {
                return await getFileDetailsFromURL(urls, session_id, user_id, true);
            }
        } else if (response.status == 200) {
            const response_data = await response.json();
            const { file_details: file_details, errors: response_errors } = response_data;
            if (response_errors && response_errors.length > 0) {
                throw new Error(`Failed to get file details due to these error(s): ${response_errors.join(', ')}`); 
            }
            return file_details;
        } else {
            console.error("Failed to get file details with status code:", response.status);
            return [];
        }
    } catch (error) {
        console.error(`Failed to get file details`, error);
        return [];
    }
}

export async function checkIsSessionNew(sessionId: string): Promise<boolean> {
    try {
        const resp  = await axiosAuthServices.get(
            ENDPOINTS.IS_NEW_SESSION.replace('{sessionId}', sessionId),
            { headers: buildHeader(false) }
        );
        return resp.data.isNewSession === true;
    } catch (err) {
        console.error("Failed to check isNewSession for", sessionId, err);
        return false;
    }
}
/**
 * Delete a chat session by ID
 */
export async function removeChat({sessionId, successTask, failureTask, errorTask, forbiddenTask, retry = false, group_id = null} : removeChatParams) {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({failureTask, errorTask});
        }
        const access_token = localStorage.getItem('access_token');
        const response = await fetch(ENDPOINTS.DELETE_SESSION, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
                'x-app-name': app_name,
                'x-session-id': sessionId
            },
            ...(group_id ? { body: JSON.stringify({ group_id: group_id }) } : {})
        });
        console.log(response);
        if (response.status == 401) {
            if (retry) {
                reauthenticationStep(errorTask);
            } else {
                return await removeChat({
                    sessionId,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask,
                    retry: true,
                    group_id
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status == 200) {
            const response_data = await response.json();
            const { status: status, errors: response_errors } = response_data;
            if (status == "success") {
                successTask();
            } else {
                if (response_errors && response_errors.length > 0) {
                    throw new Error(`Failed to delete selected chat due to these error(s): ${response_errors.join(', ')}`); 
                }
                failureTask();
            }
        } else {
            console.error("Failed to fetch chat sessions with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error(`Failed to load messages for chatId=${sessionId}`, error);
        errorTask();
    }
}
/**
 * Archive a chat session by ID
 */
export async function archiveChat(chatId: string): Promise<void> {
    try {
        await axiosAuthServices.post(
            ENDPOINTS.ARCHIVE_SESSION.replace("{sessionId}", chatId),
            {},
            { headers: buildHeader(false) }
        );
    } catch (error) {
        console.error(`Failed to archive chat session: ${chatId}`, error);
        throw error;
    }
}
/**
 * Update title of a chat session
 */
export async function updateChatTitle({
    request,
    successTask,
    failureTask,
    errorTask,
    forbiddenTask,
    retry = false
}: updateSessionTitleParams) {

    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({ failureTask, errorTask });
        }

        const access_token = localStorage.getItem('access_token');

        const response = await fetch(ENDPOINTS.UPDATE_SESSION_TITLE, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
                'x-app-name': app_name
            },
            body: JSON.stringify(request) 
        });

        if (response.status === 401) {

            if (retry) {
                reauthenticationStep(errorTask);
            } else {
                return await updateChatTitle({
                    request,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask,
                    retry: true
                });
            }

        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status === 200) {
            const response_data = await response.json();
            successTask();
        } else {
            console.error("Failed to update chat title:", response.status);
            failureTask();
        }

    } catch (error) {

        console.error(error);
        errorTask();

    }
}

export const hasAnyVisualization = (messages: ChatMessage[]): boolean => {
    return messages.some((msg) => {
        const content = msg.content || '';
        const urls = extractRenderVizUrls(content);
        return urls.length > 0;
    });
};

export const getRenderVizUrls=(message: ChatMessage): string[] => {
    return extractRenderVizUrls(message.content || '');
}

export const getAllRenderVizUrls = (messages: ChatMessage[]): string[]  => {
    return messages.flatMap((message) => {
        return extractRenderVizUrls(message.content || '');
    });
}

export const hasAnyVisualizationInText = (message: ChatMessage): boolean => {
    const content = message.content || '';
    const urls = extractRenderVizUrls(content);
    return urls.length > 0;
};

export const fetchUserChatGroups = async ({successTask, failureTask, errorTask, forbiddenTask, iamGroupId, retry = false}: GroupApiParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({failureTask, errorTask});
        }
        const token = localStorage.getItem('access_token');
        const response = await fetch(ENDPOINTS.FETCH_ALL_GROUPS, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'x-app-name': app_name,
                ...(iamGroupId != null ? { 'x-iam-group-id': String(iamGroupId) } : {})
            },
        });
        console.log(response);
        if (response.status == 401) {
            if (retry) {
                reauthenticationStep(errorTask);
            } else {
                await fetchUserChatGroups({
                    retry: true,
                    iamGroupId,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status == 200) {
            const response_data = await response.json();
            if (response_data.errors && response_data.errors.length > 0) {
                throw new Error(`Failed to load chat groups due to these error(s): ${response_data.errors.join(', ')}`); 
            }
            const chat_groups = response_data.data.groups;
            console.log(chat_groups);
            successTask(chat_groups);
        } else {
            console.error("Failed to fetch chat sessions with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to fetch chat sessions:", error);
        errorTask();
    }
}

export const fetchChatGroupSessions = async ({ groupId, successTask, failureTask, errorTask, forbiddenTask, retry = false }: ChatGroupSessionsParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({failureTask, errorTask});
        }
        const token = localStorage.getItem('access_token');
        const payload = { group_id: groupId };
        const response = await fetch(ENDPOINTS.FETCH_GROUP_SESSIONS, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'x-app-name': app_name
            },
            body: JSON.stringify(payload)
        });
        console.log(response);
        if (response.status == 401) {
            if (retry) {
                reauthenticationStep(errorTask);
            } else {
                await fetchChatGroupSessions({
                    retry: true, 
                    groupId,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status == 200) {
            const response_data = await response.json();
            if (response_data.errors && response_data.errors.length > 0) {
                throw new Error(`Failed to load chat groups due to these error(s): ${response_data.errors.join(', ')}`); 
            }
            const group_sessions = response_data.data;
            console.log(group_sessions);
            successTask(group_sessions);
        } else {
            console.error("Failed to fetch chat sessions with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to fetch chat sessions:", error);
        errorTask();
    }
}

export const createChatGroup = async ({ groupName, iamGroupId, successTask, failureTask, errorTask, forbiddenTask, retry = false }: CreateChatGroupParams) => {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({failureTask, errorTask});
        }
        const token = localStorage.getItem('access_token');
        const payload = { group_name: groupName };
        const response = await fetch(ENDPOINTS.CREATE_GROUP, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'x-app-name': app_name,
                ...(iamGroupId != null ? { 'x-iam-group-id': String(iamGroupId) } : {})
            },
            body: JSON.stringify(payload)
        });
        console.log(response);
        if (response.status == 401) {
            if (retry) {
                reauthenticationStep(errorTask);
            } else {
                await createChatGroup({
                    retry: true,
                    groupName,
                    iamGroupId,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status == 200) {
            const response_data = await response.json();
            if (response_data.errors && response_data.errors.length > 0) {
                throw new Error(`Failed to load chat groups due to these error(s): ${response_data.errors.join(', ')}`); 
            }
            if (response_data.status == "success" && response_data.data) {
                successTask(response_data.data);
            } else {
                failureTask();
            }
        } else {
            console.error("Failed to fetch chat sessions with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to fetch chat sessions:", error);
        errorTask();
    }
}

export async function deleteGroup({groupId, successTask, failureTask, errorTask, forbiddenTask, retry = false} : deleteGroupParams) {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({failureTask, errorTask});
        }
        const access_token = localStorage.getItem('access_token');
        const payload = { group_id: groupId };
        const response = await fetch(ENDPOINTS.DELETE_GROUP, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
                'x-app-name': app_name
            },
            body: JSON.stringify(payload)
        });
        console.log(response);
        if (response.status == 401) {
            if (retry) {
                reauthenticationStep(errorTask);
            } else {
                return await deleteGroup({
                    groupId,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask,
                    retry: true
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status == 200) {
            const response_data = await response.json();
            const { status: status, errors: response_errors } = response_data;
            if (status == "success") {
                successTask();
            } else {
                if (response_errors && response_errors.length > 0) {
                    throw new Error(`Failed to delete selected group due to these error(s): ${response_errors.join(', ')}`); 
                }
                failureTask();
            }
        } else {
            console.error("Failed to fetch group sessions with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error(`Failed to load chat group sessions for groupId=${groupId}`, error);
        errorTask();
    }
}

export async function moveChatToGroup({ sessionId, groupId, successTask, failureTask, errorTask, forbiddenTask, retry = false }: moveChatToGroupParams) {
    try {
        if (retry) {
            await refreshAccessToken({ failureTask, errorTask });
        }
        const access_token = localStorage.getItem('access_token');
        const payload = { session_id: sessionId, group_id: groupId };
        const response = await fetch(ENDPOINTS.MOVE_SESSION_TO_GROUP, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
                'x-app-name': app_name
            },
            body: JSON.stringify(payload)
        });
        if (response.status == 401) {
            if (retry) {
                reauthenticationStep(errorTask);
            } else {
                return await moveChatToGroup({
                    sessionId,
                    groupId,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask,
                    retry: true
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status == 200) {
            const response_data = await response.json();
            const { status: status, errors: response_errors } = response_data;
            if (status == "success") {
                successTask();
            } else {
                if (response_errors && response_errors.length > 0) {
                    throw new Error(`Failed to move chat to group due to these error(s): ${response_errors.join(', ')}`);
                }
                failureTask();
            }
        } else {
            console.error("Failed to move chat to group with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error(`Failed to move chat sessionId=${sessionId} to groupId=${groupId}`, error);
        errorTask();
    }
}

// Schedule management functions

export interface ScheduleItem {
    id: number;
    type: string;
    status: string;
    cron?: string;
    on_datetime?: string;
    payload: unknown;
    created_at: string;
    updated_at: string;
    notification_workflow_id: number;
}

export interface ScheduleListResponse {
    schedules: ScheduleItem[];
    count: number;
}

interface FetchSchedulesParams {
    retry?: boolean;
    iamGroupId?: number | null;
    successTask: (schedules: ScheduleItem[]) => void;
    failureTask: () => void;
    errorTask: () => void;
    forbiddenTask?: () => void;
}

interface ScheduleActionParams {
    scheduleId: string;
    retry?: boolean;
    iamGroupId?: number | null;
    successTask: () => void;
    failureTask: (message?: string) => void;
    errorTask: () => void;
    forbiddenTask?: () => void;
}

/**
 * Extract schedule ID from a scheduled chat session ID
 * Session format: "scheduled-chat-{scheduleId}"
 */
export function extractScheduleId(sessionId: string): string | null {
    const match = sessionId.match(/^scheduled-chat-(\d+)$/);
    return match ? match[1] : null;
}

/**
 * Check if a session is a scheduled chat
 */
export function isScheduledChat(sessionId: string): boolean {
    return sessionId.includes("scheduled-chat");
}

/**
 * Schedule status constants
 */
export const SCHEDULE_STATUS = {
    PENDING: 'PENDING',
    RUNNING: 'RUNNING',
    PAUSED: 'PAUSED',
    PENDING_RESUME: 'PENDING_RESUME',
    COMPLETED: 'COMPLETED',
    DELETED: 'DELETED',
    PERMANENTLY_STOPPED: 'PERMANENTLY_STOPPED'
} as const;

/**
 * Check if a schedule can be paused (status is RUNNING or PENDING)
 */
export function canPauseSchedule(status: string): boolean {
    return status === SCHEDULE_STATUS.RUNNING || status === SCHEDULE_STATUS.PENDING;
}

/**
 * Check if a schedule can be resumed (status is PAUSED or PENDING_RESUME)
 */
export function canResumeSchedule(status: string): boolean {
    return status === SCHEDULE_STATUS.PAUSED || status === SCHEDULE_STATUS.PENDING_RESUME;
}

/**
 * Fetch all schedules for the current user
 */
export async function fetchUserSchedules({successTask, failureTask, errorTask, forbiddenTask, iamGroupId, retry = false}: FetchSchedulesParams) {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({failureTask, errorTask});
        }
        const access_token = localStorage.getItem('access_token');
        const response = await fetch(ENDPOINTS.SCHEDULE.LIST, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
                'x-app-name': app_name,
                ...(iamGroupId != null ? { 'x-iam-group-id': String(iamGroupId) } : {})
            }
        });
        console.log(response);
        if (response.status == 401) {
            if (retry) {
                reauthenticationStep(errorTask);
            } else {
                return await fetchUserSchedules({
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask,
                    iamGroupId,
                    retry: true
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status == 200) {
            const response_data: ScheduleListResponse = await response.json();
            successTask(response_data.schedules || []);
        } else {
            console.error("Failed to fetch schedules with status code:", response.status);
            failureTask();
        }
    } catch (error) {
        console.error("Failed to fetch schedules:", error);
        errorTask();
    }
}

/**
 * Pause a scheduled chat
 */
export async function pauseSchedule({scheduleId, iamGroupId, successTask, failureTask, errorTask, forbiddenTask, retry = false}: ScheduleActionParams) {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({failureTask: () => failureTask(), errorTask});
        }
        const access_token = localStorage.getItem('access_token');
        const response = await fetch(ENDPOINTS.SCHEDULE.TOGGLE(scheduleId, 'pause'), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
                'x-app-name': app_name,
                ...(iamGroupId != null ? { 'x-iam-group-id': String(iamGroupId) } : {})
            }
        });
        console.log(response);
        if (response.status == 401) {
            if (retry) {
                reauthenticationStep(errorTask);
            } else {
                return await pauseSchedule({
                    scheduleId,
                    iamGroupId,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask,
                    retry: true
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status == 200) {
            successTask();
        } else {
            const response_data = await response.json();
            console.error("Failed to pause schedule with status code:", response.status);
            failureTask(response_data?.error || "Failed to pause schedule");
        }
    } catch (error) {
        console.error(`Failed to pause schedule ${scheduleId}`, error);
        errorTask();
    }
}

/**
 * Resume a paused scheduled chat
 */
export async function resumeSchedule({scheduleId, iamGroupId, successTask, failureTask, errorTask, forbiddenTask, retry = false}: ScheduleActionParams) {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({failureTask: () => failureTask(), errorTask});
        }
        const access_token = localStorage.getItem('access_token');
        const response = await fetch(ENDPOINTS.SCHEDULE.TOGGLE(scheduleId, 'resume'), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
                'x-app-name': app_name,
                ...(iamGroupId != null ? { 'x-iam-group-id': String(iamGroupId) } : {})
            }
        });
        console.log(response);
        if (response.status == 401) {
            if (retry) {
                reauthenticationStep(errorTask);
            } else {
                return await resumeSchedule({
                    scheduleId,
                    iamGroupId,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask,
                    retry: true
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status == 200) {
            successTask();
        } else {
            const response_data = await response.json();
            console.error("Failed to resume schedule with status code:", response.status);
            failureTask(response_data?.error || "Failed to resume schedule");
        }
    } catch (error) {
        console.error(`Failed to resume schedule ${scheduleId}`, error);
        errorTask();
    }
}

/**
 * Delete a scheduled chat permanently
 */
export async function deleteSchedule({scheduleId, iamGroupId, successTask, failureTask, errorTask, forbiddenTask, retry = false}: ScheduleActionParams) {
    try {
        if (retry) {
            console.log("Refreshing access token");
            await refreshAccessToken({failureTask: () => failureTask(), errorTask});
        }
        const access_token = localStorage.getItem('access_token');
        const response = await fetch(ENDPOINTS.SCHEDULE.DELETE(scheduleId), {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
                'x-app-name': app_name,
                ...(iamGroupId != null ? { 'x-iam-group-id': String(iamGroupId) } : {})
            }
        });
        console.log(response);
        if (response.status == 401) {
            if (retry) {
                reauthenticationStep(errorTask);
            } else {
                return await deleteSchedule({
                    scheduleId,
                    iamGroupId,
                    successTask,
                    failureTask,
                    errorTask,
                    forbiddenTask,
                    retry: true
                });
            }
        } else if (response.status === 403) {
            forbiddenTask?.();
        } else if (response.status == 200) {
            successTask();
        } else {
            const response_data = await response.json();
            console.error("Failed to delete schedule with status code:", response.status);
            failureTask(response_data?.error || "Failed to delete schedule");
        }
    } catch (error) {
        console.error(`Failed to delete schedule ${scheduleId}`, error);
        errorTask();
    }
}