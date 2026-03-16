'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, useMap, Marker } from 'react-leaflet'
import L from 'leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { PropertyMarker } from './PropertyMarker'
import 'leaflet/dist/leaflet.css'
import { MapPin } from 'lucide-react'
import { renderToString } from 'react-dom/server'

// Fix Leaflet default marker icon issue in Next.js
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

export interface PropertyMapItem {
  id: string
  name: string
  slug: string
  location: string | null
  location_lat: number | null
  location_lng: number | null
  images: string[] | null
  price_per_night?: number | null
  is_verified: boolean
  verification_status: 'pending' | 'approved' | 'rejected' | null
  amenities?: string[] | null
  max_guests?: number | null
  room_types?: { name: string; price_per_night: number }[] | null
}

interface PropertyMapProps {
  properties: PropertyMapItem[]
  center?: [number, number]
  zoom?: number
  onMarkerClick?: (property: PropertyMapItem) => void
  selectedPropertyId?: string | null
  showClustering?: boolean
  className?: string
}

// Map bounds updater component
function MapBoundsUpdater({ properties }: { properties: PropertyMapItem[] }) {
  const map = useMap()

  useEffect(() => {
    if (properties.length === 0) return

    const validCoords = properties.filter(
      (p): p is PropertyMapItem & { location_lat: number; location_lng: number } =>
        p.location_lat !== null && p.location_lng !== null
    )

    if (validCoords.length === 0) return

    if (validCoords.length === 1) {
      map.setView(
        [validCoords[0].location_lat, validCoords[0].location_lng],
        13
      )
    } else {
      const bounds = L.latLngBounds(
        validCoords.map((p) => [p.location_lat, p.location_lng])
      )
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [properties, map])

  return null
}

// Custom marker icon creator
function createCustomIcon(isVerified: boolean, isSelected: boolean): L.DivIcon {
  const colorClass = isVerified ? 'bg-success-green-500' : 'bg-warning-amber-500'
  const borderClass = isSelected ? 'border-4 border-trust-blue-500' : 'border-2 border-white'
  
  const svgString = renderToString(
    <div
      className={`w-10 h-10 rounded-full ${colorClass} ${borderClass} shadow-lg flex items-center justify-center`}
      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
    >
      <MapPin className="w-5 h-5 text-white" />
    </div>
  )

  return L.divIcon({
    className: 'custom-marker',
    html: svgString,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  })
}

export function PropertyMap({
  properties,
  center = [20.5937, 78.9629], // Center of India
  zoom = 5,
  onMarkerClick,
  selectedPropertyId,
  showClustering = true,
  className,
}: PropertyMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const validProperties = useMemo(
    () =>
      properties.filter(
        (p): p is PropertyMapItem & { location_lat: number; location_lng: number } =>
          p.location_lat !== null && p.location_lng !== null
      ),
    [properties]
  )

  if (!mounted) {
    return (
      <div
        className={`bg-gray-100 animate-pulse flex items-center justify-center ${className}`}
        style={{ minHeight: '500px' }}
      >
        <p className="text-gray-500">Loading map...</p>
      </div>
    )
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className={`w-full h-full ${className}`}
      style={{ minHeight: '500px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
      />
      
      <MapBoundsUpdater properties={validProperties} />

      {showClustering ? (
        <MarkerClusterGroup
          chunkedLoading
          spiderfyDistanceMultiplier={2}
          showCoverageOnHover={false}
        >
          {validProperties.map((property) => (
            <PropertyMarker
              key={property.id}
              property={property}
              icon={createCustomIcon(
                property.is_verified,
                property.id === selectedPropertyId
              )}
              onClick={() => onMarkerClick?.(property)}
            />
          ))}
        </MarkerClusterGroup>
      ) : (
        validProperties.map((property) => (
          <PropertyMarker
            key={property.id}
            property={property}
            icon={createCustomIcon(
              property.is_verified,
              property.id === selectedPropertyId
            )}
            onClick={() => onMarkerClick?.(property)}
          />
        ))
      )}
    </MapContainer>
  )
}
