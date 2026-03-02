import { useState, useEffect } from 'react';
import api from '../api';
import { getTypeInfo, ACTIVITY_TYPES } from '../utils';
import MiniCalendar from './MiniCalendar';

export default function RightPanel({ refreshKey }) {
  const [todayData, setTodayData] = useState([]);
  const [allActivities, setAllActivities] = useState([]);

  useEffect(() => {
    api.get('/api/activities/today').then(r => setTodayData(r.data)).catch(() => {});
    api.get('/api/activities').then(r => setAllActivities(r.data)).catch(() => {});
  }, [refreshKey]);

  const activeDates = [...new Set(allActivities.map(a => a.date))];

  // Group today's activities by type
  const todayByType = todayData.reduce((acc, a) => {
    if (!acc[a.type]) acc[a.type] = [];
    acc[a.type].push(a);
    return acc;
  }, {});

  return (
    <aside className="overflow-y-auto p-8 px-6"
      style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)', scrollbarWidth: 'none' }}>

      {/* Today's Activities */}
      <div className="mb-8" style={{ animation: 'fadeUp 0.6s ease both' }}>
        <div className="text-[15px] font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Today's Activities</div>

        {todayData.length === 0 ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--surface2)' }}>
            <div className="text-2xl mb-2">📋</div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              No activities logged today.<br />Head to Activities to start tracking.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {Object.entries(todayByType).map(([type, items]) => {
              const info = getTypeInfo(type);
              const totalMin = items.reduce((s, a) => s + (a.unit === 'hours' ? a.duration * 60 : a.duration), 0);
              return (
                <div key={type} className="rounded-2xl p-4" style={{ background: 'var(--surface2)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{ background: info.color + '15' }}>
                      {info.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>{info.label}</div>
                    </div>
                    <div className="text-sm font-bold" style={{ fontFamily: 'Syne, sans-serif', color: info.color }}>
                      {totalMin} min
                    </div>
                  </div>
                  {items.map(a => (
                    <div key={a.id} className="flex items-center justify-between py-1.5 ml-11">
                      <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
                        {a.notes || 'No notes'}
                      </div>
                      <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
                        {a.duration} {a.unit === 'hours' ? 'hr' : 'min'}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Activities */}
      <div className="mb-8" style={{ animation: 'fadeUp 0.6s 0.1s ease both' }}>
        <div className="text-[15px] font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Available Activities</div>
        <div className="flex flex-col gap-2">
          {Object.entries(ACTIVITY_TYPES).map(([key, info]) => (
            <div key={key} className="flex items-center gap-3 py-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: info.color }} />
              <div className="flex-1 text-xs" style={{ color: 'var(--muted)' }}>{info.label}</div>
              <div className="text-[10px]" style={{ color: info.color }}>{info.emoji}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mini Calendar */}
      <div style={{ animation: 'fadeUp 0.6s 0.2s ease both' }}>
        <div className="text-[15px] font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <MiniCalendar activeDates={activeDates} />
      </div>
    </aside>
  );
}