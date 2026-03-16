'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import createGlobe from 'cobe'
import { MessageCircle, ShieldCheck, Calendar, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Feature {
  title: string
  description: string
  skeleton: React.ReactNode
  className: string
}

export function FeaturesSectionWithBentoGrid() {
  const features: Feature[] = [
    {
      title: 'Direct Bookings, Zero Commission',
      description:
        'Stop paying 15-20% commission to OTAs. Accept bookings directly and keep 100% of your revenue. Your guests pay you, not middlemen.',
      skeleton: <SkeletonOne />,
      className:
        'col-span-1 md:col-span-4 lg:col-span-4 border-b md:border-r border-gray-100 dark:border-neutral-800',
    },
    {
      title: 'WhatsApp Integration',
      description:
        'Connect with guests instantly via WhatsApp. No missed inquiries, no communication gaps. Just direct, personal conversations.',
      skeleton: <SkeletonTwo />,
      className:
        'col-span-1 md:col-span-2 lg:col-span-2 border-b border-gray-100 dark:border-neutral-800',
    },
    {
      title: 'Verified Properties Only',
      description:
        'Every property is verified through document check and video call. Build trust with guests and stand out from unverified listings.',
      skeleton: <SkeletonThree />,
      className:
        'col-span-1 md:col-span-3 lg:col-span-3 border-b md:border-r border-gray-100 dark:border-neutral-800',
    },
    {
      title: 'Smart Hold System',
      description:
        'Guests place a hold while they decide. You get 24 hours to accept or decline. No double bookings, no calendar confusion.',
      skeleton: <SkeletonFour />,
      className:
        'col-span-1 md:col-span-3 lg:col-span-3 border-b md:border-none',
    },
  ]

  return (
    <div className="relative z-20 py-10 lg:py-24 max-w-7xl mx-auto">
      <div className="px-8">
        <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-gray-900 dark:text-white">
          Everything you need to succeed
        </h4>

        <p className="text-sm lg:text-base max-w-2xl my-4 mx-auto text-gray-500 text-center font-normal dark:text-neutral-300">
          Built specifically for Indian villa and homestay owners. No complex
          features, just what you need to get more direct bookings.
        </p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 mt-12 xl:border rounded-3xl border-gray-100 dark:border-neutral-800 overflow-hidden bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  )
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) => {
  return (
    <div
      className={cn(
        `p-4 sm:p-8 relative overflow-hidden hover:bg-gray-50/50 dark:hover:bg-neutral-800/50 transition-colors duration-300`,
        className
      )}
    >
      {children}
    </div>
  )
}

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className="max-w-5xl mx-auto text-left tracking-tight text-gray-900 dark:text-white text-xl md:text-2xl md:leading-snug font-semibold">
      {children}
    </p>
  )
}

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        'text-sm md:text-base max-w-4xl text-left mx-auto',
        'text-gray-500 text-center font-normal dark:text-neutral-300',
        'text-left max-w-sm mx-0 md:text-sm my-2'
      )}
    >
      {children}
    </p>
  )
}

export const SkeletonOne = () => {
  return (
    <div className="relative flex py-8 px-2 gap-10 h-full">
      <div className="w-full p-5 mx-auto bg-white dark:bg-neutral-900 shadow-2xl group h-full rounded-xl overflow-hidden">
        <div className="flex flex-1 w-full h-full flex-col space-y-2">
          <Image
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=800&fit=crop"
            alt="Luxury villa with pool - Direct bookings save you commission fees"
            width={800}
            height={800}
            className="h-full w-full aspect-square object-cover object-left-top rounded-lg"
          />
        </div>
      </div>

      <div className="absolute bottom-0 z-40 inset-x-0 h-60 bg-gradient-to-t from-white dark:from-black via-white dark:via-black to-transparent w-full pointer-events-none" />
      <div className="absolute top-0 z-40 inset-x-0 h-60 bg-gradient-to-b from-white dark:from-black via-transparent to-transparent w-full pointer-events-none" />
    </div>
  )
}

