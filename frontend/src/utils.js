export const ACTIVITY_TYPES = {
  work:       { emoji: '💼', color: '#5a9cf5', label: 'Work', desc: 'Track your work sessions' },
  workout:    { emoji: '🏋️', color: '#ff6b6b', label: 'Workout', desc: 'Gym, training, exercise' },
  sleep:      { emoji: '😴', color: '#b5a9f5', label: 'Sleep', desc: 'Track your sleep hours' },
  meditation: { emoji: '🧘', color: '#b5a9f5', label: 'Meditation', desc: 'Mindfulness & breathing' },
  walk:       { emoji: '🚶', color: '#c8f55a', label: 'Walk', desc: 'Walking & steps' },
  reading:    { emoji: '📚', color: '#f59e0b', label: 'Reading', desc: 'Books & articles' },
};

export function getTypeInfo(type) {
  return ACTIVITY_TYPES[type] || { emoji: '✨', color: '#6b6b80', label: type, desc: '' };
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

export function getFormattedToday() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

export function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}