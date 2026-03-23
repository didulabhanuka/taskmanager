import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Re-uses the same authStyles from LoginPage — import or inline as needed
const authStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --bg: #0a0a0f;
    --surface: #111118;
    --surface-2: #18181f;
    --surface-3: #1e1e28;
    --border: rgba(255,255,255,0.06);
    --border-hover: rgba(255,255,255,0.12);
    --accent: #6c63ff;
    --accent-2: #a78bfa;
    --accent-glow: rgba(108,99,255,0.3);
    --accent-soft: rgba(108,99,255,0.1);
    --text-1: #f0f0f8;
    --text-2: #8888aa;
    --text-3: #44445a;
    --danger: #ff4d6d;
    --danger-soft: rgba(255,77,109,0.1);
    --success: #34d399;
    --success-soft: rgba(52,211,153,0.1);
  }

  .auth-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    background: var(--bg);
    font-family: 'Sora', sans-serif;
    color: var(--text-1);
    position: relative;
    overflow: hidden;
  }

  .auth-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
    z-index: 0;
  }

  .auth-root::after {
    content: '';
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -60%);
    width: 700px;
    height: 700px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(108,99,255,0.07) 0%, transparent 65%);
    pointer-events: none;
    z-index: 0;
  }

  .auth-card-wrap {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 420px;
    animation: authIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes authIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .auth-header {
    text-align: center;
    margin-bottom: 28px;
  }

  .auth-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    box-shadow: 0 0 28px var(--accent-glow);
    margin-bottom: 20px;
  }

  .auth-title {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.6px;
    color: var(--text-1);
    margin-bottom: 6px;
  }

  .auth-subtitle {
    font-size: 13px;
    color: var(--text-2);
  }

  .auth-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 32px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.4);
  }

  .auth-error {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 14px;
    margin-bottom: 20px;
    background: var(--danger-soft);
    border: 1px solid rgba(255,77,109,0.2);
    border-radius: 8px;
    font-size: 13px;
    color: #ff8099;
    animation: shake 0.35s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-4px); }
    40%       { transform: translateX(4px); }
    60%       { transform: translateX(-3px); }
    80%       { transform: translateX(3px); }
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .auth-field {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .auth-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.7px;
    color: var(--text-2);
  }

  .auth-input-wrap {
    position: relative;
  }

  .auth-input-icon {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-3);
    pointer-events: none;
    transition: color 0.2s;
  }

  .auth-input-wrap:focus-within .auth-input-icon {
    color: var(--accent-2);
  }

  .auth-input {
    font-family: 'Sora', sans-serif;
    width: 100%;
    padding: 11px 14px 11px 38px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 9px;
    color: var(--text-1);
    font-size: 14px;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }
  .auth-input::placeholder {
    color: var(--text-3);
    font-family: 'Sora', sans-serif;
  }
  .auth-input:focus {
    border-color: var(--accent);
    background: var(--surface-3);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  /* Password strength */
  .pw-strength {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 2px;
  }
  .pw-bars {
    display: flex;
    gap: 4px;
  }
  .pw-bar {
    flex: 1;
    height: 3px;
    border-radius: 2px;
    background: var(--surface-3);
    transition: background 0.3s ease;
  }
  .pw-bar.active-weak   { background: var(--danger); }
  .pw-bar.active-fair   { background: #f59e0b; }
  .pw-bar.active-strong { background: var(--success); }

  .pw-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text-3);
    transition: color 0.2s;
  }
  .pw-label.weak   { color: var(--danger); }
  .pw-label.fair   { color: #f59e0b; }
  .pw-label.strong { color: var(--success); }

  .auth-submit {
    font-family: 'Sora', sans-serif;
    width: 100%;
    padding: 12px;
    margin-top: 4px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    border: none;
    border-radius: 9px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 16px var(--accent-glow);
    position: relative;
    overflow: hidden;
  }
  .auth-submit::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0);
    transition: background 0.2s;
  }
  .auth-submit:hover:not(:disabled)::before { background: rgba(255,255,255,0.08); }
  .auth-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 24px var(--accent-glow);
  }
  .auth-submit:active:not(:disabled) { transform: translateY(0); }
  .auth-submit:disabled { opacity: 0.55; cursor: not-allowed; }

  .btn-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .btn-spinner {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Terms note */
  .auth-terms {
    font-size: 11px;
    color: var(--text-3);
    text-align: center;
    line-height: 1.6;
    margin-top: 2px;
  }
  .auth-terms a {
    color: var(--text-2);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .auth-footer {
    text-align: center;
    margin-top: 22px;
    font-size: 13px;
    color: var(--text-2);
  }

  .auth-link {
    font-weight: 600;
    color: var(--accent-2);
    text-decoration: none;
    transition: color 0.2s;
  }
  .auth-link:hover { color: var(--text-1); }

  .auth-brand {
    text-align: center;
    margin-top: 32px;
  }
  .auth-brand-name {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text-3);
    letter-spacing: 1px;
    text-transform: uppercase;
  }
`;

const getPasswordStrength = (pw) => {
  if (!pw) return null;
  if (pw.length < 6) return 'weak';
  if (pw.length < 10 || !/[0-9]/.test(pw)) return 'fair';
  return 'strong';
};

const strengthMeta = {
  weak:   { label: 'Too short', bars: 1 },
  fair:   { label: 'Fair',      bars: 2 },
  strong: { label: 'Strong',    bars: 3 },
};

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(form.password);
  const meta = strength ? strengthMeta[strength] : null;

  return (
    <>
      <style>{authStyles}</style>
      <div className="auth-root">
        <div className="auth-card-wrap">

          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="auth-title">Create an account</h1>
            <p className="auth-subtitle">Start managing your tasks today</p>
          </div>

          {/* Card */}
          <div className="auth-card">
            {error && (
              <div className="auth-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              {/* Name */}
              <div className="auth-field">
                <label className="auth-label">Full name</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    className="auth-input"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    autoComplete="name"
                    autoFocus
                  />
                </div>
              </div>

              {/* Email */}
              <div className="auth-field">
                <label className="auth-label">Email</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    className="auth-input"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-field">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </span>
                  <input
                    className="auth-input"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    required
                    autoComplete="new-password"
                  />
                </div>

                {/* Password strength meter */}
                {form.password && meta && (
                  <div className="pw-strength">
                    <div className="pw-bars">
                      {[1, 2, 3].map((n) => (
                        <div
                          key={n}
                          className={`pw-bar ${n <= meta.bars ? `active-${strength}` : ''}`}
                        />
                      ))}
                    </div>
                    <span className={`pw-label ${strength}`}>{meta.label}</span>
                  </div>
                )}
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                <span className="btn-inner">
                  {loading ? (
                    <>
                      <span className="btn-spinner" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create account
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </span>
              </button>

              <p className="auth-terms">
                By creating an account you agree to our{' '}
                <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
              </p>
            </form>
          </div>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>

          <div className="auth-brand">
            <span className="auth-brand-name">TaskManager</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;