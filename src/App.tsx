
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";

import Index from "@/pages/Index";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Calendar from "@/pages/Calendar";
import Settings from "@/pages/Settings";
import Insights from "@/pages/Insights";
import Schedule from "@/pages/Schedule";
import PersonalizationSetup from "@/pages/PersonalizationSetup";
import NotFound from "@/pages/NotFound";
import GoogleCalendarRedirect from "@/components/GoogleCalendarRedirect";
import MobileApp from "@/pages/MobileApp";
import DownloadApp from "@/pages/DownloadApp";
import SubscriptionHelp from "@/pages/SubscriptionHelp";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/auth/google/callback" element={<GoogleCalendarRedirect />} />
          <Route path="/download-app" element={<DownloadApp />} />
          <Route path="/mobile-app" element={<MobileApp />} />
          <Route path="/subscription-help" element={<SubscriptionHelp />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          
          {/* Protected routes */}
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <Insights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <Schedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/personalization-setup"
            element={
              <ProtectedRoute>
                <PersonalizationSetup />
              </ProtectedRoute>
            }
          />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
