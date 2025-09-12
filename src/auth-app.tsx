import {Toaster} from "@/components/ui/toaster";
import {Route, Switch} from "wouter";
import LoginPage from "@/pages/auth/Login.tsx";
import Footer from "@/components/layout/footer";
import { Box, CssBaseline } from "@mui/material";

function AuthApp() {
    return (
        <>
            <CssBaseline />
            <Box component="main">
                <Switch>
                    <Route path="/login" component={LoginPage} />
                    {/* Add more public routes if needed */}
                </Switch>
            </Box>
            <Footer sidebarPresent={false} sidebarExpanded={false} />
            <Toaster />
        </>
    );
}

export default AuthApp;
