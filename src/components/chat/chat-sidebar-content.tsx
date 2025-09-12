import React, {useCallback, useEffect, useRef, useState} from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { MessageSquare, Plus } from "lucide-react";
import {archiveChat, fetchUserChatSessions, loadChatMessages, removeChat, updateChatTitle} from "@/hooks";
import {Chat} from "@/types";
import {onChatHistoryUpdate} from "@/utils/eventBus.ts";
import ChatMenuButton from "@/components/chat/tools/chat-menu-button.tsx";
import {
    Box,
    IconButton,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    alpha,
    useTheme,
    Typography
} from "@mui/material";
import { commonButtonStyles } from '@/common/menu-styles';

interface ChatCollapsibleItemProps {
    isActive: boolean;
    isMenuExpanded: boolean;
    closeSidebar: () => void;
}

export const ChatSidebarContent: React.FC<ChatCollapsibleItemProps> = ({ isActive, isMenuExpanded, closeSidebar }) => {
    const location = useLocation();
    const theme = useTheme();
    const navigate = useNavigate();
    const [chatHistory, setChatHistory] = useState<Chat[]>([]);
    const [currentChatId, setCurrentChatId] = useState("initial");
    const currentPath = location.pathname;
    const manuallyLoadedRef = useRef(false);
    const [isChatExpanded, setIsChatExpanded] = useState(true);

    const resetChat = useCallback(() => {
        setCurrentChatId("new");
    }, [setCurrentChatId]);

    useEffect(() => {
        const loadChats = async () => {
            try {
                const sessions = await fetchUserChatSessions();
                setChatHistory(sessions);
                if (sessions.length > 0) {
                    const defaultChatId = sessions[0].id;
                    setCurrentChatId(defaultChatId);
                    const { title, messages } = await loadChatMessages(defaultChatId);
                } else {
                    resetChat(); // fallback if no prior chats
                }
            } catch (err) {
                console.error('Failed to load chats:', err);
            }
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
            try {
                const updated = await fetchUserChatSessions();
                setChatHistory(updated);
                if (updated.length > 0 && location.pathname === '/chat/new'
                ) {
                    navigate(`/chat/${updated[0].id}`);
                }
            } catch (err) {
                console.error("Failed to refresh chat history:", err);
            }
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
        try {
            await removeChat(id);
            const updatedChats = await fetchUserChatSessions();
            setChatHistory(updatedChats);
        } catch (err) {
            console.error(`Failed to remove chat ${id}`, err);
        }
        closeSidebar();
    };
    const archiveConversation = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (id === "new") {
            setCurrentChatId("new");
            resetChat();
            closeSidebar();
            return;
        }
        try {
            await archiveChat(id);
            const updatedChats = await fetchUserChatSessions();
            setChatHistory(updatedChats);
        } catch (err) {
            console.error(`Failed to remove chat ${id}`, err);
        }
        closeSidebar();
    };

    const renameConversation = async (e: React.MouseEvent, id: string, newTitle: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (id === "new") {
            // Just reset UI state
            resetChat();
            return;
        }
        try {
            await updateChatTitle(id, newTitle);
            const updatedChats = await fetchUserChatSessions();
            setChatHistory(updatedChats);
        } catch (err) {
            console.error(`Failed to remove chat ${id}`, err);
        }
    };

    const handleNewChat = (e: React.MouseEvent) => {
        e.preventDefault();
        const timestamp = Date.now();
        navigate(`/chat/new?t=${timestamp}`);
        closeSidebar();
    };

    return (
        <Box sx={{ maxWidth: {xs: '250px', lg: '210px'} }}>
            <ListItemButton
                onClick={(e) => {
                    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.chat-header')) {
                        setIsChatExpanded(!isChatExpanded);
                    }
                    if (!isMenuExpanded) {
                        navigate('/chat');
                    }
                }}
                sx={isMenuExpanded ? {
                    ...commonButtonStyles(isActive),
                    gap: 1.5, // Equivalent to space-x-3 (12px)
                    px: 1.5, // Equivalent to px-3 (12px)
                    py: 1.25, // Equivalent to py-2.5 (10px)
                } : {
                    ...commonButtonStyles(isActive),
                    justifyContent: 'center',
                    width: 40, // Equivalent to w-10 (40px)
                    height: 40, // Equivalent to h-10 (40px)
                    // ...(isActive && {
                    //     boxShadow: 1, // Equivalent to shadow-sm
                    // }),
                }}
            >
                <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>
                    <MessageSquare size={18} />
                </ListItemIcon>
                {isMenuExpanded && (
                    <ListItemText
                        primary="Chat"
                        className="chat-header"
                        sx={{ flex: 1, m: 0, '& .MuiTypography-root': { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }}
                    />
                )}
                {isMenuExpanded && (
                    <IconButton onClick={handleNewChat} size="small" title="New Chat" sx={{ p: 0.5, opacity: 0.6, '&:hover': { opacity: 1 } }}>
                        <Plus size={16} />
                    </IconButton>
                )}
            </ListItemButton>
            {isMenuExpanded && isChatExpanded && (
                <Box sx={{ ml: 3, mt: 0.5, minHeight: 0 }}>
                    {/* Scrollable conversations container */}
                    <Box
                        sx={{
                            maxHeight: chatHistory.length > 5 ? '8rem' : 'auto',
                            overflowY: chatHistory.length > 5 ? 'auto' : 'visible',
                            pr: chatHistory.length > 5 ? 0.5 : 0,
                        }}
                    >
                        {chatHistory.map((conv) => (
                            <Box
                                key={conv.id}
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
                                    ...(conv.id === currentChatId && {
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: 'primary.dark',
                                    }),
                                }}
                                onClick={() => onLoadCurrentConversation(conv.id)}
                            >
                                <MessageSquare size={12} style={{ color: 'var(--mui-palette-text-secondary)', flexShrink: 0 }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="caption" sx={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {conv.title}
                                    </Typography>
                                </Box>
                                <ChatMenuButton
                                    chatId={conv.id}
                                    onRemove={deleteConversation}
                                    onArchive={archiveConversation}
                                    onRename={renameConversation}
                                />
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
};
