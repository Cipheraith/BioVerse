import React from 'react';
import { motion } from 'framer-motion';

interface ModernCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'outlined' | 'gradient' | 'netflix';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

const ModernCard: React.FC<ModernCardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  onClick,
}) => {
  const baseClasses = `
    relative rounded-2xl transition-all duration-300 overflow-hidden
    ${hover ? 'hover:transform hover:scale-105 cursor-pointer' : ''}
    ${onClick ? 'cursor-pointer' : ''}
  `;

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const variantClasses = {
    default: `
      bg-gray-900/90 border border-gray-800/50
      shadow-lg hover:shadow-xl
      backdrop-blur-sm
    `,
    glass: `
      bg-gray-900/40 border border-gray-700/30
      backdrop-blur-xl shadow-2xl
      hover:bg-gray-900/60 hover:border-gray-600/50
    `,
    elevated: `
      bg-gray-900 border border-gray-800/70
      shadow-2xl hover:shadow-3xl
      hover:border-gray-700/70
    `,
    outlined: `
      bg-transparent border-2 border-gray-700/60
      hover:border-gray-600/80 hover:bg-gray-900/20
    `,
    gradient: `
      bg-gradient-to-br from-gray-900/90 to-gray-800/90
      border border-gray-700/50 shadow-xl
      hover:from-gray-800/90 hover:to-gray-700/90
      hover:border-gray-600/60
    `,
    netflix: `
      bg-gradient-to-br from-gray-900/95 to-black/95
      border border-gray-800/60 shadow-2xl
      hover:from-gray-800/95 hover:to-gray-900/95
      hover:shadow-3xl
    `,
  };

  return (
    <motion.div
      className={`${baseClasses} ${paddingClasses[padding]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={hover ? { 
        scale: 1.02, 
        y: -4,
        transition: { duration: 0.2 } 
      } : {}}
    >
      {/* Subtle glow effect on hover */}
      {hover && (
        <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-20 transition-opacity duration-300 bg-gradient-to-br from-primary-500/20 to-accent-500/20 pointer-events-none" />
      )}
      
      {/* Shimmer effect for glass variant */}
      {variant === 'glass' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1500 ease-out" />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default ModernCard;
