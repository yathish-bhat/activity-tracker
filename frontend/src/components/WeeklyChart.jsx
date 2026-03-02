import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../api';

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDates() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const mon = new Date(now);
  mon.setDate(now.getDate() - diff);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

const tabs = ['Steps', 'Calories', 'Distance'];
const typeMap = { Steps: 'walk', Calories: 'workout', Distance: 'walk' };

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-1.5 rounded-lg text-xs font-medium"
      style={{ background: 'var(--text)', color: 'var(--bg)' }}>
      {payload[0].value} min
    </div>
  );
};

export default function WeeklyChart({ refreshKey }) {
  const [activeTab, setActiveTab] = useState('Steps');
  const [data, setData] = useState([]);
  const todayStr = new Date().toISOString().split('T')[0];
  const weekDates = getWeekDates();

  useEffect(() => {
    api.get('/api/activities/weekly').then(res => {
      const raw = res.data;
      const chartData = weekDates.map((date, i) => {
        const dayActivities = raw.filter(r => r.date === date);
        const total = dayActivities.reduce((sum, a) => sum + a.total_duration, 0);
        return { name: dayLabels[i], value: total, date, isToday: date === todayStr, isFuture: date > todayStr };
      });
      setData(chartData);
    }).catch(() => {
      setData(weekDates.map((date, i) => ({
        name: dayLabels[i], value: 0, date, isToday: date === todayStr, isFuture: date > todayStr
      })));
    });
  }, [refreshKey]);

  return (
    <div className="rounded-[20px] p-6 mb-6"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', animation: 'fadeUp 0.6s 0.2s ease both' }}>
      <div className="flex items-center justify-between font-syne text-[15px] font-bold mb-6">
        Weekly Activity
        <div className="flex gap-1">
          {tabs.map(t => (
            <div key={t} className="px-3.5 py-1.5 rounded-full text-xs cursor-pointer transition-all duration-200"
              style={{
                background: activeTab === t ? 'rgba(200,245,90,0.12)' : 'transparent',
                color: activeTab === t ? 'var(--accent)' : 'var(--muted)',
              }}
              onClick={() => setActiveTab(t)}>
              {t}
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} barCategoryGap="20%">
          <XAxis dataKey="name" axisLine={false} tickLine={false}
            tick={({ x, y, payload }) => {
              const item = data.find(d => d.name === payload.value);
              return (
                <text x={x} y={y + 12} textAnchor="middle" fontSize={10}
                  fontFamily="Syne" fontWeight={item?.isToday ? 700 : 400}
                  fill={item?.isToday ? '#c8f55a' : '#6b6b80'}>
                  {payload.value}
                </text>
              );
            }} />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
            {data.map((entry, i) => (
              <Cell key={i}
                fill={entry.isFuture ? 'rgba(255,255,255,0.03)'
                  : entry.isToday ? '#c8f55a'
                  : 'url(#barGrad)'}
                style={entry.isToday ? { filter: 'drop-shadow(0 0 16px rgba(200,245,90,0.4))' } : {}}
              />
            ))}
          </Bar>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c8f55a" />
              <stop offset="100%" stopColor="rgba(200,245,90,0.3)" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}