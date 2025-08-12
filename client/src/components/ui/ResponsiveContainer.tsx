import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  center?: boolean;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  size = 'xl',
  padding = 'md',
  animate = true,
  center = false
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-none'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-2',
    md: 'px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8',
    lg: 'px-6 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-12',
    xl: 'px-8 sm:px-12 lg:px-16 py-8 sm:py-12 lg:py-16'
  };

  const containerClasses = cn(
    'w-full',
    sizeClasses[size],
    paddingClasses[padding],
    center && 'mx-auto',
    className
  );

  if (animate) {
    return (
      <motion.div
        className={containerClasses}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={containerClasses}>{children}</div>;
};

export default ResponsiveContainer;