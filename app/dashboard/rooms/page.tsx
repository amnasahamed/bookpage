'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth, useToast } from '@/app/providers'
import { Plus, Pencil, Trash2, Users, Bed, Image as ImageIcon, Upload, X, Check, Wifi, Snowflake, Tv, Waves, Car, Coffee, Sparkles, ChevronDown } from 'lucide-react'
import { DashboardSidebar } from '@/components/shared/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface Room {
  id: string
  name: string
  description: string | null
  room_type: string | null
  price_per_night: number
  max_guests: number
  num_beds: number
  is_active: boolean
  images: string[]
  amenities: string[]
  bed_types: string[]
  room_size: number | null
  extra_guest_charge: number
  minimum_stay: number
  cleaning_fee: number
  check_in_time: string
  check_out_time: string
  cancellation_policy: string
}

const ROOM_TYPES = [
  { value: 'standard', label: 'Standard Room', description: 'Basic room with essential amenities' },
  { value: 'deluxe', label: 'Deluxe Room', description: 'Spacious room with premium features' },
  { value: 'suite', label: 'Suite', description: 'Luxurious suite with separate living area' },
  { value: 'penthouse', label: 'Penthouse', description: 'Top floor luxury with panoramic views' },
  { value: 'villa', label: 'Private Villa', description: 'Independent villa with exclusive amenities' },
  { value: 'cottage', label: 'Cottage', description: 'Cozy cottage in natural settings' },
  { value: 'bungalow', label: 'Bungalow', description: 'Independent single-story dwelling' },
  { value: 'studio', label: 'Studio', description: 'Open-plan living and sleeping space' },
]

const AMENITIES = [
  { value: 'wifi', label: 'Free WiFi', icon: Wifi },
  { value: 'ac', label: 'Air Conditioning', icon: Snowflake },
  { value: 'tv', label: 'Smart TV', icon: Tv },
  { value: 'pool', label: 'Private Pool', icon: Waves },
  { value: 'parking', label: 'Free Parking', icon: Car },
  { value: 'kitchen', label: 'Kitchen', icon: Coffee },
  { value: 'balcony', label: 'Balcony', icon: Coffee },
  { value: 'garden', label: 'Garden Access', icon: Sparkles },
  { value: 'gym', label: 'Gym Access', icon: Sparkles },
  { value: 'spa', label: 'Spa Access', icon: Sparkles },
  { value: 'ocean_view', label: 'Ocean View', icon: Waves },
  { value: 'mountain_view', label: 'Mountain View', icon: Sparkles },
]

const BED_TYPES = [
  { value: 'king', label: 'King Size' },
  { value: 'queen', label: 'Queen Size' },
  { value: 'double', label: 'Double' },
  { value: 'single', label: 'Single' },
  { value: 'twin', label: 'Twin' },
  { value: 'bunk', label: 'Bunk Bed' },
  { value: 'sofa', label: 'Sofa Bed' },
]

const CANCELLATION_POLICIES = [
  { value: 'freeCancellation', label: 'Free Cancellation', description: 'Cancel up to 24 hours before check-in for a full refund' },
  { value: 'moderate', label: 'Moderate', description: 'Cancel up to 5 days before check-in for a 50% refund' },
  { value: 'strict', label: 'Strict', description: 'No refund for cancellations' },
]

