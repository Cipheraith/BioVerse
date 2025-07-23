// Enhanced animation utilities for beautiful UI transitions
import { Variants } from 'framer-motion';

// Container animations
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

export const fadeInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

export const fadeInRightVariants: Variants = {
  hidden: { opacity: 0, x: 100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
};

export const slideInFromBottomVariants: Variants = {
  hidden: { opacity: 0, y: 100, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 20,
    },
  },
};

// Card hover animations
export const cardHoverVariants = {
  rest: { scale: 1, rotateY: 0 },
  hover: {
    scale: 1.05,
    rotateY: 5,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
};

export const cardHoverGlowVariants = {
  rest: { 
    boxShadow: '0 4px 24px 0 rgba(24, 28, 36, 0.8)',
    borderColor: 'rgba(45, 51, 74, 0.6)',
  },
  hover: {
    boxShadow: '0 20px 60px 0 rgba(67, 233, 123, 0.3), 0 0 40px rgba(90, 103, 216, 0.2)',
    borderColor: 'rgba(67, 233, 123, 0.6)',
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
};

// Loading animations
export const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const spinVariants: Variants = {
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Page transition animations
export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, x: -200, scale: 0.8 },
  in: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  },
  out: {
    opacity: 0,
    x: 200,
    scale: 0.8,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  },
};

// Netflix-style infinite scroll animations
export const infiniteScrollVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.1,
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  }),
};

// Floating animation for hero elements
export const floatingVariants: Variants = {
  floating: {
    y: [-20, -10, -20],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Stagger animations for lists
export const listStaggerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -30, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 15,
    },
  },
};

// Glassmorphism effect variants
export const glassVariants = {
  rest: {
    background: 'rgba(35, 41, 70, 0.8)',
    backdropFilter: 'blur(20px)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  hover: {
    background: 'rgba(35, 41, 70, 0.9)',
    backdropFilter: 'blur(30px)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};
