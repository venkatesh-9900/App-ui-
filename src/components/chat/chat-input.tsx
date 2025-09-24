import {useEffect, useRef, useState} from "react";
import {ChatToolbar} from "@/components/chat/chat-toolbar.tsx";
import {AttachedFile, FileUploadResponse} from "@/types";
import {deleteFileFromServer} from "@/hooks/upload-file.ts";
import {FileUpload, FileUploadHandle} from "@/components/chat/tools/file-upload.tsx";
import {Cross2Icon} from "@radix-ui/react-icons";
import {FiFile} from "react-icons/fi";
import {TextareaAutosize} from "@/components/chat/message/textarea-autosize.tsx";
import {Box, Container, Grid, IconButton, Paper, TextareaAutosize as MuiTextareaAutosize, Typography} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseIcon from '@mui/icons-material/Close';

interface ChatInputProps {
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    currentChatId: string;
    handleSendMessage: (message: string, selectedAgent: string) => void;
    handleFileUpload: (file: File, sessionIdOverride?: string) => Promise<FileUploadResponse>;
    isLoading?: boolean;
    selectedAgent: string;
}

export function ChatInput({
                              input,
                              setInput,
                              currentChatId,
                              handleSendMessage,
                              handleFileUpload,
                              isLoading = false,
                              selectedAgent
                          }: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileUploadRef = useRef<FileUploadHandle>(null);
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
    const [isTyping, setIsTyping] = useState<boolean>(false)

    // Auto-resize textarea height based on content
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            // const scrollHeight = textareaRef.current.scrollHeight;
            // textareaRef.current.style.height = `${scrollHeight}px`;
        }
    }, []);


    const isEmpty = input.trim() === '';

    const onFileSelectedAndUpload = async (file: File) => {
        try {
            // 1) upload immediately, get back an uploadId
            const {
                uploadId,
                status,
                sessionId: returnedSessionId,
                messageId,
            }  = await handleFileUpload(file);
            // 2) store { file, uploadId } in state so we can preview the name locally
            setAttachedFiles(prev => [
                ...prev,
                { file, uploadId, sessionId: returnedSessionId, messageId }]);
        } catch (err) {
            // If upload fails, you could show an error toast here
            console.error("Error uploading file:", err);
        }
    };

    const handleFileAttachment = () => {
        if (!isLoading) {
            fileUploadRef.current?.triggerFileDialog();
        }
    };
    const removeAttachmentAt = async (index: number) => {
        // 1) Find the uploadId we need to delete
        const { messageId } = attachedFiles[index];
        try {
            await deleteFileFromServer(messageId);
            setAttachedFiles(prev => prev.filter((_, i) => i !== index));
        } catch (err) {
            console.error("Error deleting file messageId:", messageId, err);
        }
    };
    const handleKeyDown = (e: React.KeyboardEvent<Element>): void => {
        if (
            e instanceof KeyboardEvent &&
            e.key === 'Enter' &&
            !e.shiftKey
        ) {
            e.preventDefault();
            // Optional: trigger your send logic here if needed
        }
    };
    const handleMessageSubmit = () => {
        if (!isLoading && input.trim()) {
            handleSendMessage(input, selectedAgent);
            setInput("");
            setAttachedFiles([]);
        }
    };
    const handleInputChange = (value: string) => {
        setInput(value);
    };

    const handlePaste = (event: React.ClipboardEvent) => {

    }
    // const handlePaste = (event: React.ClipboardEvent) => {
    //     const imagesAllowed = LLM_LIST.find(
    //         llm => llm.modelId === chatSettings?.model
    //     )?.imageInput
    //
    //     const items = event.clipboardData.items
    //     for (const item of items) {
    //         if (item.type.indexOf("image") === 0) {
    //             if (!imagesAllowed) {
    //                 toast.error(
    //                     `Images are not supported for this model. Use models like GPT-4 Vision instead.`
    //                 )
    //                 return
    //             }
    //             const file = item.getAsFile()
    //             if (!file) return
    //             handleSelectDeviceFile(file)
    //         }
    //     }
    // }

    return (
        <Box
            sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'background.paper',
                p: { xs: 1, sm: 2 },
                zIndex: 10,
            }}
        >
            <Container maxWidth="md">
                <Paper
                    variant="outlined"
                    sx={{
                        position: 'relative',
                        borderRadius: '16px',
                        pb: 5,
                        bgcolor: alpha('#708090', 0.1),
                        border: 'none'
                    }}
                >
                    {attachedFiles.length > 0 && (
                        <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
                            <Grid container spacing={1}>
                                {attachedFiles.map(({ file }, idx) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                position: 'relative',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                bgcolor: 'grey.100',
                                                p: 1,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                                                {file.type.startsWith("image/") ? (
                                                    <Box
                                                        component="img"
                                                        src={URL.createObjectURL(file)}
                                                        alt={file.name}
                                                        sx={{ height: 24, width: 24, objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                                                    />
                                                ) : (
                                                    <FiFile className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                                )}
                                                <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                                                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                                </Typography>
                                            </Box>
                                            <IconButton
                                                size="small"
                                                onClick={() => removeAttachmentAt(idx)}
                                                sx={{
                                                    position: 'absolute', top: 2, right: 2,
                                                    bgcolor: 'rgba(255,255,255,0.7)',
                                                    '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                                }}
                                            >
                                                <CloseIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}
                    <Box sx={{overflowY: 'scroll', maxHeight: '200px', p: 2}}>
                        <TextareaAutosize
                            className="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring text-md flex w-full resize-none rounded-md border-none bg-transparent px-4 py-3 pb-16 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder={`Ask anything.`}
                            onValueChange={handleInputChange}
                            value={input}
                            minRows={1}
                        />
                    </Box>
                    <Box sx={{ position: 'absolute', bottom: 1, left: 1, right: 1, p: 1 }}>
                        <ChatToolbar isEmpty={isEmpty}
                                     handleSubmit={handleMessageSubmit}
                                     handleFileAttachment={handleFileAttachment}
                        />
                    </Box>
                    <FileUpload
                        ref={fileUploadRef}
                        onFileUpload={onFileSelectedAndUpload}
                        disabled={isLoading}
                        showButton={false}
                    />
                </Paper>
            </Container>
        </Box>
    );
}