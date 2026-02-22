"use client"

import { useState, useCallback, useEffect, useContext } from "react"
import { useSearchParams } from "next/navigation"
import { ChatMessages, Message } from "@/components/chat/chat-messages"
import { ChatInput } from "@/components/chat/chat-input"
import { ProtectedRoute } from "@/components/protected-route"
import { loadChatMessages } from "@/hooks/chat-service"
import { getChatTitle, handleStreamMessage } from "@/hooks/message-service"
import { ChatMessage } from "@/types/chat-types"
import { ChatContext } from "@/contexts"
import { FileDetails } from "@/types"
import { fetchSessionDetails } from "@/hooks/chat-service"
import { useRouter } from "next/navigation"
import { triggerChatHistoryUpdate } from "@/utils/eventBus"
import { ArrowRightIcon, FolderClosedIcon } from "lucide-react"

export default function ChatPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { selectedModel, setIsShared, setShareableLink } = useContext(ChatContext)
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [initialMessage, setInitialMessage] = useState<string>("")
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [groupId, setGroupId] = useState<string | null>(null)
    const [isLoadingSession, setIsLoadingSession] = useState(false)
    const [hasLoadedInitialSession, setHasLoadedInitialSession] = useState(false)
    const [readOnly, setReadOnly] = useState(false)

    const session = searchParams.get("sessionId");
    const prompt = searchParams.get("prompt");
    const isNew = searchParams.get("new");
    const userid = searchParams.get("userid");
    const groupIdParam = searchParams.get("groupId");
    const [lastLoadedSession, setLastLoadedSession] = useState<string | null>(null);
    const defaultPromptList = [
        "List all the watchers",
        "List all the notifications",
        "List all Address Activities"
    ]

    useEffect(() => {
        console.log("ChatPage useEffect - session:", session, "prompt:", prompt, "isNew:", isNew, "userid:", userid, "groupId:", groupIdParam);

        // CASE 1: Existing session selected
        if (session) {
            if (lastLoadedSession !== session && lastLoadedSession !== "new") {
                setLastLoadedSession(session);
                console.log("Setting sessionId to:", session);
                setSessionId(session);
                setMessages([]);
                setInitialMessage("");
                loadExistingSession(session, userid);
            }
            if (lastLoadedSession === "new")
                setLastLoadedSession(session);
            setGroupId(null);
            return;
        }

        if (isNew === "true" && prompt) {
            console.log("Starting new chat with prompt:", prompt);
            setSessionId(null);
            setMessages([]);
            setInitialMessage(prompt);
            setLastLoadedSession("new");
            return;
        }

        // CASE 2: New chat
        if (isNew === "true") {
            console.log("Starting new chat");
            setSessionId(null);
            setMessages([]);
            setInitialMessage("");
            setLastLoadedSession("new");
            setGroupId(groupIdParam);
            return;
        }

        // CASE 3: Chat started with prompt
        if (prompt) {
            console.log("Starting prompt chat:", prompt);
            setSessionId(null);
            setMessages([]);
            setInitialMessage(prompt);
            setLastLoadedSession("prompt");
            return;
        }

        // CASE 4: Empty state (first load)
        if (lastLoadedSession !== "empty") {
            console.log("Empty chat");
            setSessionId(null);
            setMessages([]);
            setInitialMessage("");
            setLastLoadedSession("empty");
        }
    }, [session, prompt, isNew, userid, groupIdParam]);

    const loadExistingSession = async (id: string, userid?: string | null) => {
        setIsLoadingSession(true)
        try {
                        // Fetch session details to get share status (only for personal sessions)
                        // For shared sessions, skip this as the viewer may not have permission
                        if (!userid) {
                            await fetchSessionDetails({
                                sessionId: id,
                                successTask: (is_sharable: boolean, sharable_link: string) => {
                                    setIsShared(is_sharable)
                                    setShareableLink(sharable_link || "")
                                },
                                failureTask: () => {
                                    console.error("Failed to fetch session details")
                                },
                                errorTask: () => {
                                    console.error("Error fetching session details")
                                },
                            })
                        } else {
                            // For shared sessions, mark as shared
                            console.log('Loading shared session, skipping session details fetch')
                            setIsShared(true)
                        }

            console.log('Fetching chat messages for session:', id, 'userid:', userid)
            const chatData = await loadChatMessages({
                sessionId: id,
                userid: userid || undefined,
                failureTask: () => {
                    console.error("Failed to load messages")
                },
                errorTask: () => {
                    console.error("Error loading messages")
                },
            })
            setReadOnly(chatData.readonly)
            console.log('Loaded chat data:', chatData)

            // Convert ChatMessage[] to Message[]
            const convertedMessages: Message[] = chatData.conversations.map((msg: ChatMessage, idx) => ({
                id: `msg-${idx}`,
                role: msg.author === "user" ? "user" : "assistant",
                content: msg.content,
                timestamp: new Date(msg.timestamp),
                attachments: msg.attached_files || [],
            }))

            console.log('Converted messages count:', convertedMessages.length)
            setMessages(convertedMessages)
        } catch (err) {
            console.error("Failed to load session:", err)
        } finally {
            setIsLoadingSession(false)
        }
    }

    const handleSendMessage = useCallback(async (content: string, attachedFiles: FileDetails[] = []) => {
        // Convert current messages to ChatMessage format
        const chatMessages: ChatMessage[] = messages.map((msg) => ({
            author: msg.role === "user" ? "user" : "assistant",
            content: msg.content,
            timestamp: msg.timestamp.toISOString(),
            attached_files: msg.role === "user" ? msg.attachments || [] : null,
        }))

        // Add user message
        const userChatMessage: ChatMessage = {
            author: "user",
            content,
            timestamp: new Date().toISOString(),
            attached_files: attachedFiles,
        }

        const newMessages = [...chatMessages, userChatMessage]
        
        // Convert to Message[] for display
        const displayMessages: Message[] = newMessages.map((msg, idx) => ({
            id: `msg-${idx}`,
            role: msg.author === "user" ? "user" : "assistant",
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            attachments: msg.attached_files || [],
        }))
        setMessages(displayMessages)
        setIsLoading(true)

        try {
            console.log("Sending message to API with sessionId:", sessionId)
            await handleStreamMessage({
                text: content,
                newMessages,
                setMessages: (msgs: ChatMessage[]) => {
                    console.log("Received streamed messages, count:", msgs.length)
                    // Convert ChatMessage[] to Message[] for display
                    const convertedMessages: Message[] = msgs.map((msg: ChatMessage, idx) => ({
                        id: `msg-${idx}`,
                        role: msg.author === "user" ? "user" : "assistant",
                        content: msg.content,
                        timestamp: new Date(msg.timestamp),
                        attachments: msg.attached_files || [],
                        isStreaming: msg.isStreaming,  // Pass streaming state
                    }))
                    setMessages(convertedMessages)
                },
                setIsThinking: setIsLoading,
                currentChatId: sessionId,
                setCurrentChatId: (newId: string) => {
                    console.log("Created new chat with ID:", newId)
                    const firstMessage = !sessionId;
                    setSessionId(newId)
                    if (firstMessage) {
                        triggerChatHistoryUpdate({
                            sessionId: newId,
                            initialText: content,
                        });
                    }
                },
                selectedAgent: selectedModel,
                attachedFiles: attachedFiles,
                groupId: groupId,
                showError: (error: string) => {
                    console.error("Error from API:", error)
                },
                generateTitle: () => {},
                updateTyping: () => {},
                setSelectedVizUrl: () => {},
                setIsSplitMode: () => {},
                router: router,
            })
            if (isNew === "true") {
                // if (sessionId) {
                //     await getChatTitle({
                //         sessionId: sessionId,
                //         successTask: (title: string) => {
                //             console.log("Chat title updated:", title)
                //             //setInitialMessage(title)
                //         },
                //         failureTask: () => {
                //             console.error("Failed to update chat title")
                //         },
                //         errorTask: () => {
                //             console.error("Error updating chat title")
                //         },
            //     });
                // } else {
                //     console.log("Failed to update chat title: no session ID")
            // }
                // triggerChatHistoryUpdate();
            }
            console.log("Message streaming completed")
        } catch (err) {
            console.error("Error sending message:", err)
        } finally {
            setIsLoading(false)
        }
    }, [messages, sessionId, selectedModel])

    return (
        <ProtectedRoute>
            <div className="flex flex-col h-screen justify-center px-20">
                {isLoadingSession && (
                    <div className="border-b p-4 bg-muted">
                        <p className="text-sm text-muted-foreground">Loading chat session...</p>
                    </div>
                )}
                {
                    // Group name
                    (groupId && !sessionId) && (
                        <div className="flex items-center gap-2 px-3 mb-2 font-bold" style={{ fontSize: '2rem' }}>
                            <FolderClosedIcon className="h-12 w-12" />
                            {localStorage.getItem("groupName")}
                        </div>
                    )
                }
                {sessionId && <ChatMessages messages={messages} isLoading={isLoading} isLoadingSession={isLoadingSession} sessionId={sessionId} readOnly={readOnly} />}
                {!readOnly && <ChatInput 
                    key={`${sessionId || 'new'}-${initialMessage}`}
                    onSend={handleSendMessage} 
                    isLoading={isLoading} 
                    initialValue={initialMessage}
                    currentChatId={sessionId}
                />}
                {(!sessionId && groupId) && (
                    <div className="mt-4 flex flex-col gap-2 px-3">
                        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Suggested Prompts
                        </h3>
                        {defaultPromptList.map((prompt, index) => (
                            <div
                                key={index}
                                onClick={() => setInitialMessage(prompt)}
                                className="group flex cursor-pointer items-center justify-between rounded-lg border bg-card p-3 transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
                            >
                                <span className="text-sm font-medium">{prompt}</span>
                                <ArrowRightIcon className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </ProtectedRoute>
    )
}