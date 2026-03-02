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
  { path: '#workouts', title: 'Workouts', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6.5 6.5L3 3M3 3v5M3 3h5M17.5 6.5L21 3M21 3v5M21 3h-5M6.5 17.5L3 21M3 21v-5M3 21h5M17.5 17.5L21 21M21 21v-5M21 21h-5"/>
      <path d="M7 12h2l2-4 2 8 2-4 2 0"/>
    </svg>
  )},
  { path: '#nutrition', title: 'Nutrition', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 6v6l4 2"/>
    </svg>
  )},
  { path: '#settings', title: 'Settings', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M21 12h-2M5 12H3M12 21v-2M12 5V3"/>
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
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-6"
        style={{ background: 'var(--accent)' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="2.5">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      </div>

      {/* Nav items */}
      {navItems.map(item => {
        const active = item.path === '/' ? location.pathname === '/' : location.pathname === item.path;
        return (
          <div key={item.title}
            className="w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer relative transition-all duration-200"
            style={{
              background: active ? 'rgba(200,245,90,0.12)' : 'transparent',
              color: active ? 'var(--accent)' : 'var(--muted)',
            }}
            onClick={() => !item.path.startsWith('#') && navigate(item.path)}
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

      {/* Avatar */}
      <div className="mt-auto">
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-syne font-bold text-[13px]"
          style={{ background: 'linear-gradient(135deg, #c8f55a, #5a9cf5)', color: '#0a0a0f' }}>
          MK
        </div>
      </div>
    </nav>
  );
}