export default function RoomsPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const supabase = createClient()
  const [propertyId, setPropertyId] = useState<string | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [uploadingImages, setUploadingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    room_type: '',
    pricePerNight: '',
    maxGuests: '',
    numBeds: '',
    images: [] as string[],
    amenities: [] as string[],
    bedTypes: [] as string[],
    roomSize: '',
    extraGuestCharge: '',
    minimumStay: '1',
    cleaningFee: '0',
    checkInTime: '2:00 PM',
    checkOutTime: '11:00 AM',
    cancellationPolicy: 'freeCancellation',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      setIsFetching(true)
      const { data: property } = await supabase
        .from('properties')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (property) {
        setPropertyId(property.id)
        const { data: roomsData, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('property_id', property.id)
          .order('created_at')
        if (roomsData) setRooms(roomsData as Room[])
        if (error) addToast({ title: 'Failed to load rooms', variant: 'destructive' })
      }
      setIsFetching(false)
    }
    fetchData()
  }, [user])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      room_type: '',
      pricePerNight: '',
      maxGuests: '',
      numBeds: '',
      images: [],
      amenities: [],
      bedTypes: [],
      roomSize: '',
      extraGuestCharge: '',
      minimumStay: '1',
      cleaningFee: '0',
      checkInTime: '2:00 PM',
      checkOutTime: '11:00 AM',
      cancellationPolicy: 'freeCancellation',
    })
    setFormErrors({})
  }

  const openAddModal = () => {
    setEditingRoom(null)
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (room: Room) => {
    setEditingRoom(room)
    setFormData({
      name: room.name,
      description: room.description ?? '',
      room_type: room.room_type ?? '',
      pricePerNight: room.price_per_night.toString(),
      maxGuests: room.max_guests.toString(),
      numBeds: room.num_beds.toString(),
      images: room.images ?? [],
      amenities: room.amenities ?? [],
      bedTypes: room.bed_types ?? [],
      roomSize: room.room_size?.toString() ?? '',
      extraGuestCharge: room.extra_guest_charge?.toString() ?? '0',
      minimumStay: room.minimum_stay?.toString() ?? '1',
      cleaningFee: room.cleaning_fee?.toString() ?? '0',
      checkInTime: room.check_in_time ?? '2:00 PM',
      checkOutTime: room.check_out_time ?? '11:00 AM',
      cancellationPolicy: room.cancellation_policy ?? 'freeCancellation',
    })
    setFormErrors({})
    setIsModalOpen(true)
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) errors.name = 'Room name is required'
    if (!formData.pricePerNight || isNaN(Number(formData.pricePerNight)) || Number(formData.pricePerNight) <= 0)
      errors.pricePerNight = 'Enter a valid price'
    if (!formData.maxGuests || isNaN(Number(formData.maxGuests)) || Number(formData.maxGuests) <= 0)
      errors.maxGuests = 'Enter a valid number'
    if (!formData.room_type) errors.room_type = 'Select a room type'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !propertyId) return

    setUploadingImages(true)
    try {
      const newImages: string[] = []

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${propertyId}/${Date.now()}-${Math.random()}.${fileExt}`

        const { data, error } = await supabase.storage
          .from('room-images')
          .upload(fileName, file)

        if (error) {
          console.error('Upload error:', error)
          addToast({ title: 'Failed to upload image', description: error.message, variant: 'destructive' })
          continue
        }

        const { data: urlData } = supabase.storage
          .from('room-images')
          .getPublicUrl(fileName)

        if (urlData.publicUrl) {
          newImages.push(urlData.publicUrl)
        }
      }

      if (newImages.length > 0) {
        setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }))
        addToast({ title: 'Images uploaded successfully', variant: 'success' })
      }
    } catch (err) {
      console.error('Upload error:', err)
      addToast({ title: 'Failed to upload images', variant: 'destructive' })
    } finally {
      setUploadingImages(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const toggleAmenity = (value: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(value)
        ? prev.amenities.filter(a => a !== value)
        : [...prev.amenities, value]
    }))
  }

  const toggleBedType = (value: string) => {
    setFormData(prev => ({
      ...prev,
      bedTypes: prev.bedTypes.includes(value)
        ? prev.bedTypes.filter(b => b !== value)
        : [...prev.bedTypes, value]
    }))
  }

  const handleSave = async () => {
    if (!validateForm()) return
    if (!propertyId) {
      addToast({ title: 'Property not found', description: 'Please refresh the page and try again', variant: 'destructive' })
      return
    }
    setIsLoading(true)

    const payload = {
      name: formData.name,
      description: formData.description || null,
      room_type: formData.room_type,
      price_per_night: Number(formData.pricePerNight),
      max_guests: Number(formData.maxGuests),
      num_beds: Number(formData.numBeds) || 1,
      images: formData.images,
      amenities: formData.amenities,
      bed_types: formData.bedTypes,
      room_size: formData.roomSize ? Number(formData.roomSize) : null,
      extra_guest_charge: Number(formData.extraGuestCharge) || 0,
      minimum_stay: Number(formData.minimumStay) || 1,
      cleaning_fee: Number(formData.cleaningFee) || 0,
      check_in_time: formData.checkInTime,
      check_out_time: formData.checkOutTime,
      cancellation_policy: formData.cancellationPolicy,
    }

    if (editingRoom) {
      const { error } = await supabase.from('rooms').update(payload).eq('id', editingRoom.id)
      setIsLoading(false)
      if (!error) {
        setRooms(prev => prev.map(r => r.id === editingRoom.id ? { ...r, ...payload } : r))
        setIsModalOpen(false)
        resetForm()
        addToast({ title: 'Room updated', variant: 'success' })
      } else {
        addToast({ title: 'Failed to update room', description: error.message, variant: 'destructive' })
      }
    } else {
      const { data: newRoom, error } = await supabase
        .from('rooms')
        .insert({ ...payload, property_id: propertyId, is_active: true })
        .select()
        .single()
      setIsLoading(false)
      if (!error && newRoom) {
        setRooms(prev => [...prev, newRoom as Room])
        setIsModalOpen(false)
        resetForm()
        addToast({ title: 'Room added successfully', variant: 'success' })
      } else {
        addToast({ title: 'Failed to add room', description: error?.message ?? 'Unknown error', variant: 'destructive' })
      }
    }
  }

  const confirmDelete = async () => {
    if (!roomToDelete) return
    const { error } = await supabase.from('rooms').delete().eq('id', roomToDelete.id)
    if (!error) {
      setRooms(prev => prev.filter(r => r.id !== roomToDelete.id))
      addToast({ title: 'Room deleted', variant: 'success' })
    } else {
      addToast({ title: 'Failed to delete room', variant: 'destructive' })
    }
    setIsDeleteDialogOpen(false)
    setRoomToDelete(null)
  }

  const handleToggleActive = async (room: Room) => {
    const newState = !room.is_active
    const { error } = await supabase.from('rooms').update({ is_active: newState }).eq('id', room.id)
    if (!error) {
      setRooms(prev => prev.map(r => r.id === room.id ? { ...r, is_active: newState } : r))
    } else {
      addToast({ title: 'Failed to update room status', variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="lg:ml-[260px] min-h-screen">
        <div className="p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
              <p className="text-gray-500 mt-1">Add rooms, manage pricing, and showcase your spaces</p>
            </div>
            <Button onClick={openAddModal} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add New Room
            </Button>
          </div>

          {isFetching ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="h-96 bg-white rounded-xl border border-gray-200 animate-pulse" />
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <Bed className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms yet</h3>
              <p className="text-gray-500 mb-6">Add your first room to start accepting bookings</p>
              <Button onClick={openAddModal}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Room
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {rooms.map((room) => (
                <Card key={room.id} className={cn('overflow-hidden', !room.is_active && 'opacity-75')}>
                  <div className="flex flex-col md:flex-row">
                    <div className="relative h-48 md:h-auto md:w-1/3 bg-gradient-to-br from-trust-blue-100 to-trust-blue-200">
                      {room.images && room.images.length > 0 ? (
                        <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-16 w-16 text-trust-blue-300" />
                        </div>
                      )}
                      {room.images && room.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          +{room.images.length - 1} more
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge variant={room.is_active ? 'success' : 'secondary'}>
                          {room.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {room.room_type && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="info">
                            {ROOM_TYPES.find(t => t.value === room.room_type)?.label ?? room.room_type}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{room.name}</h3>
                          {room.description && (
                            <p className="text-gray-600 mt-2 line-clamp-2">{room.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4 text-gray-400" />
                          Up to {room.max_guests} guests
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Bed className="h-4 w-4 text-gray-400" />
                          {room.num_beds} bed{room.num_beds !== 1 ? 's' : ''}
                        </div>
                        {room.room_size && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-gray-400">📐</span>
                            {room.room_size} sq ft
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="text-gray-400">🛏️</span>
                          Min {room.minimum_stay} night{room.minimum_stay !== 1 ? 's' : ''}
                        </div>
                      </div>

                      {room.amenities && room.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {room.amenities.slice(0, 6).map((amenity) => {
                            const amenityInfo = AMENITIES.find(a => a.value === amenity)
                            return amenityInfo ? (
                              <span key={amenity} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                {amenityInfo.label}
                              </span>
                            ) : null
                          })}
                          {room.amenities.length > 6 && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                              +{room.amenities.length - 6} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-trust-blue-600">
                              ₹{room.price_per_night.toLocaleString()}
                            </span>
                            <span className="text-gray-500">/night</span>
                          </div>
                          {room.cleaning_fee > 0 && (
                            <span className="text-xs text-gray-500">
                              +₹{room.cleaning_fee.toLocaleString()} cleaning fee
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleActive(room)}
                            className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            {room.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => openEditModal(room)}
                            className="p-2 text-gray-500 hover:text-trust-blue-600 hover:bg-trust-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => { setRoomToDelete(room); setIsDeleteDialogOpen(true) }}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
            <DialogDescription>
              {editingRoom ? 'Update your room details and images' : 'Fill in all details to create an attractive room listing'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Basic Information</h3>

              <div>
                <Label htmlFor="name">Room Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Ocean View Deluxe Suite"
                  className={cn('mt-2', formErrors.name && 'border-red-500')}
                />
                {formErrors.name && <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <Label htmlFor="room_type">Room Type *</Label>
                <select
                  id="room_type"
                  value={formData.room_type}
                  onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                  className={cn(
                    'mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-transparent',
                    formErrors.room_type && 'border-red-500'
                  )}
                >
                  <option value="">Select room type</option>
                  {ROOM_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
                {formErrors.room_type && <p className="text-sm text-red-500 mt-1">{formErrors.room_type}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what makes this room special..."
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Room Images</h3>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {formData.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt={`Room ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-2 left-2 bg-trust-blue-600 text-white text-xs px-2 py-1 rounded">
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImages}
                      className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-trust-blue-500 hover:text-trust-blue-600 transition-colors"
                    >
                      {uploadingImages ? (
                        <div className="animate-spin">⏳</div>
                      ) : (
                        <Plus className="h-8 w-8" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">Upload room images</p>
                    <p className="text-sm text-gray-500 mb-4">Add up to 10 photos (JPG, PNG, max 5MB each)</p>
                    <Button onClick={() => fileInputRef.current?.click()} disabled={uploadingImages}>
                      {uploadingImages ? 'Uploading...' : 'Choose Images'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Capacity & Beds</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxGuests">Max Guests *</Label>
                  <Input
                    id="maxGuests"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.maxGuests}
                    onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
                    placeholder="4"
                    className={cn('mt-2', formErrors.maxGuests && 'border-red-500')}
                  />
                  {formErrors.maxGuests && <p className="text-sm text-red-500 mt-1">{formErrors.maxGuests}</p>}
                </div>
                <div>
                  <Label htmlFor="numBeds">Number of Beds</Label>
                  <Input
                    id="numBeds"
                    type="number"
                    min="1"
                    value={formData.numBeds}
                    onChange={(e) => setFormData({ ...formData, numBeds: e.target.value })}
                    placeholder="2"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label>Bed Types</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {BED_TYPES.map(bed => (
                    <button
                      key={bed.value}
                      onClick={() => toggleBedType(bed.value)}
                      className={cn(
                        'px-4 py-2 rounded-lg border transition-colors',
                        formData.bedTypes.includes(bed.value)
                          ? 'bg-trust-blue-600 text-white border-trust-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-trust-blue-600'
                      )}
                    >
                      {bed.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="roomSize">Room Size (sq ft)</Label>
                <Input
                  id="roomSize"
                  type="number"
                  min="0"
                  value={formData.roomSize}
                  onChange={(e) => setFormData({ ...formData, roomSize: e.target.value })}
                  placeholder="400"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Pricing</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price per Night (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="1"
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                    placeholder="4500"
                    className={cn('mt-2', formErrors.pricePerNight && 'border-red-500')}
                  />
                  {formErrors.pricePerNight && <p className="text-sm text-red-500 mt-1">{formErrors.pricePerNight}</p>}
                </div>
                <div>
                  <Label htmlFor="cleaningFee">Cleaning Fee (₹)</Label>
                  <Input
                    id="cleaningFee"
                    type="number"
                    min="0"
                    value={formData.cleaningFee}
                    onChange={(e) => setFormData({ ...formData, cleaningFee: e.target.value })}
                    placeholder="500"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="extraGuestCharge">Extra Guest Charge (₹)</Label>
                  <Input
                    id="extraGuestCharge"
                    type="number"
                    min="0"
                    value={formData.extraGuestCharge}
                    onChange={(e) => setFormData({ ...formData, extraGuestCharge: e.target.value })}
                    placeholder="1000"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="minimumStay">Minimum Stay (nights)</Label>
                  <Input
                    id="minimumStay"
                    type="number"
                    min="1"
                    value={formData.minimumStay}
                    onChange={(e) => setFormData({ ...formData, minimumStay: e.target.value })}
                    placeholder="1"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Amenities</h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AMENITIES.map(amenity => {
                  const Icon = amenity.icon
                  const isSelected = formData.amenities.includes(amenity.value)
                  return (
                    <button
                      key={amenity.value}
                      onClick={() => toggleAmenity(amenity.value)}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border transition-colors text-left',
                        isSelected
                          ? 'bg-trust-blue-50 border-trust-blue-600 text-trust-blue-900'
                          : 'bg-white border-gray-200 hover:border-trust-blue-300'
                      )}
                    >
                      <Icon className={cn('h-5 w-5', isSelected ? 'text-trust-blue-600' : 'text-gray-400')} />
                      <span className="text-sm font-medium">{amenity.label}</span>
                      {isSelected && <Check className="h-4 w-4 ml-auto text-trust-blue-600" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Check-in & Check-out</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkInTime">Check-in Time</Label>
                  <Input
                    id="checkInTime"
                    value={formData.checkInTime}
                    onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                    placeholder="2:00 PM"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="checkOutTime">Check-out Time</Label>
                  <Input
                    id="checkOutTime"
                    value={formData.checkOutTime}
                    onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                    placeholder="11:00 AM"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Cancellation Policy</h3>

              <div className="space-y-2">
                {CANCELLATION_POLICIES.map(policy => (
                  <button
                    key={policy.value}
                    onClick={() => setFormData({ ...formData, cancellationPolicy: policy.value })}
                    className={cn(
                      'w-full p-4 rounded-lg border transition-colors text-left',
                      formData.cancellationPolicy === policy.value
                        ? 'bg-trust-blue-50 border-trust-blue-600'
                        : 'bg-white border-gray-200 hover:border-trust-blue-300'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{policy.label}</span>
                      {formData.cancellationPolicy === policy.value && (
                        <Check className="h-5 w-5 text-trust-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : editingRoom ? 'Save Changes' : 'Add Room'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{roomToDelete?.name}&quot;? This will also remove all associated bookings and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete Room</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
