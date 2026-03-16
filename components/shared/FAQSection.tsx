'use client'

import { HelpCircle } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useScrollAnimation } from '@/lib/animations'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'What happens after I sign up?',
    answer:
      'You get a 14-day free trial with full access to all features. Set up your property page, add your rooms, and start accepting booking requests. No credit card required during the trial.',
  },
  {
    question: 'Can I use my own domain?',
    answer:
      'Currently, we provide a branded subdomain (bookpage.com/your-property) for all properties. This keeps things simple and ensures fast, reliable hosting. Custom domains may be available in the future.',
  },
  {
    question: 'How does the hold system work?',
    answer:
      'When a guest is interested in booking, they can place a hold on the dates. This creates a temporary reservation for 24 hours, giving you time to review and accept or decline. No double bookings!',
  },
  {
    question: 'What if I don\'t get verified?',
    answer:
      'If your property doesn\'t pass verification, you get a full refund of your subscription fee. Verification involves document check and a brief video call to ensure quality standards.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes! You can cancel your subscription at any time from your dashboard. Your page will remain active until the end of your billing period.',
  },
  {
    question: 'How do guests pay me?',
    answer:
      'BookPage connects guests with you directly via WhatsApp. You handle payments directly with guests using UPI, bank transfer, or any method you prefer. We don\'t take any commission.',
  },
]

export function FAQSection() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>()

  return (
    <section
      id="faq"
      ref={ref}
      className="py-24 md:py-32 bg-white"
    >
      <div className="container-xl px-6 max-w-3xl mx-auto">
        {/* Section Header */}
        <div
          className={cn(
            'text-center mb-16 transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-trust-blue-50 text-trust-blue-600 text-sm font-semibold mb-6 border border-trust-blue-100">
            <HelpCircle className="h-4 w-4" />
            Got Questions?
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Frequently asked questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about BookPage.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div
          className={cn(
            'transition-all duration-700 delay-200',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-gray-200 rounded-xl px-6 data-[state=open]:border-trust-blue-200 data-[state=open]:shadow-md transition-all duration-200"
              >
                <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-trust-blue-600 py-5 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div
          className={cn(
            'mt-12 text-center transition-all duration-700 delay-300',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a
            href="mailto:support@bookpage.com"
            className="inline-flex items-center gap-2 text-trust-blue-600 font-semibold hover:text-trust-blue-700 hover:underline"
          >
            Contact our support team
          </a>
        </div>
      </div>
    </section>
  )
}
