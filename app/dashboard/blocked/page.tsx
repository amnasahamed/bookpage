'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth, useToast } from '@/app/providers'
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Clock,
  AlertCircle,
  Ban
} from 'lucide-react'
import { DashboardSidebar } from '@/components/shared/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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

interface BlockedDate {
  id: string
  start_date: string
  end_date: string
  reason?: string
  property_id?: string
}

interface RoomOption { id: string; name: string }

export default function BlockedDatesPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const supabase = createClient()
  const [propertyId, setPropertyId] = useState<string | null>(null)
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [roomOptions, setRoomOptions] = useState<RoomOption[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [dateToDelete, setDateToDelete] = useState<BlockedDate | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState('all')

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
        const [{ data: blocked }, { data: roomsData }] = await Promise.all([
          supabase.from('blocked_dates').select('*').eq('property_id', property.id).order('start_date'),
          supabase.from('rooms').select('id, name').eq('property_id', property.id).eq('is_active', true),
        ])
        if (blocked) setBlockedDates(blocked as BlockedDate[])
        if (roomsData) setRoomOptions(roomsData as RoomOption[])
      }
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Form state
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    roomId: 'all',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [bulkInput, setBulkInput] = useState('')

  const resetForm = () => {
    setFormData({
      startDate: '',
      endDate: '',
      reason: '',
      roomId: 'all',
    })
    setFormErrors({})
    setBulkInput('')
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.startDate) errors.startDate = 'Start date is required'
    if (!formData.endDate) errors.endDate = 'End date is required'
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (end < start) {
        errors.endDate = 'End date must be after start date'
      }
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return
    if (!propertyId) return
    setIsLoading(true)
    const { data: newEntry, error } = await supabase
      .from('blocked_dates')
      .insert({
        property_id: propertyId,
        start_date: formData.startDate,
        end_date: formData.endDate,
        reason: formData.reason,
      })
      .select()
      .single()
    setIsLoading(false)
    if (!error && newEntry) {
      setBlockedDates(prev => [...prev, newEntry as BlockedDate])
      setIsModalOpen(false)
      addToast({ title: 'Dates blocked successfully', variant: 'success' })
    } else {
      addToast({ title: 'Failed to block dates', variant: 'destructive' })
    }
    resetForm()
  }

  const handleBulkAdd = async () => {
    if (!propertyId || !bulkInput.trim()) return

    const lines = bulkInput.trim().split('\n').filter(line => line.trim())
    const newEntries: { property_id: string; start_date: string; end_date: string; reason: string }[] = []

    for (const line of lines) {
      const parts = line.split(',').map(s => s.trim())
      if (parts.length >= 2) {
        const [startDate, endDate, reason = ''] = parts
        if (startDate && endDate) {
          newEntries.push({ property_id: propertyId, start_date: startDate, end_date: endDate, reason })
        }
      }
    }

    if (newEntries.length === 0) {
      addToast({ title: 'No valid date ranges found', description: 'Format: YYYY-MM-DD, YYYY-MM-DD, Optional reason', variant: 'destructive' })
      return
    }

    const { data, error } = await supabase.from('blocked_dates').insert(newEntries).select()
    if (!error && data) {
      setBlockedDates(prev => [...prev, ...data as BlockedDate[]])
      setBulkInput('')
      addToast({ title: `Blocked ${newEntries.length} date range(s)`, variant: 'success' })
    } else {
      addToast({ title: 'Failed to block dates', variant: 'destructive' })
    }
  }

  const handleDelete = (blockedDate: BlockedDate) => {
    setDateToDelete(blockedDate)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!dateToDelete) return
    const { error } = await supabase.from('blocked_dates').delete().eq('id', dateToDelete.id)
    if (!error) {
      setBlockedDates(prev => prev.filter(d => d.id !== dateToDelete.id))
      addToast({ title: 'Date range unblocked', variant: 'success' })
    } else {
      addToast({ title: 'Failed to unblock dates', variant: 'destructive' })
    }
    setIsDeleteDialogOpen(false)
    setDateToDelete(null)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const getDaysCount = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return diff
  }

  const getRoomName = (roomId?: string) => {
    if (!roomId || roomId === 'all') return 'All Rooms'
    return roomOptions.find(r => r.id === roomId)?.name || 'Unknown Room'
  }