export const SkeletonTwo = () => {
  return (
    <div className="relative flex flex-col items-center justify-center py-8 h-full">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-[200px]"
      >
        {/* WhatsApp Chat Mockup */}
        <div className="bg-[#dcf8c6] rounded-2xl rounded-tl-none p-4 shadow-lg mb-3 ml-auto max-w-[180px]">
          <p className="text-sm text-gray-800">
            Hi! I&apos;d like to book your villa for March 15-18
          </p>
          <p className="text-xs text-gray-500 mt-1 text-right">10:30 AM</p>
        </div>
        <div className="bg-white rounded-2xl rounded-tr-none p-4 shadow-lg mr-auto max-w-[160px] border border-gray-100">
          <p className="text-sm text-gray-800">
            Sure! Let me create a hold for you
          </p>
          <p className="text-xs text-gray-500 mt-1 text-right">10:32 AM</p>
        </div>
      </motion.div>

      {/* Floating WhatsApp Icon */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-4 right-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </motion.div>
    </div>
  )
}

export const SkeletonThree = () => {
  return (
    <div className="relative flex items-center justify-center py-8 h-full">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative"
      >
        {/* Verification Badge */}
        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-success-green-50 to-success-green-100 border-2 border-success-green-200 flex flex-col items-center justify-center shadow-xl">
          <ShieldCheck className="w-12 h-12 text-success-green-600 mb-2" />
          <span className="text-sm font-bold text-success-green-700">
            Verified
          </span>
        </div>

        {/* Floating Checkmarks */}
        <motion.div
          animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0 }}
          className="absolute -top-2 -right-2 w-8 h-8 bg-success-green-500 rounded-full flex items-center justify-center"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>

        <motion.div
          animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="absolute -bottom-2 -left-2 w-6 h-6 bg-trust-blue-500 rounded-full flex items-center justify-center"
        >
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  )
}

export const SkeletonFour = () => {
  return (
    <div className="h-60 md:h-60 flex flex-col items-center relative bg-transparent dark:bg-transparent mt-10">
      <Globe className="absolute -right-10 md:-right-10 -bottom-80 md:-bottom-72" />

      {/* Hold System Mockup */}
      <div className="absolute top-0 left-4 z-10 w-48 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-gray-100 dark:border-neutral-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-trust-blue-600" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            New Hold Request
          </span>
        </div>
        <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
          <div className="flex justify-between">
            <span>Guest:</span>
            <span className="font-medium">Rahul K.</span>
          </div>
          <div className="flex justify-between">
            <span>Dates:</span>
            <span className="font-medium">Mar 15-18</span>
          </div>
          <div className="flex justify-between">
            <span>Expires:</span>
            <span className="text-warning-amber-600 font-medium">
              23:45:12
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button className="flex-1 py-1.5 text-xs bg-gray-100 dark:bg-neutral-700 rounded-lg text-gray-700 dark:text-gray-300">
            Decline
          </button>
          <button className="flex-1 py-1.5 text-xs bg-trust-blue-600 rounded-lg text-white">
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}

export const Globe = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let phi = 0

    if (!canvasRef.current) return

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [1, 1, 1],
      markers: [
        { location: [15.2993, 74.124], size: 0.06 }, // Goa
        { location: [32.2432, 77.1892], size: 0.06 }, // Manali
        { location: [8.5241, 76.9366], size: 0.06 }, // Kerala
        { location: [28.6139, 77.209], size: 0.08 }, // Delhi
        { location: [19.076, 72.8777], size: 0.08 }, // Mumbai
        { location: [26.9124, 75.7873], size: 0.06 }, // Jaipur
        { location: [11.9416, 79.8083], size: 0.06 }, // Pondicherry
      ],
      onRender: (state) => {
        state.phi = phi
        phi += 0.005
      },
    })

    return () => {
      globe.destroy()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 600, height: 600, maxWidth: '100%', aspectRatio: 1 }}
      className={className}
    />
  )
}
