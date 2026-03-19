'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/app/providers'
import {
  Camera,
  Calendar,
  MessageCircle,
  IndianRupee,
  Link as LinkIcon,
  Upload,
  X,
  Check,
  Clock,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  LogOut,
  GripVertical,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const supabase = createClient()

  const [property, setProperty] = useState<Property | null>(null)
  const [images, setImages] = useState<PropertyImage[]>([])
  const [availability, setAvailability] = useState<Availability[]>([])
  const [holds, setHolds] = useState<Hold[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [activeTab, setActiveTab] = useState<'calendar' | 'photos' | 'settings'>('calendar')
  const [holdTimers, setHoldTimers] = useState<Record<string, string>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state for settings
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    price: '',
    location: '',
    description: '',
    slug: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchProperty()
      fetchAvailability()
      fetchHolds()
    }
  }, [user, authLoading])

  // Update hold timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers: Record<string, string> = {}
      holds.forEach(hold => {
        if (hold.status === 'active') {
          const expiresAt = new Date(hold.expires_at).getTime()
          const now = Date.now()
          const diff = expiresAt - now

          if (diff <= 0) {
            newTimers[hold.id] = 'Expired'
            // Refresh holds to remove expired
            fetchHolds()
          } else {
            const minutes = Math.floor(diff / 60000)
            const seconds = Math.floor((diff % 60000) / 1000)
            newTimers[hold.id] = `${minutes}:${seconds.toString().padStart(2, '0')}`
          }
        }
      })
      setHoldTimers(newTimers)
    }, 1000)

    return () => clearInterval(interval)
  }, [holds])

  const fetchProperty = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', user!.id)
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

    // Fetch images
    const { data: imagesData } = await supabase
      .from('property_images')
      .select('*')
      .eq('property_id', data.id)
      .order('sort_order')

    if (imagesData) {
      setImages(imagesData)
    }

    setShowSetup(false)
    setLoading(false)
  }

  const fetchAvailability = async () => {
    if (!property) return

    const today = new Date()
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + 90)

    const { data } = await supabase
      .from('availability')
      .select('date, status')
      .eq('property_id', property.id)
      .gte('date', today.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])

    if (data) {
      setAvailability(data)
    }
  }

  const fetchHolds = async () => {
    if (!property) return

    const { data } = await supabase
      .from('holds')
      .select('*')
      .eq('property_id', property.id)
      .eq('status', 'active')
      .order('expires_at')

    if (data) {
      setHolds(data)
    }
  }

  const handleCreateProperty = async () => {
    if (!formData.name || !formData.whatsapp || !formData.price) {
      alert('Please fill in all required fields')
      return
    }

    setSaving(true)

    // Generate slug from name
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

    if (error) {
      alert('Error creating property: ' + error.message)
      setSaving(false)
      return
    }

    setProperty(data)
    setFormData(prev => ({ ...prev, slug }))
    setShowSetup(false)
    setSaving(false)
  }

  const handleUpdateSettings = async () => {
    if (!property) return
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

    if (error) {
      alert('Error updating property: ' + error.message)
    }

    setSaving(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !property) return

    setUploadingImages(true)

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${property.id}/${Date.now()}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, file)

      if (uploadError) {
        alert('Upload error: ' + uploadError.message)
        continue
      }

      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName)

      // Add to database
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
      }
    }

    setUploadingImages(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDeleteImage = async (imageId: string) => {
    const { error } = await supabase
      .from('property_images')
      .delete()
      .eq('id', imageId)

    if (!error) {
      setImages(prev => prev.filter(img => img.id !== imageId))
    }
  }

  const handleToggleDate = async (date: string) => {
    if (!property) return

    const currentStatus = availability.find(a => a.date === date)?.status || 'available'
    let newStatus: 'available' | 'on_hold' | 'booked'

    if (currentStatus === 'available') {
      newStatus = 'booked'
    } else {
      newStatus = 'available'
    }

    // Upsert availability
    const { error } = await supabase
      .from('availability')
      .upsert({
        property_id: property.id,
        date,
        status: newStatus,
      })

    if (!error) {
      setAvailability(prev => {
        const exists = prev.find(a => a.date === date)
        if (exists) {
          return prev.map(a => a.date === date ? { ...a, status: newStatus } : a)
        }
        return [...prev, { date, status: newStatus }]
      })
    }
  }

  const handleReleaseHold = async (holdId: string) => {
    // Update hold status
    await supabase
      .from('holds')
      .update({ status: 'cancelled' })
      .eq('id', holdId)

    // Update availability
    const hold = holds.find(h => h.id === holdId)
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
          .eq('property_id', property!.id)
          .eq('date', date)
      }
    }

    fetchHolds()
    fetchAvailability()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    )
  }

  if (showSetup) {
    return <SetupWizard formData={formData} setFormData={setFormData} onSubmit={handleCreateProperty} saving={saving} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">{property?.name}</h1>
            <button onClick={() => supabase.auth.signOut()} className="p-2 text-gray-500 hover:text-gray-700">
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar className="h-4 w-4 inline mr-1" />
              Calendar
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'photos'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Camera className="h-4 w-4 inline mr-1" />
              Photos
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⚙️ Settings
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Active Holds */}
        {holds.length > 0 && activeTab === 'calendar' && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Active Holds</h2>
            <div className="space-y-3">
              {holds.map(hold => (
                <div key={hold.id} className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <span className="font-bold text-orange-600">{holdTimers[hold.id] || 'Loading...'}</span>
                    </div>
                    <button
                      onClick={() => handleReleaseHold(hold.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Release
                    </button>
                  </div>
                  <p className="text-sm text-gray-700">
                    {hold.check_in} to {hold.check_out}
                    {hold.num_guests > 1 && ` • ${hold.num_guests} guests`}
                  </p>
                  {hold.guest_name && (
                    <p className="text-sm text-gray-600">{hold.guest_name}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Availability</h2>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Hold</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Booked</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <CalendarManager
                availability={availability}
                onToggleDate={handleToggleDate}
              />
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Tap a date to mark as booked. Tap again to make available.
            </p>
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Photos</h2>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />

            {images.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">Upload vertical photos for best results</p>
                <Button onClick={() => fileInputRef.current?.click()} disabled={uploadingImages}>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingImages ? 'Uploading...' : 'Upload Photos'}
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {images.map((image, index) => (
                    <div key={image.id} className="relative aspect-[9/16] bg-gray-100 rounded-xl overflow-hidden group">
                      <img src={image.url} alt="" className="w-full h-full object-cover" />
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Cover
                        </div>
                      )}
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImages}
                  className="w-full mt-4"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {uploadingImages ? 'Uploading...' : 'Add More Photos'}
                </Button>
              </>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <Label>Property Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My Beautiful Villa"
                className="mt-2"
              />
            </div>

            <div>
              <Label>WhatsApp Number *</Label>
              <Input
                value={formData.whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="+91 98765 43210"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Price per Night (₹) *</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="8500"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Anjuna, Goa"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Description</Label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Tell guests what makes your property special..."
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>

            <Button onClick={handleUpdateSettings} disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>

            {/* Booking Link */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Your Booking Link</h3>
              <div className="flex items-center gap-2 mb-3">
                <code className="flex-1 bg-white px-3 py-2 rounded border text-sm truncate">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/p/{property?.slug}
                </code>
                <button
                  onClick={() => copyToClipboard(`${typeof window !== 'undefined' ? window.location.origin : ''}/p/${property?.slug}`)}
                  className="p-2 bg-white border rounded-lg hover:bg-gray-50"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-gray-600">Share this link in your Instagram bio!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Setup Wizard Component
function SetupWizard({
  formData,
  setFormData,
  onSubmit,
  saving,
}: {
  formData: any
  setFormData: any
  onSubmit: () => void
  saving: boolean
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Your Booking Page</h1>
          <p className="text-gray-600 mb-6">Set up in 30 seconds</p>

          <div className="space-y-4">
            <div>
              <Label>Property Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                placeholder="Sunset Villa Goa"
                className="mt-2"
              />
            </div>

            <div>
              <Label>WhatsApp Number *</Label>
              <Input
                value={formData.whatsapp}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="+91 98765 43210"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Guests will message you here</p>
            </div>

            <div>
              <Label>Price per Night (₹) *</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, price: e.target.value }))}
                placeholder="8500"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, location: e.target.value }))}
                placeholder="Anjuna, Goa"
                className="mt-2"
              />
            </div>

            <Button onClick={onSubmit} disabled={saving} className="w-full mt-6" size="lg">
              {saving ? 'Creating...' : 'Create My Page'}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              You can add photos after creating your page
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Calendar Manager Component
function CalendarManager({
  availability,
  onToggleDate,
}: {
  availability: Availability[]
  onToggleDate: (date: string) => void
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDateStatus = (date: Date): 'available' | 'on_hold' | 'booked' => {
    const dateStr = date.toISOString().split('T')[0]
    const avail = availability.find(a => a.date === dateStr)
    return avail?.status || 'available'
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const month = currentMonth
  const daysInMonth = getDaysInMonth(month)
  const firstDay = getFirstDayOfMonth(month)

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(month.getFullYear(), month.getMonth() - 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="font-semibold">
          {month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => setCurrentMonth(new Date(month.getFullYear(), month.getMonth() + 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs text-gray-500 font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const date = new Date(month.getFullYear(), month.getMonth(), day)
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          const isPast = date < today
          const status = getDateStatus(date)

          return (
            <button
              key={day}
              onClick={() => {
                if (!isPast) {
                  onToggleDate(date.toISOString().split('T')[0])
                }
              }}
              disabled={isPast}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all
                ${isPast ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                ${status === 'available' ? 'bg-green-500 text-white hover:bg-green-600' : ''}
                ${status === 'on_hold' ? 'bg-yellow-500 text-white hover:bg-yellow-600' : ''}
                ${status === 'booked' ? 'bg-red-500 text-white hover:bg-red-600' : ''}
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
