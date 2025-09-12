import {memo, useCallback, useEffect, useRef, useState} from "react";
import {ChatMessages} from "@/components/chat/chat-messages.tsx";
import {ChatInterfaceProps, FileUploadResponse, Message} from "@/types";
import {useLocation, useNavigate} from 'react-router-dom';
import {ChatInput} from "@/components/chat/chat-input.tsx";
import {hasAnyVisualization, loadChatMessages} from "@/hooks";
import {uploadFileToServer} from "@/hooks/upload-file.ts";
import {useMessageHandling} from "@/hooks/use-message-handling.ts";
import {Box} from "@mui/material";

const ChatInterface: React.FC<ChatInterfaceProps> = memo(({ params }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const query = location.search;
    const chatId = params?.id ?? 'new';
    const [currentChatId, setCurrentChatId] = useState(chatId);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [title, setTitle] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [currentTypingIndex, setCurrentTypingIndex] = useState(-1);
    const [displayedText, setDisplayedText] = useState('');
    const manuallyLoadedRef = useRef(false);
    const [isSplitMode, setIsSplitMode] = useState(false);
    const [userClosedSplitView, setUserClosedSplitView] = useState(false);
    const [selectedVizUrl, setSelectedVizUrl] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setCurrentChatId(chatId);
    }, [chatId, query]);

    useEffect(() => {
        const fetchChat = async () => {
            if (!currentChatId || currentChatId === '' || currentChatId === 'new') {
                // Fallback to reset
                resetChat();
                return;
            }
            if (manuallyLoadedRef.current) {
                manuallyLoadedRef.current = false;
                return;
            }
            try {
                const { title, messages } = await loadChatMessages(currentChatId);
                setMessages(messages);
                setTitle(title || '');
            } catch (err) {
                console.error('Failed to load selected chat:', err);
                resetChat();
            }
            // Cleanup shared state
            setInput('');
            setCurrentTypingIndex(-1);
            setDisplayedText('');
        };

        fetchChat();
    }, [currentChatId]);



    useEffect(() => {
        if (selectedVizUrl !== null) {
            setIsSplitMode(true);
            setUserClosedSplitView(false);
        }
    }, [selectedVizUrl]);

    useEffect(() => {

        if (!selectedVizUrl && !userClosedSplitView && hasAnyVisualization(messages)) {
            setIsSplitMode(true);
        } else if (!selectedVizUrl && userClosedSplitView) {
            setIsSplitMode(false);
        }
    }, [selectedVizUrl, userClosedSplitView, messages]);

    const { handleSendMessage } = useMessageHandling({
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
        setIsSplitMode
    });

    const resetChat = useCallback(() => {
        setMessages([]);
        setTitle("");
        setCurrentChatId("new");
        setInput('');
        setIsThinking(false);
        setCurrentTypingIndex(-1);
        setDisplayedText('');
        setSelectedVizUrl(null);
        setIsSplitMode(false);
    }, [setMessages, setTitle, setCurrentChatId, setInput, setIsThinking, setCurrentTypingIndex, setDisplayedText]);

    const handleFileUpload = useCallback(
        async (file: File, sessionIdOverride?: string): Promise<FileUploadResponse> => {
            const sessionIdRaw = sessionIdOverride || currentChatId;
            const isNewSession = !sessionIdRaw || sessionIdRaw === '0' || sessionIdRaw.length < 10;
            const sessionId = isNewSession ? '' : sessionIdRaw;

            try {
                const result = await uploadFileToServer(file, sessionId);
                setCurrentChatId(result.sessionId);
                return result;
            } catch (err) {
                console.error("File upload error:", err);
                throw err;
            }
        },
        [currentChatId]
    );
    const handleVizSelect = (url: string | null) => {
        if (url === selectedVizUrl) {
            // Ignore same re-selection
            return;
        }
        if (url === null) {
            // Only close when explicitly called (not internal toggle)
            setSelectedVizUrl(null);
            // setUserClosedSplitView(true);
            // setIsSplitMode(false);
        } else {
            setSelectedVizUrl(url);
            // setIsSplitMode(true);
            // setUserClosedSplitView(false);
        }
    };
    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, []);

    return (
        <>
           <Box sx={{
               position: 'relative',
               display: 'flex',
               flexDirection: 'column',
               height: 'calc(100vh - 80px)', // Adjust based on actual header height
               width: '100%',
               overflow: 'hidden',
               bgcolor: 'background.paper',
           }}>
               <ChatMessages
                   title={title}
                   input={input}
                   setInput={setInput}
                   currentChatId={String(currentChatId)}
                   handleSendMessage={handleSendMessage}
                   handleFileUpload={(file: File) => handleFileUpload(file)}
                   messages={messages}
                   isThinking={isThinking}
                   currentTypingIndex={currentTypingIndex}
                   displayedText={displayedText}
                   selectedVizUrl={selectedVizUrl}
                   onVizSelect={handleVizSelect}
                   onCloseSplitView={() => {
                       setUserClosedSplitView(true);
                       setIsSplitMode(false);
                       setSelectedVizUrl(null);
                   }}
                   userClosedSplitView={userClosedSplitView}
               />
               <ChatInput
                   input={input}
                   setInput={setInput}
                   currentChatId={currentChatId}
                   handleSendMessage={handleSendMessage}
                   handleFileUpload={handleFileUpload}
                   isLoading={isThinking}
               />
           </Box>
        </>
    );
});

ChatInterface.displayName = 'ChatInterface';
export default ChatInterface;