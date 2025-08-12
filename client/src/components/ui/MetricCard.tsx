import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  status?: 'normal' | 'warning' | 'critical' | 'excellent';
  className?: string;
  animated?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  change,
  changeType,
  icon,
  status = 'normal',
  className,
  animated = true
}) => {
  const statusColors = {
    excellent: 'from-emerald-500/20 to-teal-500/20 border-emerald-400/30',
    normal: 'from-blue-500/20 to-cyan-500/20 border-blue-400/30',
    warning: 'from-amber-500/20 to-orange-500/20 border-amber-400/30',
    critical: 'from-red-500/20 to-pink-500/20 border-red-400/30'
  };

  const statusTextColors = {
    excellent: 'text-emerald-400',
    normal: 'text-blue-400',
    warning: 'text-amber-400',
    critical: 'text-red-400'
  };

  const statusIconColors = {
    excellent: 'text-emerald-500',
    normal: 'text-blue-500',
    warning: 'text-amber-500',
    critical: 'text-red-500'
  };

  const getTrendIcon = () => {
    if (!change) return null;
    
    if (changeType === 'increase') return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (changeType === 'decrease') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (changeType === 'increase') return 'text-emerald-400';
    if (changeType === 'decrease') return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <motion.div
      className={cn(
        "relative p-6 rounded-2xl bg-gradient-to-br backdrop-blur-xl border shadow-xl",
        statusColors[status],
        "hover:scale-[1.02] transition-all duration-300",
        className
      )}
      initial={animated ? { opacity: 0, y: 20, scale: 0.9 } : {}}
      animate={animated ? { opacity: 1, y: 0, scale: 1 } : {}}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-50" />
      
      {/* Header */}
      <div className="relative flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
          {title}
        </h3>
        {icon && (
          <div className={cn("p-2 rounded-lg bg-white/10", statusIconColors[status])}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="relative mb-2">
        <div className="flex items-baseline space-x-2">
          <motion.span
            className={cn("text-3xl font-bold", statusTextColors[status])}
            initial={animated ? { scale: 0 } : {}}
            animate={animated ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            {value}
          </motion.span>
          {unit && (
            <span className="text-lg text-gray-400 font-medium">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Trend */}
      {change !== undefined && (
        <div className="relative flex items-center space-x-2">
          {getTrendIcon()}
          <span className={cn("text-sm font-medium", getTrendColor())}>
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-gray-500">vs last period</span>
        </div>
      )}

      {/* Status indicator */}
      <div className="absolute top-4 right-4">
        <div className={cn(
          "w-3 h-3 rounded-full",
          status === 'excellent' && "bg-emerald-400 animate-pulse",
          status === 'normal' && "bg-blue-400",
          status === 'warning' && "bg-amber-400 animate-pulse",
          status === 'critical' && "bg-red-400 animate-pulse"
        )} />
      </div>

      {/* Animated border */}
      <div className="absolute inset-0 rounded-2xl">
        <div className={cn(
          "absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300",
          "bg-gradient-to-r from-transparent via-white/10 to-transparent",
          "animate-pulse"
        )} />
      </div>
    </motion.div>
  );
};

export default MetricCard;