import { Toaster } from "sonner";
import Router from "./router";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import SidebarSm from "@/components/layout/sidebar-sm";
import Footer from "@/components/layout/footer";
import { useEffect, useState } from "react";
import { Box, CssBaseline } from "@mui/material";
import { AppearanceProvider } from "@/contexts/AppearanceContext.tsx";
import {AppUserProfile} from "@/types";
import {getUserProfile} from "@/hooks/user-service.ts";
import {toast} from "sonner";

const HEADER_HEIGHT = '72px';
const SIDEBAR_WIDTH_EXPANDED = '320px'; // Corresponds to w-64 (16rem)
const SIDEBAR_WIDTH_COLLAPSED = '64px'; // Corresponds to w-16 (4rem)

function MainApp() {
    const [sidebarExpanded, setSidebarExpanded] = useState(() => {
        const saved = localStorage.getItem('sidebar-expanded');
        return saved ? JSON.parse(saved) : true; // Default to expanded
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

    useEffect(() => {
        localStorage.setItem('sidebar-expanded', JSON.stringify(sidebarExpanded));
    }, [sidebarExpanded]);

    const toggleSidebar = () => {
        setSidebarExpanded(!sidebarExpanded);
    };

    const toggleSidebarSm = (value: boolean) => {
        setSidebarSmExpanded(value);
    };

    return (
        <>
            <CssBaseline />
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'grey.50' }}>
                <Header onMenuClick={() => toggleSidebarSm(true)} userProfile={profile}/>
                <Box sx={{ display: 'flex', flexGrow: 1, pt: HEADER_HEIGHT }}>
                    <SidebarSm isExpanded={sidebarSmExpanded} onToggle={toggleSidebarSm} userProfile={profile}/>
                    <Sidebar isExpanded={sidebarExpanded} onToggle={toggleSidebar}/>
                    <Box
                        component="main"
                        sx={{
                            flexGrow: 1,
                            p: { xs: 2, sm: 3 }, // Corresponds to p-6
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
                <Footer sidebarPresent={true} sidebarExpanded={sidebarExpanded} />
            </Box>
            <Toaster richColors />
        </>
    );
}

export default MainApp;