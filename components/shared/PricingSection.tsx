'use client'

import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useScrollAnimation } from '@/lib/animations'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const features = [
  'Unlimited booking requests',
  'Custom property page',
  'WhatsApp integration',
  'No commission fees',
  'Email notifications',
  'Basic analytics',
]

export function PricingSection() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>()

  return (
    <section
      id="pricing"
      ref={ref}
      className="py-24 md:py-32 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="container-xl px-6 max-w-5xl mx-auto">
        {/* Section Header */}
        <div
          className={cn(
            'text-center mb-16 transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-trust-blue-50 text-trust-blue-600 text-sm font-semibold mb-6 border border-trust-blue-100">
            <Sparkles className="h-4 w-4" />
            Simple Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            One plan. No surprises.
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to start accepting direct bookings. No hidden
            fees, no commissions.
          </p>
        </div>

        {/* Pricing Card */}
        <div
          className={cn(
            'max-w-md mx-auto transition-all duration-700 delay-200',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div className="relative rounded-3xl bg-gradient-to-b from-gray-900 to-gray-800 p-8 md:p-10 text-white shadow-2xl shadow-gray-900/20 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-trust-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-success-green-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              {/* Plan Name */}
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-white/10 text-sm font-medium">
                  Annual Plan
                </span>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl md:text-6xl font-bold">₹3,999</span>
                  <span className="text-white/60 text-lg">/year</span>
                </div>
                <p className="text-white/60 mt-2">
                  That&apos;s just ₹333/month
                </p>
              </div>

              {/* CTA */}
              <Button
                size="lg"
                className="w-full bg-white text-gray-900 hover:bg-gray-100 mb-8 h-14 text-lg font-semibold"
                asChild
              >
                <Link href="/signup">Start Free Trial</Link>
              </Button>

              {/* Features */}
              <div className="space-y-4">
                <p className="text-sm font-medium text-white/60 uppercase tracking-wider">
                  What&apos;s included
                </p>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 text-white/90"
                    >
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success-green-500/20 flex items-center justify-center">
                        <Check className="h-3 w-3 text-success-green-400" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trial Note */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-sm text-white/60 text-center">
                  14-day free trial • No credit card required • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div
          className={cn(
            'mt-12 flex flex-wrap items-center justify-center gap-8 transition-all duration-700 delay-300',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div className="flex items-center gap-2 text-gray-500">
            <Check className="h-5 w-5 text-success-green-500" />
            <span className="font-medium">Instant setup</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Check className="h-5 w-5 text-success-green-500" />
            <span className="font-medium">24/7 support</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Check className="h-5 w-5 text-success-green-500" />
            <span className="font-medium">Secure payments</span>
          </div>
        </div>
      </div>
    </section>
  )
}
