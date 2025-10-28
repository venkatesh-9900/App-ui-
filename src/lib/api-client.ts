import { refreshAccessToken, reauthenticationStep } from '@/hooks/auth-service';

interface FetchOptions extends RequestInit {
    retry?: boolean;
}

/**
 * Authenticated fetch wrapper that automatically handles token refresh
 * @param url - The URL to fetch
 * @param options - Fetch options with optional retry flag
 * @returns Response from the fetch call
 */
export async function authenticatedFetch(
    url: string, 
    options: FetchOptions = {}
): Promise<Response> {
    const { retry = false, ...fetchOptions } = options;

    // Get access token from localStorage
    const accessToken = typeof window !== 'undefined' 
        ? localStorage.getItem('access_token') 
        : null;

    if (!accessToken && !retry) {
        throw new Error('No access token found');
    }

    // Merge headers with Authorization
    const headers = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
    };

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            headers
        });

        // Handle 401 - Unauthorized
        if (response.status === 401) {
            if (retry) {
                // Already retried once, redirect to login
                await reauthenticationStep(() => {
                    console.error('Re-authentication failed');
                });
                throw new Error('Authentication failed');
            } else {
                // Try to refresh token and retry
                console.log('Token expired, attempting refresh...');
                
                await refreshAccessToken({
                    failureTask: () => {
                        console.log('Failed to refresh token');
                    },
                    errorTask: () => {
                        console.log('Error encountered while refreshing token');
                    }
                });

                // Retry the request with the new token
                return authenticatedFetch(url, { ...options, retry: true });
            }
        }

        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

/**
 * Convenience method for GET requests
 */
export async function get<T>(url: string, options?: FetchOptions): Promise<T> {
    const response = await authenticatedFetch(url, {
        ...options,
        method: 'GET'
    });

    if (!response.ok) {
        throw new Error(`GET request failed: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Convenience method for POST requests
 */
export async function post<T>(
    url: string, 
    data?: unknown, 
    options?: FetchOptions
): Promise<T> {
    const response = await authenticatedFetch(url, {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
        throw new Error(`POST request failed: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Convenience method for PUT requests
 */
export async function put<T>(
    url: string, 
    data?: unknown, 
    options?: FetchOptions
): Promise<T> {
    const response = await authenticatedFetch(url, {
        ...options,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
        throw new Error(`PUT request failed: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Convenience method for DELETE requests
 */
export async function del<T>(url: string, options?: FetchOptions): Promise<T> {
    const response = await authenticatedFetch(url, {
        ...options,
        method: 'DELETE'
    });

    if (!response.ok) {
        throw new Error(`DELETE request failed: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Convenience method for PATCH requests
 */
export async function patch<T>(
    url: string, 
    data?: unknown, 
    options?: FetchOptions
): Promise<T> {
    const response = await authenticatedFetch(url, {
        ...options,
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
        throw new Error(`PATCH request failed: ${response.statusText}`);
    }

    return response.json();
}

export default {
    authenticatedFetch,
    get,
    post,
    put,
    delete: del,
    patch
};

