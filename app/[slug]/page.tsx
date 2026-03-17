'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  MapPin,
  Share2,
  CheckCircle,
  Clock,
  Ban,
  Wifi,
  Car,
  Waves,
  Utensils,
  Wind,
  Tv,
  Coffee,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Bed,
  Bath,
  Home,
  MessageCircle,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Moon,
  ShieldAlert,
  ExternalLink,
  ArrowRight,
  Star,
} from 'lucide-react'
import { cn, formatCurrency, formatDateRange, calculateNights, doDateRangesOverlap } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { VerifiedBadge } from '@/components/shared/VerifiedBadge'
import { HoldBadge } from '@/components/shared/HoldBadge'
import { PropertyCard } from '@/components/shared/PropertyCard'

// Types
interface RoomType {
  id: string
  name: string
  description: string
  max_guests: number
  num_beds: number
  price_per_night: number
  images: string[]
}

interface Property {
  id: string
  name: string
  slug: string
  description: string
  location: string
  is_verified: boolean
  is_hibernating: boolean
  owner_phone?: string
  amenities: string[]
  images: string[]
  max_guests: number
  num_bedrooms: number
  num_bathrooms: number
  room_types: RoomType[]
}


type AvailabilityStatus = 'checking' | 'available' | 'unavailable' | 'on_hold' | 'blocked' | 'booked' | 'unknown' | null

// Amenities mapping with icons
const AMENITY_ICONS: Record<string, React.ElementType> = {
  wifi: Wifi,
  'free wifi': Wifi,
  parking: Car,
  'free parking': Car,
  pool: Waves,
  swimming_pool: Waves,
  kitchen: Utensils,
  ac: Wind,
  'air conditioning': Wind,
  tv: Tv,
  television: Tv,
  breakfast: Coffee,
  'free breakfast': Coffee,
}

// Mock data for development (will be replaced with Supabase fetch)
const MOCK_PROPERTY: Property = {
  id: '1',
  name: 'Villa Serenity',
  slug: 'villa-serenity-goa',
  description: 'Experience luxury living at Villa Serenity, a stunning 4-bedroom villa nestled in the heart of North Goa. This beautifully designed property features a private swimming pool, modern amenities, and is just minutes away from the beach. Perfect for families or groups looking for a memorable vacation.\n\nThe villa boasts spacious living areas, a fully equipped kitchen, and comfortable bedrooms with en-suite bathrooms. Enjoy your mornings by the pool and evenings watching the sunset from the terrace.',
  location: 'Anjuna, Goa, India',
  is_verified: true,
  is_hibernating: false,
  owner_phone: '+919876543210',
  amenities: ['WiFi', 'Pool', 'Parking', 'AC', 'Kitchen', 'TV', 'Breakfast'],
  images: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
  ],
  max_guests: 8,
  num_bedrooms: 4,
  num_bathrooms: 4,
  room_types: [
    {
      id: 'rt1',
      name: 'Deluxe Suite',
      description: 'Spacious suite with king bed and pool view',
      max_guests: 2,
      num_beds: 1,
      price_per_night: 4500,
      images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop'],
    },
    {
      id: 'rt2',
      name: 'Family Room',
      description: 'Perfect for families with 2 queen beds',
      max_guests: 4,
      num_beds: 2,
      price_per_night: 6500,
      images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop'],
    },
  ],
}

const NEARBY_PROPERTIES = [
  {
    id: '2',
    name: 'Beach House Retreat',
    slug: 'beach-house-retreat',
    location: 'Baga, Goa',
    pricePerNight: 3800,
    imageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&h=400&fit=crop',
    maxGuests: 6,
    isVerified: true,
    rating: 4.7,
    reviewCount: 23,
  },
  {
    id: '3',
    name: 'Sunset Villa',
    slug: 'sunset-villa-goa',
    location: 'Vagator, Goa',
    pricePerNight: 5200,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop',
    maxGuests: 10,
    isVerified: true,
    rating: 4.9,
    reviewCount: 15,
  },
  {
    id: '4',
    name: 'Coconut Grove Homestay',
    slug: 'coconut-grove-homestay',
    location: 'Morjim, Goa',
    pricePerNight: 2800,
    imageUrl: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=600&h=400&fit=crop',
    maxGuests: 4,
    isVerified: false,
    rating: 4.5,
    reviewCount: 8,
  },
]

