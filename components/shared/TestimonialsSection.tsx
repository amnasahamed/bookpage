'use client'

import { Star, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useScrollAnimation } from '@/lib/animations'
import { cn } from '@/lib/utils'

const testimonials = [
  {
    quote:
      "BookPage simplified everything. I used to spend hours responding to 'Is this date available?' DMs. Now guests just book directly.",
    author: 'Priya M.',
    property: 'Villa Serenity',
    location: 'Goa',
    rating: 5,
  },
  {
    quote:
      "No more calendar confusion. The hold system is genius - guests know exactly where they stand, and I never get double bookings.",
    author: 'Rahul K.',
    property: 'Mountain View Homestay',
    location: 'Manali',
    rating: 5,
  },
  {
    quote:
      "₹3,999 is nothing compared to the 15-20% commission I was paying OTAs. BookPage paid for itself in the first month.",
    author: 'Anjali S.',
    property: 'Beach House Kerala',
    location: 'Kerala',
    rating: 5,
  },
]

function TestimonialCard({
  testimonial,
  index,
  isVisible,
}: {
  testimonial: (typeof testimonials)[0]
  index: number
  isVisible: boolean
}) {
  return (
    <Card
      className={cn(
        'border-0 shadow-lg bg-white transition-all duration-700',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
      style={{ transitionDelay: `${index * 100 + 200}ms` }}
    >
      <CardContent className="p-8">
        {/* Quote Icon */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-full bg-trust-blue-50 flex items-center justify-center">
            <Quote className="h-5 w-5 text-trust-blue-600" />
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1 mb-4">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star
              key={i}
              className="h-5 w-5 fill-warning-amber-400 text-warning-amber-400"
            />
          ))}
        </div>

        {/* Quote */}
        <blockquote className="text-lg text-gray-700 leading-relaxed mb-6">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>

        {/* Author */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-trust-blue-100 to-trust-blue-50 flex items-center justify-center">
            <span className="text-trust-blue-700 font-bold text-lg">
              {testimonial.author.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-bold text-gray-900">{testimonial.author}</p>
            <p className="text-sm text-gray-500">
              {testimonial.property}, {testimonial.location}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TestimonialsSection() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>()

  return (
    <section
      ref={ref}
      className="py-24 md:py-32 bg-gradient-to-b from-gray-50 to-white border-y border-gray-100"
    >
      <div className="container-xl px-6 max-w-6xl mx-auto">
        {/* Section Header */}
        <div
          className={cn(
            'text-center mb-16 transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-green-50 text-success-green-700 text-sm font-semibold mb-6 border border-success-green-100">
            <Star className="h-4 w-4 fill-current" />
            Loved by Property Owners
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            What our users say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join hundreds of Indian property owners who trust BookPage for their
            bookings.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              testimonial={testimonial}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>

        {/* Stats */}
        <div
          className={cn(
            'mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto transition-all duration-700 delay-500',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900 mb-1">500+</p>
            <p className="text-gray-600">Properties</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900 mb-1">10k+</p>
            <p className="text-gray-600">Bookings</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900 mb-1">4.9/5</p>
            <p className="text-gray-600">Rating</p>
          </div>
        </div>
      </div>
    </section>
  )
}
