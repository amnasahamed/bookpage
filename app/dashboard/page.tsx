'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CalendarCheck,
  Clock,
  Eye,
  ShieldCheck,
  Bell,
  Plus,
  Ban,
  Share2,
  Check,
  X,
  Moon,
  CalendarX,
  Bed,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Copy,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/shared/DashboardSidebar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { useAuth, useToast } from '@/app/providers'
import { createClient } from '@/lib/supabase'
import { cn, formatDateRange } from '@/lib/utils'
import type { Booking, Property, DashboardStats } from '@/lib/supabase'
import { useCountUp, useScrollAnimation } from '@/lib/animations'

// Animated counter component
function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
  const { count, startAnimation } = useCountUp(value, duration)
  const { ref, isVisible } = useScrollAnimation<HTMLSpanElement>()

  useEffect(() => {
    if (isVisible) {
      startAnimation()
    }
  }, [isVisible, startAnimation])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

// Stats Card Component
interface StatsCardProps {
  title: string
  value: number
  icon: React.ElementType
  trend?: { value: number; label: string; positive?: boolean }
  note?: string
  status?: 'verified' | 'pending' | 'unverified'
  link?: string
  delay?: number
  isVisible: boolean
  color?: 'blue' | 'green' | 'amber' | 'purple'
}

