import React from 'react';
import type { Message, MessageContent } from '@/types';
import { Box, alpha } from "@mui/material";
import '@/styles/components/chat-message/message.css';

interface Props {
    message: Message;
    settings: any;
    isCollapsed: boolean;
    setIsCollapsed: (val: boolean) => void;
    isEditing: boolean;
    handleUpdate: () => void;
    handleCancel: () => void;
    handleEditClick: () => void;
    timestamp: string;
    children: React.ReactNode;
}

const MessageContentWrapper: React.FC<Props> = ({
                                                    message,
                                                    settings,
                                                    isCollapsed,
                                                    setIsCollapsed,
                                                    isEditing,
                                                    handleUpdate,
                                                    handleCancel,
                                                    handleEditClick,
                                                    timestamp,
                                                    children,
                                                }) => {
    const summary = typeof message.text === 'object' ? message.text.summary : '';
    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isEditing ? 'stretch' : message.isUser ? 'flex-end' : 'flex-start',
                fontSize: settings.largeFont ? '1.125rem' : '1rem',
            }}
        >
            {/* Left column: text */}
            <Box
                sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: isEditing || message.isUser ? '12px' : '8px',
                    transition: (theme) => theme.transitions.create('all'),
                    ...(isEditing && {
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                    }),
                    ...(!isEditing && message.isUser && {
                        color: 'text.primary',
                        alignSelf: 'flex-end',
                    }),
                    ...(!isEditing && !message.isUser && {
                        color: 'text.primary',
                    }),
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default MessageContentWrapper;
