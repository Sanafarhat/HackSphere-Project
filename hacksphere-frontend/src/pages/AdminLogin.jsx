import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminQuickLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // Credentials should match backend .env ADMIN_EMAIL/ADMIN_PASSWORD for local testing
      await login('admin@hacksphere.local', 'Admin@1234');
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 glass rounded-2xl border border-dark-600">
        <h2 className="text-2xl font-bold text-white mb-4">Admin Quick Login</h2>
        <p className="text-gray-300 mb-6">Use the seeded admin account for local testing.</p>
        {error && <div className="bg-danger/20 border border-danger/50 text-danger rounded-lg p-3 mb-4">{error}</div>}
        <button
          onClick={handleAdminQuickLogin}
          disabled={loading}
          className="w-full btn-primary"
        >
          {loading ? 'Signing in...' : 'Sign in as Admin'}
        </button>
        <p className="text-gray-400 text-sm mt-4">This is only meant for local testing. Do not enable in production.</p>
      </div>
    </div>
  );
};

export default AdminLogin;
