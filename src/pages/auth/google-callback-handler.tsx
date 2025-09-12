import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from "@/config/config.ts";
import { Box, CircularProgress, Typography } from '@mui/material';

export default function GoogleCallbackPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (!code) {
            console.error("Missing 'code' in Google redirect URL.");
            return;
        }
        const exchangeAndLogin = async () => {
            try {

                // 1. Exchange code for tokens
                const exchangeRes = await fetch(config.ENDPOINTS.AUTH.GOOGLE_EXCHANGE, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code })
                });

                const exchangeText = await exchangeRes.text();
                if (!exchangeRes.ok) {
                    throw new Error(`Exchange failed: ${exchangeText}`);
                }

                const { id_token: idToken, access_token: accessToken } = JSON.parse(exchangeText);

                // 2. Register or login
                const response  = await fetch(config.ENDPOINTS.AUTH.GOOGLE_SIGN_IN, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idToken }),
                });

                const text = await response.text();
                if (!response .ok) {
                    throw new Error(`Login failed: ${text}`);
                }
                if (!text) {
                    throw new Error("Empty response body from server");
                }

                const sessionData = JSON.parse(text);
                localStorage.setItem("session_token", sessionData.session_token || "");
                localStorage.setItem("user", JSON.stringify(sessionData.session?.identity?.traits || {}));
                localStorage.setItem("isAuthenticated", "true");

                window.location.href = "/home";
            } catch (err) {
                console.error("Google login error", err);
                // Optionally show an error UI
            }
        };

        exchangeAndLogin();
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
            <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>Signing in with Google...</Typography>
        </Box>
    );
}