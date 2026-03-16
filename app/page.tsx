'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShieldCheck,
  CalendarX,
  Clock,
  Check,
  ArrowRight,
  Zap,
  Smartphone,
  MessageCircle,
} from 'lucide-react'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { PricingSection } from '@/components/shared/PricingSection'
import { FAQSection } from '@/components/shared/FAQSection'
import { TestimonialsSection } from '@/components/shared/TestimonialsSection'
import { Button } from '@/components/ui/button'
import { FeaturesSectionWithBentoGrid } from '@/components/ui/feature-section-with-bento-grid'
import { useScrollAnimation } from '@/lib/animations'
import { cn } from '@/lib/utils'

// Step Card Component
interface StepCardProps {
  number: string
  title: string
  description: string
  delay?: number
  isVisible: boolean
}

function StepCard({
  number,
  title,
  description,
  delay = 0,
  isVisible,
}: StepCardProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center text-center transition-all duration-700 group',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-20 h-20 rounded-3xl bg-white shadow-xl shadow-gray-200/50 border-2 border-gray-100 text-trust-blue-600 flex items-center justify-center text-3xl font-black mb-6 group-hover:-translate-y-2 transition-all duration-300 group-hover:shadow-trust-blue-200/50 group-hover:border-trust-blue-100">
        {number}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 max-w-xs text-lg leading-relaxed">
        {description}
      </p>
    </div>
  )
}

