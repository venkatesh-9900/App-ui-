export interface FileUploadResponse {
    uploadId: string;
    status: string;     // "NEW"
    sessionId: string;  // the session ID
    messageId: number;  // the chat_message ID
}
export interface AttachedFile {
    file: File;
    uploadId: string;
    sessionId: string;
    messageId: number;
}
export interface FileUploadResponse {
    uploadId: string;
    status: string;     // "NEW"
    sessionId: string;  // the session ID
    messageId: number;  // the chat_message ID
}

export interface UserProfileImageUploadResponse {
    userId: string;
    imageUrl: string;
    status: 'Success' | 'Error';
}

export interface FileDetails {
    file_id: string;
    original_file_name: string;
    public_link: string;
    file_type: string;
    file_size: number;
}