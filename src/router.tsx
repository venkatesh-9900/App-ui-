import { Switch, Route } from "wouter";
// Import all your page components
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import HomePage from "@/pages/home";
import AlertsPage from "@/pages/alerts";
import ApiKeysPage from "@/pages/api-keys";
import OverviewPage from "@/pages/overview";
import AnalyticsPage from "@/pages/analytics";
import TransactionAnalysisPage from "@/pages/transaction-analysis";
import InvestigatePage from "@/pages/investigate";
import WalletScreeningPage from "@/pages/wallet-screening";
import NetworkAnalyticsPage from "@/pages/network-analytics";
import ThreatDetectionPage from "@/pages/threat-detection";
import RiskAssessmentPage from "@/pages/risk-assessment";
import CompliancePage from "@/pages/compliance";
import NotificationSettingsPage from "@/pages/notification-settings";
import AlertHistoryPage from "@/pages/alert-history";
import AIAgentsPage from "@/pages/ai-agents";
import AIConfigPage from "@/pages/ai-config";
import AIPerformancePage from "@/pages/ai-performance";
import UserManagementPage from "@/pages/user-management";
import SettingsPage from "@/pages/settings";
import PermissionsPage from "@/pages/permissions";
import DocumentationPage from "@/pages/documentation";
import IntegrationPage from "@/pages/integration";
import ProfilePage from "@/pages/profile";
import BillingPage from "@/pages/billing";
import EnterprisePage from "@/pages/enterprise";
import ChatInterface from "@/pages/chat";
import {AppearanceProvider} from "@/contexts/AppearanceContext.tsx";

export default function Router() {
    return (
        <Switch>
            <Route path="/analyze" component={LandingPage} />
            <Route path="/chat/:id">
                    {(params) => (
                        <AppearanceProvider>
                                <ChatInterface params={params} />
                        </AppearanceProvider>
                    )}
            </Route>
            <Route path="/chat">
                 <ChatInterface params={{ id: 'new' }} />
            </Route>
            <Route path="/" component={HomePage} />
            <Route path="/investigate" component={InvestigatePage} />
            <Route path="/overview" component={OverviewPage} />
            <Route path="/analytics" component={AnalyticsPage} />
            <Route path="/transaction-analysis" component={TransactionAnalysisPage} />
            <Route path="/wallet-screening" component={WalletScreeningPage} />
            <Route path="/network-analytics" component={NetworkAnalyticsPage} />
            <Route path="/threat-detection" component={ThreatDetectionPage} />
            <Route path="/risk-assessment" component={RiskAssessmentPage} />
            <Route path="/compliance" component={CompliancePage} />
            <Route path="/alerts" component={AlertsPage} />
            <Route path="/notification-settings" component={NotificationSettingsPage} />
            <Route path="/alert-history" component={AlertHistoryPage} />
            <Route path="/ai-agents" component={AIAgentsPage} />
            <Route path="/ai-config" component={AIConfigPage} />
            <Route path="/ai-performance" component={AIPerformancePage} />
            <Route path="/user-management" component={UserManagementPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/permissions" component={PermissionsPage} />
            <Route path="/api-keys" component={ApiKeysPage} />
            <Route path="/documentation" component={DocumentationPage} />
            <Route path="/integration" component={IntegrationPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/billing" component={BillingPage} />
            <Route path="/enterprise" component={EnterprisePage} />
            <Route component={NotFound} />
        </Switch>
    );
}