export default function PropertyPage() {
  const params = useParams()
  const slug = params.slug as string
  const supabase = createClient()

  // State
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Booking state
  const [selectedRoomType, setSelectedRoomType] = useState<string>('')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>(null)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  
  // Guest form state
  const [numGuests, setNumGuests] = useState(1)
  
  // Gallery state
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Share state
  const [shareCopied, setShareCopied] = useState(false)
  
  // Description expand state
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  // Fetch property data from Supabase
  useEffect(() => {
    async function fetchProperty() {
      try {
        setLoading(true)
        setError(null)
        
        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            room_types(*),
            profiles:owner_id(full_name, phone)
          `)
          .eq('slug', slug)
          .single()
        
        if (error) {
          if (error.code === 'PGRST116') {
            throw new Error('Property not found')
          }
          throw error
        }
        
        if (!data) {
          throw new Error('Property not found')
        }

        // Transform data to match Property interface
        const transformedProperty: Property = {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description || '',
          location: data.location || '',
          is_verified: data.is_verified || false,
          is_hibernating: data.is_hibernating || false,
          owner_phone: data.profiles?.phone || data.owner_phone,
          amenities: data.amenities || [],
          images: data.images || [],
          max_guests: data.max_guests || 0,
          num_bedrooms: data.num_bedrooms || 0,
          num_bathrooms: data.num_bathrooms || 0,
          room_types: (data.room_types || []).map((rt: any) => ({
            id: rt.id,
            name: rt.name,
            description: rt.description || '',
            max_guests: rt.max_guests || 0,
            num_beds: rt.num_beds || 0,
            price_per_night: rt.price_per_night || 0,
            images: rt.images || [],
          })),
        }
        
        setProperty(transformedProperty)
      } catch (err) {
        console.error('Error fetching property:', err)
        setError(err instanceof Error ? err.message : 'Failed to load property')
      } finally {
        setLoading(false)
      }
    }
    
    if (slug) {
      fetchProperty()
    }
  }, [slug])

  // Check availability
  const checkAvailability = async (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return
    setAvailabilityStatus('checking')

    const { data: blockedDates, error } = await supabase
      .from('blocked_dates')
      .select('start_date, end_date')
      .eq('property_id', property!.id)

    if (error) {
      setAvailabilityStatus('unknown')
      return
    }

    const isBlocked = (blockedDates || []).some(blocked =>
      doDateRangesOverlap(checkIn, checkOut, blocked.start_date, blocked.end_date)
    )
    setAvailabilityStatus(isBlocked ? 'unavailable' : 'available')
  }


  // Share property
  const handleShare = useCallback(async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [])

  // Open WhatsApp with prefilled booking message
  const openWhatsApp = useCallback(() => {
    if (!property?.owner_phone) return

    const roomType = property.room_types.find(rt => rt.id === selectedRoomType)
    const nightCount = calculateNights(checkInDate, checkOutDate)
    const total = roomType ? nightCount * roomType.price_per_night : 0

    const lines = [
      `Hi! I'd like to book *${property.name}*`,
      roomType ? `Room: ${roomType.name}` : '',
      checkInDate && checkOutDate ? `Dates: ${formatDateRange(checkInDate, checkOutDate)} (${nightCount} night${nightCount !== 1 ? 's' : ''})` : '',
      numGuests ? `Guests: ${numGuests}` : '',
      total > 0 ? `Total: ${formatCurrency(total)}` : '',
      `\nIs this available?`,
    ].filter(Boolean).join('\n')

    const whatsappNumber = property.owner_phone.replace(/[^\d]/g, '')
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines)}`, '_blank')
  }, [property, selectedRoomType, checkInDate, checkOutDate, numGuests])

  // Gallery navigation
  const nextImage = useCallback(() => {
    if (!property) return
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length)
  }, [property])

  const prevImage = useCallback(() => {
    if (!property) return
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
  }, [property])

  // Get selected room
  const selectedRoom = property?.room_types.find(rt => rt.id === selectedRoomType)
  
  // Calculate nights and total
  const nights = calculateNights(checkInDate, checkOutDate)
  const totalAmount = selectedRoom ? nights * selectedRoom.price_per_night : 0

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="h-16 bg-white border-b" />
          
          {/* Gallery skeleton */}
          <div className="h-[50vh] bg-gray-200" />
          
          {/* Content skeleton */}
          <div className="container-lg py-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
              <div className="h-64 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Error state
  if (error || !property) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Property Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            This property is not accepting bookings at the moment.
          </p>
          <Link href="/">
            <Button>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  // Hibernation state
  if (property.is_hibernating) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4 max-w-md">
          <div className="w-20 h-20 bg-warning-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Moon className="h-10 w-10 text-warning-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            This Property is Hibernating
          </h1>
          <p className="text-gray-600 mb-8">
            {property.name} is temporarily not accepting bookings. Please check back later or explore other properties.
          </p>
          <Link href="/">
            <Button size="lg">
              Explore Other Properties
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Photo Gallery */}
      <section className="relative">
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-2 h-[40vh] md:h-[50vh]">
          {/* Main large image */}
          <div 
            className="md:col-span-2 md:row-span-2 relative cursor-pointer overflow-hidden group"
            onClick={() => { setCurrentImageIndex(0); setGalleryOpen(true) }}
          >
            <img
              src={property.images[0]}
              alt={`${property.name} - Main`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
          
          {/* Smaller images */}
          {property.images.slice(1, 3).map((image, index) => (
            <div
              key={index}
              className="hidden md:block relative cursor-pointer overflow-hidden group"
              onClick={() => { setCurrentImageIndex(index + 1); setGalleryOpen(true) }}
            >
              <img
                src={image}
                alt={`${property.name} - ${index + 2}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          ))}
          
          {/* View all photos button */}
          <div className="hidden md:block relative">
            <div 
              className="absolute inset-0 cursor-pointer overflow-hidden"
              onClick={() => { setCurrentImageIndex(3); setGalleryOpen(true) }}
            >
              <img
                src={property.images[3]}
                alt={`${property.name} - More`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Button variant="secondary" size="sm">
                  View All Photos
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile view all button */}
        <button
          onClick={() => setGalleryOpen(true)}
          className="md:hidden absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium shadow-lg"
        >
          View All Photos
        </button>
      </section>

      {/* Main Content */}
      <div className="container-lg py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Property Info */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Property Header */}
            <section className="animate-fade-in-up">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {property.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm md:text-base">{property.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {property.is_verified && <VerifiedBadge />}
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
                    aria-label="Share property"
                  >
                    {shareCopied ? (
                      <Check className="h-5 w-5 text-success-green-600" />
                    ) : (
                      <Share2 className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-5 w-5" />
                  <span className="text-sm">Up to {property.max_guests} guests</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Bed className="h-5 w-5" />
                  <span className="text-sm">{property.num_bedrooms} bedrooms</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Bath className="h-5 w-5" />
                  <span className="text-sm">{property.num_bathrooms} bathrooms</span>
                </div>
              </div>
            </section>

            {/* Description */}
            <section className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                About this place
              </h2>
              <div className={cn(
                "text-gray-600 leading-relaxed whitespace-pre-line",
                !isDescriptionExpanded && "line-clamp-4"
              )}>
                {property.description}
              </div>
              {property.description.length > 200 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-2 text-trust-blue-600 font-medium hover:underline flex items-center gap-1"
                >
                  {isDescriptionExpanded ? (
                    <>Show less <ChevronUp className="h-4 w-4" /></>
                  ) : (
                    <>Show more <ChevronDown className="h-4 w-4" /></>
                  )}
                </button>
              )}
            </section>

            {/* Amenities */}
            <section className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                What this place offers
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {property.amenities.map((amenity) => {
                  const Icon = AMENITY_ICONS[amenity.toLowerCase()] || CheckCircle
                  return (
                    <div key={amenity} className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Room Types */}
            <section className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Select Room Type
              </h2>
              <div className="space-y-4">
                {property.room_types.map((room) => (
                  <div
                    key={room.id}
                    className={cn(
                      "border rounded-xl p-4 cursor-pointer transition-all",
                      selectedRoomType === room.id
                        ? "border-trust-blue-500 bg-trust-blue-50/50 ring-2 ring-trust-blue-100"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedRoomType(room.id)}
                  >
                    <div className="flex gap-4">
                      <img
                        src={room.images[0]}
                        alt={room.name}
                        className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-gray-900">{room.name}</h3>
                          <div className="text-right">
                            <span className="text-lg font-bold text-gray-900">
                              {formatCurrency(room.price_per_night)}
                            </span>
                            <span className="text-sm text-gray-500">/night</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{room.description}</p>
                        <div className="flex gap-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Up to {room.max_guests}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            {room.num_beds} bed{room.num_beds > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Nearby Properties */}
            <section className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Travelers who viewed this also checked out
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {NEARBY_PROPERTIES.map((prop) => (
                  <PropertyCard key={prop.id} {...prop} />
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Booking Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 md:p-6">
                {/* Price */}
                {selectedRoom && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatCurrency(selectedRoom.price_per_night)}
                      </span>
                      <span className="text-gray-500">/night</span>
                    </div>
                  </div>
                )}

                {/* Date Selection */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="check-in-date" className="text-sm font-medium text-gray-700 mb-2 block">
                      Check-in Date
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="check-in-date"
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="check-out-date" className="text-sm font-medium text-gray-700 mb-2 block">
                      Check-out Date
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="check-out-date"
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        min={checkInDate || new Date().toISOString().split('T')[0]}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Check Availability Button */}
                  <Button
                    onClick={() => checkAvailability(checkInDate, checkOutDate)}
                    disabled={!selectedRoomType || !checkInDate || !checkOutDate || isCheckingAvailability}
                    className="w-full"
                  >
                    {isCheckingAvailability ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      'Check Availability'
                    )}
                  </Button>
                </div>

                {/* Availability Result */}
                {availabilityStatus && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className={cn(
                    "mt-4 p-4 rounded-lg animate-fade-in",
                    availabilityStatus === 'available' && "bg-success-green-50 border border-success-green-200",
                    availabilityStatus === 'on_hold' && "bg-hold-orange/10 border border-hold-orange/30",
                    availabilityStatus === 'blocked' && "bg-gray-100 border border-gray-200",
                  )}>
                    {availabilityStatus === 'available' && (
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-success-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-success-green-800">
                            Available!
                          </p>
                          <p className="text-sm text-success-green-700">
                            Hold for 10 minutes
                          </p>
                        </div>
                      </div>
                    )}
                    {availabilityStatus === 'on_hold' && (
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-hold-orange mt-0.5" />
                        <div>
                          <p className="font-medium text-hold-orange">
                            On Hold
                          </p>
                          <p className="text-sm text-hold-orange/80">
                            Check back soon
                          </p>
                        </div>
                      </div>
                    )}
                    {availabilityStatus === 'blocked' && (
                      <div className="flex items-start gap-3">
                        <Ban className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-700">
                            Not Available
                          </p>
                          <p className="text-sm text-gray-500">
                            These dates are not available
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Number of Guests */}
                <div className="mt-4">
                  <Label htmlFor="num-guests" className="text-sm font-medium text-gray-700 mb-2 block">
                    Guests
                  </Label>
                  <Input
                    id="num-guests"
                    type="number"
                    min={1}
                    max={selectedRoom?.max_guests || property.max_guests}
                    value={numGuests}
                    onChange={(e) => setNumGuests(Number(e.target.value))}
                  />
                </div>

                {/* Book on WhatsApp (shown when available) */}
                {availabilityStatus === 'available' && property.owner_phone && (
                  <div className="mt-4 pt-4 border-t border-gray-200 animate-fade-in-up">
                    <Button
                      onClick={openWhatsApp}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Book on WhatsApp
                    </Button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Opens WhatsApp with your booking details pre-filled
                    </p>
                  </div>
                )}

                {/* Price Breakdown */}
                {nights > 0 && selectedRoom && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {formatCurrency(selectedRoom.price_per_night)} x {nights} nights
                        </span>
                        <span className="text-gray-900">{formatCurrency(totalAmount)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                        <span className="text-gray-900">Total</span>
                        <span className="text-gray-900">{formatCurrency(totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Direct WhatsApp Button (always visible, before availability is checked) */}
              {availabilityStatus !== 'available' && property.owner_phone && (
                <a
                  href={`https://wa.me/${(property.owner_phone || '').replace(/[^\d+]/g, '').replace(/^\+/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 border border-green-600 text-green-600 rounded-xl font-medium hover:bg-green-50 transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  Ask on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container-lg py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">Powered by</span>
              <Link href="/" className="font-bold text-trust-blue-600">
                BookPage
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/report" className="text-sm text-gray-500 hover:text-gray-700">
                Report Listing
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-700">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Gallery Lightbox */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-5xl w-full h-[90vh] p-0 bg-black/95 border-none">
          <DialogHeader className="absolute top-4 left-4 right-4 z-10">
            <DialogTitle className="text-white text-lg">
              {property.name} - Photo {currentImageIndex + 1} of {property.images.length}
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={property.images[currentImageIndex]}
              alt={`${property.name} - Photo ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Navigation */}
            <button
              onClick={prevImage}
              className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
          
          {/* Thumbnails */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {property.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentImageIndex ? "bg-white" : "bg-white/40"
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
