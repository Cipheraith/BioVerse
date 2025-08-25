import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Users, Calendar, Activity, Bot, Settings, 
  Bell, Search, Menu, X, ChevronDown, LogOut,
  Heart, Shield, Zap, Video
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface NavigationItem {
  href: string;
  icon: React.ComponentType<any>;
  label: string;
  badge?: number;
  description?: string;
}

const ModernNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState(3); // Mock notification count

  const navigationItems: NavigationItem[] = [
    { 
      href: '/dashboard', 
      icon: Home, 
      label: 'Dashboard',
      description: 'Overview and insights'
    },
    { 
      href: '/patients', 
      icon: Users, 
      label: 'Patients',
      description: 'Manage patient records'
    },
    { 
      href: '/appointments', 
      icon: Calendar, 
      label: 'Appointments',
      badge: 2,
      description: 'Schedule and manage appointments'
    },
    { 
      href: '/telemedicine', 
      icon: Video, 
      label: 'Telemedicine',
      description: 'Virtual consultations'
    },
    { 
      href: '/analytics', 
      icon: Activity, 
      label: 'Analytics',
      description: 'Health trends and insights'
    },
    { 
      href: '/ai-assistant', 
      icon: Bot, 
      label: 'AI Assistant',
      description: 'Health recommendations'
    }
  ];

  const quickActions = [
    { icon: Heart, label: 'Health Check', action: () => navigate('/health-check') },
    { icon: Shield, label: 'Emergency', action: () => navigate('/emergency') },
    { icon: Zap, label: 'Quick Scan', action: () => navigate('/scan') }
  ];

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-50 bg-dark-card/80 backdrop-blur-xl border-b border-primary-500/20 h-16">
        <div className="flex items-center justify-between w-full px-6">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="relative">
              <img src="/bio.png" alt="BioVerse" className="h-10 w-10 transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              BioVerse
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-muted" />
              <input
                type="text"
                placeholder="Search patients, appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-background/50 border border-primary-500/20 rounded-xl text-dark-text placeholder-dark-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                aria-label="Search"
              />
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
            {navigationItems.slice(0, 4).map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-gradient-to-r from-primary-600/20 to-secondary-600/20 text-primary-300' 
                      : 'text-dark-muted hover:text-primary-400 hover:bg-primary-500/10'
                  }`}
                  aria-label={item.description}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-xl border border-primary-500/30"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  onClick={action.action}
                  className="p-2 text-dark-muted hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={action.label}
                >
                  <action.icon className="w-5 h-5" />
                </motion.button>
              ))}
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-dark-muted hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all duration-200">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                >
                  {notifications}
                </motion.span>
              )}
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-3 p-2 hover:bg-primary-500/10 rounded-xl transition-all duration-200"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <ChevronDown className={`w-4 h-4 text-dark-muted transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 bg-dark-card border border-primary-500/20 rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-4 border-b border-primary-500/20">
                      <p className="font-semibold text-dark-text">{user?.name || 'User'}</p>
                      <p className="text-sm text-dark-muted">{user?.email}</p>
                    </div>
                    
                    <div className="py-2">
                      <Link
                        to="/settings"
                        className="flex items-center space-x-3 px-4 py-3 text-dark-text hover:bg-primary-500/10 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-dark-card/80 backdrop-blur-xl border-b border-primary-500/20 h-16">
        <div className="flex items-center justify-between px-4 h-full">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <img src="/bio.png" alt="BioVerse" className="h-8 w-8" />
            <span className="text-lg font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              BioVerse
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-dark-muted">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-dark-muted hover:text-primary-400"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-dark-card border-t border-primary-500/20"
            >
              <div className="p-4 space-y-2">
                {navigationItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-primary-600/20 to-secondary-600/20 text-primary-300' 
                          : 'text-dark-text hover:bg-primary-500/10'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        {item.description && (
                          <div className="text-xs text-dark-muted">{item.description}</div>
                        )}
                      </div>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
                
                <div className="border-t border-primary-500/20 pt-4 mt-4">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-16"></div>
    </>
  );
};

export default ModernNavigation;