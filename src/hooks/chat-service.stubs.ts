import { Chat, Message } from "@/types";

/**
 * Stub for `fetchUserChatSessions`.
 * Returns a predefined list of chat sessions.
 */
export const fetchUserChatSessions = async (): Promise<Chat[]> => {
    console.log("STUB: fetchUserChatSessions called");
    return Promise.resolve([
        { id: '1', title: 'First Conversation', createdAt: (new Date()).toDateString(), messages: [] },
        { id: '2', title: 'Analyzing Wallet Risk', createdAt: (new Date()).toDateString(), messages: [] },
        { id: '3', title: 'Long conversation title that should be truncated properly', createdAt: (new Date()).toDateString(), messages: [] },
    ]);
};

/**
 * Stub for `loadChatMessages`.
 * Returns a sample chat history for a given chat ID.
 */
export const loadChatMessages = async (chatId: string): Promise<{ title: string; messages: Message[] }> => {
    console.log(`STUB: loadChatMessages called for chatId: ${chatId}`);
    const messages: Message[] = [
        { id: 'msg1', text: { summary: 'Hello, how can I help you analyze this wallet?', type: 'text' }, isUser: false, timestamp: new Date().toISOString() },
        { id: 'msg2', text: { summary: 'Analyze wallet 0x123...', type: 'text' }, isUser: true, timestamp: new Date().toISOString() },
        // { id: 'msg3', text: { summary: 'This wallet has a high risk score of 85. It has interacted with sanctioned entities.', type: 'text' }, isUser: false, timestamp: new Date().toISOString() },
        {
            id: 'msg3',
            text: {
                summary: 'This wallet has a high risk score of 85. It has interacted with sanctioned entities.',
                type: 'visualization',
                visualizationUrls: ['/visualizations/sankey.html']
            },
            isUser: false,
            timestamp: new Date().toISOString()
        },
    ];
    return Promise.resolve({ title: `Chat ${chatId}`, messages });
};

/**
 * Stub for `fetchChatMessages`.
 * Returns raw message data similar to what the API would send.
 */
export const fetchChatMessages = async (chatId: string): Promise<{ title: string; messages: any[] }> => {
    console.log(`STUB: fetchChatMessages called for chatId: ${chatId}`);
    const rawMessages = [
        { role: 'assistant', content: { recommendation: 'Hello there!' }, createdAt: new Date().toISOString(), messageId: 'msg1' },
        { role: 'user', content: { query: 'Analyze this wallet' }, createdAt: new Date().toISOString(), messageId: 'msg2' },
    ];
    return Promise.resolve({ title: `Chat ${chatId}`, messages: rawMessages });
};

/**
 * Stub for `checkIsSessionNew`.
 * Simulates checking if a session is new.
 */
export const checkIsSessionNew = async (sessionId: string): Promise<boolean> => {
    console.log(`STUB: checkIsSessionNew called for sessionId: ${sessionId}`);
    return Promise.resolve(sessionId === 'new');
};

/**
 * Stub for `removeChat`.
 * Simulates deleting a chat session.
 */
export const removeChat = async (chatId: string): Promise<void> => {
    console.log(`STUB: removeChat called for chatId: ${chatId}`);
    return Promise.resolve();
};

/**
 * Stub for `archiveChat`.
 * Simulates archiving a chat session.
 */
export const archiveChat = async (chatId: string): Promise<void> => {
    console.log(`STUB: archiveChat called for chatId: ${chatId}`);
    return Promise.resolve();
};

/**
 * Stub for `updateChatTitle`.
 * Simulates updating a chat title.
 */
export const updateChatTitle = async (chatId: string, title: string): Promise<void> => {
    console.log(`STUB: updateChatTitle called for chatId: ${chatId} with title: ${title}`);
    return Promise.resolve();
};

export const hasAnyVisualization = (messages: Message[]): boolean => {
    return false;
};

export const getRenderVizUrls=(message: Message): string[] => {
    return ['http://localhost:3000/visualizations/sankey.html', 'http://localhost:8000/visualizations/sankey.html'];
}
export const getAllRenderVizUrls = (messages: Message[]): string[]  => {
    return ['http://localhost:3000/visualizations/sankey.html', 'http://localhost:8000/visualizations/sankey.html'];
}