function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  note,
  status,
  link,
  delay = 0,
  isVisible,
  color = 'blue',
}: StatsCardProps) {
  const colorStyles = {
    blue: {
      bg: 'bg-trust-blue-50',
      icon: 'text-trust-blue-600',
      border: 'border-trust-blue-100',
    },
    green: {
      bg: 'bg-success-green-50',
      icon: 'text-success-green-600',
      border: 'border-success-green-100',
    },
    amber: {
      bg: 'bg-warning-amber-50',
      icon: 'text-warning-amber-600',
      border: 'border-warning-amber-100',
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      border: 'border-purple-100',
    },
  }

  const styles = colorStyles[color]

  const statusConfig = {
    verified: { bg: 'bg-success-green-50', text: 'text-success-green-600', label: 'Verified' },
    pending: { bg: 'bg-warning-amber-100', text: 'text-warning-amber-600', label: 'Pending' },
    unverified: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Unverified' },
  }

  const statusStyle = status ? statusConfig[status] : null

  return (
    <Card
      hover
      className={cn(
        'transition-all duration-500 border-0 shadow-lg shadow-gray-200/50',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {status ? (
                  <span className={statusStyle?.text}>{statusStyle?.label}</span>
                ) : (
                  <AnimatedCounter value={value} />
                )}
              </span>
            </div>

            {trend && (
              <div className="flex items-center gap-1.5 mt-2">
                {trend.positive ? (
                  <TrendingUp className="h-4 w-4 text-success-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={cn(
                    'text-xs font-semibold',
                    trend.positive ? 'text-success-green-600' : 'text-red-500'
                  )}
                >
                  {trend.positive ? '+' : ''}
                  {trend.value}%
                </span>
                <span className="text-xs text-gray-500">{trend.label}</span>
              </div>
            )}

            {note && <p className="text-xs text-gray-500 mt-2">{note}</p>}

            {status && status === 'unverified' && link && (
              <Link
                href={link}
                className="inline-flex items-center gap-1 text-xs text-trust-blue-600 hover:text-trust-blue-700 font-medium mt-2 group"
              >
                Complete verification
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>

          <div
            className={cn(
              'p-3 rounded-xl border',
              styles.bg,
              styles.border
            )}
          >
            <Icon className={cn('h-6 w-6', styles.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Skeleton Stats Card
function StatsCardSkeleton() {
  return (
    <Card className="border-0 shadow-lg shadow-gray-200/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  )
}

// Booking Status Badge
function BookingStatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    { variant: 'default' | 'success' | 'warning' | 'destructive'; label: string }
  > = {
    pending: { variant: 'warning', label: 'Pending' },
    confirmed: { variant: 'success', label: 'Accepted' },
    on_hold: { variant: 'default', label: 'On Hold' },
    declined: { variant: 'destructive', label: 'Rejected' },
    cancelled: { variant: 'destructive', label: 'Cancelled' },
  }

  const { variant, label } = config[status] || { variant: 'default', label: status }

  return <Badge variant={variant}>{label}</Badge>
}

// Recent Bookings Table
interface RecentBookingsProps {
  bookings: Booking[]
  rooms: Record<string, { name: string }>
  onAccept: (id: string) => void
  onReject: (id: string) => void
  isLoading: boolean
}

function RecentBookings({
  bookings,
  rooms,
  onAccept,
  onReject,
  isLoading,
}: RecentBookingsProps) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>()

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg shadow-gray-200/50">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (bookings.length === 0) {
    return (
      <Card
        ref={ref}
        className={cn(
          'border-0 shadow-lg shadow-gray-200/50 transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
      >
        <CardHeader>
          <CardTitle>Recent Booking Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-trust-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CalendarX className="h-8 w-8 text-trust-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              No booking requests yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Share your booking page link to start receiving inquiries from
              guests.
            </p>
            <Button asChild>
              <Link href="/dashboard/settings">Get Your Link</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      ref={ref}
      className={cn(
        'border-0 shadow-lg shadow-gray-200/50 transition-all duration-700',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle>Recent Booking Requests</CardTitle>
          <CardDescription>Last 5 booking requests</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild className="gap-1">
          <Link href="/dashboard/bookings">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, index) => (
                <tr
                  key={booking.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors group"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {booking.guest_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.num_guests} guests
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-700">
                      {formatDateRange(booking.check_in, booking.check_out)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-700">
                      {booking.room_id
                        ? rooms[booking.room_id]?.name || 'Unknown'
                        : 'Any Room'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <BookingStatusBadge status={booking.status} />
                  </td>
                  <td className="py-4 px-4 text-right">
                    {booking.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-success-green-600 border-success-green-200 hover:bg-success-green-50 hover:border-success-green-300"
                          onClick={() => onAccept(booking.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                          onClick={() => onReject(booking.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/dashboard/bookings?id=${booking.id}`}
                          className="gap-1"
                        >
                          View
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {booking.guest_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {booking.num_guests} guests
                  </p>
                </div>
                <BookingStatusBadge status={booking.status} />
              </div>

              <div className="text-sm text-gray-600">
                {formatDateRange(booking.check_in, booking.check_out)}
              </div>

              <div className="text-sm text-gray-500">
                {booking.room_id
                  ? rooms[booking.room_id]?.name || 'Unknown'
                  : 'Any Room'}
              </div>

              {booking.status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-success-green-600 border-success-green-200 hover:bg-success-green-50"
                    onClick={() => onAccept(booking.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => onReject(booking.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Hibernation Warning Banner
function HibernationBanner({
  daysUntilHibernation,
}: {
  daysUntilHibernation: number
}) {
  return (
    <div className="bg-gradient-to-r from-warning-amber-50 to-warning-amber-100/50 border border-warning-amber-200 rounded-2xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-warning-amber-100">
          <Moon className="h-5 w-5 text-warning-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-warning-amber-800">
            Your page will hibernate in {daysUntilHibernation} days
          </p>
          <p className="text-sm text-warning-amber-700 mt-1">
            Log in regularly to keep your page active and visible to guests.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-warning-amber-300 text-warning-amber-700 hover:bg-warning-amber-200 shrink-0"
        >
          Keep Active
        </Button>
      </div>
    </div>
  )
}

// Quick Actions
function QuickActions({ propertySlug }: { propertySlug: string }) {
  const { addToast } = useToast()
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}/${propertySlug}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      addToast({
        title: 'Link copied!',
        description: 'Your booking page URL has been copied to clipboard.',
        variant: 'success',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      addToast({
        title: 'Failed to copy',
        description: 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Button asChild className="w-full gap-2 shadow-sm">
        <Link href="/dashboard/rooms">
          <Plus className="h-4 w-4" />
          Add Room
        </Link>
      </Button>

      <Button variant="outline" asChild className="w-full gap-2 border-2">
        <Link href="/dashboard/blocked">
          <Ban className="h-4 w-4" />
          Block Dates
        </Link>
      </Button>

      <Button
        variant="outline"
        className="w-full gap-2 border-2"
        onClick={handleShare}
      >
        {copied ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-success-green-600" />
            Copied!
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            Share Link
          </>
        )}
      </Button>
    </div>
  )
}

// No Rooms Empty State
function NoRoomsState() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>()

  return (
    <Card
      ref={ref}
      className={cn(
        'border-2 border-dashed border-gray-200 shadow-none transition-all duration-700',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
    >
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 bg-trust-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Bed className="h-8 w-8 text-trust-blue-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Add your first room
        </h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          You need at least one room to start taking bookings. Set up your rooms
          now.
        </p>
        <Button asChild>
          <Link href="/dashboard/rooms" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Room
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// Main Dashboard Page
export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { addToast } = useToast()
  const supabase = createClient()
  const { ref: statsRef, isVisible: statsVisible } =
    useScrollAnimation<HTMLDivElement>()

  const [property, setProperty] = useState<Property | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<Record<string, { name: string }>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [notificationCount, setNotificationCount] = useState(0)

  // Check if user needs to be redirected (hibernation warning)
  const [showHibernationWarning, setShowHibernationWarning] = useState(false)
  const [daysUntilHibernation, setDaysUntilHibernation] = useState(0)

  // Fetch dashboard data
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)

        // Get property for this user
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select('*')
          .eq('owner_id', user.id)
          .single()

        if (propertyError || !propertyData) {
          console.error('Error fetching property:', propertyError)
          setProperty(null)
          setIsLoading(false)
          return
        }

        setProperty(propertyData)

        // Check for hibernation warning (mock logic - would check last login)
        const lastActivity = user?.last_sign_in_at ? new Date(user.last_sign_in_at) : null
        const daysSinceActivity = lastActivity
          ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
          : 0
        if (daysSinceActivity > 7 && !propertyData.is_hibernating) {
          setShowHibernationWarning(true)
          setDaysUntilHibernation(Math.max(1, 14 - daysSinceActivity))
        }

        // Fetch stats
        const { data: statsData } = await supabase
          .rpc('get_property_stats', { p_property_id: propertyData.id })
          .single()

        if (statsData) {
          setStats(statsData as DashboardStats)
        } else {
          // Fallback: calculate stats manually
          const { count: totalBookings } = await supabase
            .from('bookings')
            .select('*', { count: 'exact' })
            .eq('property_id', propertyData.id)

          const { count: bookingsThisMonth } = await supabase
            .from('bookings')
            .select('*', { count: 'exact' })
            .eq('property_id', propertyData.id)
            .gte(
              'created_at',
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            )

          const { count: activeHolds } = await supabase
            .from('bookings')
            .select('*', { count: 'exact' })
            .eq('property_id', propertyData.id)
            .eq('status', 'on_hold')
            .gt('hold_expires_at', new Date().toISOString())

          const { count: pendingBookings } = await supabase
            .from('bookings')
            .select('*', { count: 'exact' })
            .eq('property_id', propertyData.id)
            .eq('status', 'pending')

          setNotificationCount(pendingBookings || 0)

          setStats({
            total_bookings: totalBookings || 0,
            bookings_this_month: bookingsThisMonth || 0,
            active_holds: activeHolds || 0,
            page_views: 0,
            page_views_change: 12,
            verification_status: propertyData.verification_status,
          })
        }

        // Fetch recent bookings
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('*')
          .eq('property_id', propertyData.id)
          .order('created_at', { ascending: false })
          .limit(5)

        setBookings(bookingsData || [])

        // Fetch rooms for reference
        const { data: roomsData } = await supabase
          .from('rooms')
          .select('id, name')
          .eq('property_id', propertyData.id)

        const roomsMap: Record<string, { name: string }> = {}
        roomsData?.forEach((room) => {
          roomsMap[room.id] = { name: room.name }
        })
        setRooms(roomsMap)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        addToast({
          title: 'Error loading dashboard',
          description: 'Please try refreshing the page.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, authLoading, router, supabase, addToast])

  // Handle booking actions
  const handleAcceptBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)

      if (error) throw error

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: 'confirmed' } : b
        )
      )

      addToast({
        title: 'Booking accepted!',
        description: 'The guest will be notified.',
        variant: 'success',
      })
    } catch (error) {
      console.error('Error accepting booking:', error)
      addToast({
        title: 'Failed to accept booking',
        description: 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleRejectBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'declined',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)

      if (error) throw error

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: 'declined' } : b
        )
      )

      addToast({
        title: 'Booking declined',
        description: 'The guest will be notified.',
        variant: 'default',
      })
    } catch (error) {
      console.error('Error rejecting booking:', error)
      addToast({
        title: 'Failed to decline booking',
        description: 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" className="text-trust-blue-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-light flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-trust-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="h-10 w-10 text-trust-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Access Required</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Please sign in to your account to access your property dashboard.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full h-12 text-lg font-semibold rounded-xl" variant="gradient">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const hasRooms = Object.keys(rooms).length > 0

  return (
    <div className="min-h-screen bg-gray-50/50">
      <DashboardSidebar
        propertyName={property?.name}
        verificationStatus={property?.verification_status}
        pendingBookingsCount={notificationCount}
      />

      {/* Main Content */}
      <main className="lg:ml-[260px] min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Dashboard
              </h1>
              <p className="text-gray-500 mt-1">
                Welcome back! Here&apos;s what&apos;s happening with your property.
              </p>
            </div>

            <button
              onClick={() => router.push('/dashboard/bookings')}
              aria-label={`${notificationCount} pending booking${notificationCount !== 1 ? 's' : ''}`}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          </div>

          {/* Hibernation Warning */}
          {showHibernationWarning && (
            <HibernationBanner daysUntilHibernation={daysUntilHibernation} />
          )}

          {/* No Rooms State */}
          {!hasRooms && !isLoading && (
            <div className="mb-8">
              <NoRoomsState />
            </div>
          )}

          {/* Stats Cards */}
          <div
            ref={statsRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {isLoading ? (
              <>
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
              </>
            ) : (
              <>
                <StatsCard
                  title="Total Bookings"
                  value={stats?.total_bookings || 0}
                  icon={CalendarCheck}
                  trend={{ value: 12, label: 'from last month', positive: true }}
                  delay={0}
                  isVisible={statsVisible}
                  color="blue"
                />

                <StatsCard
                  title="Active Holds"
                  value={stats?.active_holds || 0}
                  icon={Clock}
                  note="Expires in 24 hours"
                  delay={100}
                  isVisible={statsVisible}
                  color="amber"
                />

                <StatsCard
                  title="Page Views"
                  value={stats?.page_views || 0}
                  icon={Eye}
                  trend={{
                    value: stats?.page_views_change || 0,
                    label: 'this month',
                    positive: true,
                  }}
                  delay={200}
                  isVisible={statsVisible}
                  color="purple"
                />

                <StatsCard
                  title="Verification Status"
                  value={0}
                  icon={ShieldCheck}
                  status={
                    stats?.verification_status === 'approved'
                      ? 'verified'
                      : stats?.verification_status === 'pending'
                        ? 'pending'
                        : 'unverified'
                  }
                  link="/dashboard/verification"
                  delay={300}
                  isVisible={statsVisible}
                  color="green"
                />
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <QuickActions propertySlug={property?.slug || ''} />
          </div>

          {/* Recent Bookings */}
          <RecentBookings
            bookings={bookings}
            rooms={rooms}
            onAccept={handleAcceptBooking}
            onReject={handleRejectBooking}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  )
}
