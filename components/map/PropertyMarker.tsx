'use client'

import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Star, Users, IndianRupee } from 'lucide-react'
import type { PropertyMapItem } from './PropertyMap'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface PropertyMarkerProps {
  property: PropertyMapItem & { location_lat: number; location_lng: number }
  icon: L.DivIcon
  onClick?: () => void
}

export function PropertyMarker({ property, icon, onClick }: PropertyMarkerProps) {
  // Get minimum price from room types or use property price
  const minPrice =
    property.room_types && property.room_types.length > 0
      ? Math.min(...property.room_types.map((r) => r.price_per_night))
      : property.price_per_night || 0

  return (
    <Marker
      position={[property.location_lat, property.location_lng]}
      icon={icon}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup className="property-popup" maxWidth={300} minWidth={280}>
        <div className="p-2">
          {/* Image */}
          <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3">
            {property.images && property.images.length > 0 ? (
              <Image
                src={property.images[0]}
                alt={property.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
            )}
            
            {/* Verification Badge */}
            {property.is_verified && (
              <Badge className="absolute top-2 left-2 bg-success-green-500 text-white text-xs">
                Verified
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 text-lg leading-tight">
              {property.name}
            </h3>

            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{property.location || 'Location not set'}</span>
            </div>

            {/* Price */}
            {minPrice > 0 && (
              <div className="flex items-center gap-1 text-gray-900 font-semibold">
                <IndianRupee className="w-4 h-4" />
                <span>{minPrice.toLocaleString('en-IN')}</span>
                <span className="text-gray-500 font-normal text-sm">/night</span>
              </div>
            )}

            {/* Amenities Preview */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {property.amenities.slice(0, 3).map((amenity) => (
                  <span
                    key={amenity}
                    className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600"
                  >
                    {amenity}
                  </span>
                ))}
                {property.amenities.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                    +{property.amenities.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Action Button */}
            <Link href={`/${property.slug}`} className="block mt-3">
              <Button size="sm" className="w-full">
                View Property
              </Button>
            </Link>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}
