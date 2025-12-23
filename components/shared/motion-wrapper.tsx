'use client'

import { motion, useInView, AnimatePresence, Variants } from 'framer-motion'
import { useRef, ReactNode } from 'react'
import {
  fadeInUp,
  fadeInScale,
  staggerContainer,
  staggerContainerFast,
  cardHover,
  cardTap,
  springConfig,
  sectionReveal,
  float,
} from '@/lib/animations'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  once?: boolean
}

// Scroll-triggered section reveal with fade-in-up effect
export function AnimatedSection({
  children,
  className = '',
  delay = 0,
  once = true,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={sectionReveal}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  index?: number
  enableHover?: boolean
  enable3D?: boolean
}

// Animated card with hover effects and optional 3D tilt
export function AnimatedCard({
  children,
  className = '',
  index = 0,
  enableHover = true,
  enable3D = false,
}: AnimatedCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enable3D || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    ref.current.style.transform = `perspective(1000px) rotateX(${y * -10}deg) rotateY(${x * 10}deg) scale(1.02)`
  }

  const handleMouseLeave = () => {
    if (!enable3D || !ref.current) return
    ref.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'
  }

  return (
    <motion.div
      ref={ref}
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.1 }}
      whileHover={enableHover ? cardHover : undefined}
      whileTap={enableHover ? cardTap : undefined}
      onMouseMove={enable3D ? handleMouseMove : undefined}
      onMouseLeave={enable3D ? handleMouseLeave : undefined}
      className={`${className} ${enable3D ? 'transition-transform duration-200 ease-out' : ''}`}
      style={enable3D ? { transformStyle: 'preserve-3d' } : undefined}
    >
      {children}
    </motion.div>
  )
}

interface StaggerChildrenProps {
  children: ReactNode
  className?: string
  fast?: boolean
}

// Container that staggers the animation of its children
export function StaggerChildren({
  children,
  className = '',
  fast = false,
}: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fast ? staggerContainerFast : staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
}

// Individual item within a stagger container
export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  return (
    <motion.div variants={fadeInUp} className={className}>
      {children}
    </motion.div>
  )
}

interface FloatingElementProps {
  children: ReactNode
  className?: string
  duration?: number
  distance?: number
}

// Floating animation for decorative elements
export function FloatingElement({
  children,
  className = '',
  duration = 4,
  distance = 10,
}: FloatingElementProps) {
  return (
    <motion.div
      animate={{
        y: [-distance / 2, distance / 2, -distance / 2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
}

// Animated number counter
export function AnimatedCounter({
  value,
  duration = 1,
  className = '',
  prefix = '',
  suffix = '',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
    >
      {isInView && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {prefix}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {value.toLocaleString()}
          </motion.span>
          {suffix}
        </motion.span>
      )}
    </motion.span>
  )
}

interface AnimatedBadgeProps {
  children: ReactNode
  className?: string
  pulse?: boolean
}

// Animated badge with optional pulse effect
export function AnimatedBadge({
  children,
  className = '',
  pulse = false,
}: AnimatedBadgeProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springConfig.bouncy}
      className={className}
    >
      <motion.span
        animate={pulse ? { scale: [1, 1.05, 1] } : undefined}
        transition={pulse ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : undefined}
        className="inline-block"
      >
        {children}
      </motion.span>
    </motion.span>
  )
}

interface AnimatedButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
}

// Motion-enhanced button wrapper
export function AnimatedButton({
  children,
  className = '',
  onClick,
  disabled = false,
  loading = false,
}: AnimatedButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={disabled ? undefined : { scale: 1.02, boxShadow: '0 4px 12px rgba(30, 58, 95, 0.2)' }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={springConfig.snappy}
      className={className}
    >
      {children}
    </motion.button>
  )
}

interface AnimatedListProps {
  children: ReactNode
  className?: string
}

// Animated list with staggered item entrance
export function AnimatedList({ children, className = '' }: AnimatedListProps) {
  return (
    <motion.ul
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.ul>
  )
}

interface AnimatedListItemProps {
  children: ReactNode
  className?: string
}

export function AnimatedListItem({ children, className = '' }: AnimatedListItemProps) {
  return (
    <motion.li variants={fadeInUp} className={className}>
      {children}
    </motion.li>
  )
}

interface SlideInProps {
  children: ReactNode
  className?: string
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
}

// Slide-in animation from any direction
export function SlideIn({
  children,
  className = '',
  direction = 'up',
  delay = 0,
}: SlideInProps) {
  const variants: Record<string, Variants> = {
    left: {
      hidden: { x: -50, opacity: 0 },
      visible: { x: 0, opacity: 1 },
    },
    right: {
      hidden: { x: 50, opacity: 0 },
      visible: { x: 0, opacity: 1 },
    },
    up: {
      hidden: { y: 50, opacity: 0 },
      visible: { y: 0, opacity: 1 },
    },
    down: {
      hidden: { y: -50, opacity: 0 },
      visible: { y: 0, opacity: 1 },
    },
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={variants[direction]}
      transition={{ ...springConfig.gentle, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Export AnimatePresence for convenience
export { AnimatePresence, motion }
