import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-base font-semibold ring-offset-background transition-all duration-200 ease-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'bg-trust-blue-600 text-white hover:bg-trust-blue-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-trust-blue-600/25 active:translate-y-0 active:bg-trust-blue-700 after:absolute after:inset-0 after:bg-white/0 hover:after:bg-white/10 after:transition-colors',
        destructive:
          'bg-red-600 text-white hover:bg-red-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-600/25 active:translate-y-0',
        outline:
          'border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm active:bg-gray-100',
        secondary:
          'bg-gray-100 text-gray-900 hover:bg-gray-200 hover:shadow-sm',
        ghost:
          'text-trust-blue-600 hover:bg-trust-blue-50 hover:text-trust-blue-700',
        link:
          'text-trust-blue-600 underline-offset-4 hover:underline hover:text-trust-blue-700',
        gradient:
          'bg-gradient-to-r from-trust-blue-600 to-trust-blue-500 text-white hover:from-trust-blue-500 hover:to-trust-blue-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-trust-blue-600/30 active:translate-y-0',
        success:
          'bg-success-green-600 text-white hover:bg-success-green-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-success-green-600/25 active:translate-y-0',
        glass:
          'bg-white/80 backdrop-blur-sm border border-white/20 text-gray-900 hover:bg-white/90 hover:shadow-lg',
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-9 rounded-md px-4 text-sm',
        lg: 'h-14 rounded-xl px-8 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8 rounded-md',
        'icon-lg': 'h-12 w-12 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, loadingText, children, disabled, ...props }, ref) => {
    // When asChild is true, we can't use loading state since Slot expects a single child
    if (asChild && !isLoading) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {isLoading && loadingText ? loadingText : children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
