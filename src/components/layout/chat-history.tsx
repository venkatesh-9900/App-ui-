import { fetchUserChatSessions, loadChatMessages, removeChat } from "@/hooks";
import { toast } from 'sonner';
import { ChatSessions } from "@/types";
import { onChatHistoryUpdate, triggerChatHistoryUpdate } from "@/utils/eventBus";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { alpha, Box, CircularProgress, Drawer, Typography, useTheme } from "@mui/material";
import ChatDeleteButton from "@/components/chat/tools/chat-delete-button.tsx";
import { MessageSquare, MessagesSquare, MessageSquareWarning } from "lucide-react";

interface ChatHistoryProps {
    onMenuItemClick: () => void;
}

export default function ChatHistory({ onMenuItemClick } : ChatHistoryProps) {
    const [chatHistory, setChatHistory] = useState<ChatSessions[]>([]);
    const [currentChatId, setCurrentChatId] = useState("initial");
    const [chatHistoryLoading, setChatHistoryLoading] = useState(true);
    const [chatHistoryError, setChatHistoryError] = useState(false);
    const manuallyLoadedRef = useRef(false);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    const resetChat = useCallback(() => {
        setCurrentChatId("new");
    }, [setCurrentChatId]);
    
    useEffect(() => {
        const loadChats = async () => {
            console.log("Inside loadChats call without subscription");
            setChatHistoryLoading(true);
            setChatHistoryError(false);
            await fetchUserChatSessions({
                successTask: async (sessions: ChatSessions[]) => {
                    setChatHistory(sessions);
                    console.log("Inside API call: path: " + location.pathname)
                    if (sessions.length > 0 && location.pathname.startsWith('/chat')) {
                        console.log(`Inside condition check location.pathname.startsWith("/chat")`);
                        if (location.pathname != '/chat/new') {
                            console.log(`Inside condition check location.pathname != "/chat/new"`);
                            const session_id = location.pathname.split('/')[2];
                            const matching_index = sessions.findIndex(session => session.session_id === session_id);
                            if (matching_index >= 0) {
                                console.log(`Inside condition check matching_index >= 0`);
                                setCurrentChatId(session_id);
                            } else {
                                console.log(`Inside condition check no match`);
                                setCurrentChatId(sessions[0].session_id);
                            }
                        }
                    }
                    // if (sessions.length > 0) {
                    //     const defaultChatId = sessions[0].session_id;
                    //     setCurrentChatId(defaultChatId);
                    // } else {
                    //     resetChat(); // fallback if no prior chats
                    // }
                },
                failureTask: () => {
                    console.error('Failed to load chats');
                    setChatHistoryError(true);
                },
                errorTask: () => {
                    console.error('Error loading chats');
                    setChatHistoryError(true);
                }
            });
            setChatHistoryLoading(false);
        };
    
        void loadChats();
    
        // const unsubscribe = onChatHistoryUpdate(() => {
        //     void loadChats(); // ensure it's awaited properly in callback
        // });
        // return () => {
        //     unsubscribe();
        // };
    
    }, []);
    
    useEffect(() => {
        const loadChats = async () => {
            setChatHistoryLoading(true);
            setChatHistoryError(false);
            await fetchUserChatSessions({
                successTask: async (sessions: ChatSessions[]) => {
                    setChatHistory(sessions);
                    if (sessions.length > 0 && location.pathname.startsWith('/chat')) {
                        if (location.pathname != '/chat/new') {
                            const session_id = location.pathname.split('/')[2];
                            const matching_index = sessions.findIndex(session => session.session_id === session_id);
                            if (matching_index >= 0) {
                                setCurrentChatId(session_id);
                            }
                        }
                    }
                },
                failureTask: () => {
                    console.error('Failed to load chats');
                    setChatHistoryError(true);
                },
                errorTask: () => {
                    console.error('Error loading chats');
                    setChatHistoryError(true);
                }
            });
            setChatHistoryLoading(false);
        };
        const unsubscribe = onChatHistoryUpdate(() => {
            void loadChats();
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const onLoadCurrentConversation = async (id: string) => {
        try {
            manuallyLoadedRef.current = true;
            navigate(`/chat/${id}`);
            setCurrentChatId(id);
        } catch (err) {
            console.error(`Failed to reload chat ${id}`, err);
            manuallyLoadedRef.current = false;
        }
    }

    const deleteConversation = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (id === "new") {
            setCurrentChatId("new");
            resetChat();
            return;
        }
        await removeChat({
            sessionId: id,
            successTask: async() => {
                toast('Success', {
                    description: 'Deleted successfully',
                });
                navigate('/chat/new');
                triggerChatHistoryUpdate();
            },
            failureTask: () => {
                toast('Failure', {
                    description: 'Could not delete the chat session. Please try again.',
                });
            },
            errorTask: () => {
                toast('Error', {
                    description: 'A unexpected error occurred while deleting the chat session.',
                });
            }
        });
    };

    return (
        <Box sx={{ ml: 0.5, mt: 0.5, width: 290, pb: 4 }}>
            {/* Scrollable conversations container */}
            {chatHistory.length == 0 && <Box
                    sx={{
                        width: '100%',
                        height: '350px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        py: 0.75,
                        px: 1,
                        borderRadius: '6px'
                    }}
                >
                    { chatHistoryLoading ?  
                        <CircularProgress size={30} color="info"/> : 
                        chatHistoryError ? 
                            <MessageSquareWarning size={50} style={{ color: '#666666' }}/> : 
                            <MessagesSquare size={50} style={{ color: '#666666' }}/> }
                    <Typography
                        variant="h6"
                        sx={{
                            textAlign: 'center',
                            color: '#666666'
                        }}>
                        { chatHistoryLoading ? "" : 
                            chatHistoryError ? "Something went wrong." : 
                            "Your chat history will appear here."}
                    </Typography>
                </Box>}
            {chatHistory.map((conv) => (
                <Box
                    key={conv.session_id}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        py: 0.75,
                        px: 1,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': { bgcolor: 'action.hover' },
                        ...(conv.session_id === currentChatId && {
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.dark',
                        }),
                    }}
                    onClick={() => {
                        onMenuItemClick();
                        onLoadCurrentConversation(conv.session_id)
                    }}
                >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" sx={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {conv.initial_text}
                        </Typography>
                    </Box>
                    <Box sx={{display: {xs: 'none', md: conv.session_id === currentChatId ? 'flex' : 'none'}}}>
                        <ChatDeleteButton
                            chatId={conv.session_id}
                            onRemove={deleteConversation}
                        />
                    </Box>
                    
                </Box>
            ))}
        </Box>
    )
};