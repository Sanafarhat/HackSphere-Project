import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navigation = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setIsOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el2 = document.getElementById(id);
        if (el2) el2.scrollIntoView({ behavior: 'smooth' });
      }, 350);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsOpen(false);
  };

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } }
  };

  return (
    <motion.nav 
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled ? 'bg-background/90 backdrop-blur-md border-b-2 border-foreground py-2' : 'bg-transparent py-6'
      }`}
    >
      <div className="container-custom">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group z-50">
            <div className="w-12 h-12 border-2 border-foreground bg-accent text-background flex items-center justify-center font-display font-black text-2xl group-hover:bg-foreground transition-colors duration-300">
              H
            </div>
            <span className="text-2xl font-display font-black tracking-tighter text-foreground uppercase hidden sm:block">
              HackSphere
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-10">
            <button onClick={() => scrollToSection('features')} className="nav-link">
              Features
            </button>
            <button onClick={() => scrollToSection('journey')} className="nav-link">
              Process
            </button>
            <Link to="/gallery" className="nav-link">Archive</Link>
            
            <div className="flex items-center space-x-4 pl-4 border-l-2 border-foreground/10">
              {!user ? (
                <>
                  <Link to="/login" className="nav-link">
                    Log In
                  </Link>
                  <Link to="/register" className="btn-primary px-6 py-2 text-sm border-2 border-foreground">
                    <span>Enter Arena &rarr;</span>
                  </Link>
                </>
              ) : (
                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                    className="w-10 h-10 rounded-full border-2 border-foreground bg-light-800 flex items-center justify-center hover:bg-accent hover:text-white transition-colors"
                  >
                    <User size={20} />
                  </button>
                  
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-4 w-48 bg-background border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(15,16,20,1)] rounded-lg overflow-hidden flex flex-col"
                      >
                        <Link to="/dashboard" className="px-4 py-3 hover:bg-light-800 font-bold font-display uppercase border-b-[1px] border-foreground/20 text-foreground transition-colors">
                          Dashboard
                        </Link>
                        {(user.role === 'platformAdmin' || user.role === 'admin') && (
                          <Link to="/admin" className="px-4 py-3 hover:bg-light-800 font-bold font-display uppercase border-b-[1px] border-foreground/20 text-accent transition-colors">
                            Admin
                          </Link>
                        )}
                        <button onClick={handleLogout} className="px-4 py-3 hover:bg-accent hover:text-white font-bold font-display uppercase text-left text-foreground transition-colors">
                          Log Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 z-50 text-foreground"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, clipPath: 'circle(0% at top right)' }}
              animate={{ opacity: 1, clipPath: 'circle(150% at top right)' }}
              exit={{ opacity: 0, clipPath: 'circle(0% at top right)' }}
              transition={{ type: 'spring', stiffness: 20, damping: 10 }}
              className="fixed inset-0 bg-foreground flex flex-col justify-center items-center h-screen z-40"
            >
              <div className="flex flex-col items-center space-y-8 text-background text-3xl font-display font-black uppercase">
                <button onClick={() => scrollToSection('features')} className="hover:text-accent transition-colors">Features</button>
                <button onClick={() => scrollToSection('journey')} className="hover:text-accent transition-colors">Process</button>
                <Link to="/gallery" onClick={() => setIsOpen(false)} className="hover:text-accent transition-colors">Archive</Link>
                
                <div className="h-px w-32 bg-background/20 my-8"></div>
                
                {!user ? (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)} className="hover:text-accent transition-colors">Log In</Link>
                    <Link to="/register" onClick={() => setIsOpen(false)} className="text-accent hover:text-background transition-colors">Register</Link>
                  </>
                ) : (
                  <>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)} className="hover:text-accent transition-colors">Dashboard</Link>
                    {(user.role === 'platformAdmin' || user.role === 'admin') && (
                      <Link to="/admin" onClick={() => setIsOpen(false)} className="hover:text-accent transition-colors">Admin</Link>
                    )}
                    <button onClick={handleLogout} className="hover:text-accent transition-colors">Log Out</button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navigation;
