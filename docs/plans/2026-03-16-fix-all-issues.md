# BookPage — Fix All Issues Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all 60 identified issues across security, logic, UI, UX, micro-interactions, and accessibility.

**Architecture:** Issues are grouped by file/domain so each task is self-contained. Each task touches 1-3 files and can be committed independently. No new dependencies are needed — fixes use existing patterns (Supabase, React Hook Form, Tailwind, Lucide icons).

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Supabase, Radix UI, Lucide React, React Hook Form + Zod

---

## Task 1: Fix Login Page Issues

**Files:**
- Modify: `app/login/page.tsx`

**Problems to fix:**
1. Wrong icon — `CheckCircle` used for error messages (should be `AlertCircle`)
2. Error message leaks raw Supabase error — should use generic message
3. Password toggle missing `aria-label`
4. Google sign-in button is misleading — label it clearly as "Coming Soon"
5. Remove `router.refresh()` after `router.push()` (redundant, can cause issues)

**Implementation:**

```tsx
// In the error paragraph for email/password fields, change:
// <CheckCircle className="w-4 h-4" />  →  <AlertCircle className="w-4 h-4" />

// In onSubmit catch block, change:
// description: error.message || '...'
// TO:
// description: 'Invalid email or password. Please try again.'

// Password toggle button — add:
// aria-label={showPassword ? 'Hide password' : 'Show password'}

// Google button — disable it and show "Coming Soon" state:
<Button variant="outline" className="w-full opacity-60 cursor-not-allowed" size="lg" disabled>
  <GoogleIcon /> Continue with Google <Badge variant="secondary" className="ml-2 text-xs">Coming Soon</Badge>
</Button>

// Remove router.refresh() after router.push('/dashboard')
```

**Verify:** Load `/login`, check error icons show X/alert not checkmark. Check password toggle has aria-label. Check Google button is disabled with "Coming Soon" badge.

---

## Task 2: Fix Middleware Security Issues

**Files:**
- Modify: `middleware.ts`
- Modify: `app/login/page.tsx` (consume redirect param)

**Problems to fix:**
1. Admin emails fallback to hardcoded `admin@bookpage.com` — should fail closed (no access) if env not set
2. Email comparison case-sensitive — normalize to lowercase
3. Redundant condition on line 67
4. `?redirect` param set in middleware but never consumed after login

**Implementation:**

```ts
// middleware.ts — fix admin email check:
const adminEmailsRaw = process.env.ADMIN_EMAILS
if (!adminEmailsRaw && isSuperadminRoute) {
  return NextResponse.redirect(new URL('/superadmin/login', request.url))
}
const adminEmails = (adminEmailsRaw || '').split(',').map(e => e.trim().toLowerCase())
const isAdmin = user?.email && adminEmails.includes(user.email.toLowerCase())

// Remove redundant check: line 67 already has !pathname.startsWith('/superadmin')
// simplify to:
if (pathname.startsWith('/dashboard') && !user) { ... }

// app/login/page.tsx — consume redirect after login:
const searchParams = useSearchParams()
// after successful login:
const redirect = searchParams.get('redirect')
router.push(redirect && redirect.startsWith('/') ? redirect : '/dashboard')
```

**Verify:** Test with ADMIN_EMAILS unset → superadmin routes should redirect. Test with mixed-case admin email → should still work.

---

## Task 3: Fix lib/utils.ts Bugs

**Files:**
- Modify: `lib/utils.ts`

**Problems to fix:**
1. `generateSlug()` — doesn't handle non-ASCII (Indian names with diacritics)
2. `formatPhoneNumber()` — only handles 10/12-digit Indian format; returns raw string for others
3. `calculateNights()` — uses `Math.ceil()` which returns 0 for same-day (should use `Math.round()` for whole days)

**Implementation:**

```ts
// generateSlug — normalize unicode before stripping:
export function generateSlug(text: string): string {
  if (!text) return ''
  return text
    .normalize('NFD')                    // decompose accented chars
    .replace(/[\u0300-\u036f]/g, '')     // strip combining marks
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// formatPhoneNumber — validate before formatting:
export function formatPhoneNumber(phone: string): string {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`
  }
  // Return with + prefix if starts with country code digit, else return as-is
  return phone.startsWith('+') ? phone : `+${cleaned}`
}

