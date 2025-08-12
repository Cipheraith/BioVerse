import React from 'react';
import { motion } from 'framer-motion';

interface FloatingParticlesProps {
  count?: number;
  colors?: string[];
  size?: 'sm' | 'md' | 'lg';
  speed?: 'slow' | 'medium' | 'fast';
}

const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  count = 20,
  colors = ['cyan', 'blue', 'purple', 'pink'],
  size = 'md',
  speed = 'medium'
}) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  const speedValues = {
    slow: { duration: 20, delay: 10 },
    medium: { duration: 15, delay: 8 },
    fast: { duration: 10, delay: 5 }
  };

  const colorClasses = {
    cyan: 'bg-cyan-400',
    blue: 'bg-blue-400',
    purple: 'bg-purple-400',
    pink: 'bg-pink-400',
    green: 'bg-green-400',
    orange: 'bg-orange-400'
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(count)].map((_, i) => {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const randomX = Math.random() * 100;
        const randomY = Math.random() * 100;
        const randomDelay = Math.random() * speedValues[speed].delay;
        
        return (
          <motion.div
            key={i}
            className={`absolute rounded-full ${sizeClasses[size]} ${colorClasses[color as keyof typeof colorClasses]} opacity-60`}
            initial={{
              x: `${randomX}vw`,
              y: `${randomY}vh`,
              scale: 0,
              opacity: 0
            }}
            animate={{
              y: [
                `${randomY}vh`,
                `${randomY - 20}vh`,
                `${randomY + 10}vh`,
                `${randomY - 30}vh`
              ],
              x: [
                `${randomX}vw`,
                `${randomX + 10}vw`,
                `${randomX - 5}vw`,
                `${randomX + 15}vw`
              ],
              scale: [0, 1, 1.2, 0.8, 1, 0],
              opacity: [0, 0.6, 1, 0.8, 0.4, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: speedValues[speed].duration,
              repeat: Infinity,
              delay: randomDelay,
              ease: "easeInOut"
            }}
          />
        );
      })}
    </div>
  );
};

export default FloatingParticles;