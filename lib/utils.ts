import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'

/**
 * Merge class names with Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string | number, formatStr: string = 'MMM d, yyyy'): string {
  if (!date) return ''
  try {
    return format(new Date(date), formatStr)
  } catch {
    return ''
  }
}

/**
 * Format a date range
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  if (!startDate || !endDate) return ''
  try {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    // Same month
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`
    }
    
    // Different months
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
  } catch {
    return ''
  }
}

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount: number, showSymbol: boolean = true): string {
  if (amount === null || amount === undefined) return ''
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  
  return formatter.format(amount)
}

/**
 * Format currency with decimals
 */
export function formatCurrencyPrecise(amount: number): string {
  if (amount === null || amount === undefined) return ''
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  
  return formatter.format(amount)
}

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  if (!text) return ''

  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Generate a unique hold code
 */
export function generateHoldCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Calculate nights between two dates
 */
export function calculateNights(checkIn: Date | string, checkOut: Date | string): number {
  if (!checkIn || !checkOut) return 0
  
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diffTime = end.getTime() - start.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  if (!name) return ''
  
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Check if a date is in the past
 */
export function isPastDate(date: Date | string): boolean {
  if (!date) return false
  const checkDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return checkDate < today
}

/**
 * Check if a date range overlaps with another
 */
export function doDateRangesOverlap(
  start1: Date | string,
  end1: Date | string,
  start2: Date | string,
  end2: Date | string
): boolean {
  const s1 = new Date(start1).getTime()
  const e1 = new Date(end1).getTime()
  const s2 = new Date(start2).getTime()
  const e2 = new Date(end2).getTime()
  
  return s1 < e2 && s2 < e1
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return ''
  
  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Indian format: +91 XXXXX XXXXX
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }
  
  // With country code
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`
  }

  // Return as-is if already formatted with + or if length unknown
  if (cleaned.length > 0 && !phone.startsWith('+')) {
    return `+${cleaned}`
  }
  return phone
}
