import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../api';
import { ACTIVITY_TYPES, getTypeInfo, formatDate, getTodayStr } from '../utils';

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium"
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderLeft: '3px solid var(--accent)', animation: 'slideIn 0.3s ease',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
      <span style={{ color: 'var(--accent)' }}>✓</span> {message}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-[20px] p-7"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', animation: 'fadeUp 0.3s ease both' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[28px]"
            style={{ background: info.color + '20' }}>
            {info.emoji}
          </div>
          <div>
            <div className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Add {info.label}</div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>{info.desc}</div>
          </div>
          <button className="ml-auto text-lg cursor-pointer" style={{ color: 'var(--muted)' }} onClick={onClose}>✕</button>
        </div>

        {/* Duration */}
        <div className="mb-5">
          <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--muted)' }}>Duration</label>
          <div className="flex gap-3">
            <input type="number" placeholder="0" value={duration} onChange={e => setDuration(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl text-lg font-bold"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', fontFamily: 'Syne, sans-serif' }}
              autoFocus />
            <div className="flex rounded-full overflow-hidden" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              {['minutes', 'hours'].map(u => (
                <button key={u} onClick={() => setUnit(u)}
                  className="px-4 py-2 text-xs transition-all duration-200"
                  style={{
                    background: unit === u ? 'rgba(200,245,90,0.12)' : 'transparent',
                    color: unit === u ? 'var(--accent)' : 'var(--muted)',
                  }}>
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--muted)' }}>Notes (optional)</label>
          <textarea rows={3} placeholder="Add details..." value={notes} onChange={e => setNotes(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm resize-none"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }} />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-[14px] text-sm transition-all duration-200"
            style={{ background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!duration || submitting}
            className="flex-1 py-3 rounded-[14px] font-bold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: info.color, color: '#0a0a0f', fontFamily: 'Syne, sans-serif' }}
            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = ''; }}>
            {submitting ? 'Adding...' : 'Add Activity'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ActivityPage() {
  const { onRefresh } = useOutletContext();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [addingType, setAddingType] = useState(null);

  const fetchActivities = () => {
    api.get('/api/activities').then(r => { setActivities(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchActivities(); }, []);

  const handleAdd = async (data) => {
    try {
      await api.post('/api/activities', data);
      setAddingType(null);
      setToast('Activity logged!');
      fetchActivities();
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this activity?')) return;
    try {
      await api.delete('/api/activities/' + id);
      fetchActivities();
      onRefresh();
    } catch (err) { console.error(err); }
  };

  // Group by date
  const grouped = activities.reduce((acc, a) => {
    (acc[a.date] = acc[a.date] || []).push(a);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {addingType && <AddModal type={addingType} onClose={() => setAddingType(null)} onSubmit={handleAdd} />}

      {/* Page Title */}
      <div className="mb-8" style={{ animation: 'fadeUp 0.6s ease both' }}>
        <div className="text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--muted)', fontFamily: 'DM Sans, sans-serif' }}>
          Track your day
        </div>
        <h1 className="text-[28px] font-extrabold leading-none" style={{ fontFamily: 'Syne, sans-serif' }}>
          Activities
        </h1>
      </div>

      {/* Activity Type Banners */}
      <div className="flex flex-col gap-4 mb-10" style={{ animation: 'fadeUp 0.6s 0.1s ease both' }}>
        {Object.entries(ACTIVITY_TYPES).map(([key, info]) => {
          const todayLogs = activities.filter(a => a.type === key && a.date === getTodayStr());
          const totalMin = todayLogs.reduce((s, a) => s + (a.unit === 'hours' ? a.duration * 60 : a.duration), 0);

          return (
            <div key={key}
              className="flex items-center gap-5 rounded-[20px] p-5 transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[28px] shrink-0"
                style={{ background: info.color + '15' }}>
                {info.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-base mb-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>{info.label}</div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>{info.desc}</div>
                {todayLogs.length > 0 && (
                  <div className="text-[11px] mt-1.5" style={{ color: info.color }}>
                    {todayLogs.length} logged today · {totalMin} min total
                  </div>
                )}
              </div>
              <button
                className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shrink-0"
                style={{ background: info.color + '18', color: info.color, border: '1px solid ' + info.color + '40' }}
                onClick={() => setAddingType(key)}
                onMouseEnter={e => { e.currentTarget.style.background = info.color; e.currentTarget.style.color = '#0a0a0f'; }}
                onMouseLeave={e => { e.currentTarget.style.background = info.color + '18'; e.currentTarget.style.color = info.color; }}
              >
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
          No activities yet — use the Add buttons above to start tracking
        </div>
      ) : (
        <div style={{ animation: 'fadeUp 0.6s 0.2s ease both' }}>
          {sortedDates.map(date => (
            <div key={date} className="mb-6">
              <div className="text-[11px] uppercase tracking-wider mb-3 px-1" style={{ color: 'var(--muted)' }}>
                {formatDate(date)}
              </div>
              <div className="flex flex-col gap-2">
                {grouped[date].map(a => {
                  const info = getTypeInfo(a.type);
                  return (
                    <div key={a.id}
                      className="group flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-200 hover:-translate-y-0.5"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                        style={{ background: info.color + '15' }}>
                        {info.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{info.label}</div>
                        <div className="text-[11px] truncate" style={{ color: 'var(--muted)' }}>
                          {a.notes || 'No notes'}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif', color: info.color }}>
                          {a.duration} {a.unit === 'hours' ? 'hr' : 'min'}
                        </div>
                      </div>
                      <button onClick={() => handleDelete(a.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm cursor-pointer shrink-0 ml-2"
                        style={{ color: 'var(--muted)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent2)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
                        🗑
                      </button>
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