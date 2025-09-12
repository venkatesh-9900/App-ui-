import { Navigate } from "react-router-dom";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    // const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const isAuthenticated = true;
    
    if (!isAuthenticated) {
        // Navigate component redirects to the login page.
        return <Navigate to="/login" />;
    }
    // If authenticated, render the children (your main app).
    return <>{children}</>;
};