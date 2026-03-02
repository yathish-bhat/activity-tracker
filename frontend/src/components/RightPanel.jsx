import { useState, useEffect } from 'react';
import api from '../api';
import GoalRings from './GoalRings';
import MiniCalendar from './MiniCalendar';

export default function RightPanel({ refreshKey }) {
  const [todayData, setTodayData] = useState([]);
  const [allActivities, setAllActivities] = useState([]);

  useEffect(() => {
    api.get('/api/activities/today').then(r => setTodayData(r.data)).catch(() => {});
    api.get('/api/activities').then(r => setAllActivities(r.data)).catch(() => {});
  }, [refreshKey]);

  // Compute goals from today's activities
  const walkMin = todayData.filter(a => a.type === 'walk').reduce((s, a) => s + (a.unit === 'hours' ? a.duration * 60 : a.duration), 0);
  const steps = Math.round(walkMin * 120); // ~120 steps/min estimate
  const workoutMin = todayData.filter(a => ['workout', 'walk'].includes(a.type)).reduce((s, a) => s + (a.unit === 'hours' ? a.duration * 60 : a.duration), 0);
  const calories = Math.round(workoutMin * 8); // ~8 cal/min estimate
  const distance = +(walkMin * 0.08).toFixed(1); // ~0.08 km/min

  // Active dates for calendar
  const activeDates = [...new Set(allActivities.map(a => a.date))];

  return (
    <aside className="overflow-y-auto p-8 px-6"
      style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)', scrollbarWidth: 'none' }}>

      {/* Daily Goals */}
      <div className="mb-8" style={{ animation: 'fadeUp 0.6s ease both' }}>
        <div className="font-syne text-[15px] font-bold mb-4">Daily Goals</div>
        <GoalRings steps={steps} calories={calories} distance={distance} />
      </div>

      {/* Heart Rate */}
      <div className="mb-8" style={{ animation: 'fadeUp 0.6s 0.15s ease both' }}>
        <div className="font-syne text-[15px] font-bold mb-4">Heart Rate</div>
        <div className="flex items-center gap-3 rounded-2xl p-4 mb-4" style={{ background: 'var(--surface2)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: 'rgba(255,107,107,0.1)', animation: 'heartbeat 1.2s ease-in-out infinite' }}>
            ❤️
          </div>
          <div className="flex-1">
            <div className="font-syne text-2xl font-extrabold leading-none" style={{ color: 'var(--accent2)' }}>
              72 <span className="text-xs font-normal" style={{ color: 'var(--muted)' }}>bpm</span>
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>Resting · Normal</div>
          </div>
        </div>
        <div className="h-10 overflow-hidden">
          <svg viewBox="0 0 240 40" preserveAspectRatio="none" width="100%" height="100%">
            <defs>
              <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff6b6b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ff6b6b" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,25 L20,25 L30,10 L40,30 L50,25 L70,25 L80,8 L90,32 L100,25 L120,25 L130,12 L140,28 L150,25 L170,25 L180,6 L190,34 L200,25 L220,25 L230,14 L240,25"
              fill="none" stroke="#ff6b6b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M0,25 L20,25 L30,10 L40,30 L50,25 L70,25 L80,8 L90,32 L100,25 L120,25 L130,12 L140,28 L150,25 L170,25 L180,6 L190,34 L200,25 L220,25 L230,14 L240,25 L240,40 L0,40 Z"
              fill="url(#hrGrad)" />
          </svg>
        </div>
      </div>

      {/* Mini Calendar */}
      <div style={{ animation: 'fadeUp 0.6s 0.25s ease both' }}>
        <div className="font-syne text-[15px] font-bold mb-4">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <MiniCalendar activeDates={activeDates} />
      </div>
    </aside>
  );
}