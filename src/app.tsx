import { Switch, Route } from "wouter";
import AuthGuard from "@/components/auth/auth-guard";
import MainApp from "./main-app";
import ChatApp from "./chat-app";
import AuthApp from "@/auth-app";
import AuthCallbackPage from "@/pages/auth/auth-callback-handler";

function App() {
    return (
        <Switch>
            <Route path="/login" component={AuthApp} />
            <Route path="/auth/callback" component={AuthCallbackPage} />
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