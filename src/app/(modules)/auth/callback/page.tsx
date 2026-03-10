"use client";

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import config from "@/config/config";
import { useAuth } from '@/contexts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setAuthentication } = useAuth();
    const hasFetched = useRef(false);

    useEffect(() => {
        const code = searchParams.get("code");

        if (!code) {
            console.error("Missing 'code' in authentication redirect URL.");
            router.push('/');
            return;
        }

        // Prevent double fetch in development (React Strict Mode)
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchToken = async () => {
            try {
                const response = await fetch(config.ENDPOINTS.AUTH.ACCESS_TOKEN, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ code: code }),
                });
                
                const responseText = await response.text();
                
                if (!response.ok) {
                    console.error(`Failed to fetch token: ${responseText}`);
                }
                
                const accessToken = JSON.parse(responseText);
                console.log(accessToken);
                
                if (accessToken.access_token) {
                    localStorage.setItem("access_token", accessToken.access_token);
                    localStorage.setItem("is_authenticated", "true");
                    setAuthentication(accessToken.access_token);
                    const returnUrl = sessionStorage.getItem("return_url");
                    if (returnUrl) {
                        window.location.href = returnUrl
                    } else 
                        router.push("/home");
                } else {
                    throw new Error("No access token in response");
                }
            } catch (err) {
                console.error("Authentication error", err);
                localStorage.removeItem("access_token");
                localStorage.removeItem("is_authenticated");
                router.push("/");
            }
        }

        fetchToken();
    }, [searchParams, router, setAuthentication]);

    return (
        <div className="flex items-center justify-center min-h-screen w-full p-4">
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Logging In...</CardTitle>
                    <CardDescription>Please wait while we authenticate you...</CardDescription>
                </CardHeader>
                <CardContent>
                        <p>Please wait while we authenticate you...</p>
                </CardContent>
            </Card>
        </div>
    );
}