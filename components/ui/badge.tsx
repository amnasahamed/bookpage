import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-caption font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-trust-blue-50 text-trust-blue-600 border border-trust-blue-100',
        secondary:
          'bg-gray-100 text-gray-700 border border-gray-200',
        success:
          'bg-success-green-50 text-success-green-600 border border-success-green-200',
        warning:
          'bg-warning-amber-100 text-warning-amber-600 border border-warning-amber-200',
        destructive:
          'bg-red-50 text-red-600 border border-red-200',
        info:
          'bg-purple-50 text-purple-600 border border-purple-200',
        hold:
          'bg-orange-50 text-orange-600 border border-orange-200',
        outline:
          'border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
        gradient:
          'bg-gradient-to-r from-trust-blue-600 to-trust-blue-500 text-white border-0 shadow-sm',
        'gradient-success':
          'bg-gradient-to-r from-success-green-600 to-success-green-500 text-white border-0 shadow-sm',
        pill:
          'bg-gray-900 text-white px-4 py-1.5 font-semibold',
        ghost:
          'bg-transparent text-gray-600 hover:bg-gray-100',
      },
      size: {
        default: 'px-3 py-1',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-4 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean
}

function Badge({ className, variant, size, pulse = false, ...props }: BadgeProps) {
  return (
    <div 
      className={cn(
        badgeVariants({ variant, size }), 
        pulse && 'badge-pulse',
        className
      )} 
      {...props} 
    />
  )
}

export { Badge, badgeVariants }