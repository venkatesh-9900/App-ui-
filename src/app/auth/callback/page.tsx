"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import config from "@/config/config";
import { useAuth } from '@/contexts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";

// Module-level lock to prevent double-firing even if component remounts
let lastFetchedCode: string | null = null;

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setAuthentication } = useAuth();
    
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const code = searchParams.get("code");

        if (!code) {
            setError("No authentication code found in the URL.");
            return;
        }

        // Prevent double fetch of the same code during remounts
        if (lastFetchedCode === code) return;
        lastFetchedCode = code;

        const fetchToken = async () => {
            try {
                const response = await fetch(config.ENDPOINTS.AUTH.ACCESS_TOKEN, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ 
                        code: code
                    }),
                });
                const responseData = await response.json();
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch token: ${JSON.stringify(responseData)}`);
                }
                
                if (responseData.access_token) {
                    await setAuthentication(responseData.access_token);
                    
                    const returnUrl = sessionStorage.getItem("return_url");
                    
                    if (returnUrl && returnUrl !== '/') {
                        sessionStorage.removeItem("return_url");
                        router.push(returnUrl);
                    } else {
                        router.push("/home");
                    }
                } else {
                    throw new Error("No access token in response");
                }
            } catch (err: any) {
                setError(err.message || "Unknown error during token exchange");
                toast.error(`Authentication failed: ${err.message || "Unknown error"}`);
            }
        }

        fetchToken();
    }, [searchParams, router, setAuthentication]);

    return (
        <div className="flex items-center justify-center min-h-screen w-full p-4">
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>{error ? "Authentication Failed" : "Authenticating"}</CardTitle>
                    <CardDescription>
                        {error ? "There was an error during the sign-in process." : "Please wait while we verify your credentials."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
                    {!error ? (
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative w-12 h-12">
                                <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                            </div>
                            <p className="text-sm text-muted-foreground animate-pulse">
                                Finalizing your session...
                            </p>
                        </div>
                    ) : (
                        <div className="w-full space-y-4">
                            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-mono break-all">
                                {error}
                            </div>
                            <Button 
                                variant="outline" 
                                className="w-full cursor-pointer" 
                                onClick={() => window.location.href = '/'}
                            >
                                Return to Login
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen w-full p-4">
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>Authenticating</CardTitle>
                        <CardDescription>Please wait while we verify your credentials.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                        <div className="relative w-12 h-12">
                            <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}