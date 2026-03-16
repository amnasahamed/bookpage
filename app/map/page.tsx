'use client'


import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Map, List, Grid3X3 } from 'lucide-react'
import { MapFilters, MapFiltersState } from '@/components/map/MapFilters'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { createClient } from '@/lib/supabase'
import { cn, formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import type { PropertyMapItem } from '@/components/map/PropertyMap'

// Dynamic import of PropertyMap to avoid SSR issues with Leaflet
const PropertyMap = dynamic(
  () => import('@/components/map/PropertyMap').then((mod) => mod.PropertyMap),
  { ssr: false, loading: () => (
    <div className="bg-gray-100 animate-pulse flex items-center justify-center" style={{ minHeight: '500px' }}>
      <p className="text-gray-500">Loading map...</p>
    </div>
  )}
)

type ViewMode = 'map' | 'list'

// Main content component that uses search params
function MapContent() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<PropertyMapItem[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('map')
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [filters, setFilters] = useState<MapFiltersState>({
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : null,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : null,
    amenities: searchParams.get('amenities')?.split(',').filter(Boolean) || [],
    verifiedOnly: searchParams.get('verified') === 'true',
    propertyType: searchParams.get('type') || null,
    minGuests: searchParams.get('guests') ? parseInt(searchParams.get('guests')!) : null,
  })

  const supabase = createClient()

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true)
      try {
        let query = supabase
          .from('properties')
          .select(`
            id,
            name,
            slug,
            location,
            location_lat,
            location_lng,
            images,
            is_verified,
            verification_status,
            amenities,
            max_guests
          `)
          .eq('is_hibernating', false)

        // Only show verified properties by default
        if (filters.verifiedOnly) {
          query = query.eq('is_verified', true)
        }

        const { data, error } = await query

        if (error) throw error

        // Transform data to match PropertyMapItem
        const transformedData: PropertyMapItem[] = (data || [])
          .filter((p: any) => p.location_lat && p.location_lng)
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            location: p.location,
            location_lat: p.location_lat,
            location_lng: p.location_lng,
            images: p.images || [],
            is_verified: p.is_verified,
            verification_status: p.verification_status,
            amenities: p.amenities || [],
            max_guests: p.max_guests,
            room_types: [],
            price_per_night: 0, // We will need to fetch this separately or use a property-level price if available
          }))

        setProperties(transformedData)
      } catch (error) {
        console.error('Error fetching properties:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [supabase, filters.verifiedOnly])

  // Filter properties based on filters
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          property.name.toLowerCase().includes(searchLower) ||
          (property.location && property.location.toLowerCase().includes(searchLower))
        if (!matchesSearch) return false
      }

      // Price filter
      const minPrice = property.room_types?.length
        ? Math.min(...property.room_types.map((r: any) => r.price_per_night))
        : property.price_per_night || 0

      if (filters.minPrice && minPrice < filters.minPrice) return false
      if (filters.maxPrice && minPrice > filters.maxPrice) return false

      // Amenities filter
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every((amenity) =>
          property.amenities?.includes(amenity)
        )
        if (!hasAllAmenities) return false
      }

      // Guests filter
      if (filters.minGuests && (property.max_guests || 0) < filters.minGuests) return false

      return true
    })
  }, [properties, filters])

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Explore Properties</h1>
              <p className="text-gray-500 text-sm mt-1">
                Discover verified villas, homestays, and boutique stays across India
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('map')}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    viewMode === 'map'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <Map className="w-4 h-4" />
                  Map
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <List className="w-4 h-4" />
                  List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <MapFilters
              filters={filters}
              onChange={setFilters}
              propertyCount={filteredProperties.length}
            />
          </div>

          {/* Map or List */}
          <div className="flex-1">
            {loading ? (
              <div className="bg-gray-100 rounded-2xl" style={{ minHeight: '600px' }}>
                <div className="flex items-center justify-center h-full" style={{ minHeight: '600px' }}>
                  <div className="text-center">
                    <Skeleton className="w-12 h-12 rounded-full mx-auto mb-4" />
                    <Skeleton className="w-48 h-4 mx-auto" />
                  </div>
                </div>
              </div>
            ) : viewMode === 'map' ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <PropertyMap
                  properties={filteredProperties}
                  selectedPropertyId={selectedPropertyId}
                  onMarkerClick={(property) => setSelectedPropertyId(property.id)}
                  className="rounded-2xl"
                />
              </div>
            ) : (
              <PropertyListView properties={filteredProperties} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// Loading fallback for Suspense
function MapLoadingFallback() {
  return (
    <>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <Skeleton className="lg:w-80 h-96" />
          <Skeleton className="flex-1 h-[600px]" />
        </div>
      </div>
    </>
  )
}

export default function MapPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20 lg:pt-24">
        <Suspense fallback={<MapLoadingFallback />}>
          <MapContent />
        </Suspense>
      </div>

      <Footer />
    </main>
  )
}

// List view component
function PropertyListView({ properties }: { properties: PropertyMapItem[] }) {
  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Grid3X3 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
        <p className="text-gray-500">Try adjusting your filters to see more results.</p>
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}

// Property card for list view
function PropertyCard({ property }: { property: PropertyMapItem }) {
  const minPrice =
    property.room_types && property.room_types.length > 0
      ? Math.min(...property.room_types.map((r: any) => r.price_per_night))
      : property.price_per_night || 0

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        {property.images && property.images.length > 0 ? (
          <Image
            src={property.images[0]}
            alt={property.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        
        {property.is_verified && (
          <Badge className="absolute top-3 left-3 bg-success-green-500 text-white">
            Verified
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-bold text-gray-900 text-lg mb-1">{property.name}</h3>
        <p className="text-gray-500 text-sm mb-3">{property.location}</p>

        {minPrice > 0 && (
          <p className="text-gray-900 font-semibold mb-3">
            {formatCurrency(minPrice)}
            <span className="text-gray-500 font-normal text-sm"> /night</span>
          </p>
        )}

        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {property.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}

        <Link href={`/${property.slug}`}>
          <Button className="w-full">View Property</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
