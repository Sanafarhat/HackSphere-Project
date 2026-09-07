import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@hacksphere.dev');
  const [password, setPassword] = useState('Admin@1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async (loginEmail = email, loginPassword = password) => {
    setLoading(true);
    setError('');
    try {
      await login(loginEmail, loginPassword);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
        <div className="editorial-card">
          <p className="text-sm uppercase tracking-[0.3em] text-accent font-bold mb-3">Admin Access</p>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-foreground uppercase mb-4">Admin control center sign-in</h1>
          <p className="text-mutedForeground font-semibold mb-8 max-w-2xl">
            Sign in with your admin credentials. Default seeded account: <code className="text-accent font-bold">admin@hacksphere.dev</code>
          </p>

          {error && (
            <div className="bg-danger/20 border border-danger/50 text-danger rounded-xl p-4 mb-6">
              {error}
            </div>
          )}

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleAdminLogin();
            }}
          >
            <div>
              <label className="block text-sm font-bold text-foreground uppercase tracking-wider mb-2">Admin email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@hacksphere.dev"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button type="submit" disabled={loading} className="btn-admin-login flex-1">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/80 shadow-[0_0_18px_rgba(255,255,255,0.6)]" />
                  {loading ? 'Signing in...' : 'Enter Admin Dashboard'}
                </span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleAdminLogin('admin@hacksphere.dev', 'Admin@1234')}
                className="btn-admin-quick"
              >
                Quick login
              </button>
            </div>
          </form>
        </div>

        <div className="editorial-card border-none bg-light-800">
          <h2 className="text-xl font-black font-display uppercase text-foreground mb-4">Direct paths</h2>
          <div className="space-y-4 text-mutedForeground">
            <div className="border-2 border-foreground bg-white p-4">
              <p className="text-sm font-bold uppercase tracking-wider text-mutedForeground mb-2">Login page</p>
              <p className="font-black text-foreground mb-2">/admin-login</p>
              <p className="text-sm font-semibold">Open this page to sign in as an admin.</p>
            </div>
            <div className="border-2 border-foreground bg-white p-4">
              <p className="text-sm font-bold uppercase tracking-wider text-mutedForeground mb-2">Dashboard</p>
              <p className="font-black text-foreground mb-2">/admin</p>
              <p className="text-sm font-semibold">Available after an admin session is established.</p>
            </div>
            <div className="border-2 border-foreground bg-white p-4">
              <p className="text-sm font-bold uppercase tracking-wider text-mutedForeground mb-2">Note</p>
              <p className="text-sm font-semibold">
                This flow is intended for local development and seeded admin credentials only.
              </p>
            </div>
          </div>
          <div className="mt-8">
            <Link to="/" className="text-sm text-accent hover:text-accent-hover font-black uppercase tracking-wider">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
