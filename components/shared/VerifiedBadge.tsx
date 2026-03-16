import { CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerifiedBadgeProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export function VerifiedBadge({
  className,
  size = 'md',
  showIcon = true,
}: VerifiedBadgeProps) {
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

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-success-green-50 text-success-green-600 font-medium',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <CheckCircle className={iconSizes[size]} />}
      <span>Verified</span>
    </span>
  )
}
