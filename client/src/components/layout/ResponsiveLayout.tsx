import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import RoleBasedNavigation from '../navigation/RoleBasedNavigation';
import FloatingParticles from '../ui/FloatingParticles';
import { useAuth } from '../../hooks/useAuth';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  particleColors?: string[];
  particleCount?: number;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  showNavigation = true,
  particleColors = ['cyan', 'blue', 'purple', 'pink'],
  particleCount = 20
}) => {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Don't show navigation on login/register pages
  const shouldShowNavigation = showNavigation && user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Floating Particles Background */}
      <FloatingParticles 
        count={particleCount} 
        colors={particleColors}
        size={isMobile ? 'sm' : 'md'}
        speed={isMobile ? 'slow' : 'medium'}
      />

      <div className="relative z-10 flex min-h-screen">
        {/* Navigation Sidebar */}
        {shouldShowNavigation && <RoleBasedNavigation />}

        {/* Main Content Area */}
        <motion.main
          className={`flex-1 w-full transition-all duration-300 ${
            shouldShowNavigation 
              ? isMobile 
                ? 'ml-0' 
                : 'ml-80' 
              : 'ml-0'
          }`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Content Container */}
          <div className={`
            responsive-container w-full min-h-screen
            ${isMobile ? 'px-3 py-4 pt-20' : isTablet ? 'px-4 py-6' : 'px-6 py-8'}
            ${shouldShowNavigation && !isMobile ? 'max-w-none' : 'max-w-7xl mx-auto'}
          `}>
            {/* Responsive Content Wrapper */}
            <div className="w-full overflow-x-hidden">
              <div className="responsive-main">
                {children}
              </div>
            </div>
          </div>
        </motion.main>
      </div>

      {/* Mobile Navigation Overlay Space */}
      {shouldShowNavigation && isMobile && (
        <div className="fixed top-0 left-0 w-full h-20 pointer-events-none z-30" />
      )}
    </div>
  );
};

export default ResponsiveLayout;