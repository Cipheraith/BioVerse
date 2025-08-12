import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  glow?: boolean;
}

const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  glow = false
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600/80 to-cyan-600/80 hover:from-blue-700/90 hover:to-cyan-700/90 text-white border-blue-500/30',
    secondary: 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-700/90 hover:to-pink-700/90 text-white border-purple-500/30',
    success: 'bg-gradient-to-r from-green-600/80 to-emerald-600/80 hover:from-green-700/90 hover:to-emerald-700/90 text-white border-green-500/30',
    warning: 'bg-gradient-to-r from-orange-600/80 to-yellow-600/80 hover:from-orange-700/90 hover:to-yellow-700/90 text-white border-orange-500/30',
    danger: 'bg-gradient-to-r from-red-600/80 to-rose-600/80 hover:from-red-700/90 hover:to-rose-700/90 text-white border-red-500/30',
    ghost: 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border-gray-500/20 hover:border-gray-400/30'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };

  const glowColors = {
    primary: 'shadow-blue-500/25',
    secondary: 'shadow-purple-500/25',
    success: 'shadow-green-500/25',
    warning: 'shadow-orange-500/25',
    danger: 'shadow-red-500/25',
    ghost: 'shadow-gray-500/25'
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'relative backdrop-blur-xl border rounded-xl font-semibold transition-all duration-300',
        'flex items-center justify-center space-x-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        glow && `shadow-2xl ${glowColors[variant]}`,
        className
      )}
      whileHover={!disabled ? { 
        scale: 1.02,
        boxShadow: glow ? `0 20px 40px ${glowColors[variant].split('/')[0]}/40` : undefined
      } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 flex items-center space-x-2">
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && <span>{icon}</span>}
            <span>{children}</span>
            {icon && iconPosition === 'right' && <span>{icon}</span>}
          </>
        )}
      </div>
    </motion.button>
  );
};

export default GlassButton;