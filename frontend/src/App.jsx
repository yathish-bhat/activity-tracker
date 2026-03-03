import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import RightPanel from './components/RightPanel';
import HomePage from './pages/HomePage';
import ActivityPage from './pages/ActivityPage';
import LoginPage from './pages/LoginPage';

function ProtectedLayout({ refreshKey, onRefresh }) {
  const { user, loading } = useAuth();
  const [showPanel, setShowPanel] = useState(false);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center relative z-[1]" style={{ color: 'var(--muted)' }}>
        Loading...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      {/* Desktop layout */}
      <div className="hidden lg:grid grid-cols-[72px_1fr_320px] h-screen max-w-[1400px] mx-auto relative z-[1]">
        <Sidebar />
        <main className="overflow-y-auto p-8 px-10" style={{ scrollbarWidth: 'none' }}>
          <Outlet context={{ refreshKey, onRefresh }} />
        </main>
        <RightPanel refreshKey={refreshKey} />
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden flex flex-col h-screen h-[100dvh] relative z-[1]">
        {/* Mobile header */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="2.5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <span className="font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>Pulse</span>
          </div>
          <button onClick={() => setShowPanel(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-5 py-6" style={{ scrollbarWidth: 'none', paddingBottom: '80px' }}>
          <Outlet context={{ refreshKey, onRefresh }} />
        </main>

        {/* Bottom nav */}
        <MobileNav />

        {/* Right panel as slide-over */}
        {showPanel && (
          <div className="fixed inset-0 z-50" onClick={() => setShowPanel(false)}>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
            <div className="absolute top-0 right-0 bottom-0 w-[300px]"
              style={{ animation: 'slideIn 0.25s ease' }}
              onClick={e => e.stopPropagation()}>
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between px-5 py-3"
                  style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                  <span className="font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>Overview</span>
                  <button onClick={() => setShowPanel(false)}
                    className="text-lg" style={{ color: 'var(--muted)' }}>✕</button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <RightPanel refreshKey={refreshKey} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
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