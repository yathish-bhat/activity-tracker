import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import HomePage from './pages/HomePage';
import ActivityPage from './pages/ActivityPage';
import LoginPage from './pages/LoginPage';

function ProtectedLayout({ refreshKey, onRefresh }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center relative z-[1]" style={{ color: 'var(--muted)' }}>
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="grid grid-cols-[72px_1fr_320px] h-screen max-w-[1400px] mx-auto relative z-[1]">
      <Sidebar />
      <main className="overflow-y-auto p-8 px-10" style={{ scrollbarWidth: 'none' }}>
        <Outlet context={{ refreshKey, onRefresh }} />
      </main>
      <RightPanel refreshKey={refreshKey} />
    </div>
  );
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <LoginPage />;
}

function AppRoutes() {
  const [refreshKey, setRefreshKey] = useState(0);
  const onRefresh = useCallback(() => setRefreshKey(k => k + 1), []);

  return (
    <Routes>
      <Route path="/login" element={<AuthRoute />} />
      <Route element={<ProtectedLayout refreshKey={refreshKey} onRefresh={onRefresh} />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/activities" element={<ActivityPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}