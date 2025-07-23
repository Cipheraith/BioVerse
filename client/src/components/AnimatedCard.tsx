import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cardHoverVariants, cardHoverGlowVariants, glassVariants } from '../utils/animations';

interface AnimatedCardProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'glow' | 'hover-lift' | 'floating';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  disabled?: boolean;
  gradient?: boolean;
  blur?: boolean;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  onClick,
  disabled = false,
  gradient = false,
  blur = false,
  ...motionProps
}) => {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10',
  };

  const baseClasses = `
    rounded-xl border border-border dark:border-dark-border 
    transition-all duration-300 cursor-pointer
    ${sizeClasses[size]} ${className}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${onClick && !disabled ? 'cursor-pointer' : ''}
  `;

  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return `
          bg-card/80 dark:bg-dark-card/80 backdrop-blur-md
          border-white/20 dark:border-white/10
          shadow-lg shadow-black/10
        `;
      case 'glow':
        return `
          bg-card dark:bg-dark-card
          shadow-lg hover:shadow-2xl hover:shadow-primary-600/20
          border-primary-600/20 hover:border-primary-600/40
        `;
      case 'hover-lift':
        return `
          bg-card dark:bg-dark-card
          shadow-md hover:shadow-xl
          transform transition-transform hover:-translate-y-1
        `;
      case 'floating':
        return `
          bg-card dark:bg-dark-card
          shadow-xl
        `;
      default:
        return `
          bg-card dark:bg-dark-card
          shadow-lg
        `;
    }
  };

  const getMotionVariants = () => {
    switch (variant) {
      case 'glass':
        return glassVariants;
      case 'glow':
        return cardHoverGlowVariants;
      case 'hover-lift':
      case 'default':
        return cardHoverVariants;
      case 'floating':
        return {
          floating: {
            y: [-5, 5, -5],
            transition: {
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          },
        };
      default:
        return {};
    }
  };

  const cardContent = (
    <motion.div
      className={`${baseClasses} ${getVariantClasses()} ${
        gradient
          ? 'bg-gradient-to-br from-primary-600/10 via-secondary-600/5 to-accent-600/10'
          : ''
      } ${blur ? 'backdrop-blur-sm' : ''}`}
      variants={getMotionVariants()}
      initial="rest"
      whileHover={!disabled ? "hover" : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      animate={variant === 'floating' ? 'floating' : undefined}
      onClick={disabled ? undefined : onClick}
      {...motionProps}
    >
      {children}
    </motion.div>
  );

  // Wrap with additional motion effects for certain variants
  if (variant === 'glow') {
    return (
      <motion.div
        whileHover={{
          filter: 'drop-shadow(0 0 20px rgba(67, 233, 123, 0.3))',
        }}
        transition={{ duration: 0.3 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  if (variant === 'hover-lift') {
    return (
      <motion.div
        whileHover={{
          y: -8,
          transition: { type: 'spring', stiffness: 400, damping: 25 },
        }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
};

export default AnimatedCard;
