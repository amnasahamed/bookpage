'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Bed,
  Calendar,
  Ban,
  Gift,
  Settings,
  Shield,
  Menu,
  X,
  LogOut,
  ExternalLink,
  Map,
  MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { useAuth } from '@/app/providers'
import { getInitials } from '@/lib/utils'


const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Rooms', href: '/dashboard/rooms', icon: Bed },
  { label: 'Bookings', href: '/dashboard/bookings', icon: Calendar },
  { label: 'Blocked Dates', href: '/dashboard/blocked', icon: Ban },
  { label: 'Referrals', href: '/dashboard/referral', icon: Gift },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  { label: 'Location', href: '/dashboard/settings/location', icon: MapPin },
  { label: 'Verification', href: '/dashboard/verification', icon: Shield },
]

interface DashboardSidebarProps {
  propertyName?: string
  verificationStatus?: 'pending' | 'approved' | 'rejected' | null
  pendingBookingsCount?: number
}

export function DashboardSidebar({
  propertyName,
  verificationStatus,
  pendingBookingsCount = 0,
}: DashboardSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    if (href === '/dashboard/settings') return pathname === '/dashboard/settings'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4">
        <Link href="/dashboard" className="text-xl font-bold text-trust-blue-600">
          BookPage
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          aria-expanded={isMobileOpen}
          aria-label={isMobileOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isMobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-30 h-screen w-[260px] bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-default lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link
            href="/dashboard"
            className="text-xl font-black tracking-tight text-gray-900 group"
          >
            Book
            <span className="text-trust-blue-600 transition-colors group-hover:text-trust-blue-500">
              Page
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      active
                        ? 'bg-trust-blue-50 text-trust-blue-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <div
                      className={cn(
                        'p-1.5 rounded-lg transition-colors',
                        active ? 'bg-trust-blue-100' : 'bg-gray-100'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          active ? 'text-trust-blue-600' : 'text-gray-500'
                        )}
                      />
                    </div>
                    <span className="flex-1">{item.label}</span>
                    {item.href === '/dashboard/bookings' &&
                      pendingBookingsCount > 0 && (
                        <Badge
                          variant="default"
                          size="sm"
                          className="badge-pulse"
                        >
                          {pendingBookingsCount > 9
                            ? '9+'
                            : pendingBookingsCount}
                        </Badge>
                      )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* View Public Pages */}
          <div className="mt-6 pt-6 border-t border-gray-100 px-3 space-y-1">
            <Link
              href={`/${propertyName?.toLowerCase().replace(/\s+/g, '-') || '#'}`}
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
            >
              <div className="p-1.5 rounded-lg bg-gray-100">
                <ExternalLink className="h-4 w-4 text-gray-500" />
              </div>
              <span className="flex-1">View Your Page</span>
            </Link>
            <Link
              href="/map"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
            >
              <div className="p-1.5 rounded-lg bg-gray-100">
                <Map className="h-4 w-4 text-gray-500" />
              </div>
              <span className="flex-1">Browse Map</span>
            </Link>
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarImage src={user?.user_metadata?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-trust-blue-100 to-trust-blue-50 text-trust-blue-700 font-bold">
                {getInitials(user?.user_metadata?.full_name || user?.email || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {propertyName || user?.user_metadata?.full_name || 'My Property'}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {verificationStatus === 'approved' ? (
                  <Badge variant="success" size="sm">
                    Verified
                  </Badge>
                ) : verificationStatus === 'pending' ? (
                  <Badge variant="warning" size="sm">
                    Pending
                  </Badge>
                ) : (
                  <Badge variant="secondary" size="sm">
                    Unverified
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full mt-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 justify-start gap-2"
            onClick={() => setShowSignOutConfirm(true)}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      <Dialog open={showSignOutConfirm} onOpenChange={setShowSignOutConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>
              You will be redirected to the login page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignOutConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={signOut}>
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16" />
    </>
  )
}
