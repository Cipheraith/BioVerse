import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ChevronDown, X, Check, AlertCircle, Info } from 'lucide-react';

// Modern Button Component - Minimalistic with consistent charcoal colors
interface ModernButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = ''
}) => {
  const baseClasses = 'relative font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-charcoal-500/30 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-charcoal-500 to-charcoal-600 hover:from-charcoal-600 hover:to-charcoal-700 text-white shadow-sm hover:shadow-md hover:shadow-charcoal-500/20',
    secondary: 'bg-transparent border border-charcoal-600 text-gray-300 hover:bg-charcoal-900 hover:text-gray-300 hover:border-charcoal-500',
    ghost: 'text-gray-300 hover:text-gray-300 hover:bg-charcoal-900/50',
    danger: 'bg-gradient-to-r from-danger-500 to-danger-600 hover:from-danger-600 hover:to-danger-700 text-white shadow-sm hover:shadow-md hover:shadow-danger-500/20'
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      whileHover={{ scale: disabled ? 1 : 1.01, y: disabled ? 0 : -1 }}
      whileTap={{ scale: disabled ? 1 : 0.99, y: 0 }}
    >
      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Button Content */}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </motion.button>
  );
};

// Modern Input Component - Clean and minimalistic
interface ModernInputProps {
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const ModernInput: React.FC<ModernInputProps> = ({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = '',
  icon
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
          {required && <span className="text-danger-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300">
            {icon}
          </div>
        )}
        
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full ${icon ? 'pl-12' : 'pl-4'} ${type === 'password' ? 'pr-12' : 'pr-4'} py-3 bg-dark-input border border-dark-border rounded-lg text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-charcoal-500/30 focus:border-charcoal-500 transition-all duration-200 ${
            error ? 'border-danger-500 focus:ring-danger-500/30' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-gray-300 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
        
        {/* Subtle Focus Ring Effect */}
        <motion.div
          className="absolute inset-0 rounded-lg border border-charcoal-500/30 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: isFocused ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
        />
      </div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-danger-400 flex items-center space-x-1"
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
};

// Modern Card Component - Clean and minimal
interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  className = '',
  hover = false,
  glass = true,
  padding = 'md'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const baseClasses = `relative rounded-xl border border-dark-border transition-all duration-200 ${paddingClasses[padding]}`;
  const glassClasses = glass ? 'bg-dark-card/80 backdrop-blur-sm' : 'bg-dark-card';
  const hoverClasses = hover ? 'hover:border-dark-border-light hover:bg-dark-surface hover:shadow-lg hover:shadow-black/20' : '';
  
  return (
    <motion.div
      className={`${baseClasses} ${glassClasses} ${hoverClasses} ${className}`}
      whileHover={hover ? { y: -1 } : undefined}
    >
      {children}
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-charcoal-500/3 via-transparent to-charcoal-300/3 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
    </motion.div>
  );
};

// Modern Select Component - Minimalistic dropdown
interface ModernSelectProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const ModernSelect: React.FC<ModernSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  error,
  disabled = false,
  required = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);
  
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
          {required && <span className="text-danger-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-4 py-3 bg-dark-input border border-dark-border rounded-lg text-left text-gray-300 focus:outline-none focus:ring-2 focus:ring-charcoal-500/30 focus:border-charcoal-500 transition-all duration-200 flex items-center justify-between ${
            error ? 'border-danger-500 focus:ring-danger-500/30' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-dark-surface'}`}
        >
          <span className={selectedOption ? 'text-gray-300' : 'text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            className={`w-5 h-5 text-gray-300 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-2 bg-dark-card backdrop-blur-xl border border-dark-border rounded-lg shadow-xl max-h-60 overflow-auto"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange?.(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-gray-300 hover:bg-dark-surface transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    value === option.value ? 'bg-charcoal-600/20 text-gray-300' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Click outside to close */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-danger-400 flex items-center space-x-1"
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
};

// Modern Checkbox Component - Clean and minimal
interface ModernCheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const ModernCheckbox: React.FC<ModernCheckboxProps> = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && onChange?.(!checked)}
        disabled={disabled}
        className={`relative w-5 h-5 rounded border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-charcoal-500/30 ${
          checked 
            ? 'bg-charcoal-600 border-charcoal-600' 
            : 'bg-transparent border-charcoal-600 hover:border-charcoal-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Check size={12} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
      
      {label && (
        <label 
          className={`text-gray-300 select-none ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          onClick={() => !disabled && onChange?.(!checked)}
        >
          {label}
        </label>
      )}
    </div>
  );
};

// Modern Modal Component - Clean and minimal
interface ModernModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ModernModal: React.FC<ModernModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed inset-0 z-50 flex items-center justify-center p-4`}
          >
            <div className={`relative w-full ${sizeClasses[size]} bg-dark-card backdrop-blur-xl border border-dark-border rounded-xl shadow-2xl max-h-[90vh] overflow-hidden`}>
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between p-6 border-b border-dark-border">
                  <h3 className="text-xl font-semibold text-gray-300">{title}</h3>
                  <button
                    onClick={onClose}
                    className="text-gray-300 hover:text-gray-300 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              )}
              
              {/* Content */}
              <div className="p-6 overflow-y-auto">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Modern Alert Component - Subtle and clean
interface ModernAlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const ModernAlert: React.FC<ModernAlertProps> = ({
  type,
  title,
  message,
  onClose,
  className = ''
}) => {
  const typeConfig = {
    success: {
      icon: Check,
      bgColor: 'bg-success-500/10',
      borderColor: 'border-success-500/20',
      iconColor: 'text-success-400',
      textColor: 'text-success-300'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-danger-500/10',
      borderColor: 'border-danger-500/20',
      iconColor: 'text-danger-400',
      textColor: 'text-danger-300'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-warning-500/10',
      borderColor: 'border-warning-500/20',
      iconColor: 'text-warning-400',
      textColor: 'text-warning-300'
    },
    info: {
      icon: Info,
      bgColor: 'bg-info-500/10',
      borderColor: 'border-info-500/20',
      iconColor: 'text-info-400',
      textColor: 'text-info-300'
    }
  };
  
  const config = typeConfig[type];
  const IconComponent = config.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start space-x-3 p-4 rounded-lg border backdrop-blur-sm ${config.bgColor} ${config.borderColor} ${className}`}
    >
      <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={`font-semibold ${config.textColor}`}>{title}</h4>
        )}
        <p className={`text-sm ${title ? 'mt-1' : ''} ${config.textColor}`}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`${config.iconColor} hover:opacity-70 transition-opacity`}
        >
          <X size={20} />
        </button>
      )}
    </motion.div>
  );
};

export default {
  ModernButton,
  ModernInput,
  ModernCard,
  ModernSelect,
  ModernCheckbox,
  ModernModal,
  ModernAlert
};
