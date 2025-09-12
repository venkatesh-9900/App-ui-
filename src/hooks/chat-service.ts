
import axiosAuthServices, {buildHeader} from "@/utils/axios/auth-axios.ts";
import {ENDPOINTS} from "@/config/config.ts";
import {Chat, Message, MessageContent } from "@/types";
import {extractRenderVizUrls} from "@/utils/utils.ts";

export const fetchUserChatSessions = async (): Promise<Chat[]> => {
    try {
        const response = await axiosAuthServices.get(ENDPOINTS.CHAT_SESSION, {
            headers: buildHeader(false),
        });

        const rawSessions = response.data?.data || [];
        const visible = rawSessions.filter(
            (s: any) => typeof s.title === "string" && s.title.trim().length > 0
        );
        return visible.map((session: any) => ({
            id: session.sessionId,
            title: session.title,
            createdAt: new Date(session.createdAt),
            messages: [], // default empty, lazy-loaded
        }));
    } catch (error) {
        console.error("Failed to fetch chat sessions:", error);
        return [];
    }
};

export async function loadChatMessages(chatId: string): Promise<{ title: string; messages: Message[] }> {
    try {
        const apiData = await fetchChatMessages(chatId);
        const { title, messages: rawMessages } = apiData;

        const mappedMessages: Message[] = rawMessages.map((msg: any) => {
            const isUser = msg.role === 'user';
            let content: MessageContent = { summary: '' };
            if (isUser && msg.content?.query) {
                content = { summary: msg.content.query, type: 'text' };
            } else if (!isUser) {
                const {
                    recommendation,
                    code,
                    language,
                    chartData,
                    chartType,
                    tableData,
                    columns,
                    fileType,
                    fileExtension,
                    showDownload,
                    image,
                    commands,
                    visualizationUrls,
                    html,
                } = msg.content || {};

                content = {
                    summary: recommendation || '',
                    type: 'text', // default fallback
                    code,
                    language,
                    chartData,
                    chartType,
                    tableData,
                    columns,
                    fileType,
                    fileExtension,
                    showDownload,
                    image,
                    commands,
                    isCommandSuggestion: !!commands?.length,
                    visualizationUrls,
                    html,
                };
                if (msg.visualizationUrls?.length) {
                    content.visualizationUrls = msg.visualizationUrls;
                }
                // Dynamically assign a better type
                if (code) content.type = 'code';
                else if (chartData) content.type = 'chart';
                else if (tableData) content.type = 'table';
                else if (image) content.type = 'image';
                else if (visualizationUrls?.length) content.type = 'visualization';
                else if (commands?.length) content.type = 'command';
            }
            return {
                id: msg.messageId,
                text: content,
                isUser,
                timestamp: msg.createdAt,
                botIcon: isUser ? undefined : 'default-bot',
            };
        });
        return { title, messages: mappedMessages };
    } catch (error) {
        console.error(`Failed to load messages for chatId=${chatId}`, error);
        return { title: "", messages: [] };
    }
}

export async function fetchChatMessages(chatId: string) {
    try {
        const response = await axiosAuthServices.get(
            ENDPOINTS.CHAT_SESSION_MESSAGES.replace('{sessionId}', chatId),
            { headers: buildHeader(false) }
        );
        const payload = response.data?.data;
        if (payload && typeof payload.title === "string" && Array.isArray(payload.messages)) {
            return payload;
        }
        return { title: "", messages: [] };
    } catch (error) {
        console.error(`Failed to load messages for chatId=${chatId}`, error);
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
export async function removeChat(chatId: string) {
    try {
         await axiosAuthServices.delete(
            ENDPOINTS.DELETE_SESSION.replace('{sessionId}', chatId),
            { headers: buildHeader(false) }
        );
    } catch (error) {
        console.error(`Failed to load messages for chatId=${chatId}`, error);
        return [];
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

export const hasAnyVisualization = (messages: Message[]): boolean => {
    return messages.some((msg) => {
        if (typeof msg.text === 'object') {
            const summary = msg.text.summary || '';
            const urls = extractRenderVizUrls(summary);
            return urls.length > 0;
        }
        return false;
    });
};

export const getRenderVizUrls=(message: Message): string[] => {
    if (typeof message.text === "object" && "summary" in message.text) {
        return extractRenderVizUrls(message.text.summary || '');
    }
    return [];
}
export const getAllRenderVizUrls = (messages: Message[]): string[]  => {
    return messages.flatMap((message) => {
        if (typeof message.text === "object" && "summary" in message.text) {
            return extractRenderVizUrls(message.text.summary || '');
        }
        return [];
    });
}