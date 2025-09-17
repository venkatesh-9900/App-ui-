import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from "@/config/config.ts";
import { Box, CircularProgress, Typography } from '@mui/material';
import { useToast } from "@/hooks/use-toast";
import { access } from 'fs';

export default function AuthCallbackPage() {
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (!code) {
            console.error("Missing 'code' in authentication redirect URL.");
            return;
        }

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
                    throw new Error(`Failed to fetch token: ${responseText}`);
                }
                const accessToken = JSON.parse(responseText);
                console.log(accessToken);
                localStorage.setItem("access_token", accessToken.access_token || "");
                localStorage.setItem("isAuthenticated", "true");
                navigate("/");
            } catch (err) {
                console.error("Authentication error", err);
                toast( {
                    title: `Error`,
                    description: `Authentication failed with error`,
                } );
                localStorage.removeItem("access_token");
                localStorage.removeItem("isAuthenticated");
                navigate("/login");
                // Optionally show an error UI
            }
        }

        fetchToken();
    }, []);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                bgcolor: 'background.default',
            }}
        >
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>Logging In...</Typography>
        </Box>
    );
}