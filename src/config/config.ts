const resolveApiBaseUrl = (): string => {
    // Check for Next.js environment variables
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
        return process.env.NEXT_PUBLIC_API_BASE_URL;
    }

    // Fallback to dynamic resolution based on window location (client-side only)
    if (typeof window !== 'undefined') {
        const protocol = window.location.protocol;
        const host = window.location.hostname;
        const port = window.location.port === "3000" ? "10000" : window.location.port;
        
        return `${protocol}//${host}:${port}`;
    }

    // Default fallback for server-side rendering
    return 'http://localhost:10000';
};

export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export const GOOGLE_REDIRECT_URI = process.env.REACT_APP_GOOGLE_REDIRECT_URI;

export const API_BASE_URL = resolveApiBaseUrl();

export const ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        REGISTER: `${API_BASE_URL}/auth/register`,
        FETCH_LOGIN_URL: `/api/auth/url/login`,
        FETCH_LOGOUT_URL: `/api/auth/url/logout`,
        LOGOUT: `/api/auth/logout`,
        ACCESS_TOKEN: `/api/auth/token`,
        ROOT_ACCESS_TOKEN: `/api/auth/token/root`,
        USER_ACCESS_TOKEN: `/api/auth/token/user`,
        SIGNUP_ROOT: `/api/auth/signup/root`,
        RETRIEVE_ORG: `/api/auth/signup/root/retrieve-org`,
        REQUEST_OTP: `/api/auth/otp`,
        REFRESH_TOKEN: `/api/auth/refresh`,
        VALIDATE: `/api/auth/validate`,
        SESSION: `${API_BASE_URL}/auth/me`,
        GOOGLE_EXCHANGE: `${API_BASE_URL}/auth/google/exchange`,
        GOOGLE_SIGN_IN: `${API_BASE_URL}/auth/google/register-or-login`,
    },
    INTERACTIONS: {
        STANDARD: {
            url: `/api/interaction/chat`,
            stream: false
        },
        STREAM_STANDARD: {
            url: `/api/interaction/chat`,
            stream: true
        }
    },
    USERS: {
        GET: `/api/auth/user-info`,
        UPDATE: `${API_BASE_URL}/api/user/profile`,
        UPLOAD_FILE: `${API_BASE_URL}/api/user/upload-profile-image`,
    },
    FETCH_AGENTS_LIST: `/api/interaction/agents-list`,
    API_Keys: {
        CREATE_API_KEY: `${API_BASE_URL}/api/api-keys/create`,
        FETCH_API_KEYS_LIST: `${API_BASE_URL}/api/api-keys/list`,
        DELETE_API_KEY: `${API_BASE_URL}/api/api-keys/delete`
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
    CHAT_SESSION: `/api/interaction/fetch-all-sessions`,
    CHAT_SESSION_MESSAGES: `/api/interaction/fetch-interaction`,
    SHARED_CHAT_SESSION_MESSAGES: `/api/interaction/fetch-shared-interaction`,
    FETCH_SESSION_DETAILS: `/api/interaction/fetch-session-details`,
    DELETE_SESSION: `/api/interaction/delete-session`,
    IS_NEW_SESSION: `${API_BASE_URL}/api/ai/session/{sessionId}/isNew`,
    ARCHIVE_SESSION: `${API_BASE_URL}/api/ai/sessions/{sessionId}/archive`,
    UPDATE_SESSION_TITLE: `/api/interaction/update-session-title`,
    UPLOAD_FILE: `/api/interaction/upload-files`,
    REMOVE_FILE: `/api/interaction/remove-file-attachment`,
    TOGGLE_CHAT_SHARABILITY: `/api/interaction/toggle-session-sharability`,
    UPDATE_SESSION_ID_TO_ATTACHED_FILES: `/api/interaction/update-session-id-to-uploaded-files`,
    GET_FILE_DETAILS_FROM_URL: `/api/interaction/get-file-objects-from-public-links`,
    WEB3_MONITORING: {
        SEARCH_TXN: `/api/monitoring/search-txn`,
        CHAINLIST: `/api/monitoring/chainlist`,
        GET_NEIGHBOURS: `/api/monitoring/get-neighbours`,
        ACCOUNTS: `/api/monitoring/accounts`
    },
    OPERATOR: {
        APIS: `/api/operator/apis`,
        UNBOUND_APIS: `/api/operator/apis/unbound`,
        SERVICES: `/api/operator/api-services`,
        PERMISSIONS: `/api/operator/permissions`,
        MAPPINGS: `/api/operator/api-permissions`
    },
    IAM: {
        GROUPS: `/api/groups`,
        MY_SPACES: `/api/groups/my-spaces`,
        ROLES: `/api/roles`,
        USER_GROUP_MAPPINGS: `/api/groups/user-mappings`,
        GROUP_ROLE_MAPPINGS: `/api/groups/role-mappings`,
        USER_ROLE_MAPPINGS: `/api/roles/user-mappings`,
        ROLE_PERMISSION_MAPPINGS: `/api/roles/permission-mappings`,
        ROLE_PERMISSION_MAPPINGS_BULK: `/api/roles/permission-mappings/bulk`,
        USERS: `/api/iam/users`,
        OAUTH_ORGANIZATIONS: `/api/oauth/organizations`,
        OAUTH_ORG_IDP_MAPPINGS: `/api/oauth/organizations/identity-providers`,
        OAUTH_IDENTITY_PROVIDERS: `/api/oauth/identity-providers`,
    },
    GET_PRESIGNED_URL: `/api/interaction/get-presigned-url-for-attached-file`,
    CREATE_GROUP: `/api/interaction/create-group`,
    DELETE_GROUP: `/api/interaction/delete-group`,
    FETCH_ALL_GROUPS: `/api/interaction/fetch-all-groups`,
    FETCH_GROUP_SESSIONS: `/api/interaction/fetch-group-sessions`,
    MOVE_SESSION_TO_GROUP: `/api/interaction/move-session-to-group`,
    GET_CHAT_TITLE: `/api/interaction/get-chat-title`,
    SCHEDULE: {
        LIST: `/api/schedules`,
        DELETE: (id: string) => `/api/schedules?id=${id}`,
        TOGGLE: (id: string, action: 'pause' | 'resume') => `/api/schedules/toggle?id=${id}&action=${action}`
    }
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