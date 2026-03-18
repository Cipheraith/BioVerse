import React, { useMemo, useState } from 'react';
import logo from '/bio.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, Building2, BarChart3, Database, MapPin, LogOut, Settings, Bell, Menu, AlertTriangle, Truck, ChevronsLeft, ChevronsRight, Activity, ClipboardList, Shield } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { motion } from 'framer-motion';

interface NavItem {
  href: string;
  icon: React.FC<any>;
  label: string;
}

function getNavItemsForRole(role: string | null): NavItem[] {
  const common: NavItem[] = [
    { href: '/dashboard', icon: Home, label: 'Overview' },
  ];

  switch (role) {
    case 'admin':
      return [
        ...common,
        { href: '/moh-dashboard', icon: Shield, label: 'National Dashboard' },
        { href: '/district-dashboard', icon: Activity, label: 'District Dashboard' },
        { href: '/coordination', icon: Package, label: 'Coordination' },
        { href: '/facilities', icon: Building2, label: 'Facilities' },
        { href: '/stock', icon: BarChart3, label: 'Stock Overview' },
        { href: '/dhis2', icon: Database, label: 'DHIS2 Sync' },
        { href: '/map', icon: MapPin, label: 'Facility Map' },
        { href: '/alerts', icon: AlertTriangle, label: 'Outbreak Alerts' },
        { href: '/logistics', icon: Truck, label: 'Emergency Logistics' },
      ];
    case 'moh':
      return [
        ...common,
        { href: '/moh-dashboard', icon: Shield, label: 'National Dashboard' },
        { href: '/district-dashboard', icon: Activity, label: 'District Dashboard' },
        { href: '/facilities', icon: Building2, label: 'Facilities' },
        { href: '/stock', icon: BarChart3, label: 'Stock Overview' },
        { href: '/dhis2', icon: Database, label: 'DHIS2 Sync' },
        { href: '/map', icon: MapPin, label: 'Facility Map' },
        { href: '/alerts', icon: AlertTriangle, label: 'Outbreak Alerts' },
      ];
    case 'facility_manager':
      return [
        ...common,
        { href: '/facility-dashboard', icon: Building2, label: 'My Facility' },
        { href: '/district-dashboard', icon: Activity, label: 'District Dashboard' },
        { href: '/stock', icon: BarChart3, label: 'Stock Overview' },
        { href: '/map', icon: MapPin, label: 'Facility Map' },
        { href: '/logistics', icon: Truck, label: 'Emergency Logistics' },
      ];
    case 'health_worker':
      return [
        ...common,
        { href: '/hw-dashboard', icon: ClipboardList, label: 'Health Worker Portal' },
        { href: '/facility-dashboard', icon: Building2, label: 'Facility View' },
        { href: '/stock', icon: BarChart3, label: 'Stock Overview' },
        { href: '/map', icon: MapPin, label: 'Facility Map' },
      ];
    case 'logistics_coordinator':
      return [
        ...common,
        { href: '/logistics', icon: Truck, label: 'Emergency Logistics' },
        { href: '/coordination', icon: Package, label: 'Coordination' },
        { href: '/district-dashboard', icon: Activity, label: 'District Dashboard' },
        { href: '/stock', icon: BarChart3, label: 'Stock Overview' },
        { href: '/map', icon: MapPin, label: 'Facility Map' },
      ];
    case 'dhis2_admin':
      return [
        ...common,
        { href: '/dhis2', icon: Database, label: 'DHIS2 Sync' },
        { href: '/facilities', icon: Building2, label: 'Facilities' },
        { href: '/stock', icon: BarChart3, label: 'Stock Overview' },
        { href: '/map', icon: MapPin, label: 'Facility Map' },
      ];
    default:
      return common;
  }
}

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, role, userId } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = useMemo(() => getNavItemsForRole(role), [role]);

  const userInitial = (userId || 'U').charAt(0).toUpperCase();
  const userName = userId || 'User';
  const userRole = role || '';

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isSidebarOpen ? 256 : (typeof window !== 'undefined' && window.innerWidth >= 768 ? (isCollapsed ? 72 : 256) : 0),
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-50 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm md:relative overflow-hidden"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-gray-200 dark:border-gray-700 min-w-0">
          <Link to="/" className="flex items-center space-x-3 overflow-hidden">
            <img src={logo} alt="BioVerse" className="h-9 w-9 flex-shrink-0" />
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hidden md:block">
                <span className="text-lg font-bold text-gray-900 dark:text-white block leading-tight whitespace-nowrap">BioVerse</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase leading-none whitespace-nowrap">Health System Coordinator</span>
              </motion.div>
            )}
            {/* Always show text on mobile overlay */}
            <div className="md:hidden">
              <span className="text-lg font-bold text-gray-900 dark:text-white block leading-tight whitespace-nowrap">BioVerse</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase leading-none whitespace-nowrap">Health System Coordinator</span>
            </div>
          </Link>
        </div>

        {/* Collapse Toggle — desktop only */}
        <div className="hidden md:flex justify-end px-3 pt-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-2 flex-1 px-3 overflow-y-auto">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Main Menu</p>
          )}
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-lg transition-all duration-150 text-sm font-medium ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <item.icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                    {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                    {!isCollapsed && isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User + Logout */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          {!isCollapsed ? (
            <>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {userInitial}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole.replace('_', ' ')}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3" />
                <span className="font-medium">Sign Out</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
                {userInitial}
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 w-full min-w-0">
        {/* Header */}
        <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-6 shadow-sm z-20">
          <div className="flex items-center">
            <button
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white md:hidden mr-4"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={22} />
            </button>
            <h1 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              {navItems.find(item => location.pathname.startsWith(item.href))?.label || 'BioVerse'}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            {/* Notification */}
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] rounded-full h-3.5 w-3.5 flex items-center justify-center font-bold">3</span>
            </button>
            {/* Settings */}
            <Link
              to="/settings"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings size={18} />
            </Link>
            {/* User avatar */}
            <div className="flex items-center space-x-2 pl-2 border-l border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
                {userInitial}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize leading-tight">{userRole.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;