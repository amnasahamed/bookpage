'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth, useToast } from '@/app/providers'
import { Plus, Pencil, Trash2, Users, Bed, Image as ImageIcon, X } from 'lucide-react'
import { DashboardSidebar } from '@/components/shared/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  description: string
  pricePerNight: number
  maxGuests: number
  numBeds: number
  roomNumbers: string[]
  isActive: boolean
  photos: string[]
}


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

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      const { data: property } = await supabase
        .from('properties')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (property) {
        setPropertyId(property.id)
        const { data: roomsData } = await supabase
          .from('rooms')
          .select('*')
          .eq('property_id', property.id)
          .order('created_at')
        if (roomsData) setRooms(roomsData as Room[])
      }
    }
    fetchData()
  }, [user])

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePerNight: '',
    maxGuests: '',
    numBeds: '',
    roomNumbers: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      pricePerNight: '',
      maxGuests: '',
      numBeds: '',
      roomNumbers: '',
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
      description: room.description,
      pricePerNight: room.pricePerNight.toString(),
      maxGuests: room.maxGuests.toString(),
      numBeds: room.numBeds.toString(),
      roomNumbers: room.roomNumbers.join(', '),
    })
    setFormErrors({})
    setIsModalOpen(true)
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) errors.name = 'Room name is required'
    if (!formData.pricePerNight) errors.pricePerNight = 'Price is required'
    if (isNaN(Number(formData.pricePerNight)) || Number(formData.pricePerNight) <= 0) {
      errors.pricePerNight = 'Enter a valid price'
    }
    if (!formData.maxGuests) errors.maxGuests = 'Max guests is required'
    if (isNaN(Number(formData.maxGuests)) || Number(formData.maxGuests) <= 0) {
      errors.maxGuests = 'Enter a valid number'
    }
    if (!formData.roomNumbers.trim()) errors.roomNumbers = 'Room numbers are required'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return
    if (!propertyId) return
    setIsLoading(true)

    if (editingRoom) {
      // Update existing
      const { error } = await supabase
        .from('rooms')
        .update({
          name: formData.name,
          description: formData.description,
          price_per_night: Number(formData.pricePerNight),
          max_guests: Number(formData.maxGuests),
          num_beds: Number(formData.numBeds),
        })
        .eq('id', editingRoom.id)
      if (!error) {
        setRooms(prev => prev.map(r => r.id === editingRoom.id ? { ...r, name: formData.name, description: formData.description, pricePerNight: Number(formData.pricePerNight), maxGuests: Number(formData.maxGuests), numBeds: Number(formData.numBeds) } : r))
        addToast({ title: 'Room updated', variant: 'success' })
      }
    } else {
      // Insert new
      const { data: newRoom, error } = await supabase
        .from('rooms')
        .insert({
          property_id: propertyId,
          name: formData.name,
          description: formData.description,
          price_per_night: Number(formData.pricePerNight),
          max_guests: Number(formData.maxGuests),
          num_beds: Number(formData.numBeds),
          is_active: true,
        })
        .select()
        .single()
      if (!error && newRoom) {
        setRooms(prev => [...prev, { ...newRoom, roomNumbers: [], photos: [], isActive: true, pricePerNight: newRoom.price_per_night, maxGuests: newRoom.max_guests, numBeds: newRoom.num_beds }])
        addToast({ title: 'Room added', variant: 'success' })
      }
    }

    setIsLoading(false)
    setIsModalOpen(false)
    resetForm()
  }

  const handleDelete = (room: Room) => {
    setRoomToDelete(room)
    setIsDeleteDialogOpen(true)
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

  const handleToggleActive = async (roomId: string) => {
    const room = rooms.find(r => r.id === roomId)
    if (!room) return
    const newState = !room.isActive
    const { error } = await supabase
      .from('rooms')
      .update({ is_active: newState })
      .eq('id', roomId)
    if (!error) {
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, isActive: newState } : r))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar propertyName="Moonlight Villa" verificationStatus="approved" />
      
      <main className="lg:ml-[260px] min-h-screen">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Rooms</h1>
              <p className="text-gray-500 mt-1">Manage your room inventory and pricing</p>
            </div>
            <Button onClick={openAddModal} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add New Room
            </Button>
          </div>

          {/* Rooms Grid */}
          {rooms.length === 0 ? (
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {rooms.map((room, index) => (
                <Card 
                  key={room.id} 
                  className={cn(
                    "overflow-hidden",
                    !room.isActive && "opacity-75"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Room Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                    {room.photos.length > 0 ? (
                      <img 
                        src={room.photos[0]} 
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <span className="text-sm text-gray-400">No photos</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge variant={room.isActive ? 'success' : 'secondary'}>
                        {room.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{room.description}</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>Up to {room.maxGuests} guests</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Bed className="h-4 w-4 text-gray-400" />
                        <span>{room.numBeds} bed{room.numBeds > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-2xl font-bold text-trust-blue-600">
                          ₹{room.pricePerNight.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">/night</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(room)}
                          className="p-2 text-gray-500 hover:text-trust-blue-600 hover:bg-trust-blue-50 rounded-lg transition-colors"
                          aria-label={`Edit ${room.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(room)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label={`Delete ${room.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Room Numbers */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">Room Numbers:</p>
                      <div className="flex flex-wrap gap-2">
                        {room.roomNumbers.map(num => (
                          <span 
                            key={num}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Room Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
            <DialogDescription>
              {editingRoom 
                ? 'Update your room details below' 
                : 'Fill in the details to add a new room type'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Room Type Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Deluxe Suite"
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the room"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price per Night (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.pricePerNight}
                  onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                  placeholder="4500"
                  className={formErrors.pricePerNight ? 'border-red-500' : ''}
                />
                {formErrors.pricePerNight && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.pricePerNight}</p>
                )}
              </div>

              <div>
                <Label htmlFor="maxGuests">Max Guests</Label>
                <Input
                  id="maxGuests"
                  type="number"
                  value={formData.maxGuests}
                  onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
                  placeholder="4"
                  className={formErrors.maxGuests ? 'border-red-500' : ''}
                />
                {formErrors.maxGuests && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.maxGuests}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="numBeds">Number of Beds</Label>
              <Input
                id="numBeds"
                type="number"
                value={formData.numBeds}
                onChange={(e) => setFormData({ ...formData, numBeds: e.target.value })}
                placeholder="2"
              />
            </div>

            <div>
              <Label htmlFor="roomNumbers">Room Numbers</Label>
              <Input
                id="roomNumbers"
                value={formData.roomNumbers}
                onChange={(e) => setFormData({ ...formData, roomNumbers: e.target.value })}
                placeholder="101, 102, 103"
                className={formErrors.roomNumbers ? 'border-red-500' : ''}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter comma-separated room numbers
              </p>
              {formErrors.roomNumbers && (
                <p className="text-sm text-red-500 mt-1">{formErrors.roomNumbers}</p>
              )}
            </div>

            {/* Photo Upload Placeholder */}
            <div>
              <Label>Photos</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-trust-blue-400 transition-colors cursor-pointer">
                <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Drag & drop photos here</p>
                <p className="text-xs text-gray-400 mt-1">or click to browse</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : editingRoom ? 'Save Changes' : 'Add Room'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{roomToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
