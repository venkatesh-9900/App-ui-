import {useEffect, useRef} from 'react';
import {ChatMessagePageProps, Message} from "@/types";
import MessageInterface from "@/components/chat/message/message-interface.tsx";
import {hasAnyVisualization} from "@/hooks";
import LoadingDots from "@/utils/loading-dots.tsx";
import {Box, Container} from "@mui/material";

export function ChatMessages({
                                                             title,
                                                             input,
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
                                                             userClosedSplitView
                                                         }: ChatMessagePageProps) {
    // console.log("[ChatMessages] messages:", messages);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasAnyViz = hasAnyVisualization(messages);
    const getMessageText = (message: Message, index: number): string => {
        if (index === currentTypingIndex) {
            return displayedText;
        }

        if (typeof message.text === 'object') {
            return typeof message.text === 'object'
                ? message.text.summary ?? ''
                : message.text;
        }

        return message.text;
    };
    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: 'background.paper' }}>
            <Container
                maxWidth="lg"
                sx={{ pt: { xs: 2, md: 4 }, pb: { xs: '140px', sm: '160px' } }}
            >
                {messages.map((message, index) => (
                    <MessageInterface
                        key={index}
                        input={input}
                        setInput={setInput}
                        currentChatId={String(currentChatId)}
                        handleSendMessage={handleSendMessage}
                        message={message}
                        isTyping={index === currentTypingIndex}
                        displayedText={getMessageText(message, index)}
                        onVizSelect={onVizSelect}
                        onCloseSplitView={onCloseSplitView}
                    />
                ))}
                {isThinking && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, mb: 4 }}>
                        <Box sx={{ p: 1.5, borderRadius: '8px', bgcolor: 'action.hover' }}>
                            <LoadingDots />
                        </Box>
                    </Box>
                )}
                <Box ref={messagesEndRef} sx={{ height: '96px' }} />
            </Container>
        </Box>
    );
}