import { Toaster } from "sonner";
import Router from "./router";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import SidebarSm from "@/components/layout/sidebar-sm";
import Footer from "@/components/layout/footer";
import { useEffect, useState } from "react";
import { Box, CssBaseline } from "@mui/material";
import { AppearanceProvider } from "@/contexts/AppearanceContext.tsx";

const HEADER_HEIGHT = '80px'; // Corresponds to pt-20 (5rem)
const SIDEBAR_WIDTH_EXPANDED = '256px'; // Corresponds to w-64 (16rem)
const SIDEBAR_WIDTH_COLLAPSED = '64px'; // Corresponds to w-16 (4rem)

function MainApp() {
    const [sidebarExpanded, setSidebarExpanded] = useState(() => {
        const saved = localStorage.getItem('sidebar-expanded');
        return saved ? JSON.parse(saved) : true; // Default to expanded
    });

    const [sidebarSmExpanded, setSidebarSmExpanded] = useState(false);

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
                <Header onMenuClick={() => toggleSidebarSm(true)} />
                <Box sx={{ display: 'flex', flexGrow: 1, pt: HEADER_HEIGHT }}>
                    <SidebarSm isExpanded={sidebarSmExpanded} onToggle={toggleSidebarSm} />
                    <Sidebar isExpanded={sidebarExpanded} onToggle={toggleSidebar} />
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