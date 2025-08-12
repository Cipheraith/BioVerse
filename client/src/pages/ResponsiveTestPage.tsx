import React from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Tv,
  RotateCcw,
  Eye,
  Zap,
  Grid,
  Layout
} from 'lucide-react';
import { useResponsive } from '../hooks/useResponsive';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import ResponsiveGrid from '../components/layout/ResponsiveGrid';
import ResponsiveDashboardLayout from '../components/dashboard/ResponsiveDashboardLayout';

const ResponsiveTestPage: React.FC = () => {
  const responsive = useResponsive();

  const deviceInfo = [
    {
      name: 'Mobile',
      icon: Smartphone,
      active: responsive.isMobile,
      description: 'Phones and small devices',
      breakpoint: '< 768px'
    },
    {
      name: 'Tablet',
      icon: Tablet,
      active: responsive.isTablet,
      description: 'Tablets and medium screens',
      breakpoint: '768px - 1024px'
    },
    {
      name: 'Desktop',
      icon: Monitor,
      active: responsive.isDesktop,
      description: 'Desktop computers',
      breakpoint: '1024px - 1280px'
    },
    {
      name: 'Large Desktop',
      icon: Tv,
      active: responsive.isLargeDesktop,
      description: 'Large screens and TVs',
      breakpoint: '> 1280px'
    }
  ];

  const features = [
    {
      title: 'Mobile-First Design',
      description: 'Built from the ground up for mobile devices',
      icon: Smartphone,
      color: 'primary' as const
    },
    {
      title: 'Touch Optimized',
      description: 'All interactions designed for touch interfaces',
      icon: Eye,
      color: 'success' as const
    },
    {
      title: 'Fast Performance',
      description: 'Optimized for speed on all devices',
      icon: Zap,
      color: 'warning' as const
    },
    {
      title: 'Flexible Layouts',
      description: 'Adaptive grids that work everywhere',
      icon: Grid,
      color: 'secondary' as const
    }
  ];

  return (
    <ResponsiveDashboardLayout userRole="patient">
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Responsive Design System
            </span>
          </h1>
          <p className="text-gray-300 text-lg">
            BioVerse adapts perfectly to every screen size and device
          </p>
        </motion.div>

        {/* Current Device Info */}
        <GlassCard variant="primary" className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Current Device</h2>
            <div className="flex items-center justify-center space-x-4 text-gray-300">
              <div className="flex items-center space-x-2">
                <Monitor className="w-5 h-5" />
                <span>{responsive.screenWidth} × {responsive.screenHeight}</span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-5 h-5" />
                <span className="capitalize">{responsive.orientation}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>{responsive.isTouch ? 'Touch' : 'Mouse'}</span>
              </div>
            </div>
          </div>

          <ResponsiveGrid columns={{ mobile: 2, tablet: 4, desktop: 4 }}>
            {deviceInfo.map((device) => {
              const Icon = device.icon;
              return (
                <motion.div
                  key={device.name}
                  whileHover={{ scale: 1.02 }}
                  className={`
                    p-4 rounded-xl border transition-all
                    ${device.active 
                      ? 'bg-blue-500/20 border-blue-400/50 text-white' 
                      : 'bg-white/5 border-white/10 text-gray-400'
                    }
                  `}
                >
                  <div className="text-center">
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${device.active ? 'text-blue-400' : ''}`} />
                    <h3 className="font-semibold mb-1">{device.name}</h3>
                    <p className="text-xs opacity-75 mb-2">{device.description}</p>
                    <code className="text-xs bg-black/20 px-2 py-1 rounded">
                      {device.breakpoint}
                    </code>
                  </div>
                </motion.div>
              );
            })}
          </ResponsiveGrid>
        </GlassCard>

        {/* Features Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Responsive Features
          </h2>
          
          <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 4 }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <GlassCard key={index} variant={feature.color} className="p-6 text-center">
                  <div className="p-3 bg-white/10 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300 text-sm">{feature.description}</p>
                </GlassCard>
              );
            })}
          </ResponsiveGrid>
        </div>

        {/* Interactive Demo */}
        <GlassCard variant="secondary" className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Interactive Demo
          </h2>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-300 mb-4">
                Resize your browser window to see the responsive design in action
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <GlassButton variant="primary">
                  <Layout className="w-4 h-4 mr-2" />
                  Responsive Button
                </GlassButton>
                
                <GlassButton variant="success">
                  <Grid className="w-4 h-4 mr-2" />
                  Adaptive Layout
                </GlassButton>
                
                <GlassButton variant="warning">
                  <Zap className="w-4 h-4 mr-2" />
                  Touch Optimized
                </GlassButton>
              </div>
            </div>

            {/* Responsive Text Demo */}
            <div className="text-center space-y-2">
              <h3 className="text-responsive-xl text-white font-bold">
                Responsive Typography
              </h3>
              <p className="text-responsive-base text-gray-300">
                This text scales automatically based on screen size
              </p>
              <p className="text-responsive-sm text-gray-400">
                Smaller text that remains readable on all devices
              </p>
            </div>

            {/* Grid Demo */}
            <div className="grid-responsive-auto">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 text-center"
                >
                  <div className="w-8 h-8 bg-purple-500/30 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white font-bold">{item}</span>
                  </div>
                  <p className="text-white text-sm">Grid Item {item}</p>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Technical Details */}
        <GlassCard variant="ghost" className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Technical Implementation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Breakpoints</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Mobile:</span>
                  <code className="text-blue-400">0px - 767px</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Tablet:</span>
                  <code className="text-blue-400">768px - 1023px</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Desktop:</span>
                  <code className="text-blue-400">1024px - 1279px</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Large:</span>
                  <code className="text-blue-400">1280px+</code>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Features</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✓ Mobile-first CSS approach</li>
                <li>✓ Touch-friendly 44px minimum targets</li>
                <li>✓ Responsive typography scaling</li>
                <li>✓ Adaptive grid systems</li>
                <li>✓ Safe area support for notched devices</li>
                <li>✓ Reduced motion support</li>
                <li>✓ High contrast mode compatibility</li>
                <li>✓ Print-friendly layouts</li>
              </ul>
            </div>
          </div>
        </GlassCard>
      </div>
    </ResponsiveDashboardLayout>
  );
};

export default ResponsiveTestPage;