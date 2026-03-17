'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  CheckCircle,
  CalendarX,
  Clock,
  ShieldCheck,
  AlertCircle,
  Check,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/app/providers'
import { generateSlug } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Password strength indicator
function PasswordStrength({ password }: { password: string }) {
  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(password) },
    { label: 'Contains a letter', met: /[a-zA-Z]/.test(password) },
  ]

  const strength = requirements.filter((r) => r.met).length

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              strength >= level
                ? level === 1
                  ? 'bg-red-500'
                  : level === 2
                  ? 'bg-yellow-500'
                  : 'bg-success-green-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <ul className="space-y-1">
        {requirements.map((req, index) => (
          <li
            key={index}
            className={`text-xs flex items-center gap-1 transition-colors duration-200 ${
              req.met ? 'text-success-green-600' : 'text-gray-500'
            }`}
          >
            {req.met ? (
              <Check className="w-3 h-3" />
            ) : (
              <X className="w-3 h-3" />
            )}
            {req.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Validation schema
const signupSchema = z
  .object({
    property_name: z.string().min(2, 'Property name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(/[a-zA-Z]/, 'Password must contain at least one letter'),
    confirm_password: z.string(),
    property_slug: z
      .string()
      .min(3, 'Slug must be at least 3 characters')
      .regex(
        /^[a-z0-9-]+$/,
        'Slug can only contain lowercase letters, numbers, and hyphens'
      ),
    terms_accepted: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [slugEdited, setSlugEdited] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      property_slug: '',
      terms_accepted: false,
    },
  })

  const propertyName = watch('property_name')
  const password = watch('password')
  const propertySlug = watch('property_slug')

  // Auto-generate slug from property name
  useEffect(() => {
    if (!slugEdited && propertyName) {
      const slug = generateSlug(propertyName)
      setValue('property_slug', slug, { shouldValidate: true })
    }
  }, [propertyName, slugEdited, setValue])

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)

    try {
      // Check if slug is already taken
      const { data: existingProperty, error: checkError } = await supabase
        .from('properties')
        .select('id')
        .eq('slug', data.property_slug)
        .single()

      if (existingProperty) {
        addToast({
          title: 'Slug already taken',
          description: 'Please choose a different property slug.',
          variant: 'destructive',
        })
        setIsLoading(false)
        return
      }

      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`,
          data: {
            property_name: data.property_name,
            property_slug: data.property_slug,
          },
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (authData.user) {
        if (authData.session) {
          // Email confirmation is disabled — session exists, create property immediately
          const { error: propertyError } = await supabase.from('properties').insert({
            owner_id: authData.user.id,
            name: data.property_name,
            slug: data.property_slug,
            subscription_status: 'trial',
            is_verified: false,
            verification_status: 'pending',
            is_hibernating: false,
          })

          if (propertyError) {
            console.error('Error creating property:', propertyError)
          }

          addToast({
            title: 'Account created!',
            description: 'Your 14-day free trial has started. Welcome to BookPage!',
            variant: 'success',
          })
          router.push('/dashboard')
        } else {
          // Email confirmation is enabled — property will be created after verification
          setEmailSent(true)
        }
      }
    } catch (error: any) {
      addToast({
        title: 'Sign up failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-trust-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="h-10 w-10 text-trust-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Check your email</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            We&apos;ve sent a confirmation link to your email. Click it to verify your account and your booking page will be set up automatically.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[40%] gradient-trust-blue flex-col justify-between p-12 text-white">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold">BookPage</span>
          </Link>
        </div>

        <div className="space-y-8">
          <h1 className="text-4xl font-bold leading-tight">
            Start your 14-day<br />free trial
          </h1>
          <p className="text-lg text-white/80">
            Join hundreds of Indian property owners who trust BookPage to manage their bookings.
          </p>

          {/* Benefits */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-white/90">No credit card required</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-white/90">Full access to all features</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-white/90">Cancel anytime</span>
            </div>
          </div>

          {/* Pricing reminder */}
          <div className="pt-6 pb-4 px-6 bg-white/10 rounded-xl backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-1">After your free trial</p>
            <p className="text-3xl font-bold">₹3,999/year</p>
            <p className="text-white/70 text-sm">That&apos;s just ₹333/month</p>
          </div>
        </div>

        <div className="text-sm text-white/60">
          © 2024 BookPage. Made for Indian property owners.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 bg-gray-50 overflow-y-auto">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-trust-blue-600">BookPage</span>
          </Link>
        </div>

        {/* Mobile pricing reminder */}
        <div className="lg:hidden mb-6 text-center">
          <p className="text-sm text-gray-600">14-day free trial, then</p>
          <p className="text-xl font-bold text-gray-900">₹3,999/year</p>
        </div>

        <div className="w-full max-w-[480px] animate-fade-in-up">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
            <p className="text-gray-600">Set up your property booking page in minutes</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Property Name Field */}
            <div className="space-y-2">
              <Label htmlFor="property_name" className="text-gray-700">
                Property Name
              </Label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="property_name"
                  type="text"
                  placeholder="What's your property called?"
                  className="pl-12"
                  {...register('property_name')}
                />
              </div>
              {errors.property_name && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.property_name.message}
                </p>
              )}
            </div>

            {/* Property Slug Field */}
            <div className="space-y-2">
              <Label htmlFor="property_slug" className="text-gray-700">
                Property URL
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  bookpage.com/
                </span>
                <Input
                  id="property_slug"
                  type="text"
                  className="pl-[130px]"
                  {...register('property_slug', {
                    onChange: () => setSlugEdited(true),
                  })}
                />
              </div>
              <p className="text-xs text-gray-500">
                This will be your public booking page URL. You can change this later.
              </p>
              {errors.property_slug && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.property_slug.message}
                </p>
              )}
            </div>

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
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className="pl-12 pr-12"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {password && <PasswordStrength password={password} />}
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirm_password" className="text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className="pl-12 pr-12"
                  {...register('confirm_password')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-trust-blue-600 focus:ring-trust-blue-500"
                  {...register('terms_accepted')}
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 font-normal cursor-pointer">
                  I agree to the{' '}
                  <Link href="#" className="text-trust-blue-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="#" className="text-trust-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              {errors.terms_accepted && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.terms_accepted.message}
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
                  Creating account...
                </span>
              ) : (
                'Create My Booking Page'
              )}
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-trust-blue-600 hover:text-trust-blue-700"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
