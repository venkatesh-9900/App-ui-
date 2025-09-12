import {useEffect, useState} from "react";
import { useToast } from "@/hooks/use-toast";

import {
    Box,
    Container,
    Card,
    CardContent,
    CardHeader,
    Typography,
    Button,
    Link,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Shield,
    LogIn
} from "lucide-react";
import config from "../../config/config.ts";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    const handleSSOLogin = (provider: string) => {
        setIsLoading(true);
        toast({
            title: `SSO Login`,
            description: `Redirecting to SSO authentication...`,
        });
        navigate(`/auth/callback`);
    };

    if (isLoading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Redirecting to SSO Login...
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(to bottom right, #f8fafc, #eff6ff, #eef2ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 2, sm: 3 },
            }}
        >
            <Container maxWidth="xs" sx={{ mb: 20 }} disableGutters>
                {/* Logo and Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Box component="img" src="/assets/argus-logo.png" alt="Argus Intelligence Logo" sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 2 }} />
                    </Box>
                    <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary" gutterBottom>
                        Argus Intelligence
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Secure Blockchain Monitoring Platform
                    </Typography>
                </Box>

                <Card sx={{ boxShadow: { sm: 3 }, border: 0, borderRadius: 3 }}>
                    <CardHeader>
                        <Typography variant="h5" component="h2" textAlign="center">
                            Welcome Back
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                            Choose your preferred sign-in method
                        </Typography>
                    </CardHeader>

                    <CardContent sx={{ pt: 1 }}>
                        {/* Enterprise Login Options */}
                        <Typography variant="h5" component="h2" textAlign="center">
                            Log-in via SSO
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 5 }}>
                            <Button onClick={() => handleSSOLogin('Okta')} variant="outlined" fullWidth startIcon={<LogIn style={{ color: '#007dc1' }} />} sx={{ justifyContent: 'center', py: 1.5 }}>Enterprise Single Sign-On</Button>
                        </Box>
                    </CardContent>
                </Card>

                {/* Footer */}
                <Box sx={{ textAlign: 'center', mt: 3, spaceY: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Don't have an account?{' '}
                        <Link href="#" fontWeight="medium">
                            Request Access
                        </Link>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="p">
                        By signing in, you agree to our{' '}
                        <Link href="#" underline="always">Terms of Service</Link> and{' '}
                        <Link href="#" underline="always">Privacy Policy</Link>
                    </Typography>
                </Box>

                {/* Security Badge */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 3, gap: 1, color: 'text.secondary' }}>
                    <Shield size={16} />
                    <Typography variant="caption">
                        Enterprise-grade security • SOC 2 Compliant
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}