export default function LandingPage() {
  const { ref: stepsRef, isVisible: stepsVisible } =
    useScrollAnimation<HTMLElement>()
  const { ref: trustRef, isVisible: trustVisible } =
    useScrollAnimation<HTMLElement>()
  const { ref: ctaRef, isVisible: ctaVisible } =
    useScrollAnimation<HTMLElement>()

  // Hero animation on mount
  useEffect(() => {
    const heroElements = document.querySelectorAll('.hero-animate')
    heroElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('animate-fade-in-up')
        el.classList.remove('opacity-0', 'translate-y-8')
      }, index * 100)
    })
  }, [])

  return (
    <main className="min-h-screen bg-brand-light font-sans selection:bg-trust-blue-100 selection:text-trust-blue-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-[120px] pb-16 md:pt-[160px] md:pb-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-trust-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-success-green-50/50 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />

        <div className="container-xl px-6 md:px-12 max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Content */}
            <div className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
              <span className="hero-animate opacity-0 translate-y-8 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-success-green-50 text-success-green-700 text-sm font-bold tracking-wide mb-8 border border-success-green-200">
                <ShieldCheck className="h-4 w-4" />
                Verified Properties Only
              </span>

              <h1 className="hero-animate opacity-0 translate-y-8 text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1]">
                Your Booking Page.
              </h1>

              <p className="hero-animate opacity-0 translate-y-8 text-xl text-gray-600 mb-10 leading-relaxed max-w-lg">
                The simplest way to accept bookings directly. No calendars. No
                integrations. No technical setup.
              </p>

              {/* CTAs */}
              <div className="hero-animate opacity-0 translate-y-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
                <Button
                  size="lg"
                  variant="gradient"
                  className="h-14 px-8 text-lg font-semibold rounded-xl shadow-xl shadow-trust-blue-600/20"
                  asChild
                >
                  <Link href="/signup">Create Your Booking Page</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg font-semibold rounded-xl"
                  asChild
                >
                  <Link href="#how-it-works">See How It Works</Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="hero-animate opacity-0 translate-y-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-base font-medium text-gray-600">
                <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                  <Check className="h-4 w-4 text-success-green-500" />
                  Direct Bookings
                </span>
                <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                  <Check className="h-4 w-4 text-success-green-500" />
                  0% Commission
                </span>
                <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                  <Check className="h-4 w-4 text-success-green-500" />
                  14-day Free Trial
                </span>
              </div>
            </div>

            {/* Hero Image */}
            <div className="hero-animate opacity-0 translate-y-8 relative hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-gray-900/10 ring-1 ring-gray-900/5 bg-gray-100">
                <Image
                  src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&h=500&fit=crop"
                  alt="Luxury Indian villa with pool - Perfect for direct bookings"
                  width={600}
                  height={500}
                  className="w-full h-auto object-cover"
                  priority
                />
                {/* Overlay Card - Verified Profile */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        Villa Moonlight
                      </p>
                      <Link
                        href="#"
                        className="text-sm text-trust-blue-600 hover:underline mt-0.5 block"
                      >
                        bookpage.com/villa-moonlight
                      </Link>
                    </div>
                    <div>
                      <span className="px-3 py-1.5 bg-success-green-50 text-success-green-700 text-xs font-bold rounded-full flex items-center gap-1.5 border border-success-green-200">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating stats card */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success-green-50 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-success-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">24</p>
                    <p className="text-xs text-gray-500">Bookings this month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section - Messaging Formula */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="container-xl px-6 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="hero-animate opacity-0 translate-y-8 text-center p-6 rounded-2xl bg-gray-50/50 transition-all delay-100">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-trust-blue-50 flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-trust-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Direct Booking
              </h3>
              <p className="text-gray-600">
                Your property deserves its own booking page.
              </p>
            </div>
            <div className="hero-animate opacity-0 translate-y-8 text-center p-6 rounded-2xl bg-gray-50/50 transition-all delay-200">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-success-green-50 flex items-center justify-center">
                <Check className="h-6 w-6 text-success-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Commission
              </h3>
              <p className="text-gray-600">
                Guests pay you directly. Keep 100% of your earnings.
              </p>
            </div>
            <div className="hero-animate opacity-0 translate-y-8 text-center p-6 rounded-2xl bg-gray-50/50 transition-all delay-300">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-warning-amber-50 flex items-center justify-center">
                <Zap className="h-6 w-6 text-warning-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Tech Setup
              </h3>
              <p className="text-gray-600">
                No domain. No integrations. No headaches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-gray-50 to-white">
        <FeaturesSectionWithBentoGrid />
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        ref={stepsRef}
        className="py-24 md:py-32 bg-white"
      >
        <div className="container-xl px-6 max-w-5xl mx-auto">
          <div
            className={cn(
              'text-center mb-20 transition-all duration-700',
              stepsVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            )}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-green-50 text-success-green-700 text-sm font-semibold mb-6 border border-success-green-100">
              <ArrowRight className="h-4 w-4" />
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Built for Small Properties
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Designed exclusively for villas, homestays, and boutique stays.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-8 max-w-4xl mx-auto relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            <StepCard
              number="1"
              title="Add rooms"
              description="Enter your room types and pricing. Simple configuration."
              delay={0}
              isVisible={stepsVisible}
            />
            <StepCard
              number="2"
              title="Block dates"
              description="Block out dates in seconds when you are unavailable."
              delay={150}
              isVisible={stepsVisible}
            />
            <StepCard
              number="3"
              title="Accept bookings"
              description="Share your link and accept requests directly on WhatsApp."
              delay={300}
              isVisible={stepsVisible}
            />
          </div>
        </div>
      </section>

      {/* Trust & Verification */}
      <section
        ref={trustRef}
        className="py-24 md:py-32 bg-gradient-to-b from-gray-50 to-white border-y border-gray-100"
      >
        <div className="container-xl px-6 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div
              className={cn(
                'order-2 md:order-1 transition-all duration-700',
                trustVisible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-8'
              )}
            >
              {/* Mock UI Element */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 max-w-md mx-auto">
                <div className="flex items-center gap-3 pb-6 border-b border-gray-100 mb-6">
                  <span className="w-3 h-3 rounded-full bg-warning-amber-500 animate-pulse" />
                  <h4 className="font-bold text-gray-900 text-lg">
                    New Request
                  </h4>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Room</span>
                    <span className="font-semibold text-gray-900">Deluxe</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dates</span>
                    <span className="font-semibold text-gray-900">
                      Mar 15 – Mar 18
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hold Code</span>
                    <span className="font-mono text-sm text-gray-900 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                      BP-2847
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="w-full text-gray-900 border-gray-200 hover:bg-gray-50"
                  >
                    Reject
                  </Button>
                  <Button className="w-full">Accept</Button>
                </div>
              </div>
            </div>
            <div
              className={cn(
                'order-1 md:order-2 transition-all duration-700 delay-200',
                trustVisible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-8'
              )}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-trust-blue-50 text-trust-blue-600 text-sm font-semibold mb-6 border border-trust-blue-100">
                <Clock className="h-4 w-4" />
                Simple Workflow
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                One Action Per Screen
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
                We believe in keeping things simple. When an inquiry comes in,
                your guest creates a hold. You simply accept or reject. No
                complex inventory workflows to manage.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-lg text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-success-green-50 flex items-center justify-center">
                    <Check className="h-4 w-4 text-success-green-600" />
                  </div>
                  Fully mobile-optimized workflows
                </li>
                <li className="flex items-center gap-3 text-lg text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-success-green-50 flex items-center justify-center">
                    <Check className="h-4 w-4 text-success-green-600" />
                  </div>
                  Direct WhatsApp continuation
                </li>
                <li className="flex items-center gap-3 text-lg text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-success-green-50 flex items-center justify-center">
                    <Check className="h-4 w-4 text-success-green-600" />
                  </div>
                  Total control over every stay
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Pricing */}
      <PricingSection />

      {/* FAQ */}
      <FAQSection />

      {/* Final CTA */}
      <section
        ref={ctaRef}
        className="py-24 md:py-32 bg-gradient-to-b from-white to-gray-50 text-center relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-trust-blue-50/50 rounded-full blur-3xl" />

        <div className="container-xl px-6 max-w-3xl mx-auto relative">
          <div
            className={cn(
              'transition-all duration-700',
              ctaVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            )}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Accept bookings. Skip the platforms.
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-xl mx-auto">
              No commissions. Every listing is verified. Start your 14-day free
              trial today.
            </p>
            <Button
              size="lg"
              variant="gradient"
              className="h-14 px-10 text-lg font-semibold rounded-xl shadow-xl shadow-trust-blue-600/20"
              asChild
            >
              <Link href="/signup">Create Your Booking Page</Link>
            </Button>
            <p className="mt-6 text-sm text-gray-500">
              Free for 14 days • No credit card required
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
