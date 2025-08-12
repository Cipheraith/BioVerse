import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface GlowingOrbProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'purple' | 'green' | 'red' | 'yellow' | 'cyan' | 'pink';
  intensity?: 'low' | 'medium' | 'high';
  pulse?: boolean;
  float?: boolean;
  className?: string;
}

const GlowingOrb: React.FC<GlowingOrbProps> = ({
  size = 'md',
  color = 'blue',
  intensity = 'medium',
  pulse = true,
  float = true,
  className
}) => {
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  const colors = {
    blue: {
      bg: 'bg-blue-500',
      glow: 'shadow-[0_0_50px_rgba(59,130,246,0.5)]',
      glowHigh: 'shadow-[0_0_100px_rgba(59,130,246,0.8)]'
    },
    purple: {
      bg: 'bg-purple-500',
      glow: 'shadow-[0_0_50px_rgba(147,51,234,0.5)]',
      glowHigh: 'shadow-[0_0_100px_rgba(147,51,234,0.8)]'
    },
    green: {
      bg: 'bg-emerald-500',
      glow: 'shadow-[0_0_50px_rgba(16,185,129,0.5)]',
      glowHigh: 'shadow-[0_0_100px_rgba(16,185,129,0.8)]'
    },
    red: {
      bg: 'bg-red-500',
      glow: 'shadow-[0_0_50px_rgba(239,68,68,0.5)]',
      glowHigh: 'shadow-[0_0_100px_rgba(239,68,68,0.8)]'
    },
    yellow: {
      bg: 'bg-yellow-500',
      glow: 'shadow-[0_0_50px_rgba(234,179,8,0.5)]',
      glowHigh: 'shadow-[0_0_100px_rgba(234,179,8,0.8)]'
    },
    cyan: {
      bg: 'bg-cyan-500',
      glow: 'shadow-[0_0_50px_rgba(6,182,212,0.5)]',
      glowHigh: 'shadow-[0_0_100px_rgba(6,182,212,0.8)]'
    },
    pink: {
      bg: 'bg-pink-500',
      glow: 'shadow-[0_0_50px_rgba(236,72,153,0.5)]',
      glowHigh: 'shadow-[0_0_100px_rgba(236,72,153,0.8)]'
    }
  };

  const getGlowIntensity = () => {
    switch (intensity) {
      case 'low': return colors[color].glow.replace('0.5', '0.3');
      case 'high': return colors[color].glowHigh;
      default: return colors[color].glow;
    }
  };

  return (
    <motion.div
      className={cn(
        "rounded-full blur-sm opacity-80",
        sizes[size],
        colors[color].bg,
        getGlowIntensity(),
        className
      )}
      animate={{
        scale: pulse ? [1, 1.2, 1] : 1,
        y: float ? [-10, 10, -10] : 0,
        opacity: pulse ? [0.6, 1, 0.6] : 0.8
      }}
      transition={{
        scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }}
    />
  );
};

export default GlowingOrb;