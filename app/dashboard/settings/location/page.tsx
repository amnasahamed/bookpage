'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { MapPin, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { DashboardSidebar } from '@/components/shared/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth, useToast } from '@/app/providers'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// Dynamic import to avoid SSR issues with Leaflet
const LocationPicker = dynamic(
  () => import('@/components/map/LocationPicker').then((mod) => mod.LocationPicker),
  { ssr: false, loading: () => (
    <div className="bg-gray-100 animate-pulse rounded-xl" style={{ height: '400px' }}>
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  )}
)

export default function LocationSettingsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { addToast } = useToast()
  const supabase = createClient()

  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [location, setLocation] = useState({
    lat: null as number | null,
    lng: null as number | null,
    address: '',
  })
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch property data
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }

    const fetchProperty = async () => {
      try {
        // First check if user has any properties
        const { data: properties, error: countError } = await supabase
          .from('properties')
          .select('id, name, location, location_lat, location_lng, owner_id')
          .eq('owner_id', user.id)

        if (countError) throw countError

        // If no properties exist, show empty state
        if (!properties || properties.length === 0) {
          setProperty(null)
          setLoading(false)
          return
        }

        // Use the first property
        const data = properties[0]
        setProperty(data)
        setLocation({
          lat: data.location_lat,
          lng: data.location_lng,
          address: data.location || '',
        })
      } catch (error) {
        console.error('Error fetching property:', error)
        addToast({
          title: 'Error loading property',
          description: 'Could not load your property details.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [user, authLoading, router, supabase, addToast])

  const handleLocationChange = (lat: number, lng: number, address: string) => {
    setLocation({ lat, lng, address })
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!property || !location.lat || !location.lng) {
      addToast({
        title: 'Location required',
        description: 'Please select a location on the map.',
        variant: 'destructive',
      })
      return
    }

    if (location.lat < -90 || location.lat > 90 || location.lng < -180 || location.lng > 180) {
      addToast({ title: 'Invalid coordinates', description: 'Please select a valid location on the map', variant: 'destructive' })
      setSaveState('idle')
      return
    }

    setSaveState('saving')
    setSaving(true)
    try {
      const { error } = await supabase
        .from('properties')
        .update({
          location_lat: location.lat,
          location_lng: location.lng,
          location: location.address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', property.id)

      if (error) throw error

      addToast({
        title: 'Location saved',
        description: 'Your property location has been updated successfully.',
        variant: 'success',
      })
      setHasChanges(false)
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch (error) {
      console.error('Error saving location:', error)
      addToast({
        title: 'Failed to save',
        description: 'Could not update your property location. Please try again.',
        variant: 'destructive',
      })
      setSaveState('idle')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue-600" />
      </div>
    )
  }

  if (!user) return null

  // Show "Create Property First" state if no property exists
  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardSidebar />
        <main className="lg:ml-[260px] min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-4 mb-8">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Property Location
                </h1>
              </div>
            </div>

            <div className="max-w-2xl mx-auto text-center py-12">
              <div className="w-20 h-20 bg-trust-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-10 h-10 text-trust-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No Property Found
              </h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                You need to create a property first before you can set its location on the map.
              </p>
              <Link href="/dashboard/rooms">
                <Button size="lg" className="gap-2">
                  Create Property
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar propertyName={property?.name} />

      <main className="lg:ml-[260px] min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard/settings">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Property Location
              </h1>
              <p className="text-gray-500 mt-1">
                Set your property&apos;s location to appear on the map
              </p>
            </div>
          </div>

          <div className="max-w-3xl">
            {/* Info Card */}
            <Card className="mb-6 border-trust-blue-100 bg-trust-blue-50/50">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-trust-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700">
                    Setting your property location helps guests find you on our interactive map. 
                    This increases visibility and can lead to more bookings.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Location Status */}
            {property?.location_lat && property?.location_lng ? (
              <Card className="mb-6 border-success-green-200 bg-success-green-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-success-green-800">
                      Location is set
                    </p>
                    <p className="text-sm text-success-green-700">
                      Your property will appear on the public map
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-6 border-warning-amber-200 bg-warning-amber-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-warning-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-warning-amber-800">
                      Location not set
                    </p>
                    <p className="text-sm text-warning-amber-700">
                      Please set your property location to appear on the map
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location Picker */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-trust-blue-600" />
                  Set Location
                </CardTitle>
                <CardDescription>
                  Search for your address or drop a pin on the map
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LocationPicker
                  initialLat={location.lat}
                  initialLng={location.lng}
                  initialAddress={location.address}
                  onLocationChange={handleLocationChange}
                />

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
                  <Button
                    onClick={handleSave}
                    disabled={saveState === 'saving'}
                    className={cn(
                      'flex-1',
                      hasChanges && 'animate-pulse'
                    )}
                  >
                    {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? '✓ Saved' : 'Save Location'}
                  </Button>
                  
                  <Link href="/map" target="_blank">
                    <Button variant="outline">
                      View on Map
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Tips for accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-trust-blue-600">•</span>
                    Place the pin at your property entrance for best results
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-trust-blue-600">•</span>
                    Double-check the address before saving
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-trust-blue-600">•</span>
                    If your property is in a remote area, use nearby landmarks
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-trust-blue-600">•</span>
                    You can always update the location later
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
