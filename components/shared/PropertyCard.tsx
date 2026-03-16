import Link from 'next/link'
import { MapPin, Users, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import { VerifiedBadge } from './VerifiedBadge'

interface PropertyCardProps {
  id: string
  name: string
  slug: string
  location: string
  pricePerNight: number
  imageUrl: string
  maxGuests: number
  rating?: number
  reviewCount?: number
  isVerified?: boolean
  className?: string
}

export function PropertyCard({
  id,
  name,
  slug,
  location,
  pricePerNight,
  imageUrl,
  maxGuests,
  rating,
  reviewCount,
  isVerified = false,
  className,
}: PropertyCardProps) {
  return (
    <Link
      href={`/${slug}/`}
      className={cn(
        'group block bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 ease-default hover:shadow-lg hover:-translate-y-1',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 ease-default group-hover:scale-105"
        />
        {isVerified && (
          <div className="absolute top-3 left-3">
            <VerifiedBadge size="sm" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Location */}
        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>

        {/* Name */}
        <h3 className="mt-1 text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-trust-blue-600 transition-colors">
          {name}
        </h3>

        {/* Rating */}
        {rating && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-warning-amber-400 text-warning-amber-400" />
              <span className="text-sm font-medium text-gray-900">{rating}</span>
            </div>
            {reviewCount && (
              <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <Users className="h-4 w-4" />
            <span>Up to {maxGuests} guests</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(pricePerNight)}
            </span>
            <span className="text-sm text-gray-500">/night</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
