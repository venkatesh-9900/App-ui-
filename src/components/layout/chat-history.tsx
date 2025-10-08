import { fetchUserChatSessions, loadChatMessages, removeChat } from "@/hooks";
import { toast } from 'sonner';
import { ChatSessions } from "@/types";
import { onChatHistoryUpdate } from "@/utils/eventBus";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { alpha, Box, Drawer, Typography, useTheme } from "@mui/material";
import ChatMenuButton from "@/components/chat/tools/chat-menu-button.tsx";
import { MessageSquare } from "lucide-react";

interface ChatHistorySidebarProps {
  isExpanded: boolean;
  onToggle: (value: boolean) => void;
  closeSidebar: () => void;
}

export default function ChatHistorySidebar({ isExpanded, onToggle, closeSidebar } : ChatHistorySidebarProps) {
    const [chatHistory, setChatHistory] = useState<ChatSessions[]>([]);
    const [currentChatId, setCurrentChatId] = useState("initial");
    const manuallyLoadedRef = useRef(false);
    const navigate = useNavigate();
    const theme = useTheme();

    const resetChat = useCallback(() => {
        setCurrentChatId("new");
    }, [setCurrentChatId]);
    
    useEffect(() => {
        const loadChats = async () => {
            await fetchUserChatSessions({
                successTask: async (sessions: ChatSessions[]) => {
                    setChatHistory(sessions);
                    if (sessions.length > 0) {
                        const defaultChatId = sessions[0].session_id;
                        setCurrentChatId(defaultChatId);
                        // const { readonly, conversations } = await loadChatMessages({
                        //     sessionId: defaultChatId,
                        //     failureTask: () => {
                        //         console.error('Failed to load chat messages');
                        //     },
                        //     errorTask: () => {
                        //         console.error('Error loading chat messages');
                        //     }
                        // });
                    } else {
                        resetChat(); // fallback if no prior chats
                    }
                },
                failureTask: () => {
                    console.error('Failed to load chats');
                },
                errorTask: () => {
                    console.error('Error loading chats');
                }
            });
        };
    
        void loadChats();
    
        const unsubscribe = onChatHistoryUpdate(() => {
            void loadChats(); // ensure it's awaited properly in callback
        });
        return () => {
            unsubscribe();
        };
    
    }, []);
    
    useEffect(() => {
        const loadChats = async () => {
            await fetchUserChatSessions({
                successTask: async (sessions: ChatSessions[]) => {
                    setChatHistory(sessions);
                    // if (sessions.length > 0 && location.pathname === '/chat/new'
                    // ) {
                    //     navigate(`/chat/${sessions[0].session_id}`);
                    // }
                },
                failureTask: () => {
                    console.error('Failed to load chats');
                },
                errorTask: () => {
                    console.error('Error loading chats');
                }
            });
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
        closeSidebar();
    }

    const deleteConversation = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (id === "new") {
            setCurrentChatId("new");
            resetChat();
            closeSidebar();
            return;
        }
        await removeChat({
            sessionId: id,
            successTask: async() => {
                toast('Success', {
                    description: 'Deleted successfully',
                });
                await fetchUserChatSessions({
                    successTask: async (sessions: ChatSessions[]) => {
                        setChatHistory(sessions);
                        // if (sessions.length > 0 && location.pathname === '/chat/new'
                        // ) {
                        //     navigate(`/chat/${sessions[0].session_id}`);
                        // }
                    },
                    failureTask: () => {
                        console.error('Failed to load chats');
                    },
                    errorTask: () => {
                        console.error('Error loading chats');
                    }
                });
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
        closeSidebar();
    };

    return (
        <Drawer open={isExpanded} onClose={() => onToggle(false)}>
            <Box
                sx={{
                    overflowY: 'auto',
                    height: 'calc(100% - 48px)', 
                    pb: 4,
                    mt: 15,
                    width: 300
                }}
            >
                <Box sx={{ ml: 1, mt: 0.5, minHeight: 0 }}>
                    {/* Scrollable conversations container */}
                    <Box
                        sx={{
                            maxHeight: 'calc(100% - 80px)',
                            overflowY: 'auto',
                            pr: 0.5,
                        }}
                    >
                        {chatHistory.length == 0 && <Box
                            sx={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                py: 0.75,
                                px: 1,
                                borderRadius: '6px'
                            }}
                        >
                            <Typography
                                variant="h6">
                                No Recent Chats
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
                                onClick={() => onLoadCurrentConversation(conv.session_id)}
                            >
                                <MessageSquare size={12} style={{ color: 'var(--mui-palette-text-secondary)', flexShrink: 0 }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="caption" sx={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {conv.initial_text}
                                    </Typography>
                                </Box>
                                <ChatMenuButton
                                    chatId={conv.session_id}
                                    onRemove={deleteConversation}
                                    onArchive={()=>{}}
                                    onRename={()=>{}}
                                />
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Drawer>
    )
};