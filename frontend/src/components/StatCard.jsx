export default function StatCard({ label, value, unit, color, pct, change }) {
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (circumference * Math.min(pct, 100)) / 100;
  const isUp = change >= 0;

  return (
    <div className="relative overflow-hidden rounded-[20px] p-5 cursor-default transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {/* Top color bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[20px]" style={{ background: color }} />

      {/* Mini ring */}
      <div className="absolute top-4 right-4">
        <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
          <circle cx="22" cy="22" r="18" fill="none" stroke={color} strokeWidth="3.5"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
      </div>

      <div className="flex items-center gap-1.5 mb-2.5 text-[11px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        {label}
      </div>

      <div className="font-syne text-[30px] font-extrabold leading-none mb-1">
        {value !== null ? value : '--'}
        {unit && <span className="text-sm font-normal" style={{ color: 'var(--muted)' }}> {unit}</span>}
      </div>

      <div className="text-[11px] flex items-center gap-1" style={{ color: 'var(--muted)' }}>
        {change !== null ? (
          <>
            <span style={{ color: isUp ? 'var(--accent)' : 'var(--accent2)' }}>
              {isUp ? '↑' : '↓'} {Math.abs(change)}%
            </span>
            vs yesterday
          </>
        ) : (
          <span>No data yet</span>
        )}
      </div>
    </div>
  );
}