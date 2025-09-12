/**
 * Represents the raw JSON structure of the backend's JsonNode.
 * It's a flexible object that can hold any key-value pairs.
 */
export interface JsonNode {
    [key: string]: any;
}

/**
 * Generic wrapper for all API responses, matching the Java ChatApiResponse<T>.
 */
export interface ChatApiResponse<T> {
    status: 'success' | 'error';
    message: string;
    data: T;
}

/**
 * Represents the raw data for a single chat session, matching the Java ChatSessionModel.
 */
export interface ChatSessionModel {
    sessionId: string; // Maps from UUID
    title: string;
    createdAt: string; // Maps from LocalDateTime, typically as an ISO string
}

/**
 * Represents the raw data for a single chat message, matching the Java ChatMessageModel.
 */
export interface ChatMessageModel {
    messageId: number; // Maps from Long
    role: 'user' | 'ai';
    content: JsonNode;
    requestId: string;
    createdAt: string; // Maps from LocalDateTime
    type: string | null;
    visualizationUrls: string[];
}

/**
 * Represents the data payload for the endpoint that fetches all messages for a session.
 * Matches the Java ChatMessagesWithTitle class.
 */
export interface ChatMessagesWithTitle {
    title: string;
    messages: ChatMessageModel[];
}
