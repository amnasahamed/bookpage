/**
 * Supabase Client Utilities
 * 
 * This file re-exports the browser client and app-specific types.
 * 
 * For creating Supabase clients, new code should import directly from:
 * - '@/lib/supabase/client'    — for Client Components
 * - '@/lib/supabase/server'    — for Server Components & Route Handlers
 * - '@/lib/supabase/middleware' — for Next.js Middleware
 */

// Re-export the browser client as createClient (backward compatible)
export { createClient } from '@/lib/supabase/client'

// Re-export the core Database type for Supabase client generics
export type { Database } from '@/lib/database.types'

// ============================================
// Application-level types
// ============================================
// These types match the shapes used by dashboard components.
// They may differ from database.types.ts which represents the
// full database schema. These are the "view-model" types.

export type Profile = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type Property = {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  location: string | null
  is_verified: boolean
  verification_status: 'pending' | 'approved' | 'rejected' | null
  is_hibernating: boolean
  subscription_status: 'trial' | 'active' | 'expired' | 'cancelled'
  subscription_ends_at: string | null
  created_at: string
  updated_at: string
}

export type Room = {
  id: string
  property_id: string
  name: string
  room_type: 'entire_place' | 'private_room' | 'shared_room'
  max_guests: number
  num_beds: number
  price_per_night: number
  description: string | null
  photos: string[] | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Booking = {
  id: string
  property_id: string
  room_id: string | null
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in: string
  check_out: string
  num_guests: number
  status: 'pending' | 'confirmed' | 'on_hold' | 'declined' | 'cancelled'
  hold_code: string | null
  hold_expires_at: string | null
  total_amount: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  total_bookings: number
  bookings_this_month: number
  active_holds: number
  page_views: number
  page_views_change: number
  verification_status: 'pending' | 'approved' | 'rejected' | null
}
