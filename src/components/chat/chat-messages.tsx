import {useEffect, useRef} from 'react';
import {ChatMessagePageProps, ChatMessage, Message} from "@/types";
import MessageInterface from "@/components/chat/message/message-interface.tsx";
import {hasAnyVisualization} from "@/hooks";
import LoadingDots from "@/utils/loading-dots.tsx";
import {Box, CircularProgress, Container, Typography} from "@mui/material";
import { MessageSquareText, MessageSquareWarning, MessageSquareX } from 'lucide-react';

export function ChatMessages({
                                                             title,
                                                             input,
                                                             readonly,
                                                             setInput,
                                                             currentChatId,
                                                             handleSendMessage,
                                                             handleFileUpload,
                                                             messages,
                                                             isThinking,
                                                             currentTypingIndex,
                                                             displayedText,
                                                             onVizSelect,
                                                             onCloseSplitView,
                                                             userClosedSplitView,
                                                             selectedAgent,
                                                             chatLoadingError,
                                                             currentChatLoading
                                                         }: ChatMessagePageProps) {
    // console.log("[ChatMessages] messages:", messages);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasAnyViz = hasAnyVisualization(messages);
    const getMessageText = (message: ChatMessage, index: number): string => {
        if (index === currentTypingIndex) {
            return displayedText;
        }

        // if (typeof message.text === 'object') {
        //     return typeof message.text === 'object'
        //         ? message.text.summary ?? ''
        //         : message.text;
        // }

        return message.content;
    };
    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: 'background.paper' }}>
            <Container
                maxWidth="lg"
                sx={{ pt: { xs: 2, md: 4 }, pb: readonly ? {xs: '20px', sm: '40px'} : { xs: '140px', sm: '160px' } }}
            >
                {messages.length === 0 && <Box
                    sx={{
                        width: '100%',
                        height: '500px',
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
                    { currentChatLoading ?  
                        <CircularProgress size={50} color="info"/> : 
                        chatLoadingError ? 
                            <MessageSquareX size={50} style={{ color: '#666666' }}/> : 
                                (readonly && currentChatId !== 'new') ? 
                                    <MessageSquareWarning size={50} style={{ color: '#666666' }}/>: 
                                    <MessageSquareText size={50} style={{ color: '#666666' }}/> }
                    <Typography
                        variant="h6"
                        sx={{
                            textAlign: 'center',
                            color: '#666666'
                        }}>
                        { currentChatLoading ? "" : 
                            chatLoadingError ? "Something went wrong." : 
                                (readonly && currentChatId !== 'new') ? "No chat conversations to show." :
                                "Your chat conversations will appear here." }
                    </Typography>
                </Box>}
                {messages.map((message, index) => (
                    <MessageInterface
                        key={index}
                        input={input}
                        readonly={readonly}
                        setInput={setInput}
                        currentChatId={String(currentChatId)}
                        handleSendMessage={handleSendMessage}
                        message={message}
                        isTyping={index === currentTypingIndex}
                        displayedText={getMessageText(message, index)}
                        onVizSelect={onVizSelect}
                        onCloseSplitView={onCloseSplitView}
                        selectedAgent={selectedAgent}
                    />
                ))}
                {isThinking && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, mb: 4 }}>
                        <Box sx={{ p: 1.5, borderRadius: '8px', bgcolor: 'action.hover' }}>
                            <LoadingDots />
                        </Box>
                    </Box>
                )}
                {!readonly && <Box ref={messagesEndRef} sx={{ height: '96px' }} />}
            </Container>
        </Box>
    );
}