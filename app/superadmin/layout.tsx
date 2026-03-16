'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { 
  Users, 
  ShieldCheck, 
  Home,
  LogOut,
  Settings,
  Activity,
  Map
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/app/providers'
import { useEffect } from 'react'

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const adminEmails = [
    'admin@bookpage.com',
    'amnaskt05@gmail.com',
    'amnasahamed@gmail.com',
    'admin@example.com' // Fallback for local testing if env is missing
  ]
  const isAdmin = user?.email && adminEmails.includes(user.email)

  useEffect(() => {
    if (!isLoading && !isAdmin && pathname !== '/superadmin/login') {
      router.push('/superadmin/login')
    }
  }, [isLoading, isAdmin, pathname, router])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/superadmin/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/superadmin', icon: Activity },
    { name: 'Map', href: '/superadmin/map', icon: Map },
    { name: 'Verifications', href: '/superadmin/verifications', icon: ShieldCheck },
    { name: 'Properties', href: '/superadmin/properties', icon: Home },
    { name: 'Users', href: '/superadmin/users', icon: Users },
    { name: 'Settings', href: '/superadmin/settings', icon: Settings },
  ]

  // If it's the login page, just render the content without the sidebar layout
  if (pathname === '/superadmin/login') {
    return <div className="min-h-screen bg-brand-light font-sans selection:bg-trust-blue-100 selection:text-trust-blue-900">{children}</div>
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue-600" />
      </div>
    )
  }

  // If not admin, show loading state (redirect will happen in useEffect)
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-light font-sans selection:bg-trust-blue-100 selection:text-trust-blue-900 flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 hidden lg:flex flex-col",
      )}>
        <div className="flex h-16 items-center flex-shrink-0 px-6 border-b border-gray-100">
          <Link href="/superadmin" className="text-xl font-black tracking-tight text-gray-900 group">
            Book<span className="text-trust-blue-600 transition-colors group-hover:text-trust-blue-500">Admin</span>
          </Link>
        </div>
        
        <div className="flex flex-1 flex-col overflow-y-auto pt-6 pb-4">
          <nav className="flex-1 space-y-1 px-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    isActive
                      ? 'bg-trust-blue-50 text-trust-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors'
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive ? 'text-trust-blue-600' : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        
        <div className="flex flex-shrink-0 border-t border-gray-100 p-4">
          <button onClick={handleLogout} className="group block w-full flex-shrink-0 text-left">
            <div className="flex items-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-trust-blue-100 text-trust-blue-700 font-bold text-sm">
                SA
              </div>
              <div className="ml-3 flex items-center justify-between w-full">
                <p className="text-sm font-semibold text-gray-900">Sign out</p>
                <LogOut className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </div>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
