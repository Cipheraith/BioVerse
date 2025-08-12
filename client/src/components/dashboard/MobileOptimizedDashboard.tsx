import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Activity, 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Phone,
  Video,
  Bell,
  ChevronRight,
  Filter,
  Menu
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import { useAuth } from '../../hooks/useAuth';
import { useResponsive } from '../../hooks/useResponsive';

interface DashboardProps {
  userRole: string;
}

interface StatCard {
  id: string;
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  description?: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  path: string;
  urgent?: boolean;
}

const MobileOptimizedDashboard: React.FC<DashboardProps> = ({ userRole }) => {
  const { user } = useAuth();
  const { isMobile, isTablet } = useResponsive();
  const [showFilters, setShowFilters] = useState(false);

  // Role-specific dashboard data
  const getDashboardData = () => {
    switch (userRole) {
      case 'patient':
        return {
          stats: [
            { id: 'health-score', title: 'Health Score', value: '85%', change: '+5%', trend: 'up' as const, icon: Heart, color: 'success' as const, description: 'Overall health rating' },
            { id: 'appointments', title: 'Upcoming', value: '3', change: 'This week', trend: 'stable' as const, icon: Calendar, color: 'primary' as const, description: 'Scheduled appointments' },
            { id: 'medications', title: 'Medications', value: '2', change: 'Active', trend: 'stable' as const, icon: Activity, color: 'secondary' as const, description: 'Current prescriptions' },
            { id: 'vitals', title: 'Last Check', value: '2d', change: 'ago', trend: 'stable' as const, icon: TrendingUp, color: 'ghost' as const, description: 'Vital signs recorded' },
          ],
          quickActions: [
            { id: 'book-appointment', label: 'Book Appointment', icon: Calendar, color: 'primary' as const, path: '/appointments' },
            { id: 'video-call', label: 'Video Call', icon: Video, color: 'success' as const, path: '/telemedicine' },
            { id: 'emergency', label: 'Emergency', icon: AlertTriangle, color: 'danger' as const, path: '/emergency', urgent: true },
            { id: 'health-twin', label: 'Health Twin', icon: Heart, color: 'secondary' as const, path: '/health-twin' },
          ]
        };
      
      case 'health_worker':
        return {
          stats: [
            { id: 'patients', title: 'My Patients', value: '127', change: '+12', trend: 'up' as const, icon: Users, color: 'primary' as const, description: 'Active patients' },
            { id: 'appointments', title: 'Today', value: '8', change: '2 pending', trend: 'stable' as const, icon: Calendar, color: 'success' as const, description: 'Scheduled for today' },
            { id: 'consultations', title: 'Video Calls', value: '5', change: 'Active', trend: 'up' as const, icon: Video, color: 'secondary' as const, description: 'Telemedicine sessions' },
            { id: 'alerts', title: 'Alerts', value: '3', change: 'High priority', trend: 'down' as const, icon: AlertTriangle, color: 'warning' as const, description: 'Patient alerts' },
          ],
          quickActions: [
            { id: 'patient-list', label: 'View Patients', icon: Users, color: 'primary' as const, path: '/patients' },
            { id: 'telemedicine', label: 'Start Call', icon: Video, color: 'success' as const, path: '/telemedicine' },
            { id: 'health-twins', label: 'Health Twins', icon: Heart, color: 'secondary' as const, path: '/health-twins' },
            { id: 'emergency', label: 'Emergency', icon: Phone, color: 'danger' as const, path: '/emergency', urgent: true },
          ]
        };
      
      case 'admin':
        return {
          stats: [
            { id: 'users', title: 'Total Users', value: '2,847', change: '+156', trend: 'up' as const, icon: Users, color: 'primary' as const, description: 'Registered users' },
            { id: 'health-twins', title: 'Health Twins', value: '1,234', change: '+89', trend: 'up' as const, icon: Heart, color: 'secondary' as const, description: 'Active health twins' },
            { id: 'consultations', title: 'Consultations', value: '456', change: 'Today', trend: 'up' as const, icon: Video, color: 'success' as const, description: 'Video consultations' },
            { id: 'system-health', title: 'System Health', value: '99.9%', change: 'Uptime', trend: 'up' as const, icon: TrendingUp, color: 'ghost' as const, description: 'System performance' },
          ],
          quickActions: [
            { id: 'user-management', label: 'Manage Users', icon: Users, color: 'primary' as const, path: '/users' },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'secondary' as const, path: '/analytics' },
            { id: 'system-settings', label: 'Settings', icon: Menu, color: 'ghost' as const, path: '/settings' },
            { id: 'health-twins', label: 'Health Twins', icon: Heart, color: 'success' as const, path: '/health-twins' },
          ]
        };
      
      default:
        return { stats: [], quickActions: [] };
    }
  };

  const { stats, quickActions } = getDashboardData();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="w-full min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Mobile Header */}
      {isMobile && (
        <motion.div
          className="sticky top-0 z-30 bg-white/10 backdrop-blur-md border-b border-white/20 p-4 mb-6"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">
                Welcome back, {user?.fullName || user?.username}
              </h1>
              <p className="text-sm text-gray-300 capitalize">
                {userRole.replace('_', ' ')} Dashboard
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <GlassButton
                onClick={() => setShowFilters(!showFilters)}
                className="p-2"
                variant="primary"
              >
                <Filter className="w-5 h-5" />
              </GlassButton>
              <GlassButton className="p-2" variant="success">
                <Bell className="w-5 h-5" />
              </GlassButton>
            </div>
          </div>
        </motion.div>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <motion.div className="mb-8" variants={itemVariants}>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.fullName || user?.username}
          </h1>
          <p className="text-gray-300 capitalize">
            {userRole.replace('_', ' ')} Dashboard - {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        className={`
          responsive-grid mb-8
          ${isMobile ? 'grid-cols-2 gap-3' : isTablet ? 'grid-cols-2 gap-4' : 'grid-cols-4 gap-6'}
        `}
        variants={itemVariants}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <GlassCard
                className={`responsive-card ${isMobile ? 'p-4' : 'p-6'}`}
                variant={stat.color}
                glow
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-xl bg-white/20 ${isMobile ? 'p-2' : 'p-3'}`}>
                    <Icon className={`text-white ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                  </div>
                  <div className={`text-right ${stat.trend === 'up' ? 'text-green-300' : stat.trend === 'down' ? 'text-red-300' : 'text-gray-300'}`}>
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className={`text-white font-bold ${isMobile ? 'text-lg' : 'text-2xl'} mb-1`}>
                    {stat.value}
                  </h3>
                  <p className={`text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                    {stat.title}
                  </p>
                  {stat.description && !isMobile && (
                    <p className="text-gray-400 text-xs mt-1">
                      {stat.description}
                    </p>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h2 className={`text-white font-bold mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}>
          Quick Actions
        </h2>
        
        <div className={`
          responsive-grid
          ${isMobile ? 'grid-cols-2 gap-3' : isTablet ? 'grid-cols-3 gap-4' : 'grid-cols-4 gap-6'}
        `}>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <GlassButton
                  className={`
                    responsive-button w-full h-auto
                    ${isMobile ? 'p-4' : 'p-6'}
                    ${action.urgent ? 'ring-2 ring-red-400 ring-opacity-50' : ''}
                  `}
                  variant={action.color}
                  glow={action.urgent}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`p-3 rounded-xl bg-white/20 mb-3 ${action.urgent ? 'animate-pulse' : ''}`}>
                      <Icon className={`text-white ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
                    </div>
                    <span className={`text-white font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
                      {action.label}
                    </span>
                    {action.urgent && (
                      <span className="text-red-300 text-xs mt-1 font-medium">
                        Priority
                      </span>
                    )}
                  </div>
                </GlassButton>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Activity (Mobile Optimized) */}
      <motion.div className="mt-8" variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-white font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}>
            Recent Activity
          </h2>
          <GlassButton className="text-sm" variant="primary">
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </GlassButton>
        </div>

        <GlassCard className={`responsive-card ${isMobile ? 'p-4' : 'p-6'}`} variant="secondary">
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className={`text-white font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
                      Health check completed
                    </p>
                    <p className={`text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      2 hours ago
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};

export default MobileOptimizedDashboard;