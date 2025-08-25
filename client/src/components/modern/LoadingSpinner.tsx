import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Heart, Activity } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'pulse' | 'dots' | 'health';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  if (variant === 'pulse') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-4 ${className}`} role="status" aria-label="Loading">
        <motion.div
          className={`bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full ${sizeClasses[size]}`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        {text && (
          <p className={`text-dark-muted ${textSizeClasses[size]} font-medium`}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-4 ${className}`} role="status" aria-label="Loading">
        <div className="flex space-x-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        {text && (
          <p className={`text-dark-muted ${textSizeClasses[size]} font-medium`}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'health') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-4 ${className}`} role="status" aria-label="Loading health data">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className={`${sizeClasses[size]}`}
          >
            <Activity className="w-full h-full text-primary-500" />
          </motion.div>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Heart className="w-4 h-4 text-red-500" />
          </motion.div>
        </div>
        {text && (
          <p className={`text-dark-muted ${textSizeClasses[size]} font-medium`}>
            {text}
          </p>
        )}
      </div>
    );
  }

  // Default spinner
  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`} role="status" aria-label="Loading">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`${sizeClasses[size]}`}
      >
        <Loader2 className="w-full h-full text-primary-500" />
      </motion.div>
      {text && (
        <p className={`text-dark-muted ${textSizeClasses[size]} font-medium`}>
          {text}
        </p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Full page loading component
export const FullPageLoader: React.FC<{ text?: string }> = ({ text = "Loading BioVerse..." }) => {
  return (
    <div className="fixed inset-0 bg-dark-background/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <img src="/bio.png" alt="BioVerse" className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
            BioVerse
          </h2>
        </motion.div>
        
        <LoadingSpinner variant="health" size="lg" text={text} />
        
        <motion.div
          className="mt-8 flex justify-center space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1, 2, 3, 4].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
              animate={{
                scaleX: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingSpinner;