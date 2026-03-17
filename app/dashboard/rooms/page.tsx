'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth, useToast } from '@/app/providers'
import { Plus, Pencil, Trash2, Users, Bed, Image as ImageIcon } from 'lucide-react'
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
  description: string | null
  price_per_night: number
  max_guests: number
  num_beds: number
  is_active: boolean
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
  const [isFetching, setIsFetching] = useState(true)

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
          .select('id, name, description, price_per_night, max_guests, num_beds, is_active')
          .eq('property_id', property.id)
          .order('created_at')
        if (roomsData) setRooms(roomsData as Room[])
        if (error) addToast({ title: 'Failed to load rooms', variant: 'destructive' })
      }
      setIsFetching(false)
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePerNight: '',
    maxGuests: '',
    numBeds: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setFormData({ name: '', description: '', pricePerNight: '', maxGuests: '', numBeds: '' })
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
      pricePerNight: room.price_per_night.toString(),
      maxGuests: room.max_guests.toString(),
      numBeds: room.num_beds.toString(),
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
    setFormErrors(errors)
    return Object.keys(errors).length === 0
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
      price_per_night: Number(formData.pricePerNight),
      max_guests: Number(formData.maxGuests),
      num_beds: Number(formData.numBeds) || 1,
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
        .select('id, name, description, price_per_night, max_guests, num_beds, is_active')
        .single()
      setIsLoading(false)
      if (!error && newRoom) {
        setRooms(prev => [...prev, newRoom as Room])
        setIsModalOpen(false)
        resetForm()
        addToast({ title: 'Room added', variant: 'success' })
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
              <h1 className="text-2xl font-bold text-gray-900">Your Rooms</h1>
              <p className="text-gray-500 mt-1">Manage your room inventory and pricing</p>
            </div>
            <Button onClick={openAddModal} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add New Room
            </Button>
          </div>

          {isFetching ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse" />
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {rooms.map((room) => (
                <Card key={room.id} className={cn('overflow-hidden', !room.is_active && 'opacity-75')}>
                  <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                    <ImageIcon className="h-10 w-10 text-gray-300" />
                    <div className="absolute top-3 right-3">
                      <Badge variant={room.is_active ? 'success' : 'secondary'}>
                        {room.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                        {room.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{room.description}</p>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4 text-gray-400" />
                        Up to {room.max_guests} guests
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Bed className="h-4 w-4 text-gray-400" />
                        {room.num_beds} bed{room.num_beds !== 1 ? 's' : ''}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-2xl font-bold text-trust-blue-600">
                          ₹{room.price_per_night.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">/night</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(room)}
                          className="px-2 py-1 text-xs rounded border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          {room.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => openEditModal(room)}
                          className="p-2 text-gray-500 hover:text-trust-blue-600 hover:bg-trust-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { setRoomToDelete(room); setIsDeleteDialogOpen(true) }}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
            <DialogDescription>
              {editingRoom ? 'Update your room details' : 'Fill in the details to add a new room type'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Room Type Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Deluxe Suite"
                className={cn('mt-2', formErrors.name && 'border-red-500')}
              />
              {formErrors.name && <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the room"
                className="mt-2"
              />
            </div>

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
                <Label htmlFor="maxGuests">Max Guests *</Label>
                <Input
                  id="maxGuests"
                  type="number"
                  min="1"
                  value={formData.maxGuests}
                  onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
                  placeholder="4"
                  className={cn('mt-2', formErrors.maxGuests && 'border-red-500')}
                />
                {formErrors.maxGuests && <p className="text-sm text-red-500 mt-1">{formErrors.maxGuests}</p>}
              </div>
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
              Are you sure you want to delete &quot;{roomToDelete?.name}&quot;? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
