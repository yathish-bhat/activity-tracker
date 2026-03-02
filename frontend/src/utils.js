export const ACTIVITY_TYPES = {
  work:       { emoji: '💼', color: '#5a9cf5', label: 'Work' },
  workout:    { emoji: '🏋️', color: '#ff6b6b', label: 'Workout' },
  water:      { emoji: '💧', color: '#5a9cf5', label: 'Water' },
  sleep:      { emoji: '😴', color: '#b5a9f5', label: 'Sleep' },
  meditation: { emoji: '🧘', color: '#b5a9f5', label: 'Meditation' },
  walk:       { emoji: '🚶', color: '#c8f55a', label: 'Walk' },
  care:       { emoji: '🌿', color: '#10b981', label: 'Care' },
  reading:    { emoji: '📚', color: '#f59e0b', label: 'Reading' },
  custom:     { emoji: '✨', color: '#6b6b80', label: 'Custom' },
};

export function getTypeInfo(type) {
  return ACTIVITY_TYPES[type] || ACTIVITY_TYPES.custom;
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

export function getDayOfWeek() {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return days[new Date().getDay()];
}

export function getFormattedToday() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}