// calculateNights — use Math.round for whole-day accuracy:
const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
```

---

## Task 4: Fix Navbar Accessibility & Performance

**Files:**
- Modify: `components/shared/Navbar.tsx`

**Problems to fix:**
1. Scroll listener not debounced — fires hundreds of times per second
2. Mobile menu toggle missing `aria-expanded`
3. Mobile menu `scale-y-0/100` causes layout recalculations — should use `pointer-events-none`

**Implementation:**

```tsx
// Debounce scroll handler:
useEffect(() => {
  let rafId: number
  const handleScroll = () => {
    cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => {
      setIsScrolled(window.scrollY > 10)
    })
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
  return () => {
    window.removeEventListener('scroll', handleScroll)
    cancelAnimationFrame(rafId)
  }
}, [])

// Mobile menu button — add aria-expanded:
<button
  aria-expanded={isMobileMenuOpen}
  aria-controls="mobile-menu"
  aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
  ...
>

// Mobile menu div — add id and pointer-events:
<div
  id="mobile-menu"
  className={cn(
    '...',
    isMobileMenuOpen ? 'scale-y-100 opacity-100 pointer-events-auto' : 'scale-y-0 opacity-0 pointer-events-none'
  )}
>
```

---

## Task 5: Fix DashboardSidebar Bugs

**Files:**
- Modify: `components/shared/DashboardSidebar.tsx`

**Problems to fix:**
1. `isActive('/dashboard/settings')` also matches `/dashboard/settings/location` — wrong highlight
2. Mobile menu toggle missing `aria-expanded` + `aria-pressed`
3. Sign out has no confirmation dialog
4. `navItems` array recreated every render — move outside component
5. "View Your Page" URL construction doesn't use actual slug (uses name with spaces)

**Implementation:**

```tsx
// Move navItems OUTSIDE the component (already is, but ensure it stays)

// Fix isActive — use exact match for settings:
const isActive = (href: string) => {
  if (href === '/dashboard') return pathname === '/dashboard'
  if (href === '/dashboard/settings') return pathname === '/dashboard/settings'
  return pathname.startsWith(href)
}

// Mobile button — add aria-expanded:
<button
  aria-expanded={isMobileOpen}
  aria-label={isMobileOpen ? 'Close sidebar' : 'Open sidebar'}
  ...
>

// Sign out — add confirmation:
const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
// Show Dialog before calling signOut

// Active links — add aria-current:
<Link aria-current={active ? 'page' : undefined} ...>
```

---

## Task 6: Fix Dashboard Page Issues

**Files:**
- Modify: `app/dashboard/page.tsx`

**Problems to fix:**
1. Notification bell has no click handler — should navigate to bookings
2. Hibernation warning uses `user.created_at` instead of last login (use `user.last_sign_in_at`)
3. Loading spinner inconsistent — use a single `<Spinner>` component
4. Stats card dependency array may include unstable `addToast` reference

**Implementation:**

```tsx
// Notification bell — add navigation:
<button
  onClick={() => router.push('/dashboard/bookings')}
  aria-label={`${notificationCount} pending bookings`}
  className="..."
>
  <Bell />
  {notificationCount > 0 && <span>{notificationCount}</span>}
</button>

// Hibernation check — use last_sign_in_at:
const lastLogin = user?.last_sign_in_at ? new Date(user.last_sign_in_at) : null
const daysSinceLogin = lastLogin
  ? Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
  : 0
const showHibernationWarning = daysSinceLogin > 30

// Fix useEffect deps — wrap addToast in useCallback or exclude from deps with eslint comment
```

---

## Task 7: Fix [slug]/page.tsx — Property Public Page

**Files:**
- Modify: `app/[slug]/page.tsx`

**Problems to fix:**
1. Availability check uses `Math.random()` — replace with real blocked dates query
2. Hold code expiration never verified against real time
3. Availability status changes missing `role="alert"` for screen readers
4. Gallery nav buttons missing accessible labels
5. Date input labels not linked by `id`
6. Phone number WhatsApp link strips country code incorrectly

**Implementation:**

```tsx
// Real availability check — query blocked_dates table:
const checkAvailability = async (checkIn: string, checkOut: string, roomId: string) => {
  setAvailabilityStatus('checking')
  const { data: blockedDates } = await supabase
    .from('blocked_dates')
    .select('start_date, end_date')
    .eq('property_id', property.id)

  const isBlocked = blockedDates?.some(blocked =>
    doDateRangesOverlap(checkIn, checkOut, blocked.start_date, blocked.end_date)
  )
  setAvailabilityStatus(isBlocked ? 'unavailable' : 'available')
}

