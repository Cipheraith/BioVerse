import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  Activity, 
  Heart, 
  Brain, 
  Truck, 
  Shield, 
  Settings, 
  LogOut,
  Menu,
  X,
  Video,
  Monitor,
  BarChart3,
  AlertTriangle,
  Stethoscope,
  Pill,
  MapPin,
  Phone,
  FileText,
  UserCheck,
  Sparkles,
  Zap,
  type LucideIcon
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';

interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  badge?: number;
  gradient: 'blue' | 'purple' | 'cyan' | 'pink' | 'green' | 'orange';
  description?: string;
}

interface RoleConfig {
  role: string;
  title: string;
  subtitle: string;
  primaryColor: string;
  gradient: 'blue' | 'purple' | 'cyan' | 'pink' | 'green' | 'orange';
  navigationItems: NavigationItem[];
}

const roleConfigs: Record<string, RoleConfig> = {
  patient: {
    role: 'patient',
    title: 'Patient Portal',
    subtitle: 'Your Health Journey',
    primaryColor: 'from-blue-500 to-cyan-500',
    gradient: 'blue',
    navigationItems: [
      { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard', gradient: 'blue', description: 'Overview of your health' },
      { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/appointments', gradient: 'purple', description: 'Schedule & manage appointments' },
      { id: 'health-records', label: 'Health Records', icon: FileText, path: '/health-records', gradient: 'cyan', description: 'View your medical history' },
      { id: 'telemedicine', label: 'Video Consultations', icon: Video, path: '/telemedicine', gradient: 'green', description: 'Connect with doctors remotely' },
      { id: 'health-twin', label: 'Health Twin', icon: Brain, path: '/health-twin', gradient: 'pink', description: 'AI-powered health insights' },
      { id: 'symptoms', label: 'Symptom Checker', icon: Activity, path: '/symptoms', gradient: 'orange', description: 'Check symptoms & get guidance' },
      { id: 'emergency', label: 'Emergency', icon: AlertTriangle, path: '/emergency', gradient: 'pink', description: 'Emergency services & contacts' },
    ]
  },
  health_worker: {
    role: 'health_worker',
    title: 'Health Worker Portal',
    subtitle: 'Patient Care Management',
    primaryColor: 'from-green-500 to-emerald-500',
    gradient: 'green',
    navigationItems: [
      { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard', gradient: 'green', description: 'Patient care overview' },
      { id: 'patients', label: 'Patients', icon: Users, path: '/patients', gradient: 'blue', description: 'Manage patient records' },
      { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/appointments', gradient: 'purple', description: 'Schedule & manage appointments' },
      { id: 'telemedicine', label: 'Telemedicine', icon: Video, path: '/telemedicine', gradient: 'cyan', description: 'Virtual consultations' },
      { id: 'health-twins', label: 'Health Twins', icon: Brain, path: '/health-twins', gradient: 'pink', description: 'AI health monitoring' },
      { id: 'maternal-health', label: 'Maternal Health', icon: Heart, path: '/maternal-health', gradient: 'orange', description: 'Pregnancy & maternal care' },
      { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports', gradient: 'purple', description: 'Health analytics & reports' },
    ]
  },
  admin: {
    role: 'admin',
    title: 'Admin Control Center',
    subtitle: 'System Management',
    primaryColor: 'from-purple-500 to-pink-500',
    gradient: 'purple',
    navigationItems: [
      { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard', gradient: 'purple', description: 'System overview' },
      { id: 'users', label: 'User Management', icon: UserCheck, path: '/users', gradient: 'blue', description: 'Manage system users' },
      { id: 'patients', label: 'Patients', icon: Users, path: '/patients', gradient: 'cyan', description: 'Patient database' },
      { id: 'health-twins', label: 'Health Twins', icon: Brain, path: '/health-twins', gradient: 'pink', description: 'AI health monitoring system' },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics', gradient: 'green', description: 'System analytics & insights' },
      { id: 'telemedicine', label: 'Telemedicine', icon: Video, path: '/telemedicine', gradient: 'orange', description: 'Virtual care platform' },
      { id: 'settings', label: 'System Settings', icon: Settings, path: '/settings', gradient: 'purple', description: 'Configure system settings' },
    ]
  },
  moh: {
    role: 'moh',
    title: 'Ministry of Health',
    subtitle: 'National Health Oversight',
    primaryColor: 'from-red-500 to-orange-500',
    gradient: 'orange',
    navigationItems: [
      { id: 'dashboard', label: 'National Dashboard', icon: Home, path: '/dashboard', gradient: 'orange', description: 'National health overview' },
      { id: 'population-health', label: 'Population Health', icon: Users, path: '/population-health', gradient: 'blue', description: 'Population health metrics' },
      { id: 'disease-surveillance', label: 'Disease Surveillance', icon: Monitor, path: '/disease-surveillance', gradient: 'purple', description: 'Disease tracking & monitoring' },
      { id: 'health-facilities', label: 'Health Facilities', icon: Shield, path: '/health-facilities', gradient: 'cyan', description: 'Healthcare facility management' },
      { id: 'emergency-response', label: 'Emergency Response', icon: AlertTriangle, path: '/emergency-response', gradient: 'pink', description: 'National emergency coordination' },
      { id: 'analytics', label: 'Health Analytics', icon: BarChart3, path: '/analytics', gradient: 'green', description: 'National health analytics' },
      { id: 'policies', label: 'Health Policies', icon: FileText, path: '/policies', gradient: 'purple', description: 'Health policy management' },
    ]
  },
  ambulance_driver: {
    role: 'ambulance_driver',
    title: 'Emergency Response',
    subtitle: 'Ambulance Operations',
    primaryColor: 'from-red-500 to-yellow-500',
    gradient: 'pink',
    navigationItems: [
      { id: 'dashboard', label: 'Emergency Dashboard', icon: Home, path: '/dashboard', gradient: 'pink', description: 'Emergency response center' },
      { id: 'dispatch', label: 'Dispatch Map', icon: MapPin, path: '/dispatch-map', gradient: 'blue', description: 'Live emergency locations' },
      { id: 'emergency-calls', label: 'Emergency Calls', icon: Phone, path: '/emergency-calls', gradient: 'orange', description: 'Active emergency calls' },
      { id: 'patient-transport', label: 'Patient Transport', icon: Truck, path: '/patient-transport', gradient: 'purple', description: 'Patient transportation logs' },
      { id: 'medical-equipment', label: 'Medical Equipment', icon: Stethoscope, path: '/medical-equipment', gradient: 'cyan', description: 'Equipment status & inventory' },
      { id: 'trip-history', label: 'Trip History', icon: BarChart3, path: '/trip-history', gradient: 'green', description: 'Completed emergency responses' },
    ]
  },
  pharmacy: {
    role: 'pharmacy',
    title: 'Pharmacy Management',
    subtitle: 'Medication & Inventory',
    primaryColor: 'from-green-500 to-blue-500',
    gradient: 'cyan',
    navigationItems: [
      { id: 'dashboard', label: 'Pharmacy Dashboard', icon: Home, path: '/dashboard', gradient: 'cyan', description: 'Pharmacy operations overview' },
      { id: 'inventory', label: 'Inventory', icon: Pill, path: '/inventory', gradient: 'blue', description: 'Medication inventory management' },
      { id: 'prescriptions', label: 'Prescriptions', icon: FileText, path: '/prescriptions', gradient: 'purple', description: 'Prescription management' },
      { id: 'orders', label: 'Orders', icon: Calendar, path: '/orders', gradient: 'green', description: 'Medication orders & requests' },
      { id: 'patients', label: 'Patients', icon: Users, path: '/patients', gradient: 'orange', description: 'Patient medication history' },
      { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports', gradient: 'pink', description: 'Pharmacy analytics & reports' },
    ]
  }
};

const RoleBasedNavigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!user) return null;

  const config = roleConfigs[user.role] || roleConfigs.patient;
  const currentPath = location.pathname;

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <motion.button
          className="fixed top-4 left-4 z-50 lg:hidden"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <GlassCard className="p-3" gradient={config.gradient}>
            {isOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
          </GlassCard>
        </motion.button>
      )}

      {/* Navigation Sidebar */}
      <AnimatePresence>
        {(isOpen || !isMobile) && (
          <>
            {/* Backdrop for mobile */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setIsOpen(false)}
              />
            )}

            {/* Sidebar */}
            <motion.div
              initial={{ x: isMobile ? -320 : 0, opacity: isMobile ? 0 : 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isMobile ? -320 : 0, opacity: isMobile ? 0 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`fixed left-0 top-0 h-full w-80 z-50 ${
                isMobile ? 'lg:relative lg:translate-x-0' : ''
              }`}
            >
              <GlassCard className="h-full p-6 rounded-none lg:rounded-r-3xl" gradient={config.gradient} glow>
                {/* Header */}
                <div className="mb-8">
                  <motion.div
                    className="flex items-center mb-4"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl flex items-center justify-center mr-4">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-black text-white">{config.title}</h1>
                      <p className="text-sm text-gray-300">{config.subtitle}</p>
                    </div>
                  </motion.div>

                  {/* User Info */}
                  <div className="bg-white/10 rounded-2xl p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-white/30 to-white/20 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">
                          {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">
                          {user.fullName || user.username}
                        </p>
                        <p className="text-gray-300 text-xs capitalize">
                          {user.role.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 space-y-2">
                  {config.navigationItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.path || 
                      (item.path === '/dashboard' && currentPath === '/');
                    
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <motion.button
                          onClick={() => handleNavigation(item.path)}
                          className={`w-full text-left p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                            isActive 
                              ? 'bg-white/20 text-white shadow-lg' 
                              : 'text-gray-300 hover:bg-white/10 hover:text-white'
                          }`}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl"
                              layoutId="activeNavItem"
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                          
                          <div className="relative z-10 flex items-center">
                            <motion.div
                              className={`p-2 rounded-xl mr-4 ${
                                isActive 
                                  ? 'bg-white/20' 
                                  : 'bg-white/10 group-hover:bg-white/20'
                              }`}
                              animate={isActive ? { rotate: [0, 5, -5, 0] } : {}}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Icon size={20} />
                            </motion.div>
                            
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{item.label}</p>
                              {item.description && (
                                <p className="text-xs opacity-75 mt-1">{item.description}</p>
                              )}
                            </div>
                            
                            {item.badge && (
                              <motion.div
                                className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                {item.badge}
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </nav>

                {/* Footer Actions */}
                <div className="mt-8 space-y-3">
                  <GlassButton
                    variant="ghost"
                    className="w-full justify-start"
                    icon={<Settings size={18} />}
                    onClick={() => handleNavigation('/settings')}
                  >
                    Settings
                  </GlassButton>
                  
                  <GlassButton
                    variant="danger"
                    className="w-full justify-start"
                    icon={<LogOut size={18} />}
                    onClick={handleLogout}
                  >
                    Logout
                  </GlassButton>
                </div>

                {/* Status Indicator */}
                <div className="mt-4 flex items-center justify-center">
                  <motion.div
                    className="flex items-center space-x-2 text-xs text-gray-400"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>System Online</span>
                    <Zap size={12} />
                  </motion.div>
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default RoleBasedNavigation;