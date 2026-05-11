import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const JoinPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const token = searchParams.get('token');

  const [phase, setPhase] = useState('verifying'); // verifying | setup | success | error
  const [inviteData, setInviteData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({ name: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setPhase('error');
      setErrorMsg('No invite token found. Please check your email link.');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await axios.get(`/api/teams/verify-invite/${token}`);
        setInviteData(res.data);
        setPhase('setup');
      } catch (err) {
        setPhase('error');
        setErrorMsg(
          err.response?.data?.message || 'This invite link is invalid or has already been used.'
        );
      }
    };

    verifyToken();
  }, [token]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await axios.post('/api/teams/accept-invite', {
        token,
        name: form.name,
        password: form.password,
      });

      // Set authenticated user (server also sets httpOnly cookie)
      setUser(res.data.user);
      setPhase('success');

      // Redirect after 2.5s
      setTimeout(() => navigate('/student/dashboard'), 2500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Background grid */}
      <div style={styles.grid} />

      {/* Glow blobs */}
      <div style={{ ...styles.blob, top: '-10%', left: '-5%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />
      <div style={{ ...styles.blob, bottom: '-10%', right: '-5%', background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)' }} />

      <div style={styles.container}>

        {/* Logo */}
        <div style={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="13" stroke="#c9922a" strokeWidth="1.2" fill="rgba(20,12,5,0.6)" />
            <ellipse cx="16" cy="16" rx="13" ry="5" stroke="#c9922a" strokeWidth="0.8" fill="none" opacity="0.5" />
            <ellipse cx="16" cy="16" rx="6" ry="13" stroke="#c9922a" strokeWidth="0.8" fill="none" opacity="0.4" />
            <ellipse cx="16" cy="16" rx="18" ry="5" stroke="#e8a020" strokeWidth="1.5" fill="none" opacity="0.9" />
            <circle cx="29" cy="16.5" r="2.5" fill="#e8a020" opacity="0.95" />
          </svg>
          <span style={styles.logoText}>HackSphere</span>
        </div>

        {/* ── VERIFYING ── */}
        {phase === 'verifying' && (
          <div style={styles.card}>
            <div style={styles.spinnerWrap}>
              <div style={styles.spinner} />
            </div>
            <p style={styles.verifyText}>Verifying your invite...</p>
          </div>
        )}

        {/* ── ERROR ── */}
        {phase === 'error' && (
          <div style={styles.card}>
            <div style={styles.iconCircle('#f43f5e')}>✕</div>
            <h2 style={styles.cardTitle}>Invalid Invite</h2>
            <p style={styles.cardSubtitle}>{errorMsg}</p>
            <button style={styles.btnSecondary} onClick={() => navigate('/')}>
              Go to Homepage
            </button>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {phase === 'success' && (
          <div style={{ ...styles.card, ...styles.successCard }}>
            <div style={styles.iconCircle('#10b981')}>✓</div>
            <h2 style={styles.cardTitle}>You're In! 🎉</h2>
            <p style={styles.cardSubtitle}>
              Welcome to <strong style={{ color: '#fff' }}>{inviteData?.teamName}</strong>!
              <br />Redirecting you to your dashboard...
            </p>
            <div style={styles.progressBar}>
              <div style={styles.progressFill} />
            </div>
          </div>
        )}

        {/* ── SETUP FORM ── */}
        {phase === 'setup' && inviteData && (
          <div style={styles.card}>

            {/* Invite banner */}
            <div style={styles.inviteBanner}>
              <span style={styles.inviteTag}>🎯 Team Invitation</span>
              <h2 style={styles.inviteTitle}>
                Join <span style={{ color: '#e8a020' }}>{inviteData.teamName}</span>
              </h2>
              <p style={styles.inviteMeta}>
                Led by <strong style={{ color: '#e2eaf5' }}>{inviteData.leaderName}</strong>
                &nbsp;·&nbsp;
                {inviteData.memberCount}/{inviteData.maxMembers} members
              </p>
              <p style={styles.inviteEmail}>{inviteData.email}</p>
            </div>

            <div style={styles.divider}>
              <span style={styles.dividerText}>Set up your account to continue</span>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>

              {/* Name */}
              <div style={styles.field}>
                <label style={styles.label}>Your Full Name</label>
                <input
                  name="name"
                  type="text"
                  placeholder="e.g. Sana Farfan"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  onFocus={e => e.target.style.borderColor = '#e8a020'}
                  onBlur={e => e.target.style.borderColor = '#1e2f47'}
                />
              </div>

              {/* Email (readonly) */}
              <div style={styles.field}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  value={inviteData.email}
                  readOnly
                  style={{ ...styles.input, ...styles.inputReadonly }}
                />
              </div>

              {/* Password */}
              <div style={styles.field}>
                <label style={styles.label}>Create Password</label>
                <div style={styles.passwordWrap}>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    required
                    style={{ ...styles.input, paddingRight: '48px' }}
                    onFocus={e => e.target.style.borderColor = '#e8a020'}
                    onBlur={e => e.target.style.borderColor = '#1e2f47'}
                  />
                  <button
                    type="button"
                    style={styles.eyeBtn}
                    onClick={() => setShowPassword(v => !v)}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div style={styles.field}>
                <label style={styles.label}>Confirm Password</label>
                <input
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{
                    ...styles.input,
                    borderColor: form.confirmPassword && form.password !== form.confirmPassword
                      ? '#f43f5e' : '#1e2f47'
                  }}
                  onFocus={e => e.target.style.borderColor = '#e8a020'}
                  onBlur={e => e.target.style.borderColor = '#1e2f47'}
                />
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p style={styles.fieldError}>Passwords do not match</p>
                )}
              </div>

              {/* Error */}
              {errorMsg && (
                <div style={styles.errorBox}>
                  <span>⚠️</span> {errorMsg}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{ ...styles.btnPrimary, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={styles.btnSpinner} /> Joining team...
                  </span>
                ) : (
                  'Join Team & Create Account →'
                )}
              </button>
            </form>

            <p style={styles.footNote}>
              Already have an account?{' '}
              <span
                style={styles.link}
                onClick={() => navigate('/login')}
              >
                Log in instead
              </span>
            </p>
          </div>
        )}

        {/* Footer */}
        <p style={styles.footer}>HackSphere · Season 1 · Internal Hackathon Platform</p>
      </div>

      {/* Spinner animation */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fillProgress { from { width: 0% } to { width: 100% } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

// ── Styles ──
const styles = {
  page: {
    minHeight: '100vh',
    background: '#080c14',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 16px',
    position: 'relative',
    overflow: 'hidden',
  },
  grid: {
    position: 'fixed',
    inset: 0,
    backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },
  blob: {
    position: 'fixed',
    width: '600px',
    height: '600px',
    pointerEvents: 'none',
  },
  container: {
    width: '100%',
    maxWidth: '480px',
    position: 'relative',
    zIndex: 1,
    animation: 'fadeUp 0.6s ease both',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '32px',
  },
  logoText: {
    fontFamily: 'Georgia, serif',
    fontWeight: 700,
    fontSize: '20px',
    color: '#f5f0e8',
    letterSpacing: '-0.5px',
  },
  card: {
    background: '#0f1724',
    border: '1px solid #1e2f47',
    borderRadius: '20px',
    padding: '36px 32px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  successCard: {
    borderColor: 'rgba(16,185,129,0.3)',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 40px rgba(16,185,129,0.1)',
  },
  spinnerWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #1e2f47',
    borderTop: '3px solid #e8a020',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  btnSpinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  verifyText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontFamily: 'monospace',
    fontSize: '14px',
    letterSpacing: '0.05em',
  },
  iconCircle: (color) => ({
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: `${color}22`,
    border: `2px solid ${color}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    color: color,
    margin: '0 auto 20px',
    fontWeight: 700,
  }),
  cardTitle: {
    textAlign: 'center',
    color: '#fff',
    fontSize: '22px',
    fontWeight: 700,
    margin: '0 0 10px',
    fontFamily: 'Georgia, serif',
  },
  cardSubtitle: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
    lineHeight: 1.7,
    margin: '0 0 24px',
  },
  progressBar: {
    height: '3px',
    background: '#1e2f47',
    borderRadius: '999px',
    overflow: 'hidden',
    marginTop: '16px',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #10b981, #00d4ff)',
    borderRadius: '999px',
    animation: 'fillProgress 2.5s linear forwards',
  },
  inviteBanner: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  inviteTag: {
    display: 'inline-block',
    fontSize: '11px',
    fontFamily: 'monospace',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#e8a020',
    border: '1px solid rgba(232,160,32,0.3)',
    padding: '4px 12px',
    borderRadius: '999px',
    background: 'rgba(232,160,32,0.05)',
    marginBottom: '14px',
  },
  inviteTitle: {
    fontSize: '26px',
    fontWeight: 800,
    color: '#fff',
    fontFamily: 'Georgia, serif',
    margin: '0 0 8px',
    letterSpacing: '-0.5px',
  },
  inviteMeta: {
    fontSize: '13px',
    color: '#5a7394',
    margin: '0 0 8px',
    fontFamily: 'monospace',
  },
  inviteEmail: {
    fontSize: '12px',
    color: '#00d4ff',
    fontFamily: 'monospace',
    background: 'rgba(0,212,255,0.05)',
    border: '1px solid rgba(0,212,255,0.15)',
    padding: '4px 12px',
    borderRadius: '6px',
    display: 'inline-block',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  dividerText: {
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#5a7394',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
    flex: 1,
    textAlign: 'center',
    borderTop: '1px solid #1e2f47',
    paddingTop: '12px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '11px',
    fontFamily: 'monospace',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#5a7394',
  },
  input: {
    background: '#131d2e',
    border: '1px solid #1e2f47',
    borderRadius: '10px',
    padding: '12px 14px',
    color: '#e2eaf5',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  },
  inputReadonly: {
    color: '#5a7394',
    cursor: 'not-allowed',
    background: '#0c1520',
  },
  passwordWrap: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
  },
  fieldError: {
    fontSize: '11px',
    color: '#f43f5e',
    fontFamily: 'monospace',
    margin: '2px 0 0',
  },
  errorBox: {
    background: 'rgba(244,63,94,0.08)',
    border: '1px solid rgba(244,63,94,0.3)',
    borderRadius: '8px',
    padding: '12px 14px',
    fontSize: '13px',
    color: '#f87171',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #7c3aed, #00d4ff)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '14px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    width: '100%',
    letterSpacing: '0.02em',
    transition: 'opacity 0.2s',
    marginTop: '4px',
  },
  btnSecondary: {
    background: 'transparent',
    color: '#94a3b8',
    border: '1px solid #1e2f47',
    borderRadius: '10px',
    padding: '12px 24px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'block',
    margin: '0 auto',
    transition: 'border-color 0.2s',
  },
  footNote: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#5a7394',
    marginTop: '20px',
    fontFamily: 'monospace',
  },
  link: {
    color: '#e8a020',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  footer: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#2d3f57',
    marginTop: '24px',
    fontFamily: 'monospace',
    letterSpacing: '0.05em',
  },
};

export default JoinPage;