// Add role="alert" to availability message div
<div role="alert" aria-live="polite" className="...">
  {availabilityMessage}
</div>

// Gallery buttons — add aria-label:
<button aria-label="Previous photo" onClick={...}>
<button aria-label="Next photo" onClick={...}>

// Date inputs — ensure label htmlFor matches input id
<Label htmlFor="check-in-date">Check In</Label>
<Input id="check-in-date" type="date" ... />

// WhatsApp link — preserve +91:
const whatsappNumber = property.owner_phone?.replace(/[^\d+]/g, '') || ''
const whatsappLink = `https://wa.me/${whatsappNumber.replace('+', '')}`
```

---

## Task 8: Fix Bookings Page — Remove Mock Data & Add Real API

**Files:**
- Modify: `app/dashboard/bookings/page.tsx`

**Problems to fix:**
1. Bookings are hardcoded `initialBookings` — should fetch from Supabase
2. Accept/reject uses mock `await new Promise()` delay — should call Supabase update
3. "Copy Page Link" button unimplemented
4. Hold expiry shows text but no real-time countdown

**Implementation:**

```tsx
// Fetch from Supabase on mount:
useEffect(() => {
  const fetchBookings = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('bookings')
      .select('*, rooms(name)')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
    if (!error && data) setBookings(data)
    setIsLoading(false)
  }
  if (propertyId) fetchBookings()
}, [propertyId, supabase])

// Real accept/reject:
const handleAccept = async (bookingId: string) => {
  setActionLoading(bookingId)
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', bookingId)
  if (!error) {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b))
    addToast({ title: 'Booking accepted', variant: 'success' })
  }
  setActionLoading(null)
}

// Copy page link:
const copyPageLink = async () => {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/${propertySlug}`
  await navigator.clipboard.writeText(url)
  addToast({ title: 'Link copied!', variant: 'success' })
}
```

---

## Task 9: Fix Rooms Page — Remove Mock Data & Add Real API

**Files:**
- Modify: `app/dashboard/rooms/page.tsx`

**Problems to fix:**
1. Rooms hardcoded in `initialRooms` — should fetch from Supabase
2. Room ID uses `Date.now()` — let Supabase generate UUID
3. Toggle active/inactive doesn't persist to DB
4. Delete has no confirmation (it does have a dialog but needs to be wired to Supabase)
5. Photo upload is visual only — mark as "coming soon" or wire to Supabase Storage

**Implementation:**

```tsx
// Fetch rooms from Supabase:
useEffect(() => {
  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at')
    if (!error && data) setRooms(data)
  }
  if (propertyId) fetchRooms()
}, [propertyId, supabase])

// Save room to Supabase (no Date.now() ID):
const { data: newRoom, error } = await supabase
  .from('rooms')
  .insert({ property_id: propertyId, name: formData.name, ... })
  .select()
  .single()

// Toggle active — persist:
const handleToggleActive = async (roomId: string, currentState: boolean) => {
  await supabase.from('rooms').update({ is_active: !currentState }).eq('id', roomId)
  setRooms(prev => prev.map(r => r.id === roomId ? { ...r, is_active: !currentState } : r))
}

// Delete — call Supabase:
const confirmDelete = async () => {
  await supabase.from('rooms').delete().eq('id', roomToDelete.id)
  setRooms(prev => prev.filter(r => r.id !== roomToDelete.id))
}

// Photo upload area — add "Coming Soon" badge instead of silently failing
```

---

## Task 10: Fix Settings Page

**Files:**
- Modify: `app/dashboard/settings/page.tsx`

**Problems to fix:**
1. Profile/property save uses mocked `setTimeout` — wire to Supabase
2. Domain hardcoded as `bookpage.com/` — use `process.env.NEXT_PUBLIC_APP_URL`
3. Copy slug button has no feedback — show "Copied!" confirmation
4. Notification toggles have no API integration

**Implementation:**

```tsx
// Copy slug with feedback:
const [copied, setCopied] = useState(false)
const copySlug = async () => {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/${property.slug}`
  await navigator.clipboard.writeText(url)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
}
<button onClick={copySlug}>{copied ? '✓ Copied!' : 'Copy Link'}</button>

