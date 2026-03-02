import { getTypeInfo, formatDate } from '../utils';

export default function ActivityBanner({ activity }) {
  const info = getTypeInfo(activity.type);

  return (
    <div className="flex items-center gap-4 rounded-[20px] p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[22px] shrink-0"
        style={{ background: `${info.color}15` }}>
        {info.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-syne font-bold text-sm">{info.label}</div>
        <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
          {formatDate(activity.date)} {activity.notes && `· ${activity.notes}`}
        </div>
      </div>
      <div className="text-right">
        <div className="font-syne text-base font-bold" style={{ color: info.color }}>
          {activity.duration} {activity.unit === 'hours' ? 'hr' : 'min'}
        </div>
      </div>
    </div>
  );
}