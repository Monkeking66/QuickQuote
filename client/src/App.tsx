import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import CreateQuotePage from "@/pages/create-quote-page";
import QuoteDesignPage from "@/pages/quote-design-page";
import QuoteFinalPage from "@/pages/quote-final-page";
import SettingsPage from "@/pages/settings-page";
import QuotesListPage from "@/pages/quotes-list-page";
import PrivacyPage from "@/pages/privacy-page";
import TermsPage from "@/pages/terms-page";
import AccessibilityPage from "@/pages/accessibility-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/create-quote" component={CreateQuotePage} />
      <ProtectedRoute path="/quote-design/:id" component={QuoteDesignPage} />
      <ProtectedRoute path="/quote-final/:id" component={QuoteFinalPage} />
      <ProtectedRoute path="/quotes" component={QuotesListPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/accessibility" component={AccessibilityPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
