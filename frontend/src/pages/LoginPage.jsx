import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // login | register | forgot
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const switchMode = (m) => { setMode(m); setError(''); setSuccess(''); };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (mode === 'forgot') {
      if (!email) { setError('Please enter your email'); return; }
      setLoading(true);
      try {
        const res = await api.post('/api/auth/forgot-password', { email });
        setSuccess(res.data.message);
      } catch (err) {
        setError(err.response?.data?.error || 'Something went wrong');
      } finally { setLoading(false); }
      return;
    }

    if (!email || !password || (mode === 'register' && !name)) {
      setError('Please fill in all fields'); return;
    }
    setLoading(true);
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const body = mode === 'register' ? { name, email, password } : { email, password };
      const res = await api.post(endpoint, body);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit(); };

  const titles = {
    login: 'Welcome Back',
    register: 'Create Account',
    forgot: 'Forgot Password',
  };
  const subtitles = {
    login: 'Sign in to your Pulse account',
    register: 'Start tracking your activities',
    forgot: 'Enter your email to receive a reset link',
  };

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
          {titles[mode]}
        </h1>
        <p className="text-center text-sm mb-8" style={{ color: 'var(--muted)' }}>
          {subtitles[mode]}
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
              {success}
            </div>
          )}

          {mode === 'register' && (
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

          {mode !== 'forgot' && (
            <div className="mb-2">
              <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--muted)' }}>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }} />
            </div>
          )}

          {mode === 'login' && (
            <div className="text-right mb-4">
              <span className="text-xs cursor-pointer" style={{ color: 'var(--accent3)' }}
                onClick={() => switchMode('forgot')}>
                Forgot password?
              </span>
            </div>
          )}

          {mode === 'forgot' && <div className="mb-2" />}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3.5 rounded-[14px] font-bold text-sm transition-all duration-200 disabled:opacity-50 mt-2"
            style={{ background: 'var(--accent)', color: '#0a0a0f', fontFamily: 'Syne, sans-serif' }}>
            {loading ? 'Please wait...' :
              mode === 'login' ? 'Sign In' :
              mode === 'register' ? 'Create Account' :
              'Send Reset Link'}
          </button>

          <div className="text-center mt-5 text-sm" style={{ color: 'var(--muted)' }}>
            {mode === 'login' && (
              <>Don't have an account? <span className="cursor-pointer font-medium" style={{ color: 'var(--accent)' }} onClick={() => switchMode('register')}>Sign Up</span></>
            )}
            {mode === 'register' && (
              <>Already have an account? <span className="cursor-pointer font-medium" style={{ color: 'var(--accent)' }} onClick={() => switchMode('login')}>Sign In</span></>
            )}
            {mode === 'forgot' && (
              <>Remember your password? <span className="cursor-pointer font-medium" style={{ color: 'var(--accent)' }} onClick={() => switchMode('login')}>Sign In</span></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}