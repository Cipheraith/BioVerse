import React, { useState, useEffect } from 'react';
import logo from '/bio.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, BarChart2, LogOut, Settings, Bell, Bot, HeartPulse, Menu, Video, X, Sparkles, Zap } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import LumaChatbot from './components/LumaChatbot';
import { motion, AnimatePresence } from 'framer-motion';

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
    { href: '/symptom-trends', icon: BarChart2, label: 'Symptom Trends' },
    { href: '/luma', icon: Bot, label: 'Luma Checker' },
    { href: '/srh', icon: HeartPulse, label: 'SRH Education' },
  ];

  return (
    <div className="flex min-h-screen bg-dark-background text-dark-text">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 bg-dark-card border-r border-dark-border flex flex-col shadow-lg rounded-r-xl
          transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0`}
      >
        <div className="h-20 flex items-center justify-center border-b border-dark-border">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="BioVerse Logo" className="h-24 w-24" />
            <span className="text-2xl font-bold tracking-wider text-primary-400">
              BIOVERSE
            </span>
          </div>
        </div>
        <nav className="mt-6 flex-1">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`flex items-center px-6 py-3 text-dark-text hover:bg-primary-900 transition-colors rounded-lg mx-3 my-1 ${
                    location.pathname.startsWith(item.href) ? 'bg-primary-800 text-white shadow-md' : ''
                  }`}
                  onClick={() => setIsSidebarOpen(false)} // Close sidebar on navigation
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-dark-border p-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-dark-text hover:bg-primary-900 transition-colors rounded-lg"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <header className="h-20 flex items-center justify-between px-4 md:px-8 border-b border-dark-border bg-dark-card shadow-md">
          <button
            className="text-dark-muted hover:text-primary-400 md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={24} />
          </button>
          <div>
            {/* Breadcrumbs or Page Title can go here */}
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
                className="text-dark-muted hover:text-primary-400 relative"
              >
                <Bell size={22} />
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
            <Link 
              to="/settings"
              className="text-dark-muted hover:text-primary-400"
            >
              <Settings size={22} />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                {/* User Initials */}
                A
              </div>
              <div className="hidden md:block"> {/* Hide on small screens */}
                <p className="font-semibold text-sm">Admin User</p>
                <p className="text-xs text-dark-muted">Administrator</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-dark-background p-4 md:p-8">
          {children}
        </main>
        <LumaChatbot />
      </div>
    </div>
  );
};

export default MainLayout;
