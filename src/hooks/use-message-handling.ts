import {handleStreamMessage} from "@/hooks/message-service.ts";
import {useCallback} from "react";
import {checkIsSessionNew} from "./chat-service";
import {triggerChatHistoryUpdate} from "@/utils/eventBus";
import {ChatMessage, FileDetails, Message, MessageContent} from "@/types";

const TYPING_SPEED = 10; // Reduced from 20 to 10 for faster typing animation
const LOADING_DURATION = 2500; // 2.5 seconds in milliseconds

interface UseMessageHandlingProps {
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    setIsThinking: React.Dispatch<React.SetStateAction<boolean>>;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
    currentChatId: string;
    setCurrentChatId: React.Dispatch<React.SetStateAction<string>>;
    setCurrentTypingIndex: React.Dispatch<React.SetStateAction<number>>;
    setDisplayedText: React.Dispatch<React.SetStateAction<string>>;
    setSelectedVizUrl: React.Dispatch<React.SetStateAction<string | null>>;
    setIsSplitMode: React.Dispatch<React.SetStateAction<boolean>>;
    showError: () => void;
}
export const useMessageHandling = ({
                                       messages,
                                       setMessages,
                                       setInput,
                                       setIsThinking,
                                       setTitle,
                                       currentChatId,
                                       setCurrentChatId,
                                       setCurrentTypingIndex,
                                       setDisplayedText,
                                       setSelectedVizUrl,
                                       setIsSplitMode,
                                       showError
                                   }: UseMessageHandlingProps) => {

    const updateTyping = (text: string, index: number) => {
        setDisplayedText(text);
        setCurrentTypingIndex(index);
    };
    const generateTitle = useCallback((message: string): string => {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.startsWith('/chart')) return "Data Visualization Analysis";
        if (lowerMessage.startsWith('/image')) return "Visual Content Creation";
        if (lowerMessage.startsWith('/code')) return "Code Development Discussion";
        if (lowerMessage.startsWith('/file')) return "Document Generation";
        if (lowerMessage.startsWith('/table')) return "Data Table Analysis";

        const maxLength = 50;
        const truncatedMessage = message.slice(0, maxLength).trim();
        return truncatedMessage + (message.length > maxLength ? "..." : "");
    }, []);

    const typeWriterEffect = useCallback((text: string | MessageContent, messageIndex: number) => {
        const displayText = typeof text === 'object'
            ? `${text}${text.code ? '\n\n' + text.code : ''}`
            : text;

        setCurrentTypingIndex(messageIndex);
        setDisplayedText('');

        let i = 0;
        const typeWriter = () => {
            if (i < displayText.length) {
                setDisplayedText(displayText.substring(0, i + 1));
                i++;
                setTimeout(typeWriter, TYPING_SPEED);
            } else {
                setCurrentTypingIndex(-1);
            }
        };
        typeWriter();
    }, [setCurrentTypingIndex, setDisplayedText]);

    const handleSendMessage = useCallback( async (text: string, selectedAgent: string, attachedFiles: FileDetails[], image?: string, sessionIdOverride?: string) => {
        const sessionIdRaw = sessionIdOverride || currentChatId;
        const isNewSessionClient  = !sessionIdRaw || sessionIdRaw === '0' || sessionIdRaw.length < 10;
        const sessionId = isNewSessionClient  ? '' : sessionIdRaw;
        if (text.trim() || image) {
            const timestamp = new Date().toISOString();
            const userMessage: ChatMessage = { author: 'user', content: text, timestamp: timestamp, attached_files: attachedFiles };
            const newMessages = [...messages, userMessage];
            const botMessage: ChatMessage = {
                author: 'model',
                content: '',
                timestamp: new Date().toISOString(),
                attached_files: null
            };

            const updatedMessages = [...messages, userMessage, botMessage];
            setMessages(updatedMessages);
            setIsThinking(true);
            setInput('');
            console.log('selectedAgent:', selectedAgent);
            await handleStreamMessage({
                text,
                image,
                newMessages,
                setMessages,
                setIsThinking,
                generateTitle,
                currentChatId: sessionId,
                setCurrentChatId,
                updateTyping,
                setSelectedVizUrl,
                setIsSplitMode,
                selectedAgent,
                attachedFiles,
                showError
            });
            if (isNewSessionClient) {
                // sessionId was empty ⇒ client already knows it’s new, so update history immediately
                triggerChatHistoryUpdate();
                setTitle(generateTitle(text));
            }
        }
    }, [messages, setMessages, setIsThinking, setInput, setTitle, generateTitle]);

    return {
        handleSendMessage,
    };
};