"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser, fetchLoginURL, fetchLogoutURL, refreshAccessToken } from '@/hooks/auth-service';
import config from '@/config/config';

interface UserInfo {
    id?: string;
    email?: string;
    name?: string;
    [key: string]: any;
}

interface AuthContextType {
    isAuthenticated: boolean;
    accessToken: string | null;
    userInfo: UserInfo | null;
    isLoading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    setAuthentication: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        validateAndFetchUser();
    }, []);

    const validateAndFetchUser = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('access_token');
        console.log('token', token);
        if (!token) {
            console.log('No access token found, user needs to login');
            setIsLoading(false);
            return;
        }

        console.log('Access token found, validating...');
        
        try {
            // Try to fetch user info with existing token
            const response = await fetch(config.ENDPOINTS.USERS.GET, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Token is valid, get user info
                const userData = await response.json();
                console.log('User info fetched successfully:', userData);
                
                setUserInfo(userData);
                setAccessToken(token);
                setIsAuthenticated(true);
                localStorage.setItem('is_authenticated', 'true');
                
                // Redirect to home if not already there
                if (window.location.pathname === '/') {
                    router.push('/home');
                }
            } else if (response.status === 401) {
                // Token expired, try to refresh
                console.log('Token expired, attempting refresh...');
                await attemptTokenRefreshAndFetchUser();
            } else {
                // Other error, clear auth
                console.error('Failed to fetch user info:', response.status);
                clearAuth();
            }
        } catch (error) {
            console.error('Error validating token:', error);
            clearAuth();
        } finally {
            setIsLoading(false);
        }
    };

    const attemptTokenRefreshAndFetchUser = async () => {
        try {
            await refreshAccessToken({
                failureTask: () => {
                    console.log('Failed to refresh token');
                    window.location.href = '/';
                    clearAuth();
                },
                errorTask: () => {
                    console.log('Error refreshing token');
                    window.location.href = '/';
                    clearAuth();
                }
            });

            // Check if token was refreshed
            const newToken = localStorage.getItem('access_token');
            if (newToken) {
                console.log('Token refreshed, fetching user info...');
                
                // Fetch user info with new token
                const response = await fetch(config.ENDPOINTS.USERS.GET, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${newToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    console.log('User info fetched after refresh:', userData);
                    
                    setUserInfo(userData);
                    setAccessToken(newToken);
                    setIsAuthenticated(true);
                    localStorage.setItem('is_authenticated', 'true');
                    
                    // Redirect to home
                    if (window.location.pathname === '/') {
                        router.push('/home');
                    }
                } else {
                    console.error('Failed to fetch user info after refresh');
                    clearAuth();
                }
            } else {
                clearAuth();
            }
        } catch (error) {
            console.error('Error during token refresh:', error);
            clearAuth();
        }
    };

    const clearAuth = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('is_authenticated');
        setAccessToken(null);
        setIsAuthenticated(false);
        setUserInfo(null);
        setIsLoading(false);
    };

    const login = async () => {
        try {
            const loginURL = await fetchLoginURL({
                errorTask: () => {
                    console.error('Failed to fetch login URL');
                }
            });
            
            if (loginURL) {
                window.location.href = loginURL;
            }
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const logout = async () => {
        try {
            // Then call the logout endpoint to invalidate backend session (fire and forget)
            logoutUser({
                successTask: (idToken) => {
                    console.log('Logout successful with id_token:', idToken);
                    clearAuth();
                },
                failureTask: () => {
                    console.error('Logout failed - no id_token received');
                    clearAuth();
                },
                errorTask: () => {
                    console.error('Logout error occurred');
                    clearAuth();
                }
            }).catch(err => {
                console.error('Logout API call failed:', err);
                clearAuth();
            });
            
            // Navigate to landing page using Next.js router (no full page reload)
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
            clearAuth();
            router.push('/');
        }
    };

    const setAuthentication = async (token: string) => {
        localStorage.setItem('access_token', token);
        localStorage.setItem('is_authenticated', 'true');
        setAccessToken(token);
        setIsAuthenticated(true);
        console.log('Setting authentication token');
        
        // Fetch user info after setting token
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
                console.log('User info fetched:', userData);
                setUserInfo(userData);
            }
        } catch (error) {
            console.error('Failed to fetch user info after authentication:', error);
        }
    };

    return (
        <AuthContext.Provider 
            value={{ 
                isAuthenticated, 
                accessToken,
                userInfo,
                isLoading,
                login, 
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

