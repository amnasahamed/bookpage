import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

/**
 * Middleware for authentication and route protection.
 * 
 * Uses the industry-standard Supabase SSR pattern:
 * 1. Refresh the session (important — keeps cookies in sync)
 * 2. Check auth state using getUser() (secure, validates JWT with Supabase)
 * 3. Redirect based on route protection rules
 */
export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  // IMPORTANT: Always call getUser() in middleware.
  // This refreshes the session and keeps cookies in sync.
  // getUser() is secure (validates JWT with Supabase Auth server).
  // getSession() only reads from local cookies and is NOT secure.
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Middleware auth error:', error.message)
  }

  const pathname = request.nextUrl.pathname

  // --- Admin email check ---
  const adminEmailsRaw = process.env.ADMIN_EMAILS || ''
  const adminEmails = adminEmailsRaw
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  const isAdmin = user?.email
    ? adminEmails.includes(user.email.toLowerCase())
    : false

  // --- Route definitions ---
  const protectedRoutes = [
    '/dashboard',
    '/superadmin',
  ]

  const authRoutes = ['/login', '/signup', '/reset-password']

  // --- Route classification ---
  const isProtectedRoute = protectedRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  )
  const isAuthRoute = authRoutes.some(route => pathname === route)
  const isSuperadminRoute = pathname.startsWith('/superadmin') && pathname !== '/superadmin/login'
  const isSuperadminLogin = pathname === '/superadmin/login'

  // --- Protection logic ---

  // Superadmin routes: require admin email
  if (isSuperadminRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/superadmin/login', request.url))
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/superadmin/login', request.url))
    }
  }

  // Superadmin login: redirect admins who are already logged in
  if (isSuperadminLogin && user && isAdmin) {
    return NextResponse.redirect(new URL('/superadmin', request.url))
  }

  // Dashboard routes: require authentication
  if (isProtectedRoute && !user && pathname.startsWith('/dashboard')) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Auth routes: redirect authenticated users to dashboard
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
