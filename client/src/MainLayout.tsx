import React, { useState, useEffect } from 'react';
import logo from '/bio.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, BarChart2, LogOut, Settings, Bell, Bot, HeartPulse, Menu, Video } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import LumaChatbot from './components/LumaChatbot';
import { motion } from 'framer-motion';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/patients', icon: Users, label: 'Patients' },
    { href: '/appointments', icon: Calendar, label: 'Appointments' },
    { href: '/telemedicine', icon: Video, label: 'Telemedicine' },
    { href: '/symptom-trends', icon: BarChart2, label: 'Analytics' },
    { href: '/luma', icon: Bot, label: 'AI Assistant' },
    { href: '/srh', icon: HeartPulse, label: 'SRH Education' },
  ];

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* 🎆 NETFLIX-LEVEL ANIMATED BACKGROUND */}
      <div className="fixed inset-0 z-0">
        {/* Pure black base like Netflix */}
        <div className="absolute inset-0 bg-black"></div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/30 via-black to-gray-900/20"></div>
        
        {/* Interactive glow effect */}
        <div 
          className="absolute inset-0 opacity-20 transition-all duration-1000 ease-out"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.15), rgba(168, 85, 247, 0.1), transparent 70%)`
          }}
        ></div>
        
        {/* Premium floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full animate-float opacity-40 ${
                i % 3 === 0 ? 'w-1 h-1 bg-primary-400/30' :
                i % 3 === 1 ? 'w-0.5 h-0.5 bg-accent-400/40' :
                'w-2 h-2 bg-secondary-400/20'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${6 + Math.random() * 8}s`
              }}
            />
          ))}
        </div>
        
        {/* Subtle noise texture for premium feel */}
        <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay"></div>
      </div>

      {/* 🔥 PREMIUM NETFLIX-STYLE SIDEBAR */}
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ 
          x: isSidebarOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth >= 768 ? 0 : -300),
          opacity: 1
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-50 w-80 flex-shrink-0 bg-gray-900 border-r border-gray-700/50 flex flex-col shadow-2xl md:relative md:translate-x-0 backdrop-blur-2xl"
        style={{
          background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.98) 0%, rgba(0, 0, 0, 0.98) 100%)'
        }}
      >
        {/* 💎 PREMIUM LOGO SECTION */}
        <div className="h-28 flex items-center justify-center border-b border-gray-700/40 relative overflow-hidden">
          {/* Gradient background for logo area */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10"></div>
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="relative">
              <img src={logo} alt="BioVerse Logo" className="h-16 w-16 drop-shadow-2xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400/30 to-secondary-400/30 rounded-full blur-xl animate-pulse-glow"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-wider bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
                BIOVERSE
              </span>
              <span className="text-xs text-dark-muted font-medium tracking-wide">
                Digital Health Twin
              </span>
            </div>
          </motion.div>
        </div>

        {/* 🎆 PREMIUM NETFLIX-STYLE NAVIGATION */}
        <nav className="mt-8 flex-1 px-6">
          <ul className="space-y-1">
            {navItems.map((item, index) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <motion.li 
                  key={item.href}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Link
                    to={item.href}
                    className={`group flex items-center px-5 py-4 transition-all duration-300 rounded-2xl relative overflow-hidden ${
                      isActive 
                        ? 'text-white bg-gradient-to-r from-primary-500/20 to-accent-500/20 shadow-xl border border-primary-400/30 backdrop-blur-sm' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50 hover:shadow-lg'
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    {/* ⚡ ACTIVE STATE GLOW */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavGlow"
                        className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-2xl"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    
                    {/* LEFT BORDER INDICATOR */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-primary-400 to-accent-400 rounded-r-full"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    
                    {/* 🔥 PREMIUM ICON CONTAINER */}
                    <div className={`relative mr-5 p-2.5 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-primary-500/20 text-primary-300 shadow-lg scale-110' 
                        : 'group-hover:bg-gray-700/50 group-hover:text-primary-400 group-hover:scale-105'
                    }`}>
                      <item.icon className="w-5 h-5" />
                      
                      {/* Active glow effect */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-primary-400/30 rounded-xl blur-md"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      )}
                    </div>
                    
                    {/* 📝 TEXT LABEL */}
                    <span className={`font-medium tracking-wide transition-all duration-300 ${
                      isActive ? 'text-white font-semibold' : 'group-hover:text-white'
                    }`}>
                      {item.label}
                    </span>
                    
                    {/* ✨ HOVER SHIMMER EFFECT */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        {/* Enhanced Logout Section */}
        <div className="border-t border-primary-500/30 p-4 bg-gradient-to-r from-red-900/20 to-red-800/20">
          <motion.button
            onClick={handleLogout}
            className="group flex items-center w-full px-4 py-3 text-dark-text hover:text-red-400 transition-all duration-300 rounded-xl hover:bg-red-900/30 border border-transparent hover:border-red-500/40"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative mr-4 p-2 rounded-lg transition-all duration-300 group-hover:bg-red-500/20">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-medium tracking-wide">Logout</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* 🎆 PREMIUM NETFLIX-STYLE HEADER */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="h-20 flex items-center justify-between px-8 border-b border-gray-800/60 backdrop-blur-2xl shadow-2xl"
          style={{
            background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.95) 0%, rgba(17, 24, 39, 0.95) 100%)'
          }}
        >
          <div className="flex items-center space-x-4">
            <motion.button
              className="text-dark-muted hover:text-primary-400 md:hidden p-2 rounded-lg hover:bg-primary-500/10 transition-all duration-300"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Menu size={24} />
            </motion.button>
            
            {/* Page Title */}
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                {navItems.find(item => location.pathname.startsWith(item.href))?.label || 'BioVerse'}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4 md:space-x-6">
            {/* Notifications */}
            <div className="relative">
              <motion.button 
                onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
                className="text-dark-muted hover:text-primary-400 relative p-2 rounded-lg hover:bg-primary-500/10 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Bell size={22} />
                <motion.span 
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  3
                </motion.span>
              </motion.button>
            </div>

            {/* Settings */}
            <Link 
              to="/settings"
              className="text-dark-muted hover:text-primary-400 p-2 rounded-lg hover:bg-primary-500/10 transition-all duration-300"
            >
              <Settings size={22} />
            </Link>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <motion.div 
                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold shadow-lg"
                whileHover={{ scale: 1.1 }}
              >
                A
              </motion.div>
              <div className="hidden md:block">
                <p className="font-semibold text-sm text-dark-text">Admin User</p>
                <p className="text-xs text-dark-muted">Administrator</p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* 🎆 MAIN CONTENT AREA - NETFLIX STYLE */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-black/95">
          <div className="p-6 md:p-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </div>
        </main>

        {/* Enhanced Chatbot */}
        <LumaChatbot />
      </div>
    </div>
  );
};

export default MainLayout;