export interface FileUploadResponse {
    uploadId: string;
    status: string;     // "NEW"
    sessionId: string;  // the session ID
    messageId: number;  // the chat_message ID
}