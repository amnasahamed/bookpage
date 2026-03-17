'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import {
  User,
  Building2,
  CreditCard,
  Bell,
  Moon,
  Trash2,
  Camera,
  Check,
  AlertTriangle,
  ExternalLink,
  Copy
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth, useToast } from '@/app/providers'
import { DashboardSidebar } from '@/components/shared/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const amenitiesList = [
  'WiFi', 'Pool', 'Parking', 'AC', 'Kitchen', 'TV', 
  'Gym', 'Spa', 'Restaurant', 'Bar', 'Laundry', 'Room Service'
]

export default function SettingsPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingProperty, setSavingProperty] = useState(false)
  const [propertyId, setPropertyId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Profile state
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatar: '',
  })

  // Property state
  const [property, setProperty] = useState({
    name: '',
    slug: '',
    description: '',
    location: '',
    amenities: [] as string[],
  })

  // Subscription state
  const [subscription] = useState({
    plan: '₹3,999/year',
    renewalDate: 'Dec 15, 2024',
    credits: 666,
    status: 'active',
  })

  // Notifications state
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    whatsappNotifications: true,
    bookingConfirmations: true,
    marketingEmails: false,
  })

  // Hibernation state
  const [isHibernating, setIsHibernating] = useState(false)
  const [lastLogin] = useState('2 hours ago')

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      const [{ data: profileData }, { data: propertyData }] = await Promise.all([
        supabase.from('profiles').select('full_name, phone').eq('id', user.id).single(),
        supabase.from('properties').select('id, slug, name, description, amenities, location, is_hibernating, whatsapp_number').eq('owner_id', user.id).single(),
      ])
      if (profileData) {
        setProfile(prev => ({
          ...prev,
          fullName: profileData.full_name ?? prev.fullName,
          email: user.email ?? prev.email,
        }))
      } else {
        setProfile(prev => ({ ...prev, email: user.email ?? '' }))
      }
      if (propertyData) {
        setPropertyId(propertyData.id)
        setProperty(prev => ({
          ...prev,
          name: propertyData.name ?? prev.name,
          slug: propertyData.slug ?? prev.slug,
          description: propertyData.description ?? prev.description,
          amenities: propertyData.amenities ?? prev.amenities,
          location: propertyData.location ?? prev.location,
        }))
        // Load whatsapp_number into profile.phone for display
        setProfile(prev => ({ ...prev, phone: propertyData.whatsapp_number ?? '' }))
        setIsHibernating(propertyData.is_hibernating ?? false)
      } else {
        // Property wasn't created yet (e.g. email callback missed) — create it now
        const meta = user.user_metadata as { property_name?: string; property_slug?: string }
        const propertyName = meta?.property_name || 'My Property'
        const rawSlug = meta?.property_slug || user.email?.split('@')[0]?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'my-property'
        // Make slug unique by appending user id suffix if needed
        const slug = rawSlug + '-' + user.id.slice(0, 6)
        const { data: created, error: createErr } = await supabase.from('properties').insert({
          owner_id: user.id,
          name: propertyName,
          slug,
          location: '',
          price_per_night: 0,
          whatsapp_number: '',
          subscription_status: 'trial',
          is_verified: false,
          verification_status: 'pending',
          is_hibernating: false,
        }).select('id, name, slug').single()
        if (created) {
          setPropertyId(created.id)
          setProperty(prev => ({ ...prev, name: created.name ?? prev.name, slug: created.slug ?? prev.slug }))
        }
      }
    }
    fetchData()
  }, [user])

  const handleProfileSave = async () => {
    if (!user) return
    setSaving(true)
    const [profileRes, propertyRes] = await Promise.all([
      supabase.from('profiles').update({ full_name: profile.fullName }).eq('id', user.id),
      propertyId
        ? supabase.from('properties').update({ whatsapp_number: profile.phone }).eq('id', propertyId)
        : Promise.resolve({ error: null }),
    ])
    setSaving(false)
    if (profileRes.error || propertyRes.error) {
      addToast({ title: 'Failed to save profile', description: profileRes.error?.message || propertyRes.error?.message, variant: 'destructive' })
    } else {
      addToast({ title: 'Profile saved', variant: 'success' })
    }
  }

  const handlePropertySave = async () => {
    if (!propertyId) return
    setSavingProperty(true)
    const { error } = await supabase
      .from('properties')
      .update({ name: property.name, description: property.description, amenities: property.amenities, location: property.location })
      .eq('id', propertyId)
    setSavingProperty(false)
    if (error) {
      addToast({ title: 'Failed to save property', description: error.message, variant: 'destructive' })
    } else {
      addToast({ title: 'Property saved', variant: 'success' })
    }
  }

  const toggleAmenity = (amenity: string) => {
    setProperty(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    setIsDeleteDialogOpen(false)
  }

  const copySlug = async () => {
    const slug = property?.slug || ''
    const url = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/${slug}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      addToast({ title: 'Copy failed', variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar propertyName={property.name || undefined} />
      
      <main className="lg:ml-[260px] min-h-screen">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-1">Manage your account and property settings</p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-auto lg:inline-flex">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="property" className="gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Property</span>
              </TabsTrigger>
              <TabsTrigger value="subscription" className="gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Subscription</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile.avatar} />
                      <AvatarFallback className="text-2xl bg-trust-blue-100 text-trust-blue-600">
                        {profile.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button type="button" variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-2" />
                        Change Photo
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        JPG, PNG. Max 2MB
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={profile.fullName}
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        disabled
                        className="mt-2 bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">WhatsApp Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+919876543210"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Include country code (e.g. +91). Guests will send booking requests to this number via WhatsApp.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" onClick={handleProfileSave} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Hibernation Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Moon className="h-5 w-5" />
                    Hibernation Mode
                  </CardTitle>
                  <CardDescription>
                    Temporarily hide your property page from guests
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Enable Hibernation</p>
                      <p className="text-sm text-gray-500">
                        Your page will be hidden and guests cannot make bookings
                      </p>
                    </div>
                    <Switch
                      checked={isHibernating}
                      onCheckedChange={async (checked) => {
                        setIsHibernating(checked)
                        if (!propertyId) return
                        const { error } = await supabase
                          .from('properties')
                          .update({ is_hibernating: checked })
                          .eq('id', propertyId)
                        if (error) {
                          addToast({ title: 'Failed to update hibernation', variant: 'destructive' })
                          setIsHibernating(!checked)
                        } else {
                          addToast({ title: checked ? 'Hibernation enabled' : 'Hibernation disabled', variant: 'success' })
                        }
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Last login: {lastLogin}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Property Tab */}
            <TabsContent value="property" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                  <CardDescription>Update your property information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="propertyName">Property Name</Label>
                    <Input
                      id="propertyName"
                      value={property.name}
                      onChange={(e) => setProperty({ ...property, name: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">Page URL (Slug)</Label>
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1 flex items-center px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                        <span className="text-gray-400 text-xs truncate">{typeof window !== 'undefined' ? window.location.host : 'bookpage.com'}/</span>
                        <input
                          id="slug"
                          value={property.slug}
                          onChange={(e) => setProperty({ ...property, slug: e.target.value })}
                          className="bg-transparent border-none outline-none flex-1 text-gray-900"
                        />
                      </div>
                      <Button variant="outline" size="sm" onClick={copySlug}>
                        {copied ? '✓ Copied!' : 'Copy Link'}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This is your public booking page URL
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      value={property.description}
                      onChange={(e) => setProperty({ ...property, description: e.target.value })}
                      rows={4}
                      className="w-full mt-2 px-4 py-3 rounded-lg border border-gray-300 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-trust-blue-500 focus:ring-2 focus:ring-trust-blue-100 transition-all duration-200 resize-none"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={property.location}
                      onChange={(e) => setProperty({ ...property, location: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Amenities</Label>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {amenitiesList.map((amenity) => (
                        <button
                          type="button"
                          key={amenity}
                          onClick={() => toggleAmenity(amenity)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                            property.amenities.includes(amenity)
                              ? 'bg-trust-blue-100 text-trust-blue-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          )}
                        >
                          {property.amenities.includes(amenity) && (
                            <Check className="h-3 w-3 inline mr-1" />
                          )}
                          {amenity}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" onClick={handlePropertySave} disabled={savingProperty}>
                      {savingProperty ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Details</CardTitle>
                  <CardDescription>Manage your plan and billing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-r from-trust-blue-600 to-trust-blue-700 rounded-xl p-6 text-white">
                    <p className="text-sm text-white/80">Current Plan</p>
                    <p className="text-3xl font-bold mt-1">{subscription.plan}</p>
                    <p className="text-sm text-white/80 mt-2">
                      That&apos;s just ₹333/month
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Renewal Date</p>
                      <p className="font-medium text-gray-900">{subscription.renewalDate}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Referral Credits</p>
                      <p className="font-medium text-success-green-600">₹{subscription.credits}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Update Payment
                    </Button>
                    <Button variant="outline" className="flex-1">
                      View Billing History
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-gray-900">Email Alerts</p>
                      <p className="text-sm text-gray-500">
                        Get notified about new bookings and holds
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, emailAlerts: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">WhatsApp Notifications</p>
                      <p className="text-sm text-gray-500">
                        Receive booking updates on WhatsApp
                      </p>
                    </div>
                    <Switch
                      checked={notifications.whatsappNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, whatsappNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Booking Confirmations</p>
                      <p className="text-sm text-gray-500">
                        Send confirmation emails to guests
                      </p>
                    </div>
                    <Switch
                      checked={notifications.bookingConfirmations}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, bookingConfirmations: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Marketing Emails</p>
                      <p className="text-sm text-gray-500">
                        Tips, updates, and promotional content
                      </p>
                    </div>
                    <Switch
                      checked={notifications.marketingEmails}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, marketingEmails: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Danger Zone */}
          <Card className="mt-8 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions that affect your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">Delete Account</p>
                  <p className="text-sm text-gray-500">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button 
                  type="button"
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Account Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Type <span className="font-mono font-bold">DELETE</span> to confirm:
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className={deleteConfirmText && deleteConfirmText !== 'DELETE' ? 'border-red-500' : ''}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE' || isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
