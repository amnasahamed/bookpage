'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/app/providers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Validation schema
const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/update-password`,
      })

      if (error) {
        throw error
      }

      setSubmittedEmail(data.email)
      setIsSuccess(true)
      addToast({
        title: 'Reset link sent',
        description: 'Check your email for the password reset link.',
        variant: 'success',
      })
    } catch (error: any) {
      addToast({
        title: 'Failed to send reset link',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Success State
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-[400px] animate-fade-in-up">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-success-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Check your email
            </h1>

            <p className="text-gray-600 mb-2">
              We&apos;ve sent a password reset link to:
            </p>

            <p className="font-semibold text-gray-900 mb-6">
              {submittedEmail}
            </p>

            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Click the link in the email to reset your password. If you don&apos;t see the email, check your spam folder.
              </p>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsSuccess(false)}
              >
                Didn&apos;t receive it? Try again
              </Button>

              <Link href="/login">
                <Button className="w-full mt-3">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to login
                </Button>
              </Link>
            </div>
          </div>

          {/* Help text */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Need help?{' '}
            <a
              href="mailto:support@bookpage.com"
              className="text-trust-blue-600 hover:underline font-medium"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    )
  }

  // Email Form State
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-[400px] animate-fade-in-up">
        {/* Back to login link */}
        <div className="mb-6">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-trust-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to login
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Reset your password
            </h1>
            <p className="text-gray-600">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-12"
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p id="email-error" role="alert" className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending link...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>

          {/* Additional help */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Remember your password?{' '}
              <Link
                href="/login"
                className="text-trust-blue-600 hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Help text */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Need help?{' '}
          <a
            href="mailto:support@bookpage.com"
            className="text-trust-blue-600 hover:underline font-medium"
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  )
}
