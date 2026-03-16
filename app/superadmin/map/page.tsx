'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  Map as MapIcon,
  Filter,
  Users,
  Home,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Layers,
  Search,
  BarChart3,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/app/providers'
import type { PropertyMapItem } from '@/components/map/PropertyMap'

// Dynamic import to avoid SSR issues with Leaflet
const PropertyMap = dynamic(
  () => import('@/components/map/PropertyMap').then((mod) => mod.PropertyMap),
  { ssr: false, loading: () => (
    <div className="bg-gray-100 animate-pulse flex items-center justify-center" style={{ minHeight: '600px' }}>
      <p className="text-gray-500">Loading map...</p>
    </div>
  )}
)

interface PropertyStats {
  total: number
  verified: number
  pending: number
  byState: Record<string, number>
}

export default function SuperAdminMapPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const supabase = createClient()

  const [properties, setProperties] = useState<PropertyMapItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProperty, setSelectedProperty] = useState<PropertyMapItem | null>(null)

  // Fetch all properties
  useEffect(() => {
    const fetchProperties = async () => {
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
            max_guests,
            is_hibernating,
            subscription_status,
            room_types(name, price_per_night)
          `)

        if (showVerifiedOnly) {
          query = query.eq('is_verified', true)
        }

        const { data, error } = await query

        if (error) throw error

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
            room_types: p.room_types || [],
            price_per_night: p.room_types?.[0]?.price_per_night || null,
          }))

        setProperties(transformedData)
      } catch (error) {
        console.error('Error fetching properties:', error)
        addToast({
          title: 'Error loading properties',
          description: 'Could not load properties for the map.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [supabase, showVerifiedOnly, addToast])

  // Filter properties based on search
  const filteredProperties = useMemo(() => {
    if (!searchQuery.trim()) return properties

    const query = searchQuery.toLowerCase()
    return properties.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.location && p.location.toLowerCase().includes(query))
    )
  }, [properties, searchQuery])

  // Calculate statistics
  const stats: PropertyStats = useMemo(() => {
    const byState: Record<string, number> = {}
    
    filteredProperties.forEach((p) => {
      // Extract state from location (rough approximation)
      const location = p.location || ''
      const states = ['Goa', 'Kerala', 'Rajasthan', 'Himachal Pradesh', 'Uttarakhand', 'Maharashtra', 'Karnataka', 'Tamil Nadu']
      const state = states.find((s) => location.includes(s)) || 'Other'
      byState[state] = (byState[state] || 0) + 1
    })

    return {
      total: filteredProperties.length,
      verified: filteredProperties.filter((p) => p.is_verified).length,
      pending: filteredProperties.filter((p) => p.verification_status === 'pending').length,
      byState,
    }
  }, [filteredProperties])

  // Export to CSV
  const handleExport = () => {
    const csv = [
      ['ID', 'Name', 'Location', 'Latitude', 'Longitude', 'Verified', 'Status'].join(','),
      ...filteredProperties.map((p) =>
        [
          p.id,
          `"${p.name}"`,
          `"${p.location || ''}"`,
          p.location_lat,
          p.location_lng,
          p.is_verified ? 'Yes' : 'No',
          p.verification_status || 'N/A',
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `properties-map-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    addToast({
      title: 'Export complete',
      description: `${filteredProperties.length} properties exported to CSV.`,
      variant: 'success',
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapIcon className="w-6 h-6 text-trust-blue-600" />
            Property Map
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View and manage all property locations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Properties"
          value={stats.total}
          icon={Home}
          color="blue"
        />
        <StatCard
          title="Verified"
          value={stats.verified}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Pending Verification"
          value={stats.pending}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="With Location"
          value={filteredProperties.length}
          icon={MapPin}
          color="purple"
        />
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Verified Only Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Verified only</span>
                <button
                  onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                  className={cn(
                    'w-11 h-6 rounded-full transition-colors relative',
                    showVerifiedOnly ? 'bg-success-green-500' : 'bg-gray-200'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
                      showVerifiedOnly ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>

              {/* Heatmap Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Show heatmap</span>
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={cn(
                    'w-11 h-6 rounded-full transition-colors relative',
                    showHeatmap ? 'bg-trust-blue-500' : 'bg-gray-200'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
                      showHeatmap ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Location Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                By Region
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.byState)
                  .sort(([, a], [, b]) => b - a)
                  .map(([state, count]) => (
                    <div
                      key={state}
                      className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0"
                    >
                      <span className="text-sm text-gray-700">{state}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Property List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Properties ({filteredProperties.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto">
                {filteredProperties.map((property) => (
                  <button
                    key={property.id}
                    onClick={() => setSelectedProperty(property)}
                    className={cn(
                      'w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors',
                      selectedProperty?.id === property.id && 'bg-trust-blue-50'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm text-gray-900 truncate max-w-[150px]">
                          {property.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">
                          {property.location || 'No address'}
                        </p>
                      </div>
                      <Badge
                        variant={property.is_verified ? 'success' : 'warning'}
                        className="text-xs"
                      >
                        {property.is_verified ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardContent className="p-0">
              <div className="h-[600px] lg:h-[700px]">
                <PropertyMap
                  properties={filteredProperties}
                  selectedPropertyId={selectedProperty?.id || null}
                  onMarkerClick={(p) => setSelectedProperty(p)}
                  showClustering={!showHeatmap}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: number
  icon: React.ElementType
  color: 'blue' | 'green' | 'amber' | 'purple'
}) {
  const colors = {
    blue: 'bg-trust-blue-50 text-trust-blue-600',
    green: 'bg-success-green-50 text-success-green-600',
    amber: 'bg-warning-amber-50 text-warning-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </CardContent>
    </Card>
  )
}
