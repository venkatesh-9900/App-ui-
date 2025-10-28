import { useState, useEffect } from 'react';
import { get } from '@/lib/api-client';
import config from '@/config/config';

interface UserProfile {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    // Add other user fields as needed
}

/**
 * Example hook for fetching user profile data
 * Demonstrates how to use the authenticated API client
 */
export function useUser() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const userData = await get<UserProfile>(config.ENDPOINTS.USERS.GET);
                setUser(userData);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch user'));
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if we have an access token
        if (typeof window !== 'undefined' && localStorage.getItem('access_token')) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const refetch = async () => {
        try {
            setLoading(true);
            const userData = await get<UserProfile>(config.ENDPOINTS.USERS.GET);
            setUser(userData);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch user'));
        } finally {
            setLoading(false);
        }
    };

    return { user, loading, error, refetch };
}

