import { Toaster } from "sonner";
import Router from "./router";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import SidebarSm from "@/components/layout/sidebar-sm";
import Footer from "@/components/layout/footer";
import { useEffect, useState } from "react";
import { Box, CssBaseline } from "@mui/material";
import { AppearanceProvider } from "@/contexts/AppearanceContext.tsx";
import { TooltipProvider } from "./components/ui/tooltip";
import {AppUserProfile} from "@/types";
import {getUserProfile} from "@/hooks/user-service.ts";
import {toast} from "sonner";

const HEADER_HEIGHT = '100px'; // Corresponds to pt-20 (5rem)
const SIDEBAR_WIDTH_EXPANDED = '256px'; // Corresponds to w-64 (16rem)
const SIDEBAR_WIDTH_COLLAPSED = '64px'; // Corresponds to w-16 (4rem)

function ChatApp() {
    const [sidebarExpanded, setSidebarExpanded] = useState(() => {
        const stored = localStorage.getItem('sidebar-expanded');
        return stored ? JSON.parse(stored) : true;
    });
    const [sidebarSmExpanded, setSidebarSmExpanded] = useState(false);
    const [profile, setProfile] = useState<AppUserProfile | null>(null);

    useEffect(() => {
        const loadProfile = async () => {
            await getUserProfile({
                successTask: (data: AppUserProfile) => {
                    console.log(data);
                    setProfile(data);
                },
                failureTask: () => {
                    toast('Failure', {
                        description: 'Could not fetch user profile details.',
                    });
                },
                errorTask: () => {
                    toast('Error', {
                        description: 'An unexpected error occurred while fetching user profile details.',
                    });
                }
            });
        };
        loadProfile();
    }, []);

    const toggleSidebarSm = (value: boolean) => {
        setSidebarSmExpanded(value);
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);
    const toggleSidebar = () => {
        setSidebarExpanded(!sidebarExpanded);
    };
    useEffect(() => {
        localStorage.setItem('sidebar-expanded', JSON.stringify(sidebarExpanded));
    }, [sidebarExpanded]);
    return (
        <TooltipProvider>
            <CssBaseline />
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'grey.50' }}>
                <Header onMenuClick={() => toggleSidebarSm(true)} userProfile={profile} />
                <Box sx={{ display: 'flex', flexGrow: 1, pt: HEADER_HEIGHT }}>
                    <SidebarSm isExpanded={sidebarSmExpanded} onToggle={toggleSidebarSm} userProfile={profile} />
                    <Sidebar isExpanded={sidebarExpanded} onToggle={toggleSidebar} collapseSidebar={() => setSidebarExpanded((prev: boolean) => prev)}/>
                    <Box
                        component="main"
                        sx={{
                            flexGrow: 1,
                            transition: (theme) => theme.transitions.create('margin', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                            ml: {
                                xs: 0, // No sidebar on mobile, so no margin
                                md: sidebarExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED
                            },
                        }}
                    >
                        <AppearanceProvider>
                            <Router />
                        </AppearanceProvider>
                    </Box>
                </Box>
            </Box>
            <Toaster richColors />
        </TooltipProvider>
    );
}
export default ChatApp;
