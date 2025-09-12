
const resolveApiBaseUrl = (): string => {
    if (import.meta.env?.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    if (process.env.REACT_APP_API_BASE_URL) {
        return process.env.REACT_APP_API_BASE_URL;
    }

    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = window.location.port === "3000" ? "8080" : window.location.port;

    return `${protocol}//${host}:${port}`;
};

export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export const GOOGLE_REDIRECT_URI = process.env.REACT_APP_GOOGLE_REDIRECT_URI;

export const API_BASE_URL = resolveApiBaseUrl();

export const ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        REGISTER: `${API_BASE_URL}/auth/register`,
        LOGOUT: `${API_BASE_URL}/auth/logout`,
        SESSION: `${API_BASE_URL}/auth/me`,
        GOOGLE_EXCHANGE: `${API_BASE_URL}/auth/google/exchange`,
        GOOGLE_SIGN_IN: `${API_BASE_URL}/auth/google/register-or-login`,
    },
    INTERACTIONS: {
        STANDARD: {
            url: `${API_BASE_URL}/api/ai/interaction/chat`,
            type: 'generic',
            stream: false
        },
        STREAM_STANDARD: {
            url: `${API_BASE_URL}/api/ai/interaction/chat-stream`,
            type: 'generic',
            stream: true
        }
    },
    USERS: {
        GET: `${API_BASE_URL}/api/user/profile`,
        UPDATE: `${API_BASE_URL}/api/user/profile`,
        UPLOAD_FILE: `${API_BASE_URL}/api/user/upload-profile-image`,
    },
    TEAM_MGR: {
        TEAM: {
            CREATE: `${API_BASE_URL}/api/team-management/create-team`,
            GET_ALL: `${API_BASE_URL}/api/team-management/get-all-teams`,
            GET_ONE: (id: number) => `${API_BASE_URL}/api/team-management/get-single-team-details/${id}`,
            UPDATE: (id: number) => `${API_BASE_URL}/api/team-management/update-team-details/${id}`,
            DELETE: (id: number) => `${API_BASE_URL}/api/team-management/delete-team/${id}`,
            CONFIGURE_LOAD: `${API_BASE_URL}/api/team-management/team-config/all`,
            CONFIGURE_UPDATE: `${API_BASE_URL}/api/team-management/team-config/update`
        },
        AGENT: {
            CREATE: `${API_BASE_URL}/api/team-management/create-agent`,
            GET_ALL: `${API_BASE_URL}/api/team-management/get-all-agents`,
            GET_ONE: (id: number) => `${API_BASE_URL}/api/team-management/get-single-agent-details/${id}`,
            UPDATE: (id: number) => `${API_BASE_URL}/api/team-management/update-agent-details/${id}`,
            DELETE: (id: number) => `${API_BASE_URL}/api/team-management/delete-agent/${id}`
        },

        SYSTEM_INSTRUCTION: {
            CREATE: `${API_BASE_URL}/api/team-management/create-system-instruction`,
            UPDATE: (id: number) => `${API_BASE_URL}/api/team-management/update-system-instruction/${id}`,
            DELETE: (id: number) => `${API_BASE_URL}/api/team-management/delete-system-instruction/${id}`
        },

        MCP_URL: {
            CREATE: `${API_BASE_URL}/api/team-management/create-mcp-url`,
            CREATE_BULK: `${API_BASE_URL}/api/team-management/create-bulk-mcp-urls`,
            GET_ALL: `${API_BASE_URL}/api/team-management/get-all-mcp-urls`,
            UPDATE: (id: number) => `${API_BASE_URL}/api/team-management/update-mcp-url/${id}`,
            DELETE: (id: number) => `${API_BASE_URL}/api/team-management/delete-mcp-url/${id}`,
            DELETE_BULK: `${API_BASE_URL}/api/team-management/delete-bulk-mcp-urls`
        }
    },
    CHAT_SESSION: `${API_BASE_URL}/api/ai/sessions`,
    CHAT_SESSION_MESSAGES: `${API_BASE_URL}/api/ai/sessions/{sessionId}/messages`,
    DELETE_SESSION: `${API_BASE_URL}/api/ai/sessions/{sessionId}`,
    IS_NEW_SESSION: `${API_BASE_URL}/api/ai/session/{sessionId}/isNew`,
    ARCHIVE_SESSION: `${API_BASE_URL}/api/ai/sessions/{sessionId}/archive`,
    UPDATE_SESSION_TITLE: `${API_BASE_URL}/api/ai/sessions/{sessionId}/title`,
    UPLOAD_FILE: `${API_BASE_URL}/api/ai/upload`,
    REMOVE_FILE: `${API_BASE_URL}/api/ai/message/{messageId}/attachment`,
};
export const SELECTED_ENDPOINT =
    ENDPOINTS.INTERACTIONS.STREAM_STANDARD;


export default {
    API_BASE_URL,
    ENDPOINTS,
    SELECTED_ENDPOINT,
    GOOGLE_CLIENT_ID,
    GOOGLE_REDIRECT_URI
};