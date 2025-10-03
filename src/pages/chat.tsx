import {memo, useCallback, useEffect, useRef, useState} from "react";
import {ChatMessages} from "@/components/chat/chat-messages.tsx";
import {ChatInterfaceProps, ChatMessage, FileDetails, FileUploadResponse, Message} from "@/types";
import {useLocation, useNavigate} from 'react-router-dom';
import {ChatInput} from "@/components/chat/chat-input.tsx";
import {fetchSessionDetails, hasAnyVisualization, loadChatMessages, toggleChatSharability} from "@/hooks";
import {uploadFilesToServer, uploadFileToServer} from "@/hooks/upload-file.ts";
import {useMessageHandling} from "@/hooks/use-message-handling.ts";
import {Box} from "@mui/material";
import {toast} from "sonner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MuiToggleIconButton } from "@/components/ui/toggle-icon-button";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { InfoOutlineRounded } from "@mui/icons-material";
import { InfoIcon } from "lucide-react";
import { ShareLinkDialog } from "@/components/ui/share-link-dialog";
import { getAgentsList } from "@/hooks/agent-service";
import { set } from "date-fns";

const ChatInterface: React.FC<ChatInterfaceProps> = memo(({ params }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const query = location.search;
    const urlParams = new URLSearchParams(query);
    const userId : string | null = urlParams.get("userid"); // Would be null if it is a self session
    const chatId = params?.id ?? 'new';
    const [currentChatId, setCurrentChatId] = useState(chatId);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [title, setTitle] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [currentTypingIndex, setCurrentTypingIndex] = useState(-1);
    const [displayedText, setDisplayedText] = useState('');
    const manuallyLoadedRef = useRef(false);
    const [isSplitMode, setIsSplitMode] = useState(false);
    const [userClosedSplitView, setUserClosedSplitView] = useState(false);
    const [selectedVizUrl, setSelectedVizUrl] = useState<string | null>(null);
    const [agentsList, setAgentsList] = useState<string[]>([]);
    const [selectedAgent, setSelectedAgent] = useState("");
    const [isShared, setIsShared] = useState(false);
    const [isSharedLoading, setIsSharedLoading] = useState(false);
    const [openShareLinkDialogBox, setOpenShareLinkDialogBox] = useState(false);
    const [shareLink, setShareLink] = useState("");
    const [readOnly, setReadOnly] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const getBaseUrl = (): string => {
        return `${window.location.protocol}//${window.location.host}`;
    };

    useEffect(() => {
        setCurrentChatId(chatId);
    }, [chatId, query]);

    useEffect(() => {
        const fetchSessionDetailsAPICall = async () => {
            if (userId) { // This means it is a shared session
                return;
            }
            if (!currentChatId || currentChatId === '' || currentChatId === 'new') {
                // Fallback to reset
                resetChat();
                return;
            }
            if (manuallyLoadedRef.current) {
                manuallyLoadedRef.current = false;
                return;
            }
            setIsSharedLoading(true);
            await fetchSessionDetails({
                sessionId: currentChatId,
                successTask: (is_sharable: boolean, sharable_link: string) => {
                    setIsShared(is_sharable);
                    if (is_sharable) {
                        setShareLink(`${getBaseUrl()}${sharable_link}`);
                    }
                    setIsSharedLoading(false);
                },
                failureTask: () => {
                    toast('Failure', {
                        description: 'Could not load session details'
                    });
                    console.error('Failed to load session details');
                },
                errorTask: () => {
                    toast('Error', {
                        description: 'An unexpected error occurred while loading session details'
                    });
                    console.error('Error loading session details');
                }
            });
            setIsSharedLoading(false);
        }

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
            const { readonly, conversations } = await loadChatMessages({
                sessionId: currentChatId,
                userid: userId,
                failureTask: () => {
                    toast('Failure', {
                        description: 'Could not load chat messages'
                    });
                    console.error('Failed to load chat messages');
                },
                errorTask: () => {
                    toast('Error', {
                        description: 'An unexpected error occurred while loading chat messages'
                    });
                    console.error('Error loading chat messages');
                }
            });
            console.log("Read_only:", readonly);
            setReadOnly(readonly);
            console.log("Conversations:", conversations);
            setMessages(conversations);
            setTitle('');
            // try {
            //     const { title, messages } = await loadChatMessages(currentChatId);
            //     setMessages(messages);
            //     setTitle(title || '');
            // } catch (err) {
            //     console.error('Failed to load selected chat:', err);
            //     resetChat();
            // }
            // Cleanup shared state
            setInput('');
            setCurrentTypingIndex(-1);
            setDisplayedText('');
        };
        fetchSessionDetailsAPICall();
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

    const showError = () => {
        toast('Error', {
            description: 'An unexpected error occurred. Please reload the page and try again.'
        });
    }

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
        setIsSplitMode,
        showError
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
        async (files: File[], sessionIdOverride?: string): Promise<FileDetails[]> => {
            const sessionIdRaw = sessionIdOverride || currentChatId;
            const isNewSession = !sessionIdRaw || sessionIdRaw === '0' || sessionIdRaw.length < 10;
            const sessionId = isNewSession ? '' : sessionIdRaw;

            try {
                const result = await uploadFilesToServer({
                    files: files, 
                    currentChatId: sessionId,
                    fileFailureTask: (file_error) => {
                        toast('Failure', {
                            description: 'One or more files could not be uploaded'
                        });
                    },
                    failureTask: () => {
                        toast('Failure', {
                            description: 'Could not upload files'
                        });
                    },
                    errorTask: () => {
                        toast(
                            'Error', {
                                description: 'An unexpected error occurred while uploading files'
                            }
                        )
                    }
                });
                // setCurrentChatId(result.sessionId);
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
    const handleAgentSelect = async (value: string) => {
        console.log("Selected Agent:", value);
        setSelectedAgent(value);
    };
    const handleToggleShareChat = (value: boolean) => {
        const handleToggleChatSharability = async () => {
            setIsSharedLoading(true);
            await toggleChatSharability({
                sessionId: currentChatId,
                isSharable: value,
                successTask: (link) => {
                    toast('Success', {
                        description: 'Updated successfully',
                    });
                    if (value) {
                        setOpenShareLinkDialogBox(true);
                        setShareLink(link ? `${getBaseUrl()}${link}` : ``);
                    }
                    setIsShared(value);
                },
                failureTask: () => {
                    toast('Failure', {
                        description: 'Could not update the chat session. Please try again.',
                    });
                },
                errorTask: () => {
                    toast('Error', {
                        description: 'A unexpected error occurred while updating the chat session.',
                    });
                }
            });
            setIsSharedLoading(false);
        }
        if (!currentChatId || currentChatId === '' || currentChatId === 'new') {
            toast(
                "Cannot be updated", {
                    description: "This preference can be updated once chat session is saved"
                }
            )
        } else {
            handleToggleChatSharability();
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        // const urlParams = new URLSearchParams(query);
        // console.log("Sharable: ", typeof urlParams.get("sharable"));
        // console.log("UserId: ", typeof urlParams.get("userid"));
        // console.log("Params: ", params);
        const fetchAgentsList = async () => {
            await getAgentsList({
                successTask: (data: string[]) => {
                    console.log(data);
                    setAgentsList(data);
                    if (data.length > 0) {
                        setSelectedAgent(data[0]);
                    }
                },
                failureTask: () => {
                    toast('Failure', {
                        description: 'Could not fetch agents list.',
                    });
                },
                errorTask: () => {
                    toast('Error', {
                        description: 'An unexpected error occurred while fetching agents list.',
                    });
                }
            });
        };

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
        fetchAgentsList();
    }, []);

    return (
        <Box>
            {!readOnly && <Box sx={{
               display: 'flex',
               flexDirection: 'row',
               height: '50px', // Adjust based on actual header height
               width: '100%',
               bgcolor: 'background.paper',
               alignItems: 'center',
               p: 1,
               gap: 2
            }}>
                <Box sx={{ width: '130px' }}>
                    {/* <Label className="text-sm font-medium text-slate-600">Select Team</Label> */}
                    <Select value={selectedAgent ?? ''} onValueChange={handleAgentSelect}>
                        <SelectTrigger className="mt-1 bg-slate-100">
                            <SelectValue placeholder="Select Agent" />
                        </SelectTrigger>
                        <SelectContent>
                            {agentsList.map((agent) => (
                                <SelectItem key={agent} value={agent}>
                                    {agent.charAt(0).toUpperCase() + agent.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', direction: 'row' }}>
                    <MuiToggleIconButton
                        isSharable={isShared}
                        isLoading={isSharedLoading}
                        onToggleChange={handleToggleShareChat}
                    />
                    <p style={{ marginRight: '8px' }}>{isSharedLoading ? '' : isShared ? 'ON' : 'OFF'}</p>
                    {!isSharedLoading && isShared && <InfoIcon size={20} color="gray" style={{ cursor: 'pointer' }} onClick={() => { setOpenShareLinkDialogBox(true); }}/>}
                </Box>
            </Box>}
           <Box sx={{
               position: 'relative',
               display: 'flex',
               flexDirection: 'column',
               height: readOnly ? 'calc(100vh - 80px)' : 'calc(100vh - 160px)', // Adjust based on actual header height
               width: '100%',
               overflow: 'hidden',
               bgcolor: 'background.paper',
           }}>
               <ChatMessages
                   title={title}
                   input={input}
                   readonly={readOnly}
                   setInput={setInput}
                   currentChatId={String(currentChatId)}
                   handleSendMessage={handleSendMessage}
                   handleFileUpload={(files: File[]) => handleFileUpload(files)}
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
                   selectedAgent={selectedAgent}
               />
               {!readOnly && <ChatInput
                   input={input}
                   setInput={setInput}
                   currentChatId={currentChatId}
                   handleSendMessage={handleSendMessage}
                   handleFileUpload={handleFileUpload}
                   isLoading={isThinking}
                   selectedAgent={selectedAgent}
               />}
           </Box>
           <ShareLinkDialog link={shareLink} open={openShareLinkDialogBox} onClose={() => setOpenShareLinkDialogBox(false)} />
        </Box>
    );
});

ChatInterface.displayName = 'ChatInterface';
export default ChatInterface;