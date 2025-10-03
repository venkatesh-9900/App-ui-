import {useEffect, useRef, useState} from "react";
import {ChatToolbar} from "@/components/chat/chat-toolbar.tsx";
import {AttachedFile, FileDetails, FileUploadResponse} from "@/types";
import {deleteFileFromServer, removeAttachedFile} from "@/hooks/upload-file.ts";
import {FileUpload, FileUploadHandle} from "@/components/chat/tools/file-upload.tsx";
import {Cross2Icon} from "@radix-ui/react-icons";
import {FiFile} from "react-icons/fi";
import {TextareaAutosize} from "@/components/chat/message/textarea-autosize.tsx";
import {Box, Container, Grid, IconButton, Paper, TextareaAutosize as MuiTextareaAutosize, Typography, CircularProgress} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseIcon from '@mui/icons-material/Close';
import { toast } from "sonner";
import { attachmentStyles } from "@/common/chat-messages";
import LoadingDots from "@/utils/loading-dots";

interface ChatInputProps {
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    currentChatId: string;
    handleSendMessage: (message: string, selectedAgent: string, attachedFiles: FileDetails[]) => void;
    handleFileUpload: (files: File[], sessionIdOverride?: string) => Promise<FileDetails[]>;
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
    const [attachedFiles, setAttachedFiles] = useState<FileDetails[]>([]);
    const [isTyping, setIsTyping] = useState<boolean>(false)
    const [isFileUploading, setIsFileUploading] = useState<boolean>(false);
    const [isRemoveAttachmentLoading, setIsRemoveAttachmentLoading] = useState<boolean>(false);
    const [attachmentSelectedForRemoval, setAttachmentSelectedForRemoval] = useState<number | null>(null);

    // Auto-resize textarea height based on content
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            // const scrollHeight = textareaRef.current.scrollHeight;
            // textareaRef.current.style.height = `${scrollHeight}px`;
        }
    }, []);


    const isEmpty = input.trim() === '';

    const onFileSelectedAndUpload = async (files: File[]) => {
        try {
            setIsFileUploading(true);
            // 1) upload immediately, get back an uploadId
            const uploadedFileList  = await handleFileUpload(files);
            // 2) store { file, uploadId } in state so we can preview the name locally
            setAttachedFiles(prev => [
                ...prev,
                ...uploadedFileList]);
            setIsFileUploading(false);
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
        setAttachmentSelectedForRemoval(index);
        setIsRemoveAttachmentLoading(true);
        // 1) Find the uploadId we need to delete
        const removingFileObj = attachedFiles[index];
        try {
            // await deleteFileFromServer(removingFileObj.file_id);
            // setAttachedFiles(prev => prev.filter((e, i) => e.file_id !== removingFileObj.file_id));
            const isNewSession = !currentChatId || currentChatId === '0' || currentChatId.length < 10;
            const sessionId = isNewSession ? '' : currentChatId;
            await removeAttachedFile({
                fileId: removingFileObj.file_id,
                currentChatId: sessionId,
                successTask: () => {
                    setAttachedFiles(prev => prev.filter((e, i) => e.file_id !== removingFileObj.file_id));
                },
                failureTask: () => {
                    toast('Failure', {
                        description: 'Could not remove file attachment'
                    });
                },
                errorTask: () => {
                    toast('Error', {
                        description: 'An unexpected error occurred while removing file attachment'
                    });
                }
            });
            setIsRemoveAttachmentLoading(false);
            setAttachmentSelectedForRemoval(null); 
        } catch (err) {
            console.error("Error deleting file:", err);
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
            handleSendMessage(input, selectedAgent, attachedFiles);
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
                    {(attachedFiles.length > 0 || isFileUploading) && (
                        <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
                            <Grid container spacing={1} sx={{alignItems: 'center'}}>
                                {attachedFiles.map((file_item, idx) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                                        <Paper
                                            variant="outlined"
                                            sx={attachmentStyles}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                                                {file_item.file_type.startsWith("image/") ? (
                                                    <Box
                                                        component="img"
                                                        src={file_item.public_link}
                                                        alt={file_item.original_file_name}
                                                        sx={{ height: 24, width: 24, objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                                                    />
                                                ) : (
                                                    <FiFile className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                                )}
                                                <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                                                    {file_item.original_file_name} ({(file_item.file_size / 1024).toFixed(1)} KB)
                                                </Typography>
                                            </Box>
                                            <IconButton
                                                size="small"
                                                onClick={(attachmentSelectedForRemoval === idx && isRemoveAttachmentLoading) ? undefined : () => removeAttachmentAt(idx)}
                                                sx={{
                                                    bgcolor: 'rgba(255,255,255,0.7)',
                                                    '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                                }}
                                            >
                                                {(attachmentSelectedForRemoval === idx && isRemoveAttachmentLoading) ? <CircularProgress size={16} /> : <CloseIcon sx={{ fontSize: 16 }} /> }
                                            </IconButton>
                                        </Paper>
                                    </Grid>
                                ))}
                                {isFileUploading && <Box sx={{ p: 1.5, borderRadius: '8px', bgcolor: 'action.hover' }}>
                                    <LoadingDots />
                                </Box>}
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