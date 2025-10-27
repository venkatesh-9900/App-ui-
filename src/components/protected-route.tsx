"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, login } = useAuth();
    const router = useRouter();

    useEffect(() => {
        console.log('isAuthenticated inside protected route...', isAuthenticated, 'isLoading:', isLoading);
        // Only trigger login if:
        // 1. Not currently loading (validation finished)
        // 2. Not authenticated
        // 3. User hasn't been here before (avoid redirect loop on logout)
        if (!isLoading && !isAuthenticated) {
            const accessToken = localStorage.getItem('access_token');
            console.log('accessToken', accessToken);
            // Only login if there's no token (genuine unauthenticated state)
            // If token exists but isAuthenticated is false, validation is still in progress
            if (accessToken != null) {
                login();
            }
        }
    }, [isAuthenticated, isLoading, login]);

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen w-full p-4">
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">Checking Authentication</CardTitle>
                        <CardDescription className="text-center">
                            Please wait...
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4 pb-6">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Verifying your session...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show authentication required if not authenticated after loading
    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen w-full p-4">
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">Authentication Required</CardTitle>
                        <CardDescription className="text-center">
                            Your session has expired. Please sign in again to continue.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4 pb-6">
                        <Button 
                            onClick={() => router.push('/')}
                            className="w-full cursor-pointer"
                            size="lg"
                        >
                            Sign in again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}

