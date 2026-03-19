'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useAuth, useToast } from '@/app/providers'
import {
  Camera,
  Calendar,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Upload,
  Trash2,
  Plus,
  X,
  Clock,
  Users,
  MapPin,
  Link as LinkIcon,
  Loader2,
  ImageIcon,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

// ============================================================================
// TYPES
// ============================================================================

interface PropertyImage {
  id: string
  url: string
  caption?: string
  sort_order: number
}

interface Availability {
  date: string
  status: 'available' | 'on_hold' | 'booked'
}

interface Hold {
  id: string
  check_in: string
  check_out: string
  guest_name?: string
  guest_phone?: string
  num_guests: number
  whatsapp_msg?: string
  expires_at: string
  status: string
}

interface Property {
  id: string
  name: string
  slug: string
  description?: string
  location?: string
  whatsapp: string
  price_per_night: number
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { addToast } = useToast()
  const supabase = createClient()

  // Core state
  const [property, setProperty] = useState<Property | null>(null)
  const [images, setImages] = useState<PropertyImage[]>([])
  const [availability, setAvailability] = useState<Availability[]>([])
  const [holds, setHolds] = useState<Hold[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'calendar' | 'photos' | 'settings'>('calendar')
  const [holdTimers, setHoldTimers] = useState<Record<string, string>>({})

  // Form state for settings
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    price: '',
    location: '',
    description: '',
    slug: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  // Image upload state
  const [uploadingImages, setUploadingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<string | null>(null)

  // Setup wizard state
  const [showSetup, setShowSetup] = useState(false)

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchProperty = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', user.id)
      .single()

    if (error || !data) {
      setShowSetup(true)
      setLoading(false)
      return
    }

    setProperty(data)
    setFormData({
      name: data.name || '',
      whatsapp: data.whatsapp || '',
      price: data.price_per_night?.toString() || '',
      location: data.location || '',
      description: data.description || '',
      slug: data.slug || '',
    })

    // Fetch related data in parallel
    await Promise.all([
      fetchImages(data.id),
      fetchAvailability(data.id),
      fetchHolds(data.id),
    ])

    setShowSetup(false)
    setLoading(false)
  }, [user, supabase])

  const fetchImages = async (propertyId: string) => {
    const { data } = await supabase
      .from('property_images')
      .select('*')
      .eq('property_id', propertyId)
      .order('sort_order')

    if (data) setImages(data)
  }

  const fetchAvailability = async (propertyId: string) => {
    const today = new Date()
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + 90)

    const { data } = await supabase
      .from('availability')
      .select('date, status')
      .eq('property_id', propertyId)
      .gte('date', today.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])

    if (data) setAvailability(data)
  }

  const fetchHolds = async (propertyId: string) => {
    const { data } = await supabase
      .from('holds')
      .select('*')
      .eq('property_id', propertyId)
      .eq('status', 'active')
      .order('expires_at')

    if (data) setHolds(data)
  }

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchProperty()
    }
  }, [user, authLoading, router, fetchProperty])

  // Hold timers countdown
  useEffect(() => {
    if (holds.length === 0) return

    const interval = setInterval(() => {
      const newTimers: Record<string, string> = {}
      let needsRefresh = false

      holds.forEach(hold => {
        if (hold.status === 'active') {
          const expiresAt = new Date(hold.expires_at).getTime()
          const now = Date.now()
          const diff = expiresAt - now

          if (diff <= 0) {
            newTimers[hold.id] = 'Expired'
            needsRefresh = true
          } else {
            const minutes = Math.floor(diff / 60000)
            const seconds = Math.floor((diff % 60000) / 1000)
            newTimers[hold.id] = `${minutes}:${seconds.toString().padStart(2, '0')}`
          }
        }
      })

      setHoldTimers(newTimers)
      if (needsRefresh && property) {
        fetchHolds(property.id)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [holds, property])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const validatePropertyForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) errors.name = 'Property name is required'
    if (!formData.whatsapp.trim()) errors.whatsapp = 'WhatsApp number is required'
    if (!formData.price || Number(formData.price) <= 0) errors.price = 'Enter a valid price'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateProperty = async () => {
    if (!validatePropertyForm()) return

    setSaving(true)
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const { data, error } = await supabase
      .from('properties')
      .insert({
        owner_id: user!.id,
        name: formData.name,
        slug,
        whatsapp: formData.whatsapp,
        price_per_night: Number(formData.price),
        location: formData.location,
        description: formData.description,
      })
      .select()
      .single()

    setSaving(false)

    if (error) {
      addToast({ title: 'Failed to create property', description: error.message, variant: 'destructive' })
      return
    }

    setProperty(data)
    setFormData(prev => ({ ...prev, slug }))
    setShowSetup(false)
    addToast({ title: 'Property created!', variant: 'success' })

    // Fetch related data
    await Promise.all([
      fetchImages(data.id),
      fetchAvailability(data.id),
      fetchHolds(data.id),
    ])
  }

  const handleUpdateSettings = async () => {
    if (!property || !validatePropertyForm()) return
    setSaving(true)

    const { error } = await supabase
      .from('properties')
      .update({
        name: formData.name,
        whatsapp: formData.whatsapp,
        price_per_night: Number(formData.price),
        location: formData.location,
        description: formData.description,
      })
      .eq('id', property.id)

    setSaving(false)

    if (error) {
      addToast({ title: 'Failed to update', description: error.message, variant: 'destructive' })
      return
    }

    addToast({ title: 'Settings saved', variant: 'success' })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !property) return

    setUploadingImages(true)
    let uploadedCount = 0

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${property.id}/${Date.now()}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, file)

      if (uploadError) {
        addToast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' })
        continue
      }

      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName)

      const { data: imageData, error: dbError } = await supabase
        .from('property_images')
        .insert({
          property_id: property.id,
          url: urlData.publicUrl,
          sort_order: images.length,
          is_cover: images.length === 0,
        })
        .select()
        .single()

      if (!dbError && imageData) {
        setImages(prev => [...prev, imageData])
        uploadedCount++
      }
    }

    setUploadingImages(false)
    if (fileInputRef.current) fileInputRef.current.value = ''

    if (uploadedCount > 0) {
      addToast({ title: `${uploadedCount} image${uploadedCount > 1 ? 's' : ''} uploaded`, variant: 'success' })
    }
  }

  const handleDeleteImage = async () => {
    if (!imageToDelete || !property) return

    const { error } = await supabase
      .from('property_images')
      .delete()
      .eq('id', imageToDelete)

    if (error) {
      addToast({ title: 'Failed to delete', variant: 'destructive' })
      return
    }

    setImages(prev => prev.filter(img => img.id !== imageToDelete))
    addToast({ title: 'Image deleted', variant: 'success' })
    setImageToDelete(null)
  }

  const handleToggleDate = async (date: string) => {
    if (!property) return

    const currentStatus = availability.find(a => a.date === date)?.status || 'available'
    const newStatus: 'available' | 'on_hold' | 'booked' =
      currentStatus === 'available' ? 'booked' : 'available'

    // Optimistic update
    setAvailability(prev => {
      const exists = prev.find(a => a.date === date)
      if (exists) {
        return prev.map(a => a.date === date ? { ...a, status: newStatus } : a)
      }
      return [...prev, { date, status: newStatus }]
    })

    const { error } = await supabase
      .from('availability')
      .upsert({
        property_id: property.id,
        date,
        status: newStatus,
      })

    if (error) {
      // Rollback on error
      fetchAvailability(property.id)
      addToast({ title: 'Failed to update date', variant: 'destructive' })
    }
  }

  const handleReleaseHold = async (holdId: string) => {
    if (!property) return

    // Optimistic update
    setHolds(prev => prev.filter(h => h.id !== holdId))

    const hold = holds.find(h => h.id === holdId)

    // Update hold status
    await supabase
      .from('holds')
      .update({ status: 'cancelled' })
      .eq('id', holdId)

    // Update availability for the hold's dates
    if (hold) {
      const dates = []
      const checkIn = new Date(hold.check_in)
      const checkOut = new Date(hold.check_out)

      for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0])
      }

      for (const date of dates) {
        await supabase
          .from('availability')
          .update({ status: 'available', hold_id: null })
          .eq('property_id', property.id)
          .eq('date', date)
      }
    }

    fetchAvailability(property.id)
    addToast({ title: 'Hold released', variant: 'success' })
  }

  const copyBookingLink = () => {
    const link = `${window.location.origin}/${property?.slug}`
    navigator.clipboard.writeText(link)
    addToast({ title: 'Link copied!', variant: 'success' })
  }

  // ============================================================================
  // RENDER STATES
  // ============================================================================

  if (authLoading || loading) {
    return (
      <DashboardSkeleton />
    )
  }

  if (showSetup) {
    return (
      <SetupWizard
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        onSubmit={handleCreateProperty}
        saving={saving}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-trust-blue-500 to-trust-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-trust-blue-500/20">
                {property?.name?.charAt(0)?.toUpperCase() || 'P'}
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">{property?.name}</h1>
                <p className="text-xs text-slate-500">Property Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              className="p-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1.5 p-1.5 bg-slate-100 rounded-xl">
            {[
              { id: 'calendar', label: 'Calendar', icon: Calendar },
              { id: 'photos', label: 'Photos', icon: Camera },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all
                  ${activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                  }
                `}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Active Holds Alert */}
        {holds.length > 0 && activeTab === 'calendar' && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2 text-amber-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Active Booking Requests</span>
            </div>
            {holds.map(hold => (
              <div
                key={hold.id}
                className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white rounded-full text-sm font-bold">
                        <Clock className="h-3.5 w-3.5" />
                        {holdTimers[hold.id] || '...'}
                      </span>
                      {hold.guest_name && (
                        <span className="font-semibold text-slate-900">{hold.guest_name}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {hold.check_in} → {hold.check_out}
                      </span>
                      {hold.num_guests > 1 && (
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {hold.num_guests} guests
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleReleaseHold(hold.id)}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    Release
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <CalendarManager
                availability={availability}
                onToggleDate={handleToggleDate}
              />
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-500 rounded-lg" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-500 rounded-lg" />
                <span>On Hold</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-rose-500 rounded-lg" />
                <span>Booked</span>
              </div>
            </div>

            <p className="text-center text-xs text-slate-400">
              Tap a date to toggle availability. Tap again to revert.
            </p>
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Property Photos</h2>
                <p className="text-sm text-slate-500">{images.length} photo{images.length !== 1 ? 's' : ''}</p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImages}
                size="sm"
              >
                {uploadingImages ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Add Photos
                  </>
                )}
              </Button>
            </div>

            {images.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No photos yet</h3>
                <p className="text-slate-500 mb-6 max-w-xs mx-auto">
                  Add vertical photos to showcase your property. They'll appear on your booking page.
                </p>
                <Button onClick={() => fileInputRef.current?.click()} disabled={uploadingImages}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photos
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden group"
                  >
                    <img
                      src={image.url}
                      alt={`Property photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {index === 0 && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-trust-blue-600 text-white text-xs font-medium rounded-lg flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Cover
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setImageToDelete(image.id)
                        setDeleteDialogOpen(true)
                      }}
                      className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImages}
                  className="aspect-[3/4] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-trust-blue-400 hover:text-trust-blue-600 transition-all"
                >
                  <Plus className="h-6 w-6" />
                  <span className="text-sm font-medium">Add More</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Property Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-slate-900">Property Details</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Property Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Sunset Villa Goa"
                    className={formErrors.name ? 'border-red-500' : ''}
                  />
                  {formErrors.name && <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className={formErrors.whatsapp ? 'border-red-500' : ''}
                  />
                  {formErrors.whatsapp && <p className="text-sm text-red-500 mt-1">{formErrors.whatsapp}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price per Night (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="8500"
                      className={formErrors.price ? 'border-red-500' : ''}
                    />
                    {formErrors.price && <p className="text-sm text-red-500 mt-1">{formErrors.price}</p>}
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Anjuna, Goa"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Tell guests what makes your property special..."
                    rows={3}
                  />
                </div>
              </div>

              <Button onClick={handleUpdateSettings} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>

            {/* Booking Link Card */}
            <div className="bg-gradient-to-br from-trust-blue-50 to-indigo-50 rounded-2xl border border-trust-blue-100 p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-trust-blue-100 flex items-center justify-center">
                  <LinkIcon className="h-5 w-5 text-trust-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Your Booking Page</h3>
                  <p className="text-sm text-slate-500">Share this link with potential guests</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white px-4 py-3 rounded-xl border border-slate-200 text-sm font-mono truncate">
                  {typeof window !== 'undefined' ? `${window.location.origin}/${property?.slug}` : ''}
                </code>
                <Button onClick={copyBookingLink} variant="outline" size="sm">
                  {<Copy className="h-4 w-4" />}
                </Button>
              </div>

              <p className="text-xs text-trust-blue-600 mt-3 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Share in your Instagram bio, WhatsApp status, or anywhere!
              </p>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Quick Stats</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <div className="text-2xl font-bold text-trust-blue-600">{images.length}</div>
                  <div className="text-xs text-slate-500">Photos</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <div className="text-2xl font-bold text-emerald-600">
                    {availability.filter(a => a.status === 'available').length}
                  </div>
                  <div className="text-xs text-slate-500">Available Days</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <div className="text-2xl font-bold text-amber-600">{holds.length}</div>
                  <div className="text-xs text-slate-500">Active Holds</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Photo</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this photo? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteImage}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================================================
// SKELETON LOADING STATE
// ============================================================================

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse" />
              <div className="space-y-2">
                <div className="w-32 h-4 bg-slate-200 rounded animate-pulse" />
                <div className="w-20 h-3 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="flex gap-1.5 p-1.5 bg-slate-100 rounded-xl">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex-1 h-10 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="aspect-square bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

// ============================================================================
// SETUP WIZARD COMPONENT
// ============================================================================

interface SetupWizardProps {
  formData: Record<string, string>
  setFormData: React.Dispatch<React.SetStateAction<Record<string, string>>>
  formErrors: Record<string, string>
  onSubmit: () => void
  saving: boolean
}

function SetupWizard({ formData, setFormData, formErrors, onSubmit, saving }: SetupWizardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-trust-blue-50/30 to-indigo-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-trust-blue-500 to-trust-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-trust-blue-500/30">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Your Booking Page</h1>
          <p className="text-slate-500 mt-2">Set up in under a minute</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 space-y-5">
          <div className="space-y-4">
            <div>
              <Label htmlFor="setup-name">Property Name</Label>
              <Input
                id="setup-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Sunset Villa Goa"
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>}
            </div>

            <div>
              <Label htmlFor="setup-whatsapp">WhatsApp Number</Label>
              <Input
                id="setup-whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="+91 98765 43210"
                className={formErrors.whatsapp ? 'border-red-500' : ''}
              />
              <p className="text-xs text-slate-500 mt-1">Guests will message you here to book</p>
              {formErrors.whatsapp && <p className="text-sm text-red-500 mt-1">{formErrors.whatsapp}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="setup-price">Price per Night</Label>
                <Input
                  id="setup-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="8500"
                  className={formErrors.price ? 'border-red-500' : ''}
                />
                {formErrors.price && <p className="text-sm text-red-500 mt-1">{formErrors.price}</p>}
              </div>
              <div>
                <Label htmlFor="setup-location">Location</Label>
                <Input
                  id="setup-location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Anjuna, Goa"
                />
              </div>
            </div>
          </div>

          <Button onClick={onSubmit} disabled={saving} size="lg" className="w-full">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create My Page
                <Sparkles className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>

          <p className="text-center text-xs text-slate-400">
            You can add photos and more details after creating your page
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// CALENDAR MANAGER COMPONENT
// ============================================================================

interface CalendarManagerProps {
  availability: Availability[]
  onToggleDate: (date: string) => void
}

function CalendarManager({ availability, onToggleDate }: CalendarManagerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDateStatus = (date: Date): 'available' | 'on_hold' | 'booked' => {
    const dateStr = date.toISOString().split('T')[0]
    const avail = availability.find(a => a.date === dateStr)
    return avail?.status || 'available'
  }

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const month = currentMonth
  const daysInMonth = getDaysInMonth(month)
  const firstDay = getFirstDayOfMonth(month)
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const prevMonth = () => setCurrentMonth(new Date(month.getFullYear(), month.getMonth() - 1))
  const nextMonth = () => setCurrentMonth(new Date(month.getFullYear(), month.getMonth() + 1))

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </button>
        <h3 className="font-bold text-lg text-slate-900">
          {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-slate-600" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-slate-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const date = new Date(month.getFullYear(), month.getMonth(), day)
          const isPast = date < today
          const status = getDateStatus(date)

          return (
            <button
              key={day}
              onClick={() => !isPast && onToggleDate(date.toISOString().split('T')[0])}
              disabled={isPast}
              className={`
                aspect-square rounded-xl text-sm font-semibold transition-all
                ${isPast ? 'text-slate-300 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                ${status === 'available' && !isPast ? 'bg-emerald-500 text-white hover:bg-emerald-600' : ''}
                ${status === 'on_hold' && !isPast ? 'bg-amber-500 text-white hover:bg-amber-600' : ''}
                ${status === 'booked' && !isPast ? 'bg-rose-500 text-white hover:bg-rose-600' : ''}
                ${isPast ? 'bg-slate-100 text-slate-300' : ''}
              `}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