const filteredBlockedDates = selectedRoom === 'all' ? blockedDates : blockedDates.filter(b => (b as any).room_id === selectedRoom)

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />
      
      <main className="lg:ml-[260px] min-h-screen">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Blocked Dates</h1>
              <p className="text-gray-500 mt-1">Block dates when rooms are unavailable</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Block Date Range
            </Button>
          </div>

          {/* Info Banner */}
          <div className="bg-trust-blue-50 border border-trust-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-trust-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-trust-blue-900">
                  How blocking works
                </h4>
                <p className="text-sm text-trust-blue-700 mt-1">
                  Guests won&apos;t be able to request bookings for blocked dates. 
                  You can block specific rooms or all rooms at once.
                </p>
              </div>
            </div>
          </div>

          {/* Room Filter */}
          <div className="mb-6">
            <Label htmlFor="roomFilter" className="text-sm font-medium text-gray-700">
              Filter by Room
            </Label>
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger className="w-full sm:w-64 mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                {roomOptions.map(room => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Blocked Dates List */}
          {filteredBlockedDates.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <Ban className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blocked dates</h3>
              <p className="text-gray-500 mb-6">Block dates when your property is unavailable</p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Block Dates
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBlockedDates.map((blocked, index) => (
                <Card 
                  key={blocked.id}
                  className="overflow-hidden"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                          <Calendar className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg font-semibold text-gray-900">
                              {formatDate(blocked.start_date)}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="text-lg font-semibold text-gray-900">
                              {formatDate(blocked.end_date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              {getDaysCount(blocked.start_date, blocked.end_date)} days
                            </Badge>
                          </div>
                          {blocked.reason && (
                            <p className="text-sm text-gray-500 mt-2">
                              <span className="font-medium">Reason:</span> {blocked.reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(blocked)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors self-start sm:self-center"
                        aria-label="Delete blocked date"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Blocked Date Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Block Date Range</DialogTitle>
            <DialogDescription>
              Select the dates and rooms to block
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="room">Room</Label>
              <Select 
                value={formData.roomId} 
                onValueChange={(value) => setFormData({ ...formData, roomId: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  {roomOptions.map(room => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className={cn('mt-2', formErrors.startDate && 'border-red-500')}
                />
                {formErrors.startDate && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.startDate}</p>
                )}
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={cn('mt-2', formErrors.endDate && 'border-red-500')}
                />
                {formErrors.endDate && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.endDate}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="reason">Reason (optional)</Label>
              <Input
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="e.g., Owner staying, Maintenance"
                className="mt-2"
              />
            </div>

            {/* Bulk Input */}
            <div className="pt-4 border-t border-gray-200">
              <Label htmlFor="bulk">Bulk Input (optional)</Label>
              <textarea
                id="bulk"
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="Paste multiple ranges (e.g., March 15-18, March 22-25)"
                className="w-full mt-2 px-4 py-3 rounded-lg border border-gray-300 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-trust-blue-500 focus:ring-2 focus:ring-trust-blue-100 transition-all duration-200 resize-none"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                For bulk entry, paste dates in any format and we&apos;ll parse them
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={bulkInput ? handleBulkAdd : handleSave} 
              disabled={isLoading}
            >
              {isLoading ? 'Blocking...' : 'Block Dates'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Unblock Dates</DialogTitle>
            <DialogDescription>
              Are you sure you want to unblock these dates? Guests will be able to book them.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isLoading}>
              {isLoading ? 'Unblocking...' : 'Unblock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
