'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Users, 
  Check, 
  X, 
  Clock, 
  MessageCircle,
  ChevronDown,
  Home
} from 'lucide-react'
import { DashboardSidebar } from '@/components/shared/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { useAuth, useToast } from '@/app/providers'

type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'expired'

interface Booking {
  id: string
  holdCode: string
  guestName: string
  guestEmail: string
  guestPhone: string
  checkIn: string
  checkOut: string
  roomType: string
  numGuests: number
  status: BookingStatus
  holdExpiresAt?: string
  rejectionReason?: string
}

const initialBookings: Booking[] = [
  {
    id: '1',
    holdCode: 'BP-7842',
    guestName: 'Rahul Sharma',
    guestEmail: 'rahul@example.com',
    guestPhone: '+91 98765 43210',
    checkIn: '2024-03-15',
    checkOut: '2024-03-18',
    roomType: 'Deluxe Suite',
    numGuests: 3,
    status: 'pending',
    holdExpiresAt: '2024-03-10T18:00:00',
  },
  {
    id: '2',
    holdCode: 'BP-7841',
    guestName: 'Priya Patel',
    guestEmail: 'priya@example.com',
    guestPhone: '+91 98765 12345',
    checkIn: '2024-03-20',
    checkOut: '2024-03-22',
    roomType: 'Standard Room',
    numGuests: 2,
    status: 'accepted',
  },
  {
    id: '3',
    holdCode: 'BP-7839',
    guestName: 'Amit Kumar',
    guestEmail: 'amit@example.com',
    guestPhone: '+91 98765 67890',
    checkIn: '2024-03-25',
    checkOut: '2024-03-28',
    roomType: 'Family Room',
    numGuests: 5,
    status: 'rejected',
    rejectionReason: 'Dates not available',
  },
  {
    id: '4',
    holdCode: 'BP-7835',
    guestName: 'Sneha Gupta',
    guestEmail: 'sneha@example.com',
    guestPhone: '+91 98765 11111',
    checkIn: '2024-02-10',
    checkOut: '2024-02-12',
    roomType: 'Deluxe Suite',
    numGuests: 2,
    status: 'expired',
  },
]

const availableRooms = [
  { id: '101', name: 'Room 101 - Deluxe Suite' },
  { id: '102', name: 'Room 102 - Deluxe Suite' },
  { id: '201', name: 'Room 201 - Standard Room' },
  { id: '202', name: 'Room 202 - Standard Room' },
]

