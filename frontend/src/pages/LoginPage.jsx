import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError('');
    if (!email || !password || (isRegister && !name)) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister ? { name, email, password } : { email, password };
      const res = await api.post(endpoint, body);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative z-[1]" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm" style={{ animation: 'fadeUp 0.6s ease both' }}>

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--accent)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="2.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
        </div>

        <h1 className="text-center text-2xl font-extrabold mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-center text-sm mb-8" style={{ color: 'var(--muted)' }}>
          {isRegister ? 'Start tracking your activities' : 'Sign in to your Pulse account'}
        </p>

        {/* Form Card */}
        <div className="rounded-[20px] p-7" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,107,107,0.1)', color: 'var(--accent2)', border: '1px solid rgba(255,107,107,0.2)' }}>
              {error}
            </div>
          )}

          {isRegister && (
            <div className="mb-4">
              <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--muted)' }}>Name</label>
              <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }} />
            </div>
          )}

          <div className="mb-4">
            <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--muted)' }}>Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }} />
          </div>

          <div className="mb-6">
            <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--muted)' }}>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }} />
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3.5 rounded-[14px] font-bold text-sm transition-all duration-200 disabled:opacity-50"
            style={{ background: 'var(--accent)', color: '#0a0a0f', fontFamily: 'Syne, sans-serif' }}
            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = ''; }}>
            {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>

          <div className="text-center mt-5 text-sm" style={{ color: 'var(--muted)' }}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <span className="cursor-pointer font-medium" style={{ color: 'var(--accent)' }}
              onClick={() => { setIsRegister(!isRegister); setError(''); }}>
              {isRegister ? 'Sign In' : 'Sign Up'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}