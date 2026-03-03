import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../api';
import { ACTIVITY_TYPES, getTypeInfo, formatDate, getTodayStr } from '../utils';

function Toast({ message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)',
        animation: 'slideIn 0.3s ease', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      <span style={{ color: 'var(--accent)' }}>✓</span> {message}
    </div>
  );
}

function BottomModal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="w-full sm:max-w-md rounded-t-[24px] sm:rounded-[20px] p-6 sm:p-7"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)',
          animation: window.innerWidth < 640 ? 'slideUp 0.3s ease both' : 'fadeUp 0.3s ease both',
          paddingBottom: 'max(24px, calc(var(--safe-bottom) + 16px))' }}
        onClick={e => e.stopPropagation()}>
        <div className="sm:hidden w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--border)' }} />
        {children}
      </div>
    </div>
  );
}

function AddModal({ type, onClose, onSubmit }) {
  const info = ACTIVITY_TYPES[type];
  const [duration, setDuration] = useState('');
  const [unit, setUnit] = useState('minutes');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async () => {
    if (!duration) return;
    setSubmitting(true);
    await onSubmit({ type, duration: Number(duration), unit, notes, date: getTodayStr() });
    setSubmitting(false);
  };
  return (
    <BottomModal onClose={onClose}>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl flex items-center justify-center text-[24px] sm:text-[28px]"
          style={{ background: info.color + '20' }}>{info.emoji}</div>
        <div>
          <div className="text-base sm:text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Add {info.label}</div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>{info.desc}</div>
        </div>
        <button className="ml-auto text-lg cursor-pointer" style={{ color: 'var(--muted)' }} onClick={onClose}>✕</button>
      </div>
      <div className="mb-5">
        <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--muted)' }}>Planned Duration</label>
        <div className="flex gap-3">
          <input type="number" inputMode="numeric" placeholder="0" value={duration} onChange={e => setDuration(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl text-lg font-bold"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', fontFamily: 'Syne, sans-serif' }} autoFocus />
          <div className="flex rounded-full overflow-hidden" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            {['minutes', 'hours'].map(u => (
              <button key={u} onClick={() => setUnit(u)} className="px-3 sm:px-4 py-2 text-xs transition-all duration-200"
                style={{ background: unit === u ? 'rgba(200,245,90,0.12)' : 'transparent', color: unit === u ? 'var(--accent)' : 'var(--muted)' }}>
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mb-6">
        <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--muted)' }}>Notes (optional)</label>
        <textarea rows={3} placeholder="Add details..." value={notes} onChange={e => setNotes(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-sm resize-none"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }} />
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-3 rounded-[14px] text-sm transition-all duration-200"
          style={{ background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>Cancel</button>
        <button onClick={handleSubmit} disabled={!duration || submitting}
          className="flex-1 py-3 rounded-[14px] font-bold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: info.color, color: '#0a0a0f', fontFamily: 'Syne, sans-serif' }}>
          {submitting ? 'Adding...' : 'Add Activity'}
        </button>
      </div>
    </BottomModal>
  );
}

function CompleteModal({ activity, onClose, onSubmit }) {
  const info = getTypeInfo(activity.type);
  const [actualDuration, setActualDuration] = useState(String(activity.duration));
  const [actualUnit, setActualUnit] = useState(activity.unit || 'minutes');
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async () => {
    if (!actualDuration) return;
    setSubmitting(true);
    await onSubmit(activity.id, { actual_duration: Number(actualDuration), actual_unit: actualUnit });
    setSubmitting(false);
  };
  const plannedMin = activity.unit === 'hours' ? activity.duration * 60 : activity.duration;
  const actualMin = actualDuration ? (actualUnit === 'hours' ? Number(actualDuration) * 60 : Number(actualDuration)) : 0;
  const diff = actualMin - plannedMin;

  return (
    <BottomModal onClose={onClose}>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl flex items-center justify-center text-[24px] sm:text-[28px]"
          style={{ background: info.color + '20' }}>{info.emoji}</div>
        <div>
          <div className="text-base sm:text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Complete {info.label}</div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            Planned: {activity.duration} {activity.unit === 'hours' ? 'hr' : 'min'}
          </div>
        </div>
        <button className="ml-auto text-lg cursor-pointer" style={{ color: 'var(--muted)' }} onClick={onClose}>✕</button>
      </div>

      <div className="mb-5">
        <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--muted)' }}>Actual Time Taken</label>
        <div className="flex gap-3">
          <input type="number" inputMode="numeric" placeholder="0" value={actualDuration} onChange={e => setActualDuration(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl text-lg font-bold"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', fontFamily: 'Syne, sans-serif' }} autoFocus />
          <div className="flex rounded-full overflow-hidden" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            {['minutes', 'hours'].map(u => (
              <button key={u} onClick={() => setActualUnit(u)} className="px-3 sm:px-4 py-2 text-xs transition-all duration-200"
                style={{ background: actualUnit === u ? 'rgba(200,245,90,0.12)' : 'transparent', color: actualUnit === u ? 'var(--accent)' : 'var(--muted)' }}>
                {u}
              </button>
            ))}
          </div>
        </div>
        {actualDuration && diff !== 0 && (
          <div className="mt-2 text-[11px] px-1"
            style={{ color: diff > 0 ? 'var(--accent2)' : 'var(--accent)' }}>
            {diff > 0 ? `+${diff} min over planned` : `${Math.abs(diff)} min under planned`}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-3 rounded-[14px] text-sm transition-all duration-200"
          style={{ background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>Cancel</button>
        <button onClick={handleSubmit} disabled={!actualDuration || submitting}
          className="flex-1 py-3 rounded-[14px] font-bold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--accent)', color: '#0a0a0f', fontFamily: 'Syne, sans-serif' }}>
          {submitting ? 'Saving...' : '✓ Mark Complete'}
        </button>
      </div>
    </BottomModal>
  );
}

function generateReportText(data, type) {
  const lines = [];
  const divider = '='.repeat(48);
  const thinDiv = '-'.repeat(48);
  lines.push(divider);
  lines.push(`  PULSE — ${type === 'daily' ? 'DAILY' : 'WEEKLY'} ACTIVITY REPORT`);
  lines.push(`  User: ${data.userName}`);
  if (type === 'daily') lines.push(`  Date: ${formatDate(data.date)}`);
  else lines.push(`  Week: ${formatDate(data.weekStart)} — ${formatDate(data.weekEnd)}`);
  lines.push(divider);
  lines.push('');
  lines.push(`  Total Activities:  ${data.totalActivities}`);
  lines.push(`  Completed:         ${data.completedCount} / ${data.totalActivities}`);
  lines.push(`  Total Time:        ${Math.floor(data.totalMinutes / 60)}h ${data.totalMinutes % 60}m`);
  if (type === 'weekly') lines.push(`  Days Active:       ${data.daysActive} / 7`);
  lines.push('');
  lines.push(thinDiv);
  lines.push('  BREAKDOWN BY TYPE');
  lines.push(thinDiv);
  const summary = type === 'daily' ? data.summary : data.byType;
  Object.entries(summary).forEach(([t, info]) => {
    const ti = getTypeInfo(t);
    const hrs = Math.floor(info.totalMin / 60);
    const mins = info.totalMin % 60;
    lines.push(`  ${ti.emoji}  ${ti.label.padEnd(14)} ${String(info.count).padStart(3)} entries    ${hrs > 0 ? hrs + 'h ' : ''}${mins}m    (${info.completed}/${info.count} done)`);
  });
  if (type === 'daily' && data.activities?.length > 0) {
    lines.push('');
    lines.push(thinDiv);
    lines.push('  ACTIVITY DETAILS');
    lines.push(thinDiv);
    data.activities.forEach(a => {
      const info = getTypeInfo(a.type);
      const status = a.status === 'completed' ? '✓' : '○';
      const actual = a.actual_duration ? ` → actual: ${a.actual_duration} ${a.actual_unit === 'hours' ? 'hr' : 'min'}` : '';
      lines.push(`  ${status} ${info.emoji}  ${info.label} — ${a.duration} ${a.unit === 'hours' ? 'hr' : 'min'}${actual}${a.notes ? '  "' + a.notes + '"' : ''}`);
    });
  }
  if (type === 'weekly' && data.byDate) {
    lines.push('');
    lines.push(thinDiv);
    lines.push('  DAILY BREAKDOWN');
    lines.push(thinDiv);
    Object.entries(data.byDate).forEach(([date, items]) => {
      const dayMin = items.reduce((s, a) => s + (a.unit === 'hours' ? a.duration * 60 : a.duration), 0);
      const done = items.filter(a => a.status === 'completed').length;
      lines.push(`  ${formatDate(date).padEnd(20)} ${items.length} activities    ${Math.floor(dayMin / 60)}h ${dayMin % 60}m    (${done} done)`);
    });
  }
  lines.push('');
  lines.push(divider);
  lines.push('  Generated by Pulse Activity Tracker');
  lines.push(`  ${new Date().toLocaleString()}`);
  lines.push(divider);
  return lines.join('\n');
}

function downloadReport(text, filename) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Status badge component ──
function StatusBadge({ activity, onComplete, onReopen }) {
  if (activity.status === 'completed') {
    const actualMin = activity.actual_unit === 'hours' ? activity.actual_duration * 60 : activity.actual_duration;
    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold"
            style={{ background: 'rgba(200,245,90,0.12)', color: 'var(--accent)' }}>
            ✓ Done · {activity.actual_duration}{activity.actual_unit === 'hours' ? 'h' : 'm'}
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onReopen(activity.id); }}
          className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] transition-all duration-200"
          style={{ color: 'var(--muted)' }}
          title="Undo completion"
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent2)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
          ↩
        </button>
      </div>
    );
  }

  return (
    <button onClick={(e) => { e.stopPropagation(); onComplete(activity); }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all duration-200"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--muted)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}>
      ○ Mark Done
    </button>
  );
}

export default function ActivityPage() {
  const { onRefresh } = useOutletContext();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [addingType, setAddingType] = useState(null);
  const [completingActivity, setCompletingActivity] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const fetchActivities = () => {
    api.get('/api/activities').then(r => { setActivities(r.data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { fetchActivities(); }, []);

  const handleAdd = async (data) => {
    try {
      await api.post('/api/activities', data);
      setAddingType(null);
      setToast('Activity logged!');
      fetchActivities(); onRefresh();
    } catch (err) { console.error(err); }
  };

  const handleComplete = async (id, data) => {
    try {
      await api.patch(`/api/activities/${id}/complete`, data);
      setCompletingActivity(null);
      setToast('Activity completed!');
      fetchActivities(); onRefresh();
    } catch (err) { console.error(err); }
  };

  const handleReopen = async (id) => {
    try {
      await api.patch(`/api/activities/${id}/reopen`);
      setToast('Activity reopened');
      fetchActivities(); onRefresh();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this activity?')) return;
    try {
      await api.delete('/api/activities/' + id);
      fetchActivities(); onRefresh();
    } catch (err) { console.error(err); }
  };

  const handleDailyReport = async () => {
    setDownloading('daily');
    try {
      const res = await api.get('/api/activities/report/daily?date=' + getTodayStr());
      downloadReport(generateReportText(res.data, 'daily'), `pulse-daily-${getTodayStr()}.txt`);
      setToast('Daily report downloaded!');
    } catch (err) { console.error(err); }
    setDownloading(null);
  };

  const handleWeeklyReport = async () => {
    setDownloading('weekly');
    try {
      const res = await api.get('/api/activities/report/weekly');
      downloadReport(generateReportText(res.data, 'weekly'), `pulse-weekly-${res.data.weekStart}.txt`);
      setToast('Weekly report downloaded!');
    } catch (err) { console.error(err); }
    setDownloading(null);
  };

  const grouped = activities.reduce((acc, a) => { (acc[a.date] = acc[a.date] || []).push(a); return acc; }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  // Stats
  const todayActivities = activities.filter(a => a.date === getTodayStr());
  const todayCompleted = todayActivities.filter(a => a.status === 'completed').length;
  const todayTotal = todayActivities.length;

  return (
    <>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {addingType && <AddModal type={addingType} onClose={() => setAddingType(null)} onSubmit={handleAdd} />}
      {completingActivity && <CompleteModal activity={completingActivity} onClose={() => setCompletingActivity(null)} onSubmit={handleComplete} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3" style={{ animation: 'fadeUp 0.6s ease both' }}>
        <div>
          <div className="text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--muted)' }}>Track your day</div>
          <h1 className="text-[22px] sm:text-[28px] font-extrabold leading-none" style={{ fontFamily: 'Syne, sans-serif' }}>Activities</h1>
          {todayTotal > 0 && (
            <div className="text-[11px] mt-1.5" style={{ color: 'var(--muted)' }}>
              Today: <span style={{ color: 'var(--accent)' }}>{todayCompleted}/{todayTotal} completed</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={handleDailyReport} disabled={downloading === 'daily'}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-medium transition-all duration-200"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {downloading === 'daily' ? '...' : 'Daily'}
          </button>
          <button onClick={handleWeeklyReport} disabled={downloading === 'weekly'}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-medium transition-all duration-200"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent3)'; e.currentTarget.style.color = 'var(--accent3)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {downloading === 'weekly' ? '...' : 'Weekly'}
          </button>
        </div>
      </div>

      {/* Activity Banners */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-8 sm:mb-10" style={{ animation: 'fadeUp 0.6s 0.1s ease both' }}>
        {Object.entries(ACTIVITY_TYPES).map(([key, info]) => {
          const todayLogs = activities.filter(a => a.type === key && a.date === getTodayStr());
          const done = todayLogs.filter(a => a.status === 'completed').length;
          const totalMin = todayLogs.reduce((s, a) => s + (a.unit === 'hours' ? a.duration * 60 : a.duration), 0);
          return (
            <div key={key}
              className="flex items-center gap-4 sm:gap-5 rounded-2xl sm:rounded-[20px] p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-[22px] sm:text-[28px] shrink-0"
                style={{ background: info.color + '15' }}>{info.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm sm:text-base mb-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>{info.label}</div>
                <div className="text-[11px] sm:text-xs hidden sm:block" style={{ color: 'var(--muted)' }}>{info.desc}</div>
                {todayLogs.length > 0 && (
                  <div className="text-[10px] sm:text-[11px] mt-1" style={{ color: info.color }}>
                    {todayLogs.length} today · {done}/{todayLogs.length} done · {totalMin}m
                  </div>
                )}
              </div>
              <button className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0"
                style={{ background: info.color + '18', color: info.color, border: '1px solid ' + info.color + '40' }}
                onClick={() => setAddingType(key)}
                onMouseEnter={e => { e.currentTarget.style.background = info.color; e.currentTarget.style.color = '#0a0a0f'; }}
                onMouseLeave={e => { e.currentTarget.style.background = info.color + '18'; e.currentTarget.style.color = info.color; }}>
                + Add
              </button>
            </div>
          );
        })}
      </div>

      {/* Activity Log */}
      <div className="text-[15px] font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif', animation: 'fadeUp 0.6s 0.2s ease both' }}>
        Activity Log
      </div>

      {loading ? (
        <div className="text-center py-8" style={{ color: 'var(--muted)' }}>Loading...</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 rounded-[20px]"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
          No activities yet — use the Add buttons above
        </div>
      ) : (
        <div style={{ animation: 'fadeUp 0.6s 0.2s ease both' }}>
          {sortedDates.map(date => (
            <div key={date} className="mb-6">
              <div className="text-[11px] uppercase tracking-wider mb-3 px-1 flex items-center justify-between"
                style={{ color: 'var(--muted)' }}>
                <span>{formatDate(date)}</span>
                <span>
                  {grouped[date].filter(a => a.status === 'completed').length}/{grouped[date].length} done
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {grouped[date].map(a => {
                  const info = getTypeInfo(a.type);
                  const isCompleted = a.status === 'completed';
                  return (
                    <div key={a.id}
                      className="group flex items-center gap-3 sm:gap-4 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 transition-all duration-200 hover:-translate-y-0.5"
                      style={{
                        background: 'var(--surface)',
                        border: `1px solid ${isCompleted ? 'rgba(200,245,90,0.15)' : 'var(--border)'}`,
                        opacity: isCompleted ? 0.85 : 1,
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = isCompleted ? 'rgba(200,245,90,0.15)' : 'var(--border)'}>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-base sm:text-lg shrink-0"
                        style={{ background: info.color + '15' }}>{info.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                          {info.label}
                          <span className="text-[10px] font-normal" style={{ color: 'var(--muted)' }}>
                            {a.duration} {a.unit === 'hours' ? 'hr' : 'min'}
                          </span>
                        </div>
                        <div className="text-[11px] truncate" style={{ color: 'var(--muted)' }}>{a.notes || 'No notes'}</div>
                      </div>

                      <StatusBadge activity={a}
                        onComplete={() => setCompletingActivity(a)}
                        onReopen={handleReopen} />

                      <button onClick={() => handleDelete(a.id)}
                        className="sm:opacity-0 sm:group-hover:opacity-100 opacity-60 transition-opacity duration-200 text-sm cursor-pointer shrink-0"
                        style={{ color: 'var(--muted)' }}>🗑</button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}