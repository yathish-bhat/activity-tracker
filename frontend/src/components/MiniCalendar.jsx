import { useState } from 'react';

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function MiniCalendar({ activeDates = [] }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const todayStr = now.toISOString().split('T')[0];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--surface2)' }}>
      <div className="flex items-center justify-between mb-3 font-syne text-[13px] font-bold">
        <span className="cursor-pointer" style={{ color: 'var(--muted)' }} onClick={prev}>←</span>
        <span>{monthName}</span>
        <span className="cursor-pointer" style={{ color: 'var(--muted)' }} onClick={next}>→</span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {dayLabels.map((d, i) => (
          <div key={i} className="text-[9px] uppercase tracking-wider py-0.5" style={{ color: 'var(--muted)' }}>{d}</div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          const hasData = activeDates.includes(dateStr);
          const isPast = dateStr < todayStr && !isToday;

          return (
            <div key={i}
              className="text-[11px] py-1 rounded-md cursor-pointer relative transition-all duration-150 hover:bg-white/5"
              style={{
                background: isToday ? 'var(--accent)' : 'transparent',
                color: isToday ? '#0a0a0f' : hasData ? 'var(--text)' : isPast ? 'rgba(240,240,245,0.4)' : 'var(--muted)',
                fontWeight: isToday ? 700 : 400,
              }}>
              {d}
              {hasData && !isToday && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full opacity-60"
                  style={{ background: 'var(--accent)' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}