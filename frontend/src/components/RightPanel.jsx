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

  const todayByType = todayData.reduce((acc, a) => {
    if (!acc[a.type]) acc[a.type] = [];
    acc[a.type].push(a);
    return acc;
  }, {});

  const todayCompleted = todayData.filter(a => a.status === 'completed').length;
  const todayTotal = todayData.length;
  const completionPct = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  return (
    <aside className="overflow-y-auto p-8 px-6"
      style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)', scrollbarWidth: 'none' }}>

      {/* Today's Activities */}
      <div className="mb-8" style={{ animation: 'fadeUp 0.6s ease both' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-[15px] font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Today</div>
          {todayTotal > 0 && (
            <div className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
              style={{
                background: completionPct === 100 ? 'rgba(200,245,90,0.12)' : 'rgba(255,255,255,0.04)',
                color: completionPct === 100 ? 'var(--accent)' : 'var(--muted)',
              }}>
              {todayCompleted}/{todayTotal} done
            </div>
          )}
        </div>

        {todayData.length === 0 ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--surface2)' }}>
            <div className="text-2xl mb-2">📋</div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              No activities logged today.<br />Head to Activities to start tracking.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Completion bar */}
            {todayTotal > 0 && (
              <div className="rounded-xl p-3" style={{ background: 'var(--surface2)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Completion</span>
                  <span className="text-xs font-bold" style={{ fontFamily: 'Syne, sans-serif', color: completionPct === 100 ? 'var(--accent)' : 'var(--text)' }}>
                    {completionPct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: completionPct + '%',
                      background: completionPct === 100 ? 'var(--accent)' : 'linear-gradient(90deg, var(--accent3), var(--accent))',
                    }} />
                </div>
              </div>
            )}

            {Object.entries(todayByType).map(([type, items]) => {
              const info = getTypeInfo(type);
              const totalMin = items.reduce((s, a) => s + (a.unit === 'hours' ? a.duration * 60 : a.duration), 0);
              const doneCount = items.filter(a => a.status === 'completed').length;
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
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{ fontFamily: 'Syne, sans-serif', color: info.color }}>
                        {totalMin}m
                      </div>
                      <div className="text-[9px]" style={{ color: 'var(--muted)' }}>
                        {doneCount}/{items.length} done
                      </div>
                    </div>
                  </div>
                  {items.map(a => (
                    <div key={a.id} className="flex items-center justify-between py-1.5 ml-11">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px]" style={{ color: a.status === 'completed' ? 'var(--accent)' : 'var(--muted)' }}>
                          {a.status === 'completed' ? '✓' : '○'}
                        </span>
                        <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                          {a.notes || 'No notes'}
                        </span>
                      </div>
                      <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
                        {a.duration} {a.unit === 'hours' ? 'hr' : 'min'}
                        {a.status === 'completed' && a.actual_duration && (
                          <span style={{ color: 'var(--accent)' }}> → {a.actual_duration}{a.actual_unit === 'hours' ? 'h' : 'm'}</span>
                        )}
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