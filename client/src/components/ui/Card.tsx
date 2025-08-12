import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'neon' | 'medical';
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  variant = 'default',
  hover = true,
  glow = false,
  onClick 
}) => {
  const baseClasses = "rounded-2xl border transition-all duration-300";
  
  const variants = {
    default: "bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl",
    glass: "bg-white/10 backdrop-blur-2xl border-white/20 shadow-2xl",
    gradient: "bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-gradient-to-r from-blue-500/30 to-purple-500/30 shadow-2xl",
    neon: "bg-black/50 border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.3)]",
    medical: "bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 border-emerald-400/20 shadow-xl"
  };

  const hoverEffects = hover ? {
    default: "hover:bg-white/10 hover:border-white/20 hover:shadow-3xl hover:scale-[1.02]",
    glass: "hover:bg-white/15 hover:border-white/30 hover:shadow-3xl hover:scale-[1.02]",
    gradient: "hover:shadow-3xl hover:scale-[1.02]",
    neon: "hover:border-cyan-400/80 hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] hover:scale-[1.02]",
    medical: "hover:border-emerald-400/40 hover:shadow-2xl hover:scale-[1.02]"
  } : {};

  const glowEffect = glow ? "animate-pulse-glow" : "";

  return (
    <motion.div
      className={cn(
        baseClasses,
        variants[variant],
        hoverEffects[variant],
        glowEffect,
        onClick ? "cursor-pointer" : "",
        className
      )}
      onClick={onClick}
      whileHover={hover ? { y: -4 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default Card;