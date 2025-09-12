import { Switch, Route } from "wouter";
import AuthGuard from "@/components/auth/auth-guard";
import MainApp from "./main-app";
import ChatApp from "./chat-app";
import AuthApp from "@/auth-app";
import GoogleCallbackPage from "@/pages/auth/google-callback-handler.tsx";

function App() {
    return (
        <Switch>
            <Route path="/login" component={AuthApp} />
            <Route path="/auth/callback" component={GoogleCallbackPage} />
            <Route path="/chat" component={() => (
                <AuthGuard>
                    <ChatApp />
                </AuthGuard>
            )} />

            <Route path="/chat/:id" component={() => (
                <AuthGuard>
                    <ChatApp />
                </AuthGuard>
            )} />
            <Route>
                <AuthGuard>
                    <MainApp />
                </AuthGuard>
            </Route>
        </Switch>
    );
}

export default App;