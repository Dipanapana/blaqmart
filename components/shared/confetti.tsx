'use client'

import { useEffect, useCallback } from 'react'
import confetti from 'canvas-confetti'

// Brand colors for confetti
const BRAND_COLORS = ['#1E3A5F', '#FFB81C', '#22C55E', '#FFFFFF']

interface ConfettiOptions {
  particleCount?: number
  angle?: number
  spread?: number
  startVelocity?: number
  decay?: number
  gravity?: number
  drift?: number
  ticks?: number
  origin?: { x?: number; y?: number }
  colors?: string[]
  shapes?: string[]
  scalar?: number
  zIndex?: number
  disableForReducedMotion?: boolean
}

interface ConfettiProps {
  trigger?: boolean
  duration?: number
  particleCount?: number
}

// Full-page confetti explosion for celebrations
export function Confetti({
  trigger = true,
  duration = 3000,
  particleCount = 100,
}: ConfettiProps) {
  const fire = useCallback(() => {
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: BRAND_COLORS,
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: BRAND_COLORS,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    // Initial burst
    confetti({
      particleCount,
      spread: 70,
      origin: { y: 0.6 },
      colors: BRAND_COLORS,
    })

    frame()
  }, [duration, particleCount])

  useEffect(() => {
    if (trigger) {
      fire()
    }
  }, [trigger, fire])

  return null
}

// Single burst confetti from a specific point
export function ConfettiBurst({
  x = 0.5,
  y = 0.5,
  particleCount = 50,
}: {
  x?: number
  y?: number
  particleCount?: number
}) {
  useEffect(() => {
    confetti({
      particleCount,
      spread: 60,
      origin: { x, y },
      colors: BRAND_COLORS,
    })
  }, [x, y, particleCount])

  return null
}

// Fireworks effect for major celebrations
export function Fireworks({ duration = 5000 }: { duration?: number }) {
  useEffect(() => {
    const end = Date.now() + duration
    const colors = BRAND_COLORS

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }, [duration])

  return null
}

// School-themed confetti with stars and shapes
export function SchoolConfetti() {
  useEffect(() => {
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: BRAND_COLORS,
    }

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ['circle', 'square'],
      })

      confetti({
        ...defaults,
        particleCount: 20,
        scalar: 0.75,
        shapes: ['circle'],
      })
    }

    // Three bursts with slight delays
    shoot()
    setTimeout(shoot, 100)
    setTimeout(shoot, 200)
  }, [])

  return null
}

// Utility function to trigger confetti programmatically
export const triggerConfetti = (options?: ConfettiOptions) => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: BRAND_COLORS,
    ...options,
  })
}

// Trigger mini confetti from cart icon position
export const triggerCartConfetti = (element?: HTMLElement | null) => {
  if (!element) {
    triggerConfetti({ particleCount: 30, spread: 50, origin: { x: 0.9, y: 0.1 } })
    return
  }

  const rect = element.getBoundingClientRect()
  const x = (rect.left + rect.width / 2) / window.innerWidth
  const y = (rect.top + rect.height / 2) / window.innerHeight

  confetti({
    particleCount: 20,
    spread: 40,
    origin: { x, y },
    colors: BRAND_COLORS,
    startVelocity: 20,
    gravity: 0.8,
  })
}

// Success checkmark animation confetti
export const triggerSuccessConfetti = () => {
  const count = 200
  const defaults = {
    origin: { y: 0.7 },
    colors: BRAND_COLORS,
  }

  function fire(particleRatio: number, opts: ConfettiOptions) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    })
  }

  fire(0.25, { spread: 26, startVelocity: 55 })
  fire(0.2, { spread: 60 })
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
  fire(0.1, { spread: 120, startVelocity: 45 })
}

export default Confetti
