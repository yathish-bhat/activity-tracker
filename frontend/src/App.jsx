import { Routes, Route, Outlet } from 'react-router-dom';
import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import HomePage from './pages/HomePage';
import ActivityPage from './pages/ActivityPage';

function Layout({ refreshKey, onRefresh }) {
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

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const onRefresh = useCallback(() => setRefreshKey(k => k + 1), []);

  return (
    <Routes>
      <Route element={<Layout refreshKey={refreshKey} onRefresh={onRefresh} />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/activities" element={<ActivityPage />} />
      </Route>
    </Routes>
  );
}