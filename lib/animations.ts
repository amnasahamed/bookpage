'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// Hook for scroll-triggered animations
export function useScrollAnimation<T extends HTMLElement>(
  options: IntersectionObserverInit = { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
) {
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      options
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [options])

  return { ref, isVisible }
}

// Hook for staggered animations
export function useStaggerAnimation(itemCount: number, baseDelay: number = 50) {
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(itemCount).fill(false))
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Trigger staggered animations
            for (let i = 0; i < itemCount; i++) {
              setTimeout(() => {
                setVisibleItems((prev) => {
                  const newState = [...prev]
                  newState[i] = true
                  return newState
                })
              }, i * baseDelay)
            }
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [itemCount, baseDelay])

  return { containerRef, visibleItems }
}

// Hook for animated counter
export function useCountUp(
  end: number,
  duration: number = 1500,
  start: number = 0
) {
  const [count, setCount] = useState(start)
  const [isAnimating, setIsAnimating] = useState(false)

  const startAnimation = useCallback(() => {
    if (isAnimating || end === start) return
    
    setIsAnimating(true)
    let startTime: number | null = null
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentCount = Math.floor(easeOut * (end - start) + start)
      
      setCount(currentCount)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [end, duration, start, isAnimating])

  return { count, startAnimation, isAnimating }
}

// Hook for parallax effect
export function useParallax(speed: number = 0.5) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const scrolled = window.scrollY
      const elementTop = rect.top + scrolled
      const relativeScroll = scrolled - elementTop + window.innerHeight
      setOffset(relativeScroll * speed)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [speed])

  return { ref, offset }
}

// Hook for reduced motion preference
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

// Animation variants for Framer Motion (if used)
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] }
  }
}

export const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] }
  }
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

export const slideInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] }
  }
}

// Utility to generate stagger delay class
export function getStaggerDelayClass(index: number, baseDelay: number = 50): string {
  const delayMs = index * baseDelay
  return `[animation-delay:${delayMs}ms]`
}

// Spring animation config
export const springConfig = {
  type: 'spring',
  stiffness: 300,
  damping: 30
}

// Easing functions
export const easings = {
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55]
} as const
