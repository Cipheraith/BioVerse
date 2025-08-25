import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, LucideIcon } from 'lucide-react';

interface ModernButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'netflix';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
}

const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
}) => {
  const baseClasses = `
    relative overflow-hidden rounded-2xl font-semibold transition-all duration-300 
    focus:outline-none focus:ring-4 focus:ring-opacity-50 
    transform hover:scale-105 active:scale-95
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? 'opacity-50 cursor-not-allowed transform-none' : 'cursor-pointer'}
  `;

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800
      text-white shadow-lg hover:shadow-xl focus:ring-primary-500
      border border-primary-500/30
    `,
    secondary: `
      bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800
      text-white shadow-lg hover:shadow-xl focus:ring-secondary-500
      border border-secondary-500/30
    `,
    ghost: `
      bg-transparent hover:bg-gray-800/50 
      text-gray-300 hover:text-white
      border border-gray-700/50 hover:border-gray-600
      focus:ring-gray-500
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800
      text-white shadow-lg hover:shadow-xl focus:ring-red-500
      border border-red-500/30
    `,
    success: `
      bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800
      text-white shadow-lg hover:shadow-xl focus:ring-green-500
      border border-green-500/30
    `,
    netflix: `
      bg-gradient-to-r from-netflix-600 to-red-700 hover:from-netflix-700 hover:to-red-800
      text-white shadow-lg hover:shadow-xl focus:ring-netflix-500
      border border-netflix-500/30
    `,
  };

  return (
    <motion.button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={disabled || loading ? {} : { scale: 1.05 }}
      whileTap={disabled || loading ? {} : { scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-out" />
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl blur-xl opacity-20 bg-gradient-to-r from-primary-500 to-accent-500" />
      
      {/* Content */}
      <div className="relative flex items-center justify-center space-x-2">
        {loading && (
          <Loader2 className="w-5 h-5 animate-spin" />
        )}
        
        {!loading && Icon && iconPosition === 'left' && (
          <Icon className="w-5 h-5" />
        )}
        
        <span>{children}</span>
        
        {!loading && Icon && iconPosition === 'right' && (
          <Icon className="w-5 h-5" />
        )}
      </div>
    </motion.button>
  );
};

export default ModernButton;