export default function BookingsPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const supabase = createClient()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [selectedRoom, setSelectedRoom] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [propertyId, setPropertyId] = useState<string | null>(null)
  const [propertySlug, setPropertySlug] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      setIsLoading(true)
      const { data: property } = await supabase
        .from('properties')
        .select('id, slug')
        .eq('owner_id', user.id)
        .single()

      if (property) {
        setPropertyId(property.id)
        setPropertySlug(property.slug)

        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('*')
          .eq('property_id', property.id)
          .order('created_at', { ascending: false })

        if (bookingsData) setBookings(bookingsData as Booking[])
      }
      setIsLoading(false)
    }
    fetchData()
  }, [user])

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true
    return booking.status === activeTab
  })

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="hold">Pending</Badge>
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>
      default:
        return null
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const getDaysCount = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const openAcceptModal = (booking: Booking) => {
    setSelectedBooking(booking)
    setSelectedRoom('')
    setIsAcceptModalOpen(true)
  }

  const openRejectModal = (booking: Booking) => {
    setSelectedBooking(booking)
    setRejectionReason('')
    setIsRejectModalOpen(true)
  }

  const confirmAccept = async () => {
    if (!selectedBooking || !selectedRoom) return
    await handleAccept(selectedBooking.id)
    setIsAcceptModalOpen(false)
    setSelectedBooking(null)
    setSelectedRoom('')
  }

  const confirmReject = async () => {
    if (!selectedBooking) return
    await handleReject(selectedBooking.id, rejectionReason)
    setIsRejectModalOpen(false)
    setSelectedBooking(null)
    setRejectionReason('')
  }

  const handleAccept = async (bookingId: string) => {
    setActionLoading(bookingId)
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', bookingId)
    if (!error) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'accepted' as BookingStatus } : b))
      addToast({ title: 'Booking accepted', variant: 'success' })
    } else {
      addToast({ title: 'Failed to accept booking', variant: 'destructive' })
    }
    setActionLoading(null)
  }

  const handleReject = async (bookingId: string, reason?: string) => {
    setActionLoading(bookingId)
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
    if (!error) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'rejected' as BookingStatus } : b))
      addToast({ title: 'Booking rejected', variant: 'success' })
    } else {
      addToast({ title: 'Failed to reject booking', variant: 'destructive' })
    }
    setActionLoading(null)
  }

  const copyPageLink = async () => {
    const url = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/${propertySlug}`
    try {
      await navigator.clipboard.writeText(url)
      addToast({ title: 'Page link copied!', variant: 'success' })
    } catch {
      addToast({ title: 'Copy failed', description: 'Please copy the link manually', variant: 'destructive' })
    }
  }

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\s/g, '').replace(/\+/g, '')
    window.open(`https://wa.me/${cleanPhone}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar propertyName="Moonlight Villa" verificationStatus="approved" />
      
      <main className="lg:ml-[260px] min-h-screen">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Booking Requests</h1>
            <p className="text-gray-500 mt-1">Manage all your booking requests and holds</p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-flex">
              <TabsTrigger value="all">
                All
                <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                  {bookings.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending
                <span className="ml-2 text-xs bg-hold-orange/20 text-hold-orange px-2 py-0.5 rounded-full">
                  {bookings.filter(b => b.status === 'pending').length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-500 mb-6">Share your page link to start getting bookings</p>
              <Button variant="outline" onClick={copyPageLink}>Copy Page Link</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking, index) => (
                <Card 
                  key={booking.id}
                  className="overflow-hidden"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Left: Guest Info */}
                      <div className="flex-1">
                        {/* Hold Code */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-lg font-bold text-trust-blue-600 font-mono">
                            #{booking.holdCode}
                          </span>
                          {getStatusBadge(booking.status)}
                        </div>

                        {/* Guest Details */}
                        <h3 className="text-lg font-semibold text-gray-900">{booking.guestName}</h3>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>{booking.guestEmail}</span>
                          <button
                            onClick={() => openWhatsApp(booking.guestPhone)}
                            className="flex items-center gap-1 text-success-green-600 hover:text-success-green-700 hover:underline"
                          >
                            <MessageCircle className="h-4 w-4" />
                            {booking.guestPhone}
                          </button>
                        </div>

                        {/* Dates & Room */}
                        <div className="flex flex-wrap items-center gap-6 mt-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              <span className="font-medium">{formatDate(booking.checkIn)}</span>
                              {' → '}
                              <span className="font-medium">{formatDate(booking.checkOut)}</span>
                            </span>
                            <span className="text-xs text-gray-500">
                              ({getDaysCount(booking.checkIn, booking.checkOut)} nights)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{booking.roomType}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{booking.numGuests} guests</span>
                          </div>
                        </div>

                        {/* Expiry Timer (for pending) */}
                        {booking.status === 'pending' && booking.holdExpiresAt && (
                          <div className="flex items-center gap-2 mt-3 text-sm text-hold-orange">
                            <Clock className="h-4 w-4" />
                            <span>Hold expires soon</span>
                          </div>
                        )}

                        {/* Rejection Reason */}
                        {booking.status === 'rejected' && booking.rejectionReason && (
                          <div className="mt-3 text-sm text-gray-500">
                            <span className="font-medium">Reason:</span> {booking.rejectionReason}
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      {booking.status === 'pending' && (
                        <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
                          <Button
                            size="sm"
                            onClick={() => openAcceptModal(booking)}
                            className="flex-1"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRejectModal(booking)}
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Accept Modal */}
      <Dialog open={isAcceptModalOpen} onOpenChange={setIsAcceptModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Accept Booking</DialogTitle>
            <DialogDescription>
              Select a room to assign to {selectedBooking?.guestName}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="room">Select Room</Label>
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose a room..." />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map(room => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-2">
              The selected dates will be automatically blocked for this room.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAcceptModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmAccept} 
              disabled={!selectedRoom || isLoading}
            >
              {isLoading ? 'Confirming...' : 'Confirm Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this booking request?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input
              id="reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Dates not available"
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmReject} 
              disabled={isLoading}
            >
              {isLoading ? 'Rejecting...' : 'Reject Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
