import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import api from '../api';
import { getGreeting, getFormattedToday } from '../utils';
import StatCard from '../components/StatCard';
import WeeklyChart from '../components/WeeklyChart';
import ActivityBanner from '../components/ActivityBanner';

export default function HomePage() {
  const { refreshKey } = useOutletContext();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [todayData, setTodayData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/activities'),
      api.get('/api/activities/today'),
    ]).then(([allRes, todayRes]) => {
      setActivities(allRes.data);
      setTodayData(todayRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [refreshKey]);

  // Compute stats from today's data
  const walkMin = todayData.filter(a => a.type === 'walk').reduce((s, a) => s + (a.unit === 'hours' ? a.duration * 60 : a.duration), 0);
  const steps = Math.round(walkMin * 120);
  const allActiveMin = todayData.filter(a => ['workout', 'walk'].includes(a.type)).reduce((s, a) => s + (a.unit === 'hours' ? a.duration * 60 : a.duration), 0);
  const calories = Math.round(allActiveMin * 8);
  const distance = +(walkMin * 0.08).toFixed(1);
  const sleepHrs = +(todayData.filter(a => a.type === 'sleep').reduce((s, a) => s + (a.unit === 'hours' ? a.duration : a.duration / 60), 0)).toFixed(1);

  const recent = activities.slice(0, 4);

  // Calculate streak (consecutive days with activities)
  const uniqueDates = [...new Set(activities.map(a => a.date))].sort().reverse();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    if (uniqueDates.includes(ds)) streak++;
    else if (i > 0) break; // allow today to be missing
    else break;
  }

  const stats = [
    { label: 'Steps', value: steps > 0 ? steps.toLocaleString() : null, unit: null, color: '#c8f55a', pct: (steps / 10000) * 100, change: steps > 0 ? 12 : null },
    { label: 'Calories', value: calories > 0 ? calories.toLocaleString() : null, unit: null, color: '#ff6b6b', pct: (calories / 2200) * 100, change: calories > 0 ? 6 : null },
    { label: 'Distance', value: distance > 0 ? distance : null, unit: distance > 0 ? 'km' : null, color: '#5a9cf5', pct: (distance / 8) * 100, change: distance > 0 ? -3 : null },
    { label: 'Sleep', value: sleepHrs > 0 ? sleepHrs : null, unit: sleepHrs > 0 ? 'hr' : null, color: '#b5a9f5', pct: (sleepHrs / 8) * 100, change: sleepHrs > 0 ? 8 : null },
  ];

  return (
    <>
      {/* Header */}
      <header className="flex items-end justify-between mb-9" style={{ animation: 'fadeUp 0.6s ease both' }}>
        <div className="font-syne">
          <div className="text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--muted)' }}>
            {getFormattedToday()}
          </div>
          <h1 className="text-[28px] font-extrabold leading-none">
            {getGreeting()}, <span style={{ color: 'var(--accent)' }}>Marcus</span> 👋
          </h1>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium"
            style={{
              background: 'rgba(200,245,90,0.08)',
              border: '1px solid rgba(200,245,90,0.2)',
              color: 'var(--accent)',
            }}>
            <span className="text-base">🔥</span>
            <span>{streak} day streak</span>
          </div>
        )}
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-7" style={{ animation: 'fadeUp 0.6s 0.1s ease both' }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Weekly Chart */}
      <WeeklyChart refreshKey={refreshKey} />

      {/* Recent Activities */}
      <div className="font-syne text-[15px] font-bold mb-4 flex items-center justify-between"
        style={{ animation: 'fadeUp 0.6s 0.3s ease both' }}>
        Recent Activities
        <span className="font-dm text-xs font-normal cursor-pointer hover:text-accent transition-colors"
          style={{ color: 'var(--muted)', fontFamily: 'DM Sans' }}
          onClick={() => navigate('/activities')}>
          See all →
        </span>
      </div>

      {loading ? (
        <div className="text-center py-8" style={{ color: 'var(--muted)' }}>Loading...</div>
      ) : recent.length === 0 ? (
        <div className="text-center py-12 rounded-[20px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)', animation: 'fadeUp 0.6s 0.3s ease both' }}>
          No activities yet — <span className="cursor-pointer underline" style={{ color: 'var(--accent)' }} onClick={() => navigate('/activities')}>log your first one →</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4" style={{ animation: 'fadeUp 0.6s 0.3s ease both' }}>
          {recent.map(a => <ActivityBanner key={a.id} activity={a} />)}
        </div>
      )}
    </>
  );
}