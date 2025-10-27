/**
 * Authentication Types
 * 
 * Type definitions for authentication-related data structures
 */

export interface LoginResponse {
    url: string;
}

export interface LogoutResponse {
    id_token: string;
}

export interface TokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
}

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    created_at?: string;
    updated_at?: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    accessToken: string | null;
    user: UserProfile | null;
}

export interface AuthContextType {
    isAuthenticated: boolean;
    accessToken: string | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    setAuthentication: (token: string) => void;
}

export interface ApiError {
    message: string;
    status: number;
    code?: string;
}

export interface ApiResponse<T> {
    data: T;
    status: string;
    message?: string;
}