// Real profile save:
const handleProfileSave = async () => {
  setSaving(true)
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: formData.fullName, phone: formData.phone })
    .eq('id', user.id)
  setSaving(false)
  if (error) {
    addToast({ title: 'Failed to save', description: error.message, variant: 'destructive' })
  } else {
    addToast({ title: 'Profile saved', variant: 'success' })
  }
}

// Real property save:
const handlePropertySave = async () => {
  const { error } = await supabase
    .from('properties')
    .update({ name: formData.name, description: formData.description, amenities: formData.amenities })
    .eq('id', property.id)
  // toast on success/error
}
```

---

## Task 11: Fix Verification Page

**Files:**
- Modify: `app/dashboard/verification/page.tsx`

**Problems to fix:**
1. `simulateStatus()` demo function should be removed from production UI
2. File upload has no size/type validation on the client before uploading
3. `steps` array recreated on every render — move outside component

**Implementation:**

```tsx
// Remove simulateStatus() and demo buttons entirely (the whole "Demo Controls" section)

// Move steps outside component:
const VERIFICATION_STEPS = [
  { id: 1, title: 'Submit Documents', ... },
  { id: 2, title: 'Video Call', ... },
  { id: 3, title: 'Verification Status', ... },
]

// File validation before upload:
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
const MAX_SIZE_MB = 5

const handleFileSelect = (file: File) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    addToast({ title: 'Invalid file type', description: 'Please upload JPG, PNG, or PDF', variant: 'destructive' })
    return
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    addToast({ title: 'File too large', description: `Maximum file size is ${MAX_SIZE_MB}MB`, variant: 'destructive' })
    return
  }
  // proceed with upload
}
```

---

## Task 12: Fix Blocked Dates Page

**Files:**
- Modify: `app/dashboard/blocked/page.tsx`

**Problems to fix:**
1. `handleBulkAdd()` creates one entry instead of parsing multiple — fix parsing logic
2. Initial state uses hardcoded test data — fetch from Supabase
3. IDs use `Date.now()` — use Supabase UUIDs

**Implementation:**

```tsx
// Fetch from Supabase:
useEffect(() => {
  const fetchBlocked = async () => {
    const { data } = await supabase
      .from('blocked_dates')
      .select('*')
      .eq('property_id', propertyId)
    if (data) setBlockedDates(data)
  }
  if (propertyId) fetchBlocked()
}, [propertyId, supabase])

// Fix bulk add — parse each line:
const handleBulkAdd = async () => {
  const lines = bulkInput.trim().split('\n').filter(Boolean)
  const newEntries = []

  for (const line of lines) {
    const parts = line.split(',').map(s => s.trim())
    if (parts.length >= 2) {
      const [startDate, endDate, reason = ''] = parts
      if (startDate && endDate) {
        newEntries.push({ property_id: propertyId, start_date: startDate, end_date: endDate, reason })
      }
    }
  }

  if (newEntries.length === 0) {
    addToast({ title: 'No valid dates found', variant: 'destructive' })
    return
  }

  const { error } = await supabase.from('blocked_dates').insert(newEntries)
  if (!error) {
    addToast({ title: `Blocked ${newEntries.length} date range(s)`, variant: 'success' })
    // refetch
  }
}
```

---

## Task 13: Fix Referral Page

**Files:**
- Modify: `app/dashboard/referral/page.tsx`

**Problems to fix:**
1. Referral data hardcoded — fetch from Supabase
2. `navigator.clipboard.writeText()` can fail — add try/catch
3. `window.open()` can be blocked — show toast on failure
4. Referral link uses hardcoded domain — use env var

**Implementation:**

```tsx
// Fetch from Supabase:
useEffect(() => {
  const fetchReferrals = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('referral_code, credits_earned')
      .eq('id', user.id)
      .single()

    const { data: referrals } = await supabase
      .from('referrals')
      .select('*, referred:referred_id(email)')
      .eq('referrer_id', user.id)

    setReferralData(profile)
    setReferrals(referrals || [])
  }
  fetchReferrals()
}, [supabase, user.id])

// Safe clipboard copy:
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    addToast({ title: 'Copied to clipboard!', variant: 'success' })
  } catch {
    addToast({ title: 'Copy failed', description: 'Please copy the link manually', variant: 'destructive' })
  }
}

