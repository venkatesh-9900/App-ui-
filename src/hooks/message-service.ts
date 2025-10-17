import {SELECTED_ENDPOINT, ENDPOINTS} from "@/config/config.ts";
import { app_name } from "@/constants/constants";
import {ChatMessage, FileDetails, Message, MessageContent} from "@/types";
import { addAttachedFilesPublicLinks } from "@/utils/utils";
import {fetchLoginURL, reauthenticationStep, refreshAccessToken} from "@/hooks/auth-service.ts";

export async function handleStreamMessage({
                                              retry = false,
                                              text,
                                              image,
                                              newMessages,
                                              setMessages,
                                              setIsThinking,
                                              generateTitle,
                                              currentChatId,
                                              setCurrentChatId,
                                              updateTyping,
                                              setSelectedVizUrl,
                                              setIsSplitMode,
                                              selectedAgent,
                                              attachedFiles,
                                              showError
                                          }: any) {
    if (retry) {
        console.log("Refreshing access token");
        await refreshAccessToken({
            failureTask: () => {
                console.log("Failed to refresh token while sending message")
            }, 
            errorTask: () => {
                console.log("Error encountered while refreshing token on send message")
            }
        });
    }
    const interactionMode = SELECTED_ENDPOINT;
    console.log('selectedAgent:', selectedAgent);
    let messageText = text;
    if (attachedFiles.length > 0) {
        messageText = addAttachedFilesPublicLinks(text, attachedFiles);
    }
    const payload = { query: messageText, agent: selectedAgent };
    const newChatId: string = window.crypto.randomUUID() + '-' + new Date().toISOString();
    setIsThinking(true);
    try {
        const response = await fetch(interactionMode.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'x-app-name': app_name,
                'x-session-id': (!currentChatId || currentChatId === 0 || currentChatId === 'new') ? newChatId : currentChatId
            },
            body: JSON.stringify(payload)
        });

        if (response.status == 401) {
            if (retry) {
                reauthenticationStep(() => {
                    console.log("Error encountered while fetching login URL");
                });
            } else {
                await handleStreamMessage({
                    text,
                    image,
                    newMessages,
                    setMessages,
                    setIsThinking,
                    generateTitle,
                    currentChatId: currentChatId,
                    setCurrentChatId,
                    updateTyping,
                    setSelectedVizUrl,
                    setIsSplitMode,
                    selectedAgent,
                    attachedFiles,
                    showError,
                    retry: true
                });
            }
            return;
        }

        if (!response.ok || !response.body) throw new Error(`Stream failed with status: ${response.status}`);

        //const sessionId = content.replace('__SESSION_ID__:', '');
        let updateURL = false;
        if (!currentChatId || currentChatId === 0 || currentChatId === 'new') {
            setCurrentChatId(newChatId);
            updateURL = true;
            if (attachedFiles.length > 0) {
                updateSessionIdForAttachedFilesInNewChat(attachedFiles, newChatId);
            }
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const botMessage: ChatMessage = {
            author: 'model',
            content: '',
            timestamp: new Date().toISOString(),
            attachments: []
        };
        const updatedMessages = [...newMessages, botMessage];
        setMessages(updatedMessages);
        const index = updatedMessages.length - 1;
        let result = '';
        let seenSessionId = false;
        let lastEventType: string | null = null;
        const vizUrls: string[] = [];
        let pendingVizLine = '';
        const pendingMarkdownUrl = { buffer: '', active: false };
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            //console.log('chunk: ', [chunk]);
            const lines = chunk.split('\r\n\r\n');
            console.log('lines:', lines);
            lines.forEach((line) => {
                //line = line.trim();
                if (!line) return;

                if (line.startsWith('event:')) {
                    lastEventType = line.replace('event:', '').trim();
                    return;
                }

                if (line.startsWith('data: ')) {
                    const content = line.replace(/data: /g, '').replace(/\r\n/g, '\n');
                    console.log('content:', content);
                    if (!content) return;
                    if (processMarkdownVizChunk(content, pendingMarkdownUrl, vizUrls, setSelectedVizUrl, setIsSplitMode)) {
                        return;
                    }
                    // Handle possibly multi-line visualization URL
                    // const markdownLinkMatch = content.match(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/);
                    // if (markdownLinkMatch && markdownLinkMatch[2]) {
                    //     const detectedUrl = markdownLinkMatch[2];
                    //     if (!vizUrls.includes(detectedUrl)) {
                    //         setSelectedVizUrl(detectedUrl);   // Optional: pick first or last
                    //         setIsSplitMode(true);             // Optional: toggle layout
                    //         vizUrls.push(detectedUrl);
                    //         console.log('[Markdown Link Detected]:', detectedUrl);
                    //     }
                    // } else
                    if (content.startsWith('RENDER-VIZ-ON-UI:') || pendingVizLine.startsWith('RENDER-VIZ-ON-UI:')) {
                        pendingVizLine += content;
                        console.log('Detected start of visualization URL chunk:', content);
                        // Check if it now looks like a complete URL (basic check: has a full https://...)
                        const rawUrl = pendingVizLine.replace('RENDER-VIZ-ON-UI:', '');
                        const cleanedUrl = rawUrl.replace(/\s+/g, '').trim();
                        // console.log('cleanedUrl:', cleanedUrl);
                        if ((cleanedUrl.startsWith('https://') || cleanedUrl.startsWith('http://')) && cleanedUrl.endsWith('.html')) {
                            setSelectedVizUrl(cleanedUrl);
                            setIsSplitMode(true);
                            vizUrls.push(cleanedUrl);
                            pendingVizLine = '';
                            console.log('vizUrls:', cleanedUrl);
                            result += `\nRENDER-VIZ-ON-UI:${cleanedUrl}\n`;
                            updatedMessages[index].content = result;
                            setMessages([...updatedMessages]);
                            return;
                        }
                        // otherwise, wait for next line to complete it
                        return;
                    }

                    // Detect and extract session ID
                    if (lastEventType === 'init' && content.startsWith('__SESSION_ID__:')) {
                        const sessionId = content.replace('__SESSION_ID__:', '');
                        if (!currentChatId || currentChatId === 0 || currentChatId === 'new') {
                            setCurrentChatId(sessionId);
                        }
                        lastEventType = null;
                        return;
                    }

                    // Append chat data
                    // result += content + '\n';
                    result += content;
                    updatedMessages[index].content = result;
                    setMessages([...updatedMessages]);
                    lastEventType = null;
                }
            });
        }
        const trimmed = result.trim();
        updatedMessages[index].content = trimmed;
        // updatedMessages[index].text = vizUrls.length > 0
        //     ? {
        //         summary: trimmed,
        //         type: 'visualization',
        //         visualizationUrls: vizUrls,
        //     }
        //     : {
        //         summary: trimmed,
        //         type: 'text',
        //     };

        setMessages([...updatedMessages]);
        if (updateURL) {
            history.replaceState(null, '', `/chat/${newChatId}`);
        }
    } catch (error: any) {
        console.error('Error in handleStreamMessage:', error);
        // alert(error.message || 'Stream failed.');
    } finally {
        setIsThinking(false);
    }
}
function processMarkdownVizChunk(
    line: string,
    pendingMarkdownUrl: { buffer: string, active: boolean },
    vizUrls: string[],
    setSelectedVizUrl: (url: string) => void,
    setIsSplitMode: (isSplit: boolean) => void
): boolean {
    if (!line.startsWith('RENDER-VIZ-ON-UI:') && !pendingMarkdownUrl.active) {
        return false;
    }
    const startMatch = /\[http(s)?:\/\/[^\]\s]*/;
    const endMatch = /\]\(http(s)?:\/\/[^\)\s]*\.html\)/;

    if (startMatch.test(line) || pendingMarkdownUrl.active) {
        pendingMarkdownUrl.buffer += line.trim();
        pendingMarkdownUrl.active = true;

        if (endMatch.test(pendingMarkdownUrl.buffer)) {
            const match = pendingMarkdownUrl.buffer.match(/\(https:\/\/[^\)\s]*\)/);
            if (match) {
                const url = match[0].slice(1, -1); // strip parentheses
                setSelectedVizUrl(url);
                setIsSplitMode(true);
                vizUrls.push(url);
                console.log('[Markdown-style URL]:', url);
            }
            pendingMarkdownUrl.buffer = '';
            pendingMarkdownUrl.active = false;
            return true;
        }
        return true; // still buffering
    }

    return false;
}

async function updateSessionIdForAttachedFilesInNewChat(attachedFiles: FileDetails[], sessionId: string) {
    const file_id_list = attachedFiles.map(file => file.file_id);
    const payload = { file_ids: file_id_list };
    try {
        const response = await fetch(ENDPOINTS.UPDATE_SESSION_ID_TO_ATTACHED_FILES, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'x-app-name': app_name,
                'x-session-id': sessionId
            },
            body: JSON.stringify(payload)
        });
        if (response.status == 200) {
            console.log('Session ID updated successfully for attached files.');
        } else {
            console.error("Failed to update session ID for attached files with status code:", response.status);
        }
    } catch (error: any) {
        console.error('Error in updateSessionIdForAttachedFilesInNewChat:', error);
    }
}