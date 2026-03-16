import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HoldBadgeProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  expiresAt?: string | null
}

export function HoldBadge({
  className,
  size = 'md',
  showIcon = true,
  expiresAt,
}: HoldBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-caption',
    lg: 'px-4 py-1.5 text-sm',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  }

  // Calculate time remaining if expiresAt is provided
  const getTimeRemaining = () => {
    if (!expiresAt) return null
    
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffMs = expiry.getTime() - now.getTime()
    
    if (diffMs <= 0) return 'Expired'
    
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) {
      const diffMinutes = Math.ceil(diffMs / (1000 * 60))
      return `${diffMinutes}m left`
    }
    
    return `${diffHours}h left`
  }

  const timeRemaining = getTimeRemaining()

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-hold-orange/10 text-hold-orange font-medium',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Clock className={iconSizes[size]} />}
      <span>On Hold</span>
      {timeRemaining && (
        <span className="opacity-75">({timeRemaining})</span>
      )}
    </span>
  )
}