// Safe window.open:
const shareVia = (url: string) => {
  const popup = window.open(url, '_blank', 'noopener,noreferrer')
  if (!popup) {
    addToast({ title: 'Popup blocked', description: 'Please allow popups to share', variant: 'destructive' })
  }
}

// Use env var:
const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${referralCode}`
```

---

## Task 14: Fix Superadmin Page

**Files:**
- Modify: `app/superadmin/page.tsx`
- Modify: `app/superadmin/login/page.tsx`

**Problems to fix:**
1. `Promise.all()` crashes entire page if any query fails — use `Promise.allSettled()`
2. `any` type on verification items — use proper type
3. Admin email `split(',')` missing `.trim()` (already fixed in middleware — sync here too)
4. Superadmin login shows `err.message` raw — use generic error
5. Admin login placeholder email `admin@bookpage.com` — remove it

**Implementation:**

```tsx
// superadmin/page.tsx — use Promise.allSettled:
const results = await Promise.allSettled([
  supabase.from('properties').select('count'),
  supabase.from('profiles').select('count'),
  supabase.from('properties').select('*').eq('verification_status', 'pending'),
])

const propertiesCount = results[0].status === 'fulfilled' ? results[0].value.count : 0
// etc.

// superadmin/login/page.tsx — generic error message:
} catch (err) {
  setError('Invalid credentials. Please try again.')
}

// Remove placeholder from email input
<Input type="email" placeholder="Admin email address" ... />
```

---

## Task 15: Fix Reset Password Page

**Files:**
- Modify: `app/reset-password/page.tsx`

**Problems to fix:**
1. `window.location.origin` used for redirect URL — SSR unsafe; use env var instead
2. `formatDate` is undefined/missing import — fix import
3. Error messages not linked to inputs via `aria-describedby`

**Implementation:**

```tsx
// Use env var for redirect URL (safe on server & client):
const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/update-password`
await supabase.auth.resetPasswordForEmail(data.email, { redirectTo })

// Fix formatDate — import from lib/utils:
import { formatDate } from '@/lib/utils'

// Link errors to inputs:
<Input
  id="email"
  aria-describedby={errors.email ? 'email-error' : undefined}
  ...
/>
{errors.email && (
  <p id="email-error" role="alert" className="text-sm text-red-600">
    {errors.email.message}
  </p>
)}
```

---

## Task 16: Add Consistent Loading Skeleton Component

**Files:**
- Create: `components/ui/spinner.tsx`
- Modify: `app/dashboard/page.tsx` (replace custom spinner with component)
- Modify: `app/login/page.tsx` (replace custom spinner with component)

**Problems to fix:**
1. Three different spinner implementations across the app — standardize to one

**Implementation:**

```tsx
// components/ui/spinner.tsx:
import { cn } from '@/lib/utils'

