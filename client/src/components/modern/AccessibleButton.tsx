import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AccessibleButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    children,
    className,
    disabled,
    ...props
  }, ref) => {
    const baseClasses = [
      'inline-flex items-center justify-center font-semibold transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-background',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      'relative overflow-hidden'
    ];

    const variantClasses = {
      primary: [
        'bg-gradient-to-r from-primary-600 to-secondary-600',
        'hover:from-primary-700 hover:to-secondary-700',
        'text-white shadow-lg hover:shadow-xl',
        'focus:ring-primary-500',
        'active:scale-95'
      ],
      secondary: [
        'bg-gradient-to-r from-gray-700 to-gray-800',
        'hover:from-gray-600 hover:to-gray-700',
        'text-white shadow-lg hover:shadow-xl',
        'focus:ring-gray-500',
        'active:scale-95'
      ],
      outline: [
        'border-2 border-primary-500 text-primary-400',
        'hover:bg-primary-500 hover:text-white',
        'focus:ring-primary-500',
        'active:scale-95'
      ],
      ghost: [
        'text-dark-text hover:bg-primary-500/10',
        'hover:text-primary-400',
        'focus:ring-primary-500',
        'active:scale-95'
      ],
      destructive: [
        'bg-gradient-to-r from-red-600 to-red-700',
        'hover:from-red-700 hover:to-red-800',
        'text-white shadow-lg hover:shadow-xl',
        'focus:ring-red-500',
        'active:scale-95'
      ]
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm rounded-lg',
      md: 'px-4 py-3 text-base rounded-xl',
      lg: 'px-6 py-4 text-lg rounded-xl',
      xl: 'px-8 py-5 text-xl rounded-2xl'
    };

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-7 h-7'
    };

    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.02 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        aria-disabled={isDisabled}
        aria-describedby={isLoading ? `${props.id}-loading` : undefined}
        {...props}
      >
        {/* Loading overlay */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-current/10 backdrop-blur-sm rounded-inherit"
          />
        )}

        {/* Content */}
        <span className="flex items-center space-x-2 relative z-10">
          {isLoading ? (
            <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
          ) : (
            leftIcon && <span className={iconSizes[size]}>{leftIcon}</span>
          )}
          
          <span>
            {isLoading && loadingText ? loadingText : children}
          </span>
          
          {!isLoading && rightIcon && (
            <span className={iconSizes[size]}>{rightIcon}</span>
          )}
        </span>

        {/* Screen reader loading text */}
        {isLoading && (
          <span id={`${props.id}-loading`} className="sr-only">
            Loading, please wait...
          </span>
        )}

        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-inherit"
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      </motion.button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

// Specialized button variants
export const PrimaryButton = forwardRef<HTMLButtonElement, Omit<AccessibleButtonProps, 'variant'>>(
  (props, ref) => <AccessibleButton ref={ref} variant="primary" {...props} />
);

export const SecondaryButton = forwardRef<HTMLButtonElement, Omit<AccessibleButtonProps, 'variant'>>(
  (props, ref) => <AccessibleButton ref={ref} variant="secondary" {...props} />
);

export const OutlineButton = forwardRef<HTMLButtonElement, Omit<AccessibleButtonProps, 'variant'>>(
  (props, ref) => <AccessibleButton ref={ref} variant="outline" {...props} />
);

export const GhostButton = forwardRef<HTMLButtonElement, Omit<AccessibleButtonProps, 'variant'>>(
  (props, ref) => <AccessibleButton ref={ref} variant="ghost" {...props} />
);

export const DestructiveButton = forwardRef<HTMLButtonElement, Omit<AccessibleButtonProps, 'variant'>>(
  (props, ref) => <AccessibleButton ref={ref} variant="destructive" {...props} />
);

// Call-to-action button with enhanced styling
export const CTAButton = forwardRef<HTMLButtonElement, Omit<AccessibleButtonProps, 'variant'>>(
  ({ className, children, ...props }, ref) => (
    <motion.div
      className="relative group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
      
      <AccessibleButton
        ref={ref}
        variant="primary"
        size="lg"
        className={cn(
          'relative bg-gradient-to-r from-primary-600 via-blue-600 to-secondary-600',
          'hover:from-primary-700 hover:via-blue-700 hover:to-secondary-700',
          'shadow-2xl hover:shadow-primary-500/25',
          'transform-gpu',
          className
        )}
        {...props}
      >
        {children}
      </AccessibleButton>
    </motion.div>
  )
);

PrimaryButton.displayName = 'PrimaryButton';
SecondaryButton.displayName = 'SecondaryButton';
OutlineButton.displayName = 'OutlineButton';
GhostButton.displayName = 'GhostButton';
DestructiveButton.displayName = 'DestructiveButton';
CTAButton.displayName = 'CTAButton';

export default AccessibleButton;