export default function GoalRings({ steps, calories, distance }) {
  const stepsPct = Math.min((steps / 10000) * 100, 100);
  const calPct = Math.min((calories / 2200) * 100, 100);
  const distPct = Math.min((distance / 8) * 100, 100);
  const overall = Math.round((stepsPct + calPct + distPct) / 3);

  const rings = [
    { r: 62, circ: 2 * Math.PI * 62, pct: stepsPct, color: '#c8f55a', bg: 'rgba(200,245,90,0.08)' },
    { r: 49, circ: 2 * Math.PI * 49, pct: calPct, color: '#ff6b6b', bg: 'rgba(255,107,107,0.08)' },
    { r: 36, circ: 2 * Math.PI * 36, pct: distPct, color: '#5a9cf5', bg: 'rgba(90,156,245,0.08)' },
  ];

  const goals = [
    { name: 'Steps', actual: steps, goal: 10000, unit: '', color: '#c8f55a', pct: Math.round(stepsPct) },
    { name: 'Calories', actual: calories, goal: 2200, unit: '', color: '#ff6b6b', pct: Math.round(calPct) },
    { name: 'Distance', actual: distance.toFixed(1), goal: 8, unit: ' km', color: '#5a9cf5', pct: Math.round(distPct) },
  ];

  return (
    <div>
      <div className="flex justify-center my-6 relative">
        <svg width="140" height="140" viewBox="0 0 140 140"
          style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0 0 20px rgba(200,245,90,0.2))' }}>
          {rings.map((ring, i) => (
            <g key={i}>
              <circle fill="none" cx="70" cy="70" r={ring.r} stroke={ring.bg} strokeWidth="10" />
              <circle fill="none" cx="70" cy="70" r={ring.r} stroke={ring.color} strokeWidth="10"
                strokeLinecap="round" strokeDasharray={ring.circ}
                strokeDashoffset={ring.circ - (ring.circ * ring.pct) / 100}
                style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.16,1,.3,1)' }} />
            </g>
          ))}
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <span className="font-syne text-[28px] font-extrabold block" style={{ color: 'var(--accent)' }}>{overall}%</span>
          <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Overall</span>
        </div>
      </div>

      {goals.map(g => (
        <div key={g.name} className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: g.color }} />
          <div className="flex-1">
            <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>
              {g.name} — {g.actual.toLocaleString()} / {g.goal.toLocaleString()}{g.unit}
            </div>
            <div className="h-1 rounded-sm overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-sm" style={{
                width: `${g.pct}%`, background: g.color,
                transition: 'width 1s cubic-bezier(.16,1,.3,1)'
              }} />
            </div>
          </div>
          <div className="text-[11px] font-syne font-bold" style={{ color: g.color }}>{g.pct}%</div>
        </div>
      ))}
    </div>
  );
}