import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const tabs = [
  { path: '/', label: 'Home', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>
    </svg>
  )},
  { path: '/activities', label: 'Activity', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )},
  { path: 'logout', label: 'Sign Out', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )},
];

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'max(12px, var(--safe-bottom))',
        paddingTop: '10px',
      }}>
      {tabs.map(tab => {
        const active = tab.path === '/' ? location.pathname === '/' : location.pathname === tab.path;
        const isLogout = tab.path === 'logout';
        return (
          <button key={tab.label}
            className="flex flex-col items-center gap-1 transition-all duration-200"
            style={{ color: isLogout ? 'var(--accent2)' : active ? 'var(--accent)' : 'var(--muted)' }}
            onClick={() => {
              if (isLogout) logout();
              else navigate(tab.path);
            }}>
            {tab.icon}
            <span className="text-[10px]" style={{ fontFamily: 'Syne, sans-serif', fontWeight: active ? 700 : 400 }}>
              {tab.label}
            </span>
            {active && !isLogout && (
              <div className="w-4 h-[2px] rounded-full" style={{ background: 'var(--accent)' }} />
            )}
          </button>
        );
      })}
    </div>
  );
}