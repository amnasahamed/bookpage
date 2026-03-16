'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Search, Crosshair, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/app/providers'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default marker icon
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface LocationPickerProps {
  initialLat?: number | null
  initialLng?: number | null
  initialAddress?: string | null
  onLocationChange: (lat: number, lng: number, address: string) => void
  readOnly?: boolean
}

// Draggable marker component
function DraggableMarker({
  position,
  onPositionChange,
}: {
  position: [number, number]
  onPositionChange: (pos: [number, number]) => void
}) {
  const markerRef = useRef<L.Marker | null>(null)

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current
      if (marker) {
        const newPos = marker.getLatLng()
        onPositionChange([newPos.lat, newPos.lng])
      }
    },
  }

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    >
    </Marker>
  )
}

// Map click handler
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// Geolocation button component
function GeolocationButton({ onLocate }: { onLocate: (lat: number, lng: number) => void }) {
  const map = useMap()
  const { addToast } = useToast()

  const handleLocate = () => {
    if (!navigator.geolocation) {
      addToast({
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation.',
        variant: 'destructive',
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        map.setView([latitude, longitude], 15)
        onLocate(latitude, longitude)
        addToast({
          title: 'Location found',
          description: 'Your current location has been set.',
          variant: 'success',
        })
      },
      (error) => {
        addToast({
          title: 'Could not get location',
          description: error.message,
          variant: 'destructive',
        })
      }
    )
  }

  return (
    <button
      onClick={handleLocate}
      className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
      title="Use my current location"
    >
      <Crosshair className="w-5 h-5 text-gray-700" />
    </button>
  )
}

export function LocationPicker({
  initialLat,
  initialLng,
  initialAddress,
  onLocationChange,
  readOnly = false,
}: LocationPickerProps) {
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState<[number, number]>(
    initialLat && initialLng ? [initialLat, initialLng] : [20.5937, 78.9629]
  )
  const [address, setAddress] = useState(initialAddress || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition([initialLat, initialLng])
    }
  }, [initialLat, initialLng])

  const handlePositionChange = useCallback(
    async (newPos: [number, number]) => {
      setPosition(newPos)
      
      // Reverse geocode to get address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos[0]}&lon=${newPos[1]}&zoom=18&addressdetails=1`
        )
        const data = await response.json()
        const newAddress = data.display_name || `${newPos[0].toFixed(4)}, ${newPos[1].toFixed(4)}`
        setAddress(newAddress)
        onLocationChange(newPos[0], newPos[1], newAddress)
      } catch (error) {
        const fallbackAddress = `${newPos[0].toFixed(4)}, ${newPos[1].toFixed(4)}`
        setAddress(fallbackAddress)
        onLocationChange(newPos[0], newPos[1], fallbackAddress)
      }
    },
    [onLocationChange]
  )

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0]
        const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)]
        setPosition(newPos)
        setAddress(display_name)
        onLocationChange(newPos[0], newPos[1], display_name)
        addToast({
          title: 'Location found',
          description: display_name,
          variant: 'success',
        })
      } else {
        addToast({
          title: 'Location not found',
          description: 'Please try a different search term.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      addToast({
        title: 'Search failed',
        description: 'Could not search for location.',
        variant: 'destructive',
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleMapClick = (lat: number, lng: number) => {
    if (!readOnly) {
      handlePositionChange([lat, lng])
    }
  }

  if (!mounted) {
    return (
      <div className="bg-gray-100 animate-pulse rounded-xl" style={{ height: '400px' }}>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {!readOnly && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search for your property address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
      )}

      {/* Address Display */}
      {address && (
        <div className="p-3 bg-gray-50 rounded-lg flex items-start gap-2">
          <MapPin className="w-4 h-4 text-trust-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-700">{address}</p>
            <p className="text-xs text-gray-500 mt-1">
              Coordinates: {position[0].toFixed(4)}, {position[1].toFixed(4)}
            </p>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border border-gray-200">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full"
          style={{ height: '400px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
          />
          
          {!readOnly && (
            <>
              <GeolocationButton onLocate={(lat, lng) => handlePositionChange([lat, lng])} />
              <MapClickHandler onMapClick={handleMapClick} />
            </>
          )}
          
          <DraggableMarker
            position={position}
            onPositionChange={handlePositionChange}
          />
        </MapContainer>

        {/* Instructions */}
        {!readOnly && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000]">
            <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-100">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-trust-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600">
                  Click on the map or drag the marker to set your exact property location. 
                  You can also use the search bar or click the target icon to use your current location.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
