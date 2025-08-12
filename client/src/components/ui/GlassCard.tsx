import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  gradient?: 'blue' | 'purple' | 'cyan' | 'pink' | 'green' | 'orange'; // Keep for backward compatibility
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  hover = true, 
  glow = false,
  variant = 'primary',
  gradient
}) => {
  // Map variants to gradient colors
  const variantToGradient = {
    primary: 'blue',
    secondary: 'purple',
    success: 'green',
    warning: 'orange',
    danger: 'pink',
    ghost: 'cyan'
  };

  // Use gradient prop if provided, otherwise use variant mapping
  const activeGradient = gradient || variantToGradient[variant];

  const gradientClasses = {
    blue: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
    purple: 'from-purple-500/10 to-pink-500/10 border-purple-500/20',
    cyan: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20',
    pink: 'from-pink-500/10 to-rose-500/10 border-pink-500/20',
    green: 'from-green-500/10 to-emerald-500/10 border-green-500/20',
    orange: 'from-orange-500/10 to-red-500/10 border-orange-500/20'
  };

  const glowClasses = {
    blue: 'shadow-blue-500/25',
    purple: 'shadow-purple-500/25',
    cyan: 'shadow-cyan-500/25',
    pink: 'shadow-pink-500/25',
    green: 'shadow-green-500/25',
    orange: 'shadow-orange-500/25'
  };

  return (
    <motion.div
      className={cn(
        'relative backdrop-blur-xl bg-gradient-to-br border rounded-2xl p-6',
        'bg-white/5 dark:bg-black/20',
        gradientClasses[activeGradient],
        glow && `shadow-2xl ${glowClasses[activeGradient]}`,
        className
      )}
      whileHover={hover ? { 
        scale: 1.02,
        boxShadow: glow ? `0 25px 50px ${glowClasses[activeGradient].split('/')[0]}/30` : undefined
      } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;