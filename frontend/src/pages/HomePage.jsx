import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';
import { getGreeting, getFormattedToday, ACTIVITY_TYPES, getTypeInfo, formatDate } from '../utils';
import WeeklyChart from '../components/WeeklyChart';

export default function HomePage() {
  const { refreshKey } = useOutletContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/activities').then(r => setActivities(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [refreshKey]);

  const recent = activities.slice(0, 6);
  const todayStr = new Date().toISOString().split('T')[0];

  const uniqueDates = [...new Set(activities.map(a => a.date))].sort().reverse();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    if (uniqueDates.includes(ds)) streak++;
    else if (i > 0) break;
    else break;
  }

  const firstName = user?.name?.split(' ')[0] || '';

  return (
    <>
      <header className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-9 gap-3" style={{ animation: 'fadeUp 0.6s ease both' }}>
        <div style={{ fontFamily: 'Syne, sans-serif' }}>
          <div className="text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--muted)' }}>
            {getFormattedToday()}
          </div>
          <h1 className="text-[22px] sm:text-[28px] font-extrabold leading-none">
            {getGreeting()}{firstName ? ', ' : ''}{firstName ? <span style={{ color: 'var(--accent)' }}>{firstName}</span> : ''} 👋
          </h1>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium self-start"
            style={{ background: 'rgba(200,245,90,0.08)', border: '1px solid rgba(200,245,90,0.2)', color: 'var(--accent)' }}>
            <span className="text-base">🔥</span>
            <span>{streak} day streak</span>
          </div>
        )}
      </header>

      {/* Activity Type Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-7" style={{ animation: 'fadeUp 0.6s 0.1s ease both' }}>
        {Object.entries(ACTIVITY_TYPES).map(([key, info]) => {
          const todayCount = activities.filter(a => a.type === key && a.date === todayStr).length;
          return (
            <div key={key}
              className="relative overflow-hidden rounded-2xl sm:rounded-[20px] p-4 sm:p-5 cursor-default transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: info.color }} />
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-base sm:text-lg"
                  style={{ background: info.color + '15' }}>
                  {info.emoji}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{info.label}</div>
                  <div className="text-[9px] sm:text-[10px] hidden sm:block" style={{ color: 'var(--muted)' }}>{info.desc}</div>
                </div>
              </div>
              <div className="text-[10px] sm:text-[11px]" style={{ color: 'var(--muted)' }}>
                {todayCount > 0 ? (
                  <span style={{ color: info.color }}>{todayCount} today</span>
                ) : 'No entries'}
              </div>
            </div>
          );
        })}
      </div>

      <WeeklyChart refreshKey={refreshKey} />

      {/* Recent Activities */}
      <div className="text-[15px] font-bold mb-4 flex items-center justify-between"
        style={{ fontFamily: 'Syne, sans-serif', animation: 'fadeUp 0.6s 0.3s ease both' }}>
        Recent Activities
        <span className="text-xs font-normal cursor-pointer transition-colors"
          style={{ color: 'var(--muted)', fontFamily: 'DM Sans, sans-serif' }}
          onClick={() => navigate('/activities')}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
          See all →
        </span>
      </div>

      {loading ? (
        <div className="text-center py-8" style={{ color: 'var(--muted)' }}>Loading...</div>
      ) : recent.length === 0 ? (
        <div className="text-center py-12 rounded-[20px]"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)', animation: 'fadeUp 0.6s 0.3s ease both' }}>
          No activities yet — <span className="cursor-pointer underline" style={{ color: 'var(--accent)' }}
            onClick={() => navigate('/activities')}>log your first one →</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ animation: 'fadeUp 0.6s 0.3s ease both' }}>
          {recent.map(a => {
            const info = getTypeInfo(a.type);
            return (
              <div key={a.id}
                className="flex items-center gap-3 sm:gap-4 rounded-2xl sm:rounded-[20px] p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-[14px] flex items-center justify-center text-lg sm:text-[22px] shrink-0"
                  style={{ background: info.color + '15' }}>{info.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{info.label}</div>
                  <div className="text-[11px] truncate" style={{ color: 'var(--muted)' }}>
                    {formatDate(a.date)}{a.notes ? ' · ' + a.notes : ''}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm sm:text-base font-bold" style={{ fontFamily: 'Syne, sans-serif', color: info.color }}>
                    {a.duration} {a.unit === 'hours' ? 'hr' : 'min'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}