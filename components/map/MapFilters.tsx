'use client'

import { useState } from 'react'
import {
  Search,
  SlidersHorizontal,
  MapPin,
  IndianRupee,
  Users,
  Home,
  CheckCircle,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface MapFiltersState {
  search: string
  minPrice: number | null
  maxPrice: number | null
  amenities: string[]
  verifiedOnly: boolean
  propertyType: string | null
  minGuests: number | null
}

const AMENITIES_LIST = [
  'WiFi',
  'Pool',
  'AC',
  'Parking',
  'Kitchen',
  'TV',
  'Gym',
  'Spa',
  'Beach Access',
  'Mountain View',
]

const PROPERTY_TYPES = [
  { value: 'villa', label: 'Villa' },
  { value: 'homestay', label: 'Homestay' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'resort', label: 'Resort' },
  { value: 'guesthouse', label: 'Guest House' },
]

interface MapFiltersProps {
  filters: MapFiltersState
  onChange: (filters: MapFiltersState) => void
  className?: string
  showVerifiedOnly?: boolean
  propertyCount?: number
}

export function MapFilters({
  filters,
  onChange,
  className,
  showVerifiedOnly = true,
  propertyCount,
}: MapFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const activeFiltersCount =
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    filters.amenities.length +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.propertyType ? 1 : 0) +
    (filters.minGuests ? 1 : 0)

  const clearFilters = () => {
    onChange({
      search: '',
      minPrice: null,
      maxPrice: null,
      amenities: [],
      verifiedOnly: false,
      propertyType: null,
      minGuests: null,
    })
  }

  const toggleAmenity = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity]
    onChange({ ...filters, amenities: newAmenities })
  }

  return (
    <div className={cn('bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-gray-600" />
            <h3 className="font-bold text-gray-900">Filters</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="default" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-trust-blue-600 hover:text-trust-blue-700 font-medium"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search location..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="p-4 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
        {/* Property Count */}
        {propertyCount !== undefined && (
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-900">{propertyCount}</span> properties
          </p>
        )}

        {/* Verified Only Toggle */}
        {showVerifiedOnly && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success-green-500" />
              <span className="text-sm font-medium text-gray-700">Verified only</span>
            </div>
            <button
              onClick={() => onChange({ ...filters, verifiedOnly: !filters.verifiedOnly })}
              className={cn(
                'w-11 h-6 rounded-full transition-colors relative',
                filters.verifiedOnly ? 'bg-success-green-500' : 'bg-gray-200'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
                  filters.verifiedOnly ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>
        )}

        {/* Price Range */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <IndianRupee className="w-4 h-4" />
            Price per night
          </h4>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  minPrice: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="text-sm"
            />
            <span className="text-gray-400">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  maxPrice: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="text-sm"
            />
          </div>
        </div>

        {/* Guests */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Minimum guests
          </h4>
          <div className="flex gap-2">
            {[2, 4, 6, 8, 10].map((num) => (
              <button
                key={num}
                onClick={() =>
                  onChange({
                    ...filters,
                    minGuests: filters.minGuests === num ? null : num,
                  })
                }
                className={cn(
                  'flex-1 py-2 text-sm font-medium rounded-lg transition-colors',
                  filters.minGuests === num
                    ? 'bg-trust-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {num}+
              </button>
            ))}
          </div>
        </div>

        {/* Property Type */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Home className="w-4 h-4" />
            Property type
          </h4>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() =>
                  onChange({
                    ...filters,
                    propertyType:
                      filters.propertyType === type.value ? null : type.value,
                  })
                }
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-full transition-colors',
                  filters.propertyType === type.value
                    ? 'bg-trust-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Amenities</h4>
          <div className="flex flex-wrap gap-2">
            {AMENITIES_LIST.map((amenity) => (
              <button
                key={amenity}
                onClick={() => toggleAmenity(amenity)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-full transition-colors',
                  filters.amenities.includes(amenity)
                    ? 'bg-trust-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {amenity}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile toggle */}
      <div className="lg:hidden p-4 border-t border-gray-100">
        <Button onClick={() => setIsExpanded(!isExpanded)} className="w-full">
          {isExpanded ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>
    </div>
  )
}
