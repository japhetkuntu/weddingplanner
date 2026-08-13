import { Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { PageLoader } from "@ovutor/ui";
import { useAuthStore } from "@/store/authStore";
import { ClientLayout } from "@/components/ClientLayout";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ChecklistPage = lazy(() => import("@/pages/ChecklistPage"));
const BudgetPage = lazy(() => import("@/pages/BudgetPage"));
const RsvpsPage = lazy(() => import("@/pages/RsvpsPage"));
const DocumentsPage = lazy(() => import("@/pages/DocumentsPage"));
const WebsitePage = lazy(() => import("@/pages/WebsitePage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));

function RequireAuth({ children }: { children: ReactNode }) {
  const profile = useAuthStore((s) => s.profile);
  const initializing = useAuthStore((s) => s.initializing);
  if (initializing) return <PageLoader label="Loading your workspace" />;
  if (!profile) return <Navigate to="/login" replace />;
  return <ClientLayout>{children}</ClientLayout>;
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
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/checklist" element={<RequireAuth><ChecklistPage /></RequireAuth>} />
        <Route path="/budget" element={<RequireAuth><BudgetPage /></RequireAuth>} />
        <Route path="/rsvps" element={<RequireAuth><RsvpsPage /></RequireAuth>} />
        <Route path="/documents" element={<RequireAuth><DocumentsPage /></RequireAuth>} />
        <Route path="/website" element={<RequireAuth><WebsitePage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
