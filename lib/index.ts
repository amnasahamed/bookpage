// Library exports
export {
  cn,
  formatDate,
  formatDateRange,
  formatCurrency,
  formatCurrencyPrecise,
  generateSlug,
  generateHoldCode,
  calculateNights,
  truncateText,
  getInitials,
  isPastDate,
  doDateRangesOverlap,
  debounce,
  capitalize,
  formatPhoneNumber,
} from './utils'

export { createClient } from './supabase/client'
export type { Database, Property, Booking, Profile, Room } from './database.types'
export type { DashboardStats } from './supabase'
