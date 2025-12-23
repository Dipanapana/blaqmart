import { Variants, Transition } from 'framer-motion'

// Spring configurations for natural-feeling animations
export const springConfig = {
  gentle: { type: 'spring', stiffness: 120, damping: 14 },
  snappy: { type: 'spring', stiffness: 300, damping: 20 },
  bouncy: { type: 'spring', stiffness: 400, damping: 10 },
  smooth: { type: 'spring', stiffness: 100, damping: 20 },
} as const

// Transition presets
export const transitions = {
  fast: { duration: 0.2, ease: 'easeOut' },
  normal: { duration: 0.3, ease: 'easeOut' },
  slow: { duration: 0.5, ease: 'easeOut' },
  bounce: { type: 'spring', stiffness: 500, damping: 15 },
} as const

// Fade animations
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.normal },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...transitions.normal, duration: 0.4 }
  },
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.normal
  },
}

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.normal
  },
}

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.normal
  },
}

// Scale animations
export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springConfig.gentle
  },
}

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springConfig.bouncy
  },
}

export const scaleOnHover = {
  scale: 1.02,
  transition: springConfig.snappy,
}

export const scaleOnTap = {
  scale: 0.98,
}

// Container for staggered children animations
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
}

// Card animations
export const cardHover = {
  y: -8,
  scale: 1.02,
  boxShadow: '0 20px 40px rgba(30, 58, 95, 0.15)',
  transition: springConfig.gentle,
}

export const cardTap = {
  scale: 0.98,
  boxShadow: '0 5px 15px rgba(30, 58, 95, 0.1)',
}

// 3D tilt effect for cards
export const calculate3DTilt = (
  clientX: number,
  clientY: number,
  rect: DOMRect,
  intensity: number = 10
) => {
  const x = (clientX - rect.left) / rect.width - 0.5
  const y = (clientY - rect.top) / rect.height - 0.5
  return {
    rotateX: y * -intensity,
    rotateY: x * intensity,
  }
}

// Badge animations
export const badgePop: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springConfig.bouncy
  },
}

export const badgePulse = {
  scale: [1, 1.1, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
}

// Button animations
export const buttonHover = {
  scale: 1.02,
  boxShadow: '0 4px 12px rgba(30, 58, 95, 0.2)',
  transition: springConfig.snappy,
}

export const buttonTap = {
  scale: 0.98,
}

// Slide animations
export const slideInFromRight: Variants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: springConfig.gentle
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.2 }
  },
}

export const slideInFromLeft: Variants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: springConfig.gentle
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: { duration: 0.2 }
  },
}

export const slideInFromBottom: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: springConfig.gentle
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: 0.2 }
  },
}

// Float animation for decorative elements
export const float: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// Shimmer loading effect
export const shimmer: Variants = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// Success checkmark draw animation
export const drawCheckmark: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: 'easeOut' },
      opacity: { duration: 0.1 },
    },
  },
}

// Counter animation helper
export const createCounterVariants = (from: number, to: number): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
})

// Page transition variants
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3, ease: 'easeIn' }
  },
}

// Scroll-triggered section reveal
export const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

// Gradient background animation
export const gradientShift = {
  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
  transition: {
    duration: 10,
    repeat: Infinity,
    ease: 'linear',
  },
}

// Reduced motion variants (accessibility)
export const reducedMotion: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.1 } },
}

// Helper to check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Get appropriate variants based on motion preference
export const getMotionVariants = (
  variants: Variants,
  fallback: Variants = reducedMotion
): Variants => {
  if (typeof window === 'undefined') return variants
  return prefersReducedMotion() ? fallback : variants
}
