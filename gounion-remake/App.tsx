import React, { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar } from "./components/layout/Sidebar";
import { RightSidebar } from "./components/layout/RightSidebar";
import { TopNav } from "./components/layout/TopNav";
import { MobileNav } from "./components/layout/MobileNav";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { Groups } from "./pages/Groups";
import { Messages } from "./pages/Messages";
import { Profile } from "./pages/Profile";
import { Alumni } from "./pages/Alumni";
import { GroupDetails } from "./pages/GroupDetails";
import { AdminPanel } from "./pages/AdminPanel";
import { DownloadPage } from "./pages/DownloadPage";
import { useAuthStore } from "./store";
import { API_URL, api } from "./services/api";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

// Layout Component to wrap authenticated routes
const AppLayout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-[#030303] text-white overflow-hidden selection:bg-white/20 relative">
      <Sidebar />
      <main className="flex-1 overflow-y-auto hide-scrollbar md:pl-64 lg:pr-80 pb-28 md:pb-0">
        <div className="px-4 py-6 md:px-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
      <RightSidebar />
      <MobileNav />
    </div>
  );
};

const PrivateRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
};

const AppBootState = ({
  isChecking,
  error,
  onRetry,
}: {
  isChecking: boolean;
  error: string | null;
  onRetry: () => void;
}) => {
  return (
    <div className="min-h-screen w-full bg-[#030303] text-white flex items-center justify-center px-6">
      <div className="glass-panel rounded-3xl p-10 w-full max-w-md text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center font-serif font-black text-3xl">
          G
        </div>
        <h1 className="mt-5 font-serif text-3xl tracking-tight">
          {isChecking ? "Connecting..." : "Connection Needed"}
        </h1>
        <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
          {isChecking
            ? "Loading GoUnion and verifying backend availability."
            : error}
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.2s]" />
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.1s]" />
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" />
        </div>
        {!isChecking && (
          <button
            onClick={onRetry}
            className="mt-8 h-11 px-6 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all"
          >
            Retry Connection
          </button>
        )}
        <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          API {API_URL}
        </p>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const [checkingBackend, setCheckingBackend] = useState(true);
  const [backendError, setBackendError] = useState<string | null>(null);

  const isNativeApp = Capacitor.isNativePlatform();
  const hasDownloadedApk = useMemo(() => {
    try {
      return localStorage.getItem("gounion_apk_downloaded") === "true";
    } catch {
      return false;
    }
  }, []);

  const defaultPublicRoute = isNativeApp || hasDownloadedApk ? "/login" : "/download";

  const checkBackendHealth = async () => {
    setCheckingBackend(true);
    setBackendError(null);
    try {
      await api.health.check();
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        "Cannot reach the backend right now. Please confirm your API URL and backend CORS settings, then retry.";
      setBackendError(message);
    } finally {
      setCheckingBackend(false);
    }
  };

  useEffect(() => {
    void checkBackendHealth();
  }, []);

  const PUBLIC_ROUTES = [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/download",
  ];

  if (checkingBackend || backendError) {
    return (
      <AppBootState
        isChecking={checkingBackend}
        error={backendError}
        onRetry={checkBackendHealth}
      />
    );
  }

  if (!isAuthenticated && !PUBLIC_ROUTES.includes(location.pathname)) {
    return <Navigate to={defaultPublicRoute} replace />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" /> : <Login />}
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/download"
        element={isNativeApp ? <Navigate to="/login" replace /> : <DownloadPage />}
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/groups"
        element={
          <PrivateRoute>
            <Groups />
          </PrivateRoute>
        }
      />
      <Route
        path="/groups/:id"
        element={
          <PrivateRoute>
            <GroupDetails />
          </PrivateRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <PrivateRoute>
            <Messages />
          </PrivateRoute>
        }
      />
      <Route
        path="/alumni"
        element={
          <PrivateRoute>
            <Alumni />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/:username"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminPanel />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to={defaultPublicRoute} />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
