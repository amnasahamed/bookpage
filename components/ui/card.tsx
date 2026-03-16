import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'gradient' | 'glass' | 'bordered' | 'elevated'
    hover?: boolean
  }
>(({ className, variant = 'default', hover = false, ...props }, ref) => {
  const variantStyles = {
    default:
      'rounded-xl bg-white text-gray-900 shadow-md transition-all duration-300 ease-default',
    gradient:
      'rounded-xl border-0 bg-gradient-to-br from-white to-gray-50 text-gray-900 shadow-lg',
    glass:
      'rounded-xl border border-white/20 bg-white/80 backdrop-blur-md text-gray-900 shadow-lg',
    bordered:
      'rounded-xl border-2 border-gray-100 bg-white text-gray-900 shadow-sm',
    elevated:
      'rounded-xl bg-white text-gray-900 shadow-xl shadow-gray-200/50',
  }

  return (
    <div
      ref={ref}
      className={cn(
        variantStyles[variant],
        hover &&
          'hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/50 cursor-pointer',
        className
      )}
      {...props}
    />
  )
})
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-card-title leading-none tracking-tight', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-body-sm text-gray-500', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
}
