import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModernInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outline';
  inputSize?: 'sm' | 'md' | 'lg';
  showPasswordToggle?: boolean;
}

const ModernInput = forwardRef<HTMLInputElement, ModernInputProps>(
  ({
    label,
    error,
    success,
    helper,
    leftIcon,
    rightIcon,
    variant = 'default',
    inputSize = 'md',
    showPasswordToggle = false,
    type = 'text',
    className,
    id,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const inputType = showPasswordToggle && type === 'password' 
      ? (showPassword ? 'text' : 'password') 
      : type;

    const baseClasses = [
      'w-full transition-all duration-200 font-medium',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-background',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'placeholder:text-dark-muted'
    ];

    const variantClasses = {
      default: [
        'bg-dark-background/50 border border-primary-500/20',
        'focus:border-primary-500 focus:ring-primary-500/20',
        'hover:border-primary-500/40'
      ],
      filled: [
        'bg-dark-card border border-transparent',
        'focus:border-primary-500 focus:ring-primary-500/20',
        'hover:bg-dark-card/80'
      ],
      outline: [
        'bg-transparent border-2 border-primary-500/30',
        'focus:border-primary-500 focus:ring-primary-500/20',
        'hover:border-primary-500/50'
      ]
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm rounded-lg',
      md: 'px-4 py-3 text-base rounded-xl',
      lg: 'px-6 py-4 text-lg rounded-xl'
    };

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    const hasError = !!error;
    const hasSuccess = !!success;
    const hasLeftIcon = !!leftIcon;
    const hasRightIcon = !!rightIcon || showPasswordToggle || hasError || hasSuccess;

    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <motion.label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium transition-colors duration-200',
              hasError ? 'text-red-400' : hasSuccess ? 'text-green-400' : 'text-dark-text'
            )}
            animate={{ 
              color: isFocused 
                ? hasError ? '#f87171' : hasSuccess ? '#4ade80' : '#0ea5e9'
                : hasError ? '#f87171' : hasSuccess ? '#4ade80' : '#f8fafc'
            }}
          >
            {label}
          </motion.label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {hasLeftIcon && (
            <div className={cn(
              'absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted transition-colors duration-200',
              iconSizes[inputSize],
              isFocused && 'text-primary-400'
            )}>
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <motion.input
            ref={ref}
            id={inputId}
            type={inputType}
            className={cn(
              baseClasses,
              variantClasses[variant],
              sizeClasses[inputSize],
              hasLeftIcon && 'pl-10',
              hasRightIcon && 'pr-10',
              hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              hasSuccess && 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
              'text-dark-text',
              className
            )}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : 
              success ? `${inputId}-success` : 
              helper ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {/* Right Icons */}
          {hasRightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              {/* Status Icons */}
              {hasError && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-red-400"
                >
                  <AlertCircle className={iconSizes[inputSize]} />
                </motion.div>
              )}
              
              {hasSuccess && !hasError && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-400"
                >
                  <CheckCircle className={iconSizes[inputSize]} />
                </motion.div>
              )}

              {/* Password Toggle */}
              {showPasswordToggle && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-dark-muted hover:text-primary-400 transition-colors duration-200 focus:outline-none focus:text-primary-400"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className={iconSizes[inputSize]} />
                  ) : (
                    <Eye className={iconSizes[inputSize]} />
                  )}
                </button>
              )}

              {/* Custom Right Icon */}
              {rightIcon && !hasError && !hasSuccess && (
                <div className="text-dark-muted">
                  {rightIcon}
                </div>
              )}
            </div>
          )}

          {/* Focus Ring Animation */}
          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-primary-500 pointer-events-none"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </div>

        {/* Helper/Error/Success Text */}
        <div className="min-h-[20px]">
          {error && (
            <motion.p
              id={`${inputId}-error`}
              className="text-red-400 text-sm flex items-center space-x-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.p>
          )}
          
          {success && !error && (
            <motion.p
              id={`${inputId}-success`}
              className="text-green-400 text-sm flex items-center space-x-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </motion.p>
          )}
          
          {helper && !error && !success && (
            <p id={`${inputId}-helper`} className="text-dark-muted text-sm">
              {helper}
            </p>
          )}
        </div>
      </div>
    );
  }
);

ModernInput.displayName = 'ModernInput';

// Specialized input variants
export const EmailInput = forwardRef<HTMLInputElement, Omit<ModernInputProps, 'type'>>(
  (props, ref) => (
    <ModernInput
      ref={ref}
      type="email"
      placeholder="Enter your email address"
      {...props}
    />
  )
);

export const PasswordInput = forwardRef<HTMLInputElement, Omit<ModernInputProps, 'type' | 'showPasswordToggle'>>(
  (props, ref) => (
    <ModernInput
      ref={ref}
      type="password"
      showPasswordToggle
      placeholder="Enter your password"
      {...props}
    />
  )
);

export const SearchInput = forwardRef<HTMLInputElement, Omit<ModernInputProps, 'type'>>(
  ({ leftIcon, ...props }, ref) => (
    <ModernInput
      ref={ref}
      type="search"
      placeholder="Search..."
      leftIcon={leftIcon || <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
      {...props}
    />
  )
);

EmailInput.displayName = 'EmailInput';
PasswordInput.displayName = 'PasswordInput';
SearchInput.displayName = 'SearchInput';

export default ModernInput;