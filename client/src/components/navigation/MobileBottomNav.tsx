import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Calendar, 
  Heart, 
  User, 
  Plus,
  Activity
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  isSpecial?: boolean;
}

interface MobileBottomNavProps {
  userRole: string;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getNavItems = (): NavItem[] => {
    const baseItems = [
      { id: 'dashboard', label: 'Home', icon: Home, path: '/dashboard' },
      { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/appointments' },
    ];

    // Special center button based on user role
    const specialButton = userRole === 'patient' 
      ? { id: 'health-check', label: 'Health Check', icon: Plus, path: '/luma', isSpecial: true }
      : { id: 'emergency', label: 'Emergency', icon: Plus, path: '/emergency', isSpecial: true };

    const endItems = [
      { id: 'health-twin', label: 'Health Twin', icon: Heart, path: '/health-twin' },
      { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
    ];

    return [...baseItems, specialButton, ...endItems];
  };

  const navItems = getNavItems();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-xl border-t border-white/10 safe-area-pb"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          if (item.isSpecial) {
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                {/* Floating label */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                >
                  {item.label}
                </motion.div>
              </motion.button>
            );
          }

          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`
                flex flex-col items-center justify-center p-2 rounded-xl min-w-[60px] transition-all
                ${active 
                  ? 'bg-white/10 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`
                p-2 rounded-lg transition-all
                ${active ? 'bg-blue-500/20' : ''}
              `}>
                <Icon className="w-5 h-5" />
              </div>
              
              <span className="text-xs font-medium mt-1 leading-tight">
                {item.label}
              </span>
              
              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-transparent" />
    </motion.div>
  );
};

export default MobileBottomNav;