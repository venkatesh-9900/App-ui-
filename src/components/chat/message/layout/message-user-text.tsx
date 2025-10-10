import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {Copy, Edit, Check, Send, X } from "lucide-react";
import {Textarea} from "@/components/ui/textarea.tsx";
import Box from "@mui/material/Box";
import { FileDetails } from "@/types";
import Grid from "@mui/material/Grid";
import { Paper, Typography } from "@mui/material";
import {FiFile} from "react-icons/fi";
import { attachmentStyles } from "@/common/chat-messages";

interface MessageUserPlainTextProps {
    input: string;
    setInput: (value: string) => void;
    readonly: boolean;
    currentChatId: string;
    handleSendMessage: (message: string, selectedAgent: string, attachedFiles: FileDetails[]) => void;
    handleEditClick: () => void;
    handleUpdate: () => void;
    handleCancel: () => void;
    displayText: string;
    isEditing: boolean;
    selectedAgent: string;
    attachments: FileDetails[];
}

const MessageUserPlainText: React.FC<MessageUserPlainTextProps> = ({
                                                                       input,
                                                                       setInput,
                                                                       readonly,
                                                                       currentChatId,
                                                                       handleSendMessage,
                                                                       handleEditClick,
                                                                       handleUpdate,
                                                                       handleCancel,
                                                                       displayText,
                                                                       isEditing,
                                                                       selectedAgent,
                                                                       attachments
                                                                     }) => {

    const [editingContent, setEditingContent] = useState<string>("");
    const [copyFeedback, setCopyFeedback] = useState(false);

    const fallbackCopyTextToClipboard = (text: string) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";  // Avoid scrolling to bottom
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const success = document.execCommand("copy");
        } catch (err) {
            console.error("Fallback: Copy failed", err);
        }

        document.body.removeChild(textArea);
    };

    const handleCopy = () => {
        if (navigator?.clipboard?.writeText) {
            navigator.clipboard.writeText(displayText)
                .then(() => {
                    setCopyFeedback(true);
                    setTimeout(() => setCopyFeedback(false), 1500);
                })
                .catch((err) => {
                    console.error("Clipboard write failed, falling back:", err);
                    fallbackCopyTextToClipboard(displayText);
                });
        } else {
            fallbackCopyTextToClipboard(displayText);
        }
    };

    const handleEditMessage = () => {
        setEditingContent(displayText);
        handleEditClick();
    };

    const handleSendEdit = () => {
        let message =editingContent.trim()
        setInput(message);
        handleSendMessage(message, selectedAgent, []);
        handleUpdate();
    };

    return (
        <Box component={"div"} style={{ position: "relative" }}>
            {!isEditing && (
                <Box component={"div"}
                    style={{
                        position: "absolute",
                        bottom: "4px",
                        right: "10px",
                        backgroundColor: "#f0f7ff",
                        borderRadius: "6px",
                        padding: "2px",
                        marginBottom: "4px"
                    }}
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="h-6 w-6 p-0 hover:bg-white/80"
                        title="Copy message"
                    >
                        {copyFeedback ? (
                            <Check className="w-3 h-3 text-green-600" />
                        ) : (
                            <Copy className="w-3 h-3 text-slate-500" />
                        )}
                    </Button>
                    {!readonly && <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditMessage}
                        className="h-6 w-6 p-0 hover:bg-white/80"
                        title="Edit message"
                    >
                        <Edit className="w-3 h-3 text-slate-500" />
                    </Button>}
                </Box>
            )}
            {/* Editing View */}
            {!readonly && isEditing ? (
                <Box
                    component={"div"}
                    className="user-edit-message w-full whitespace-pre-line"
                    style={{
                        backgroundColor: '#ffffff',
                        padding: "2.5rem 1rem 1rem 1rem",
                        borderRadius: '0.5rem',
                        maxWidth: '100%', // Allow full width
                    }}
                >
                    <Textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full min-h-[120px] resize-none border border-slate-300 rounded-md px-3 py-2 focus:outline-none"
                        placeholder="Edit your message..."
                        autoFocus
                    />
                    <Box component={"div"} className="flex justify-end gap-2 mt-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                            className="h-8 px-3"
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSendEdit}
                            disabled={!editingContent.trim()}
                            className="h-8 px-3 gap-1"
                        >
                            <Send className="w-3 h-3" />
                            Send
                        </Button>
                    </Box>
                </Box>
            ) : (
                <Box
                    component={"div"}
                    className="user-message whitespace-pre-line"
                    style={{
                        backgroundColor: "#f0f7ff",
                        padding: "1.25rem 3rem 3rem 1.5rem",
                        borderRadius: "0.5rem",
                        whiteSpace: "pre-line",
                        wordBreak: 'break-word',
                        maxWidth: '100%', // Allow full width
                    }}
                >
                    <Grid container spacing={1} sx={{mb: 1}}>
                        {attachments.map((file_item, idx) => (
                            <Grid size={{ xs: 12, sm: 5 }} key={idx}>
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
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                    {displayText}
                </Box>
            )}
        </Box>
    );
};

export default MessageUserPlainText;