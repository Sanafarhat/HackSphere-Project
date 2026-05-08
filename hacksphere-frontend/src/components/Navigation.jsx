import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, LogIn } from 'lucide-react';

export const Navigation = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-dark-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-primary-600 rounded-lg flex items-center justify-center font-display font-bold text-dark-900">
              H
            </div>
            <span className="text-2xl font-display font-bold gradient-text hidden sm:block">
              HackSphere
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/#features" className="nav-link">
              Features
            </Link>
            <Link to="/#journey" className="nav-link">
              Journey
            </Link>
            {!user && (
              <>
                <Link to="/register" className="nav-link">
                  Register
                </Link>
                <button
                  onClick={() => navigate('/login')}
                  className="btn-primary text-sm"
                >
                  Login
                </button>
              </>
            )}
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className="nav-link"
                >
                  Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="nav-link text-warning"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 nav-link hover:text-danger"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-dark-700 rounded-lg transition"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-dark-800 border-b border-dark-600 p-4 space-y-4">
            <Link
              to="/#features"
              className="nav-link block py-2"
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/#journey"
              className="nav-link block py-2"
              onClick={() => setIsOpen(false)}
            >
              Journey
            </Link>
            {!user && (
              <>
                <Link
                  to="/register"
                  className="nav-link block py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
                <button
                  onClick={() => {
                    navigate('/login');
                    setIsOpen(false);
                  }}
                  className="btn-primary w-full text-center"
                >
                  Login
                </button>
              </>
            )}
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className="nav-link block py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="nav-link block py-2 text-warning"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 py-2 nav-link hover:text-danger"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
