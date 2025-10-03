import React, {memo, useEffect, useRef, useState} from 'react';
import {format, isValid, parseISO} from 'date-fns';
import {useAppearance} from '@/contexts/AppearanceContext';
import {ChatMessage, FileDetails, Message} from "@/types";
import MessageContentWrapper from "@/components/chat/message/message-content-wrapper.tsx";
import {RenderMessageContent} from "@/components/chat/message/render-message-content.tsx";
import {Box} from "@mui/material";
import '@/styles/components/chat-message/message.css';


interface MessageProps {
    input: string;
    setInput: (value: string) => void;
    readonly: boolean;
    currentChatId: string;
    handleSendMessage: (message: string, selectedAgent: string, attachedFiles: FileDetails[]) => void;
    message: ChatMessage;
    isTyping: boolean;
    displayedText: string;
    onVizSelect?: (url: string) => void;
    onCloseSplitView?: () => void;
    selectedAgent: string;
}

const MessageInterface: React.FC<MessageProps> = memo(({
                                                           input,
                                                           setInput,
                                                           readonly,
                                                           currentChatId,
                                                           handleSendMessage,
                                                           message,
                                                           isTyping,
                                                           displayedText,
                                                           onVizSelect,
                                                           onCloseSplitView,
                                                           selectedAgent
                                                        }) => {
    const [showContent, setShowContent] = useState(false);
    const [showAdditionalContent, setShowAdditionalContent] = useState(false);
    const { settings } = useAppearance();

    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [updatedText, setUpdatedText] = useState<string | null>(null);
    const editableRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isTyping) {
            setShowContent(true);
            setTimeout(() => {
                setShowAdditionalContent(true);
            }, 500);
        } else if (message.author === 'user') {
            setShowContent(true);
            setShowAdditionalContent(true);
        } else {
            setShowContent(false);
            setShowAdditionalContent(false);
        }
    }, [isTyping, message.author]);

    const formatTimestamp = (timestamp?: string) => {
        if (!timestamp) return format(new Date(), 'hh:mm a');
        const date = timestamp.includes('T') ? parseISO(timestamp) : new Date(timestamp);
        return isValid(date) ? format(date, 'hh:mm a') : format(new Date(), 'hh:mm a');
    };

    const timestamp = formatTimestamp(message.timestamp);

    const handleEditClick = () => {
        setIsEditing(true)
        setIsCollapsed(false)
    };
    const handleUpdate = () => {
        const newText = editableRef.current?.innerText || '';
        setUpdatedText(newText);
        setIsEditing(false);
        editableRef.current?.blur();
    };

    const handleCancel = () => {
        setIsEditing(false);
        setUpdatedText(null);
    };

    const renderMessageContent = () => {
        return (
            <RenderMessageContent
                input={input}
                setInput={setInput}
                readonly={readonly}
                currentChatId={currentChatId}
                handleSendMessage={handleSendMessage}
                handleEditClick={handleEditClick}
                handleUpdate={handleUpdate}
                handleCancel={handleCancel}
                message={message}
                isTyping={isTyping}
                isEditing={isEditing}
                updatedText={updatedText}
                editableRef={editableRef}
                showContent={showContent}
                showAdditionalContent={showAdditionalContent}
                onVizSelect={onVizSelect}
                onCloseSplitView={onCloseSplitView}
                selectedAgent={selectedAgent}
            />
        );
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            mb: settings.compactMode ? 0.5 : 2
        }}>
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 2,
                width: '100%'
            }}>
                <Box sx={{ flex: 1 }}>
                    <MessageContentWrapper
                        message={message}
                        settings={settings}
                        isCollapsed={isCollapsed}
                        setIsCollapsed={setIsCollapsed}
                        isEditing={isEditing}
                        handleUpdate={handleUpdate}
                        handleCancel={handleCancel}
                        handleEditClick={handleEditClick}
                        timestamp={timestamp}
                    >
                        {renderMessageContent()}
                    </MessageContentWrapper>
                </Box>
            </Box>
        </Box>
    );
});

MessageInterface.displayName = 'Message';

export default MessageInterface;
