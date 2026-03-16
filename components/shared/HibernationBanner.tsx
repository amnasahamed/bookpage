'use client'

import { Moon, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface HibernationBannerProps {
  className?: string
  onReactivate?: () => void
  dismissible?: boolean
}

export function HibernationBanner({
  className,
  onReactivate,
  dismissible = true,
}: HibernationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  return (
    <div
      className={cn(
        'relative bg-warning-amber-100 border-l-4 border-warning-amber-500 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Moon className="h-5 w-5 text-warning-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-warning-amber-800">
            Your page is in hibernation mode
          </h4>
          <p className="mt-1 text-sm text-warning-amber-700">
            Your booking page is currently hidden from guests. Guests cannot view or request bookings while hibernating.
          </p>
          {onReactivate && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 border-warning-amber-500 text-warning-amber-700 hover:bg-warning-amber-200"
              onClick={onReactivate}
            >
              Reactivate Now
            </Button>
          )}
        </div>
        {dismissible && (
          <button
            onClick={() => setIsDismissed(true)}
            className="text-warning-amber-600 hover:text-warning-amber-800"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}
