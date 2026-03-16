'use client'

import * as React from 'react'
import {
  Provider,
  Viewport,
  Root,
  Title,
  Description,
  Action,
  Close,
} from '@radix-ui/react-toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastProvider = Provider
const ToastViewport = Viewport
const ToastRoot = Root
const ToastTitle = Title
const ToastDescription = Description
const ToastAction = Action
const ToastClose = Close

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border border-gray-200 p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-white text-gray-950',
        destructive:
          'destructive group border-red-200 bg-red-50 text-red-600',
        success:
          'border-success-green-200 bg-success-green-50 text-success-green-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastRoot>,
  React.ComponentPropsWithoutRef<typeof ToastRoot> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastRoot
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = 'Toast'

const Toaster = ({ toasts, onRemove }: { toasts: any[]; onRemove: (id: string) => void }) => {
  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant, ...props }) => (
        <Toast key={id} variant={variant} onOpenChange={(open) => !open && onRemove(id)} {...props}>
          <div className="grid gap-1">
            {title && <ToastTitle className="text-sm font-semibold">{title}</ToastTitle>}
            {description && (
              <ToastDescription className="text-sm opacity-90">
                {description}
              </ToastDescription>
            )}
          </div>
          {action && <ToastAction altText="Action">{action}</ToastAction>}
          <ToastClose className="absolute right-2 top-2 rounded-md p-1 text-gray-400 opacity-0 transition-opacity hover:text-gray-900 group-hover:opacity-100">
            <X className="h-4 w-4" />
          </ToastClose>
        </Toast>
      ))}
      <ToastViewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
    </ToastProvider>
  )
}

export {
  ToastProvider,
  ToastViewport,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  Toast,
  Toaster,
}