export function Spinner({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-8 w-8' }
  return (
    <svg
      className={cn('animate-spin text-current', sizes[size], className)}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}
```

Then replace all inline spinner SVGs with `<Spinner />`.

---

## Task 17: Add Missing Aria Labels & Accessibility Fixes

**Files:**
- Modify: `app/[slug]/page.tsx`
- Modify: `app/dashboard/verification/page.tsx`
- Modify: `app/dashboard/rooms/page.tsx`

**Problems to fix:**
1. Edit/Delete icon buttons in rooms have no aria-labels
2. File input hidden with `display:none` — change to `sr-only` class
3. Time slot buttons in verification have no selected-state aria-label

**Implementation:**

```tsx
// Rooms — icon buttons:
<button aria-label={`Edit ${room.name}`} onClick={() => handleEdit(room)}>
  <Pencil className="h-4 w-4" />
</button>
<button aria-label={`Delete ${room.name}`} onClick={() => handleDelete(room)}>
  <Trash2 className="h-4 w-4" />
</button>

// Verification — file input:
<input
  type="file"
  className="sr-only"  // instead of style={{ display: 'none' }}
  ref={fileInputRef}
  accept=".jpg,.jpeg,.png,.pdf"
/>

// Verification — time slot buttons:
<button
  aria-pressed={selectedSlot === slot}
  aria-label={`Select time slot ${slot}`}
  ...
>
  {slot}
</button>
```

---

## Task 18: Fix Settings/Location Page

**Files:**
- Modify: `app/dashboard/settings/location/page.tsx`

**Problems to fix:**
1. "Saved" button text never resets after success — add timeout to revert
2. Coordinates saved without validation
3. `useEffect` with unstable `addToast` reference

**Implementation:**

```tsx
// Reset "Saved" text after 2 seconds:
const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

const handleSave = async () => {
  setSaveState('saving')
  // validate coordinates
  if (location.lat < -90 || location.lat > 90 || location.lng < -180 || location.lng > 180) {
    addToast({ title: 'Invalid coordinates', variant: 'destructive' })
    setSaveState('idle')
    return
  }
  const { error } = await supabase.from('properties')
    .update({ location_lat: location.lat, location_lng: location.lng })
    .eq('id', property.id)

  if (error) {
    addToast({ title: 'Failed to save location', variant: 'destructive' })
    setSaveState('idle')
  } else {
    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 2000)
  }
}

// Button:
<Button disabled={saveState === 'saving'}>
  {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? '✓ Saved' : 'Save Location'}
</Button>

// Fix useEffect — use useRef for addToast to avoid stale closure:
const addToastRef = useRef(addToast)
useEffect(() => { addToastRef.current = addToast }, [addToast])
```

---

## Task 19: Fix Tailwind — Add Missing Animation Classes

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

**Problems to fix:**
1. `animate-float` class referenced but not defined
2. `animate-fade-in-up` class referenced but not defined
3. `badge-pulse` class referenced but not defined
4. `ease-default` referenced but not defined

**Implementation:**

```ts
// tailwind.config.ts — add to theme.extend:
animation: {
  'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
  'float': 'float 3s ease-in-out infinite',
  'badge-pulse': 'badgePulse 2s ease-in-out infinite',
},
keyframes: {
  fadeInUp: {
    '0%': { opacity: '0', transform: 'translateY(16px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  float: {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-8px)' },
  },
  badgePulse: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.6' },
  },
},
// globals.css — add ease-default:
// .ease-default { transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94); }
```

---

## Task 20: Final Audit — Verify All Fixes

**Steps:**
1. Run `npm run build` and confirm no TypeScript errors
2. Test login → wrong icon gone, generic error message works
3. Test dashboard → notification bell navigates to bookings
4. Test public page → availability queries DB, not `Math.random()`
5. Test middleware → admin without ADMIN_EMAILS env cannot access superadmin
6. Test mobile nav → aria-expanded correct, menu accessible
7. Test blocked dates bulk add → multiple lines parsed correctly
8. Test settings → save calls real Supabase, slug copy shows "Copied!"
9. Check browser console for no runtime errors
10. Run lighthouse accessibility audit on `/login` and `/dashboard`

---

## Summary

| Task | Files Changed | Issues Fixed |
|------|--------------|-------------|
| 1 | login/page.tsx | Wrong icon, error message, aria-label, Google button |
| 2 | middleware.ts, login/page.tsx | Admin email security, redirect param |
| 3 | lib/utils.ts | Slug unicode, phone format, nights calc |
| 4 | Navbar.tsx | Scroll perf, aria-expanded, pointer-events |
| 5 | DashboardSidebar.tsx | isActive bug, aria, sign out confirm |
| 6 | dashboard/page.tsx | Notification bell, hibernation timestamp |
| 7 | [slug]/page.tsx | Real availability, a11y, WhatsApp link |
| 8 | bookings/page.tsx | Real Supabase data, accept/reject, copy link |
| 9 | rooms/page.tsx | Real Supabase data, toggle persist, delete |
| 10 | settings/page.tsx | Real saves, env var domain, copy feedback |
| 11 | verification/page.tsx | Remove demo, file validation |
| 12 | blocked/page.tsx | Bulk add fix, real data |
| 13 | referral/page.tsx | Real data, safe clipboard/popup |
| 14 | superadmin/page.tsx, login.tsx | allSettled, generic errors |
| 15 | reset-password/page.tsx | Env redirect, import fix, a11y |
| 16 | ui/spinner.tsx + all pages | Consistent spinner |
| 17 | [slug], verification, rooms | Aria labels |
| 18 | settings/location/page.tsx | Save state, coord validation |
| 19 | tailwind.config.ts, globals.css | Missing animations |
| 20 | — | Final verification |
