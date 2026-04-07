"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser, fetchLoginURL, fetchLogoutURL, refreshAccessToken, requestOTP, loginWithOTP } from '@/hooks/auth-service';
import config from '@/config/config';

interface UserInfo {
    id?: string;
    email?: string;
    name?: string;
    [key: string]: any;
}

interface AuthState {
    isAuthenticated: boolean;
    accessToken: string | null;
    userInfo: UserInfo | null;
    isLoading: boolean;
    isRootUser: boolean;
}

interface AuthContextType extends AuthState {
    login: () => Promise<void>;
    requestOTP: (params: { email: string, successTask: () => void, errorTask: (error: string) => void }) => Promise<void>;
    loginWithOTP: (params: { email: string, otp: string, successTask: (token: string) => void, errorTask: (error: string) => void }) => Promise<void>;
    logout: () => Promise<void>;
    setAuthentication: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_STATE: AuthState = {
    isAuthenticated: false,
    accessToken: null,
    userInfo: null,
    isLoading: true,
    isRootUser: false,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>(INITIAL_STATE);
    const router = useRouter();

    // Helper to update state atomically
    const setAuthState = React.useCallback((updates: Partial<AuthState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const clearAuth = React.useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('is_authenticated');
        setAuthState({
            isAuthenticated: false,
            accessToken: null,
            userInfo: null,
            isLoading: false,
            isRootUser: false,
        });
    }, [setAuthState]);

    const attemptTokenRefreshAndFetchUser = React.useCallback(async () => {
        const isCallbackPage = typeof window !== 'undefined' && window.location.pathname.includes('/auth/callback');

        try {
            await refreshAccessToken({
                failureTask: () => {
                    if (!isCallbackPage) window.location.href = '/';
                    clearAuth();
                },
                errorTask: () => {
                    if (!isCallbackPage) window.location.href = '/';
                    clearAuth();
                }
            });

            const newToken = localStorage.getItem('access_token');
            if (newToken) {
                const response = await fetch(config.ENDPOINTS.USERS.GET, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${newToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    setAuthState({
                        userInfo: userData,
                        accessToken: newToken,
                        isAuthenticated: true,
                        isRootUser: userData.is_root_user || false,
                        isLoading: false
                    });
                    localStorage.setItem('is_authenticated', 'true');
                    
                    if (window.location.pathname === '/' || window.location.pathname === '') {
                        const returnUrl = sessionStorage.getItem('return_url');
                        if (returnUrl && returnUrl !== '/') {
                            sessionStorage.removeItem('return_url');
                            router.push(returnUrl);
                        } else {
                            router.push('/home');
                        }
                    }
                } else {
                    clearAuth();
                }
            } else {
                clearAuth();
            }
        } catch (error) {
            clearAuth();
        }
    }, [router, clearAuth, setAuthState]);

    const validateAndFetchUser = React.useCallback(async () => {
        if (typeof window === 'undefined') return;

        const pathname = window.location.pathname;

        // Skip validation/redirect logic if on auth callback page to avoid race conditions
        const isCallbackPage = pathname.includes('/auth/callback');
        
        if (isCallbackPage) {
            setAuthState({ isLoading: false });
            return;
        }

        setAuthState({ isLoading: true });
        const token = localStorage.getItem('access_token');
        
        if (!token) {
            setAuthState({ isLoading: false });
            return;
        }

        try {
            const response = await fetch(config.ENDPOINTS.USERS.GET, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const userData = await response.json();
                
                setAuthState({
                    userInfo: userData,
                    accessToken: token,
                    isAuthenticated: true,
                    isRootUser: userData.is_root_user || false,
                    isLoading: false
                });
                localStorage.setItem('is_authenticated', 'true');
                
                if (window.location.pathname === '/' || window.location.pathname === '') {
                    const returnUrl = sessionStorage.getItem('return_url');
                    if (returnUrl && returnUrl !== '/') {
                        sessionStorage.removeItem('return_url');
                        router.push(returnUrl);
                    } else {
                        router.push('/home');
                    }
                }
            } else if (response.status === 401) {
                await attemptTokenRefreshAndFetchUser();
            } else {
                clearAuth();
            }
        } catch (error) {
            clearAuth();
        } finally {
            setAuthState({ isLoading: false });
        }
    }, [router, clearAuth, setAuthState, attemptTokenRefreshAndFetchUser]);

    useEffect(() => {
        validateAndFetchUser();
    }, [validateAndFetchUser]);

    const setAuthentication = React.useCallback(async (token: string) => {
        // Atomic start: set loading and authenticated together
        setAuthState({ 
            isLoading: true, 
            isAuthenticated: true, 
            accessToken: token 
        });
        
        localStorage.setItem('access_token', token);
        localStorage.setItem('is_authenticated', 'true');
        
        try {
            const response = await fetch(config.ENDPOINTS.USERS.GET, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const userData = await response.json();
                setAuthState({
                    userInfo: userData,
                    isRootUser: userData.is_root_user || false,
                    isLoading: false
                });
            }
        } catch (error) {
            // silent fail for profile fetch
        } finally {
            setAuthState({ isLoading: false });
        }
    }, [setAuthState]);

    const login = React.useCallback(async () => {
        try {
            const loginURL = await fetchLoginURL({
                errorTask: () => console.error('Failed to fetch login URL')
            });
            if (loginURL) window.location.href = loginURL;
        } catch (error) {
            console.error('Login failed:', error);
        }
    }, []);

    const requestOTPMethod = React.useCallback(async (params: { email: string, successTask: () => void, errorTask: (error: string) => void }) => {
        try {
            await requestOTP({
                email: params.email,
                successTask: params.successTask,
                errorTask: params.errorTask
            });
        } catch (error) {
            console.error('OTP Request failed:', error);
            params.errorTask('An error occurred while requesting OTP');
        }
    }, []);

    const loginWithOTPMethod = React.useCallback(async (params: { email: string, otp: string, successTask: (token: string) => void, errorTask: (error: string) => void }) => {
        try {
            await loginWithOTP({
                email: params.email,
                otp: params.otp,
                successTask: (token) => {
                    setAuthentication(token);
                    setAuthState({ isRootUser: true });
                    params.successTask(token);
                },
                errorTask: params.errorTask
            });
        } catch (error) {
            console.error('OTP Login failed:', error);
            params.errorTask('An error occurred during login');
        }
    }, [loginWithOTP, setAuthentication, setAuthState]);

    const logout = React.useCallback(async () => {
        try {
            logoutUser({
                successTask: () => clearAuth(),
                failureTask: () => clearAuth(),
                errorTask: () => clearAuth()
            }).catch(() => clearAuth());
            router.push('/');
        } catch (error) {
            clearAuth();
            router.push('/');
        }
    }, [router, clearAuth]);

    return (
        <AuthContext.Provider 
            value={{ 
                ...state,
                login, 
                requestOTP: requestOTPMethod,
                loginWithOTP: loginWithOTPMethod,
                logout,
                setAuthentication
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
