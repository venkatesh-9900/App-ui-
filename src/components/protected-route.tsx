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
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const path = window.location.pathname;

        // Skip protection logic if on auth callback page to avoid race conditions
        if (path.includes('/auth/callback')) return;

        // Redirection logic: Only trigger if not loading and definitely not authenticated
        if (!isLoading && !isAuthenticated) {
            // Check localStorage as a ultimate fallback to prevent race-condition bounces
            if (localStorage.getItem('is_authenticated') !== 'true') {
                const returnUrl = window.location.pathname + window.location.search;
                if (returnUrl !== '/' && returnUrl !== '') {
                    sessionStorage.setItem('return_url', returnUrl);
                }
                router.push('/');
            }
        }
    }, [isAuthenticated, isLoading, router]);

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
