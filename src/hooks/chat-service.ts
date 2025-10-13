
import axiosAuthServices, {buildHeader} from "@/utils/axios/auth-axios.ts";
import {ENDPOINTS} from "@/config/config.ts";
import {Chat, ChatMessage, ChatSessions, FileDetails, Message, MessageContent } from "@/types";
import {extractAttachedFilesPublicLinks, extractRenderVizUrls, getTextWithoutReasoning} from "@/utils/utils.ts";
import {fetchLoginURL, reauthenticationStep, refreshAccessToken} from "@/hooks/auth-service.ts";
import {iam_login_url} from "@/constants/iam-uri.tsx";
import {buildHeaderJSON} from "@/utils/axios/auth-axios.ts";
import { app_name } from "@/constants/constants";

interface ApiParams {
    retry?: boolean;
    successTask: (chat_sessions: ChatSessions[]) => void;
    failureTask: () => void;
    errorTask: () => void;
}

interface SessionDetailsParams {
    sessionId: string;
    retry?: boolean;
    successTask: (is_sharable: boolean, sharable_link: string) => void;
    failureTask: () => void;
    errorTask: () => void;
}


interface fetchUserInteractionParams {
    retry?: boolean;
    sessionId: string;
    failureTask: () => void;
    errorTask: () => void;
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
}

interface toggleChatSharabilityParams {
    retry?: boolean;
    sessionId: string;
    isSharable: boolean;
    successTask: (chat_link?: string) => void;
    failureTask: () => void;
    errorTask: () => void;
}

export const fetchUserChatSessions = async ({successTask, failureTask, errorTask, retry = false}: ApiParams) => {
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
                'x-app-name': app_name
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
                    errorTask
                });
            }
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

export const fetchSessionDetails = async ({sessionId, successTask, failureTask, errorTask, retry = false}: SessionDetailsParams) => {
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
                    errorTask
                });
            }
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

export async function loadChatMessages({sessionId, userid, failureTask, errorTask, retry = false}: fetchCommonUserInteractionParams): Promise<{ readonly: boolean, conversations: ChatMessage[] }> {
    try {
        
        const apiData = (userid == null || userid == undefined) ? await fetchChatMessages({sessionId, failureTask, errorTask}) : await fetchSharedUserInteraction({sessionId, userid, failureTask, errorTask});
        const { readonly, conversations: rawConversations } = apiData;

        const mappedMessages: ChatMessage[] = await Promise.all(rawConversations.map(async (msg: ChatMessage) => {
            if (msg.author == "user") {
                const { message: message, attachedFiles: attachmentsPublicURL } = extractAttachedFilesPublicLinks(msg.content);
                if (attachmentsPublicURL.length > 0) {
                    const attachmentDetails = await getFileDetailsFromURL(attachmentsPublicURL, sessionId, userid, retry);
                    return {
                        author: msg.author,
                        content: message,
                        timestamp: msg.timestamp,
                        attachments: attachmentDetails
                    };
                } else {
                    return {
                        author: msg.author,
                        content: message,
                        timestamp: msg.timestamp,
                        attachments: []
                    };
                }
            } else {
                return {
                    author: msg.author,
                    content: msg.content,
                    timestamp: msg.timestamp,
                    attachments: []
                }
            }
        }));
        console.log(mappedMessages);
        const finalChatList = mappedMessages.filter((msg) => msg.author == "user" || msg.content.length > 0);
        return { readonly, conversations: finalChatList };
    } catch (error) {
        console.error(`Failed to load messages for chatId=${sessionId}`, error);
        return { readonly: true, conversations: [] };
    }
}

export async function fetchChatMessages({sessionId, failureTask, errorTask, retry = false}: fetchUserInteractionParams) : Promise<{ readonly: boolean, conversations: ChatMessage[] }> {
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
                    retry: true
                });
            }
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

export async function fetchSharedUserInteraction({sessionId, failureTask, errorTask, retry = false, userid}: fetchSharedUserInteractionParams) : Promise<{ readonly: boolean, conversations: ChatMessage[] }> {
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
                    retry: true,
                    userid
                });
            }
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

export async function toggleChatSharability({sessionId, isSharable, successTask, failureTask, errorTask, retry = false}: toggleChatSharabilityParams) {
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
                    retry: true
                });
            }
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
export async function removeChat({sessionId, successTask, failureTask, errorTask, retry = false} : removeChatParams) {
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
                    retry: true
                });
            }
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
export async function updateChatTitle(chatId: string, title: string): Promise<void> {
    try {
        await axiosAuthServices.post(
            ENDPOINTS.UPDATE_SESSION_TITLE.replace("{sessionId}", chatId),
            { title },
            { headers: buildHeader(false) }
        );
    } catch (error) {
        console.error(`Failed to update title for chat: ${chatId}`, error);
        throw error;
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