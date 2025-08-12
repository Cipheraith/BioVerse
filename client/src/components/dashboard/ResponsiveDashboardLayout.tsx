import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  Calendar, 
  Heart, 
  User, 
  Settings, 
  Bell,
  Search,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import GlassButton from '../ui/GlassButton';
import GlassCard from '../ui/GlassCard';

interface ResponsiveDashboardLayoutProps {
  children: React.ReactNode;
  userRole: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: number;
}

const ResponsiveDashboardLayout: React.FC<ResponsiveDashboardLayoutProps> = ({ 
  children, 
  userRole 
}) => {
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      
      // Auto-close sidebar on mobile when screen size changes
      if (width >= 768) {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const sidebar = document.getElementById('mobile-sidebar');
        const menuButton = document.getElementById('menu-button');
        
        if (sidebar && !sidebar.contains(event.target as Node) && 
            menuButton && !menuButton.contains(event.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  const getNavigationItems = (): NavigationItem[] => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
      { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/appointments', badge: 3 },
      { id: 'health-twin', label: 'Health Twin', icon: Heart, path: '/health-twin' },
      { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
      { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    ];

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Mobile Header */}
      {isMobile && (
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-xl border-b border-white/10"
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <GlassButton
                id="menu-button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2"
                variant="ghost"
              >
                <Menu className="w-6 h-6" />
              </GlassButton>
              
              <div>
                <h1 className="text-lg font-bold text-white">BioVerse</h1>
                <p className="text-xs text-gray-300 capitalize">
                  {userRole.replace('_', ' ')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <GlassButton
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2"
                variant="ghost"
              >
                <Search className="w-5 h-5" />
              </GlassButton>
              
              <GlassButton className="p-2 relative" variant="ghost">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  3
                </span>
              </GlassButton>

              <GlassButton
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-2"
                variant="ghost"
              >
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </span>
                </div>
              </GlassButton>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-white/10 p-4"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile User Menu */}
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-white/10 p-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{user?.fullName || user?.username}</p>
                      <p className="text-gray-400 text-sm">{user?.email}</p>
                    </div>
                  </div>
                  
                  <GlassButton
                    onClick={logout}
                    className="w-full justify-start p-3"
                    variant="danger"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </GlassButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-xl border-b border-white/10"
        >
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-white">BioVerse</h1>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-80 pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <GlassButton className="p-2 relative" variant="ghost">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  3
                </span>
              </GlassButton>

              <div className="relative">
                <GlassButton
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-3"
                  variant="ghost"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-white font-medium">{user?.fullName || user?.username}</span>
                  <ChevronDown className="w-4 h-4" />
                </GlassButton>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-64 z-50"
                    >
                      <GlassCard className="p-4" variant="ghost">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-white">
                                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{user?.fullName || user?.username}</p>
                              <p className="text-gray-400 text-sm">{user?.email}</p>
                            </div>
                          </div>
                          
                          <div className="border-t border-white/10 pt-3">
                            <GlassButton
                              onClick={logout}
                              className="w-full justify-start p-3"
                              variant="danger"
                            >
                              <LogOut className="w-4 h-4 mr-3" />
                              Sign Out
                            </GlassButton>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.header>
      )}

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-45"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || !isMobile) && (
          <motion.aside
            id="mobile-sidebar"
            variants={isMobile ? sidebarVariants : undefined}
            initial={isMobile ? "closed" : undefined}
            animate={isMobile ? "open" : undefined}
            exit={isMobile ? "closed" : undefined}
            className={`
              fixed left-0 z-50 h-full bg-black/20 backdrop-blur-xl border-r border-white/10
              ${isMobile ? 'top-0 w-80' : 'top-20 w-64'}
            `}
          >
            <div className="flex flex-col h-full">
              {/* Mobile Sidebar Header */}
              {isMobile && (
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <h2 className="text-xl font-bold text-white">Menu</h2>
                  <GlassButton
                    onClick={() => setSidebarOpen(false)}
                    className="p-2"
                    variant="ghost"
                  >
                    <X className="w-5 h-5" />
                  </GlassButton>
                </div>
              )}

              {/* Navigation */}
              <nav className="flex-1 p-4">
                <div className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <GlassButton
                          className="w-full justify-start p-3 relative"
                          variant="ghost"
                        >
                          <Icon className="w-5 h-5 mr-3" />
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {item.badge}
                            </span>
                          )}
                        </GlassButton>
                      </motion.div>
                    );
                  })}
                </div>
              </nav>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-white/10">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">BioVerse v2.0</p>
                  <p className="text-gray-500 text-xs">AI-Powered Healthcare</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className={`
          transition-all duration-300
          ${isMobile ? 'pt-20' : !isMobile ? 'pt-20 pl-64' : 'pt-20'}
        `}
      >
        <div className="responsive-container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ResponsiveDashboardLayout;