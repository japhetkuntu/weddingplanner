import { Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { PageLoader } from "@ovutor/ui";
import { useAuthStore } from "@/store/authStore";
import { AdminLayout } from "@/components/AdminLayout";
import { ClientPageShell } from "@/components/ClientPageShell";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetSentPage = lazy(() => import("@/pages/ResetSentPage"));
const NewPasswordPage = lazy(() => import("@/pages/NewPasswordPage"));
const ResetCompletePage = lazy(() => import("@/pages/ResetCompletePage"));

const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ClientsListPage = lazy(() => import("@/pages/ClientsListPage"));
const AddClientPage = lazy(() => import("@/pages/AddClientPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));

const ClientOverviewPage = lazy(() => import("@/pages/client/ClientOverviewPage"));
const ClientChecklistPage = lazy(() => import("@/pages/client/ClientChecklistPage"));
const ClientBudgetPage = lazy(() => import("@/pages/client/ClientBudgetPage"));
const ClientRsvpsPage = lazy(() => import("@/pages/client/ClientRsvpsPage"));
const ClientWebsitePage = lazy(() => import("@/pages/client/ClientWebsitePage"));
const ClientDocumentsPage = lazy(() => import("@/pages/client/ClientDocumentsPage"));
const ClientSettingsPage = lazy(() => import("@/pages/client/ClientSettingsPage"));

function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const initializing = useAuthStore((s) => s.initializing);
  if (initializing) return <PageLoader label="Loading your workspace" />;
  if (!user) return <Navigate to="/login" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

function ClientRoute({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <ClientPageShell>{children}</ClientPageShell>
    </RequireAuth>
  );
}

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <Suspense fallback={<PageLoader label="Loading Ovutor" />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/sent" element={<ResetSentPage />} />
        <Route path="/reset-password/new" element={<NewPasswordPage />} />
        <Route path="/reset-password/complete" element={<ResetCompletePage />} />

        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/clients" element={<RequireAuth><ClientsListPage /></RequireAuth>} />
        <Route path="/clients/new" element={<RequireAuth><AddClientPage /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />

        <Route path="/clients/:clientId" element={<Navigate to="overview" replace />} />
        <Route path="/clients/:clientId/overview" element={<ClientRoute><ClientOverviewPage /></ClientRoute>} />
        <Route path="/clients/:clientId/checklist" element={<ClientRoute><ClientChecklistPage /></ClientRoute>} />
        <Route path="/clients/:clientId/budget" element={<ClientRoute><ClientBudgetPage /></ClientRoute>} />
        <Route path="/clients/:clientId/rsvps" element={<ClientRoute><ClientRsvpsPage /></ClientRoute>} />
        <Route path="/clients/:clientId/website" element={<ClientRoute><ClientWebsitePage /></ClientRoute>} />
        <Route path="/clients/:clientId/documents" element={<ClientRoute><ClientDocumentsPage /></ClientRoute>} />
        <Route path="/clients/:clientId/settings" element={<ClientRoute><ClientSettingsPage /></ClientRoute>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
