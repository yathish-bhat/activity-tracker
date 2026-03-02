import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/', title: 'Dashboard', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>
    </svg>
  )},
  { path: '/activities', title: 'Activity', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )},
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="flex flex-col items-center py-6 gap-2 relative z-10"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-6 cursor-pointer"
        style={{ background: 'var(--accent)' }}
        onClick={() => navigate('/')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="2.5">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      </div>

      {navItems.map(item => {
        const active = item.path === '/' ? location.pathname === '/' : location.pathname === item.path;
        return (
          <div key={item.title}
            className="w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer relative transition-all duration-200"
            style={{
              background: active ? 'rgba(200,245,90,0.12)' : 'transparent',
              color: active ? 'var(--accent)' : 'var(--muted)',
            }}
            onClick={() => navigate(item.path)}
            title={item.title}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)'; }}}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}}
          >
            {active && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r"
                style={{ background: 'var(--accent)' }} />
            )}
            {item.icon}
          </div>
        );
      })}
    </nav>
  );
}