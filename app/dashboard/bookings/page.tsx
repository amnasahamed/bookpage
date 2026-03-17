'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Calendar, Users, Check, X, Clock, MessageCircle, Home } from 'lucide-react'
import { DashboardSidebar } from '@/components/shared/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase'
import { useAuth, useToast } from '@/app/providers'

type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'expired'

interface Booking {
  id: string
  hold_code: string | null
  guest_name: string
  guest_email: string | null
  guest_phone: string | null
  check_in: string
  check_out: string
  room_id: string | null
  num_guests: number
  status: string
  hold_expires_at: string | null
  notes: string | null
  total_amount: number | null
}

interface RoomOption {
  id: string
  name: string
  price_per_night: number
}

export default function BookingsPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const supabase = createClient()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [roomOptions, setRoomOptions] = useState<RoomOption[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [selectedRoom, setSelectedRoom] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [isFetching, setIsFetching] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [propertySlug, setPropertySlug] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      setIsFetching(true)
      const { data: property } = await supabase
        .from('properties')
        .select('id, slug')
        .eq('owner_id', user.id)
        .single()

      if (property) {
        setPropertySlug(property.slug)

        const [{ data: bookingsData }, { data: roomsData }] = await Promise.all([
          supabase
            .from('bookings')
            .select('*')
            .eq('property_id', property.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('rooms')
            .select('id, name, price_per_night')
            .eq('property_id', property.id)
            .eq('is_active', true),
        ])

        if (bookingsData) setBookings(bookingsData as Booking[])
        if (roomsData) setRoomOptions(roomsData as RoomOption[])
      }
      setIsFetching(false)
    }
    fetchData()
  }, [user])

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'all') return true
    if (activeTab === 'pending') return b.status === 'pending'
    if (activeTab === 'confirmed') return b.status === 'confirmed'
    if (activeTab === 'rejected') return b.status === 'rejected' || b.status === 'cancelled'
    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':    return <Badge variant="hold">Pending</Badge>
      case 'confirmed':  return <Badge variant="success">Confirmed</Badge>
      case 'rejected':
      case 'cancelled':  return <Badge variant="destructive">Rejected</Badge>
      case 'expired':    return <Badge variant="secondary">Expired</Badge>
      default:           return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const getDaysCount = (checkIn: string, checkOut: string) =>
    Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))

  const handleAccept = async () => {
    if (!selectedBooking) return
    setActionLoading(selectedBooking.id)
    const updatePayload: any = { status: 'confirmed' }
    if (selectedRoom) updatePayload.room_id = selectedRoom
    const { error } = await supabase.from('bookings').update(updatePayload).eq('id', selectedBooking.id)
    if (!error) {
      setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, ...updatePayload } : b))
      addToast({ title: 'Booking confirmed', variant: 'success' })
    } else {
      addToast({ title: 'Failed to confirm booking', variant: 'destructive' })
    }
    setActionLoading(null)
    setIsAcceptModalOpen(false)
    setSelectedBooking(null)
    setSelectedRoom('')
  }

  const handleReject = async () => {
    if (!selectedBooking) return
    setActionLoading(selectedBooking.id)
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'rejected', notes: rejectionReason || null })
      .eq('id', selectedBooking.id)
    if (!error) {
      setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, status: 'rejected', notes: rejectionReason || null } : b))
      addToast({ title: 'Booking rejected', variant: 'success' })
    } else {
      addToast({ title: 'Failed to reject booking', variant: 'destructive' })
    }
    setActionLoading(null)
    setIsRejectModalOpen(false)
    setSelectedBooking(null)
    setRejectionReason('')
  }

  const copyPageLink = async () => {
    const url = `${window.location.origin}/${propertySlug}`
    try {
      await navigator.clipboard.writeText(url)
      addToast({ title: 'Page link copied!', variant: 'success' })
    } catch {
      addToast({ title: 'Copy failed', variant: 'destructive' })
    }
  }

  const pendingCount = bookings.filter(b => b.status === 'pending').length

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar pendingBookingsCount={pendingCount} />

      <main className="lg:ml-[260px] min-h-screen">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Booking Requests</h1>
            <p className="text-gray-500 mt-1">Manage all your booking requests</p>
          </div>

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
                  {pendingCount}
                </span>
              </TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>

          {isFetching ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-36 bg-white rounded-xl border border-gray-200 animate-pulse" />
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-500 mb-6">Share your page link to start getting bookings</p>
              <Button variant="outline" onClick={copyPageLink}>Copy Page Link</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {booking.hold_code && (
                            <span className="text-sm font-bold text-trust-blue-600 font-mono">
                              #{booking.hold_code}
                            </span>
                          )}
                          {getStatusBadge(booking.status)}
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900">{booking.guest_name}</h3>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                          {booking.guest_email && <span>{booking.guest_email}</span>}
                          {booking.guest_phone && (
                            <button
                              onClick={() => window.open(`https://wa.me/${booking.guest_phone?.replace(/[^\d]/g, '')}`, '_blank')}
                              className="flex items-center gap-1 text-success-green-600 hover:underline"
                            >
                              <MessageCircle className="h-4 w-4" />
                              {booking.guest_phone}
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-6 mt-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              <span className="font-medium">{formatDate(booking.check_in)}</span>
                              {' → '}
                              <span className="font-medium">{formatDate(booking.check_out)}</span>
                              <span className="text-gray-500 ml-1">
                                ({getDaysCount(booking.check_in, booking.check_out)} nights)
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{booking.num_guests} guests</span>
                          </div>
                          {booking.total_amount && (
                            <div className="text-sm font-semibold text-gray-900">
                              ₹{booking.total_amount.toLocaleString()}
                            </div>
                          )}
                        </div>

                        {booking.status === 'pending' && booking.hold_expires_at && (
                          <div className="flex items-center gap-2 mt-3 text-sm text-hold-orange">
                            <Clock className="h-4 w-4" />
                            <span>Expires: {formatDate(booking.hold_expires_at)}</span>
                          </div>
                        )}

                        {(booking.status === 'rejected' || booking.status === 'cancelled') && booking.notes && (
                          <p className="mt-3 text-sm text-gray-500">
                            <span className="font-medium">Reason:</span> {booking.notes}
                          </p>
                        )}
                      </div>

                      {booking.status === 'pending' && (
                        <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
                          <Button
                            size="sm"
                            onClick={() => { setSelectedBooking(booking); setIsAcceptModalOpen(true) }}
                            disabled={actionLoading === booking.id}
                            className="flex-1"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSelectedBooking(booking); setIsRejectModalOpen(true) }}
                            disabled={actionLoading === booking.id}
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
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              Confirm booking for {selectedBooking?.guest_name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {roomOptions.length > 0 && (
              <>
                <Label>Assign Room (optional)</Label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a room..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roomOptions.map(r => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name} — ₹{r.price_per_night.toLocaleString()}/night
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAcceptModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAccept} disabled={actionLoading === selectedBooking?.id}>
              {actionLoading === selectedBooking?.id ? 'Confirming...' : 'Confirm Booking'}
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
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={actionLoading === selectedBooking?.id}>
              {actionLoading === selectedBooking?.id ? 'Rejecting...' : 'Reject Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
