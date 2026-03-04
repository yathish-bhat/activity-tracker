import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center px-5 relative z-[1]" style={{ background: 'var(--bg)' }}>
        <div className="text-center" style={{ animation: 'fadeUp 0.6s ease both' }}>
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Invalid Reset Link</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>This link is missing or invalid.</p>
          <button onClick={() => navigate('/login')}
            className="px-6 py-3 rounded-[14px] font-bold text-sm"
            style={{ background: 'var(--accent)', color: '#0a0a0f', fontFamily: 'Syne, sans-serif' }}>
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    setError(''); setSuccess('');
    if (!password || !confirm) { setError('Please fill in both fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/reset-password', { token, password });
      setSuccess(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center px-5 relative z-[1]" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm" style={{ animation: 'fadeUp 0.6s ease both' }}>
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="2.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
        </div>
        <h1 className="text-center text-2xl font-extrabold mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
          Set New Password
        </h1>
        <p className="text-center text-sm mb-8" style={{ color: 'var(--muted)' }}>
          Enter your new password below
        </p>
        <div className="rounded-[20px] p-6 sm:p-7" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(255,107,107,0.1)', color: 'var(--accent2)', border: '1px solid rgba(255,107,107,0.2)' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(200,245,90,0.1)', color: 'var(--accent)', border: '1px solid rgba(200,245,90,0.2)' }}>
              {success} Redirecting...
            </div>
          )}

          <div className="mb-4">
            <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--muted)' }}>New Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }} />
          </div>

          <div className="mb-6">
            <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--muted)' }}>Confirm Password</label>
            <input type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }} />
          </div>

          <button onClick={handleSubmit} disabled={loading || !!success}
            className="w-full py-3.5 rounded-[14px] font-bold text-sm transition-all duration-200 disabled:opacity-50"
            style={{ background: 'var(--accent)', color: '#0a0a0f', fontFamily: 'Syne, sans-serif' }}>
            {loading ? 'Please wait...' : 'Reset Password'}
          </button>

          <div className="text-center mt-5 text-sm" style={{ color: 'var(--muted)' }}>
            <span className="cursor-pointer font-medium" style={{ color: 'var(--accent)' }}
              onClick={() => navigate('/login')}>
              Back to Sign In
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}