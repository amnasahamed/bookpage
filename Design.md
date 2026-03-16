# Design PRD: BookPage

## 1. Overview

**Project Name:** BookPage  
**Tagline:** "Your Property's Instagram-Ready Booking Page"  
**Target Audience:** Indian villa/homestay owners (Instagram-savvy, mobile-first)  
**Language:** English (with Indian market adaptations - ₹ symbol, familiar patterns)  
**Website Type:** SaaS Platform with Public Pages + Owner Dashboard  

**Core Value Proposition:**  
A simple, elegant booking page generator for property owners who want to convert Instagram followers into paying guests without complex calendar grids or OTA commissions.

**Business Model:**  
- Subscription: ₹3,999/year per property
- Subdomain URLs: bookpage.com/[property-slug] (no custom domains)
- Referral Program: ₹666 credit per successful referral

---

## 2. Page Manifest

| Page ID | Page Name | File Name | Is Entry | SubAgent Notes |
|---------|-----------|-----------|----------|----------------|
| landing | Landing Page | page.tsx | YES | Marketing hero, pricing, features, testimonials |
| login | Login | login/page.tsx | NO | Email + password, link to signup |
| signup | Signup | signup/page.tsx | NO | Email, password, property name, link to login |
| reset-password | Password Reset | reset-password/page.tsx | NO | Email input, confirmation state |
| dashboard | Owner Dashboard | dashboard/page.tsx | NO | Overview stats, quick actions, requires auth |
| dashboard-rooms | Room Management | dashboard/rooms/page.tsx | NO | Add/edit rooms, room types, requires auth |
| dashboard-bookings | Booking Requests | dashboard/bookings/page.tsx | NO | Accept/reject with hold codes, requires auth |
| dashboard-blocked | Blocked Dates | dashboard/blocked/page.tsx | NO | List view date ranges, requires auth |
| dashboard-settings | Settings | dashboard/settings/page.tsx | NO | Profile, subscription, hibernation toggle |
| dashboard-referral | Referral Program | dashboard/referral/page.tsx | NO | Code display, share buttons, credits |
| verification | Verification Flow | dashboard/verification/page.tsx | NO | 3-step verification process |
| property | Public Property Page | [slug]/page.tsx | NO | Guest view, photo gallery, availability |

---

## 3. Global Design System

### 3.1 Color Palette

**Primary Colors:**
| Name | Hex | Usage |
|------|-----|-------|
| trust-blue-600 | #2563EB | Primary buttons, links, active states |
| trust-blue-500 | #3B82F6 | Hover states, secondary actions |
| trust-blue-50 | #EFF6FF | Light backgrounds, badges |

**Success Colors:**
| Name | Hex | Usage |
|------|-----|-------|
| success-green-600 | #059669 | Verified badges, success states |
| success-green-500 | #10B981 | Success notifications |
| success-green-50 | #ECFDF5 | Success backgrounds |

**Warning Colors:**
| Name | Hex | Usage |
|------|-----|-------|
| warning-amber-500 | #F59E0B | Warning banners, hibernation alerts |
| warning-amber-100 | #FEF3C7 | Warning backgrounds |
| warning-amber-600 | #D97706 | Warning text |

**Neutral Colors:**
| Name | Hex | Usage |
|------|-----|-------|
| gray-900 | #111827 | Primary text, headings |
| gray-700 | #374151 | Secondary text |
| gray-500 | #6B7280 | Placeholder text, disabled |
| gray-300 | #D1D5DB | Borders, dividers |
| gray-100 | #F3F4F6 | Card backgrounds |
| gray-50 | #F9FAFB | Page backgrounds |
| white | #FFFFFF | Cards, inputs |

**Accent Colors:**
| Name | Hex | Usage |
|------|-----|-------|
| hold-orange | #EA580C | On-hold status, urgency indicators |
| referral-purple | #7C3AED | Referral program accents |

### 3.2 Typography

**Font Family:**
- Primary: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Fallback: `system-ui, sans-serif`

**Type Scale:**
| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| H1 (Hero) | 48px / 3rem | 800 | 1.1 | -0.02em |
| H2 (Section) | 36px / 2.25rem | 700 | 1.2 | -0.01em |
| H3 (Card Title) | 24px / 1.5rem | 600 | 1.3 | 0 |
| H4 (Subsection) | 20px / 1.25rem | 600 | 1.4 | 0 |
| Body Large | 18px / 1.125rem | 400 | 1.6 | 0 |
| Body | 16px / 1rem | 400 | 1.6 | 0 |
| Body Small | 14px / 0.875rem | 400 | 1.5 | 0 |
| Caption | 12px / 0.75rem | 500 | 1.4 | 0.01em |
| Button | 16px / 1rem | 600 | 1 | 0 |

### 3.3 Spacing System

**Base Unit:** 4px (0.25rem)

| Token | Value | Usage |
|-------|-------|-------|
| space-1 | 4px | Tight spacing |
| space-2 | 8px | Icon gaps, inline spacing |
| space-3 | 12px | Small component padding |
| space-4 | 16px | Standard padding, card gaps |
| space-6 | 24px | Section padding |
| space-8 | 32px | Large gaps, section separators |
| space-12 | 48px | Major section spacing |
| space-16 | 64px | Hero spacing |

**Container Widths:**
| Container | Max Width | Padding |
|-----------|-----------|---------|
| sm | 640px | 16px |
| md | 768px | 24px |
| lg | 1024px | 32px |
| xl | 1280px | 48px |

### 3.4 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| radius-sm | 4px | Small buttons, tags |
| radius-md | 8px | Inputs, cards |
| radius-lg | 12px | Large cards, modals |
| radius-xl | 16px | Feature cards, hero elements |
| radius-full | 9999px | Pills, avatars, badges |

### 3.5 Shadows

| Token | Value | Usage |
|-------|-------|-------|
| shadow-sm | 0 1px 2px rgba(0,0,0,0.05) | Subtle elevation |
| shadow-md | 0 4px 6px -1px rgba(0,0,0,0.1) | Cards, buttons |
| shadow-lg | 0 10px 15px -3px rgba(0,0,0,0.1) | Modals, dropdowns |
| shadow-xl | 0 20px 25px -5px rgba(0,0,0,0.1) | Hero elements |

### 3.6 Animation Defaults

**Easing Functions:**
| Name | Value | Usage |
|------|-------|-------|
| ease-default | cubic-bezier(0.4, 0, 0.2, 1) | Standard transitions |
| ease-in | cubic-bezier(0.4, 0, 1, 1) | Exit animations |
| ease-out | cubic-bezier(0, 0, 0.2, 1) | Enter animations |
| ease-bounce | cubic-bezier(0.68, -0.55, 0.265, 1.55) | Playful interactions |

**Durations:**
| Name | Value | Usage |
|------|-------|-------|
| fast | 150ms | Hover states, micro-interactions |
| normal | 300ms | Standard transitions |
| slow | 500ms | Page transitions, reveals |
| slower | 700ms | Hero animations |

**Stagger Delays:**
| Pattern | Delay |
|---------|-------|
| Grid items | 50ms between items |
| List items | 75ms between items |
| Section reveals | 100ms between sections |

### 3.7 Shared Components

**Primary Button:**
- Background: trust-blue-600 (#2563EB)
- Text: white
- Padding: 12px 24px
- Border Radius: radius-lg (12px)
- Font: 16px, weight 600
- Hover: trust-blue-500 (#3B82F6), translateY(-2px), shadow-lg
- Active: trust-blue-700, translateY(0)
- Transition: all 200ms ease-default

**Secondary Button:**
- Background: white
- Border: 1px solid gray-300 (#D1D5DB)
- Text: gray-700 (#374151)
- Hover: gray-50 (#F9FAFB), border-gray-400

**Ghost Button:**
- Background: transparent
- Text: trust-blue-600 (#2563EB)
- Hover: trust-blue-50 (#EFF6FF)

**Standard Card:**
- Background: white
- Border Radius: radius-lg (12px)
- Padding: 24px
- Shadow: shadow-md
- Hover: shadow-lg, translateY(-4px)
- Transition: all 300ms ease-default

**Text Input:**
- Background: white
- Border: 1px solid gray-300 (#D1D5DB)
- Border Radius: radius-md (8px)
- Padding: 12px 16px
- Font: 16px
- Focus: border-trust-blue-500 (#3B82F6), ring-2 ring-trust-blue-100
- Placeholder: gray-400 (#9CA3AF)
- Error: border-red-500, ring-red-100

**Verified Badge:**
- Background: success-green-50 (#ECFDF5)
- Text: success-green-600 (#059669)
- Border Radius: radius-full
- Padding: 4px 12px
- Icon: CheckCircle (Lucide), 14px
- Font: 12px, weight 500

**Hold Badge:**
- Background: hold-orange/10
- Text: hold-orange (#EA580C)
- Icon: Clock (Lucide)

**Hibernation Badge:**
- Background: warning-amber-100 (#FEF3C7)
- Text: warning-amber-600 (#D97706)
- Icon: Moon (Lucide)


---

## 4. Page Specifications

### 4.1 Page: landing (Landing Page)

**Purpose:** Convert visitors into trial signups. Showcase value proposition, pricing, and social proof.

**Layout Structure:**
1. Navigation (sticky)
2. Hero Section
3. Pricing Banner
4. Features Grid
5. How It Works
6. Testimonials
7. FAQ Accordion
8. Final CTA
9. Footer

**Section: Navigation**
- Height: 72px
- Background: white with backdrop-blur when scrolled
- Shadow on scroll: shadow-sm
- Logo: "BookPage" text, trust-blue-600, 24px, weight 700
- Links: Features, Pricing, How it Works, FAQ
- CTA: "Start Free Trial" button (trust-blue-600)
- Mobile: Hamburger menu with slide-in drawer

**Section: Hero**
- Min Height: 90vh
- Background: gradient from gray-50 to white
- Content max-width: 768px, centered
- Padding: 96px 24px

Content:
- Eyebrow: "For Indian Property Owners" (trust-blue-600, 14px, uppercase, tracking-wide)
- Headline: "Your Property's Instagram-Ready Booking Page" (H1, gray-900)
- Subheadline: "Convert your Instagram followers into paying guests. No calendar grids. No OTA commissions. Just a beautiful booking page that works on mobile." (Body Large, gray-600)
- Price Badge: "₹3,999/year" (white bg, shadow-md, radius-full, padding 12px 24px)
- Primary CTA: "Start Your Free Trial" (trust-blue-600, large button)
- Secondary CTA: "See Example Page" (ghost button)
- Trust indicators: "No credit card required" + "Cancel anytime" with Check icons

Hero Image:
- Position: Right side on desktop, below content on mobile
- Mockup: iPhone showing a property page
- Shadow: shadow-xl
- Animation: Float animation (translateY 10px, 3s infinite)

**Section: Pricing Banner**
- Background: trust-blue-600 (#2563EB)
- Padding: 32px 24px
- Content centered
- Text: "Simple pricing. No hidden fees." (white, H3)
- Price: "₹3,999/year" (white, 48px, weight 800)
- Subtext: "That's just ₹333/month" (white/80, Body)
- CTA: "Get Started" button (white bg, trust-blue-600 text)

**Section: Features Grid**
- Background: white
- Padding: 96px 24px
- Grid: 2 columns desktop, 1 column mobile
- Gap: 32px
- Max-width: 1024px

Features (4 cards):
1. **Verified Properties Only**
   - Icon: ShieldCheck (Lucide)
   - Title: "Verified Properties Only"
   - Description: "Every property is verified through document check and video call. Guests book with confidence."

2. **No Calendar Grid**
   - Icon: CalendarX (Lucide)
   - Title: "No Complex Calendar"
   - Description: "Just block dates when unavailable. No confusing calendar grids to manage. Perfect for mobile."

3. **Smart Hold System**
   - Icon: Clock (Lucide)
   - Title: "Smart Hold System"
   - Description: "Guests can place a hold while they decide. You approve or decline with one tap."

4. **Anti-Ghost Protection**
   - Icon: UserCheck (Lucide)
   - Title: "No More Ghost Bookings"
   - Description: "WhatsApp-integrated confirmations. Real conversations with real guests."

Card Animation:
- Entrance: fadeIn + translateY(30px to 0)
- Duration: 500ms
- Stagger: 100ms between cards
- Easing: ease-out

**Section: How It Works**
- Background: gray-50 (#F9FAFB)
- Padding: 96px 24px
- Steps: 3 horizontal on desktop, vertical on mobile

Steps:
1. **Create Your Page** - "01" (trust-blue-600, 48px, weight 800)
2. **Share Your Link** - "02"
3. **Get Bookings** - "03"

Connector line between steps: 2px dashed gray-300 (#D1D5DB)

**Section: Testimonials**
- Background: white
- Padding: 96px 24px

Testimonials:
1. "BookPage simplified everything." - Priya M., Villa Serenity, Goa
2. "No more 'Is this date available?' DMs." - Rahul K., Mountain View Homestay, Manali
3. "₹3,999 is nothing compared to OTAs." - Anjali S., Beach House, Kerala

**Section: FAQ**
- Background: gray-50 (#F9FAFB)
- Padding: 96px 24px
- Max-width: 768px, centered

Accordion Items:
1. "What happens after I sign up?" → 14-day free trial
2. "Can I use my own domain?" → Subdomain only
3. "How does the hold system work?" → 24-hour hold system
4. "What if I don't get verified?" → Full refund
5. "Can I cancel anytime?" → Yes, anytime

**Section: Final CTA**
- Background: trust-blue-600 (#2563EB)
- Padding: 96px 24px
- Headline: "Ready to convert followers into guests?"
- CTA: "Start Free Trial" button

**Section: Footer**
- Background: gray-900 (#111827)
- Padding: 64px 24px 32px
- Copyright: "© 2024 BookPage. Made for Indian property owners."

---

### 4.2 Page: login (Login)

**Purpose:** Authenticate existing users.

**Layout:**
- Split layout: Left (branding), Right (form) on desktop
- Left side: 40%, gradient background
- Right side: 60%, white background

**Left Panel:**
- Background: linear-gradient(135deg, #2563EB, #1E40AF)
- Logo: BookPage, white
- Tagline: "Welcome back, property owner"

**Right Panel:**
- Max-width: 400px, centered
- Padding: 48px 24px

Form Fields:
1. Email - Label: "Email address", Placeholder: "you@example.com", Icon: Mail
2. Password - Label: "Password", Icon: Lock, Toggle: Eye/EyeOff

Actions:
- Primary: "Sign In" (full-width, trust-blue-600)
- Link: "Forgot password?"
- Google Sign In: "Continue with Google"
- Footer: "Don't have an account? Sign up"

---

### 4.3 Page: signup (Signup)

**Purpose:** Register new property owners.

**Layout:** Same as login (split layout)

**Left Panel:**
- Tagline: "Start your 14-day free trial"
- Benefits: No credit card, Full access, Cancel anytime

**Right Panel:**

Form Fields:
1. Property Name - "What's your property called?", Help: "bookpage.com/your-property"
2. Email
3. Password - Strength indicator
4. Confirm Password

Actions:
- Primary: "Create Account"
- Terms checkbox
- Footer: "Already have an account? Sign in"

---

### 4.4 Page: reset-password (Password Reset)

**Layout:** Centered card, max-width 400px

States:
1. **Input State:** Email input + "Send Reset Link" button
2. **Success State:** Mail icon + "Check your email" + "Back to login"

---

### 4.5 Page: dashboard (Owner Dashboard)

**Purpose:** Main dashboard for property owners.

**Layout:** Sidebar + Main content

**Sidebar:**
- Width: 260px (desktop), overlay (mobile)
- Navigation: Dashboard, Rooms, Bookings, Blocked Dates, Referrals, Settings
- User section with verification badge

**Main Content:**
- Padding: 32px 24px

**Hibernation Warning Banner (conditional):**
- Background: warning-amber-100 (#FEF3C7)
- Border-left: 4px solid warning-amber-500 (#F59E0B)
- Icon: Moon (Lucide)
- Text: "Your page is in hibernation mode."
- Action: "Reactivate Now"

**Stats Cards Row (4 columns):**
1. Total Bookings - "24", "+3 this month"
2. Active Holds - "3", Clock icon
3. Page Views - "1,247", "+12%"
4. Verification Status - "Verified"/"Pending"/"Required"

**Quick Actions:**
- "Add New Room"
- "Block Dates"
- "Share Page"

**Recent Bookings:**
- Last 5 bookings table
- Status badges: Confirmed (green), On Hold (orange), Pending (gray)

---

### 4.6 Page: dashboard-rooms (Room Management)

**Purpose:** Add, edit, and manage rooms.

**Header:**
- Title: "Your Rooms" (H2)
- Button: "+ Add New Room"

**Room Cards (2 columns):**
- Image: 100% width, 200px height
- Room name, Type badge
- Guests, Beds info
- Price: "₹4,500/night"
- Edit/Delete actions
- Active toggle

**Add/Edit Room Modal:**
- Fields: Name, Type, Max guests, Beds, Price, Description, Photos
- Actions: "Save Room" / "Cancel"

---

### 4.7 Page: dashboard-bookings (Booking Requests)

**Purpose:** Manage incoming booking requests and holds.

**Header:**
- Title: "Booking Requests"
- Tabs: All | Pending | Confirmed | On Hold | Expired

**Booking Request Card:**
- Guest avatar + name + WhatsApp button
- Room name, Dates, Guests
- Status badge
- Hold code (if applicable)
- Timer: "Expires in X hours"

Actions:
- Pending: "Accept" / "Decline"
- On Hold: "Convert to Booking" / "Release Hold"

---

### 4.8 Page: dashboard-blocked (Blocked Dates)

**Purpose:** Manage unavailable date ranges (list view).

**Header:**
- Title: "Blocked Dates"
- Button: "+ Block Date Range"

**Blocked Date Card:**
- Date range: "Jan 20 - Jan 25, 2024"
- Reason (optional)
- Days count
- Edit/Delete actions

**Block Dates Modal:**
- Start date, End date, Reason
- Info: "Guests won't be able to request these dates"

---

### 4.9 Page: dashboard-settings (Settings)

**Tabs:** Profile | Property | Subscription | Security

**Profile Tab:**
- Profile photo (120px circle)
- Name, Email (read-only), Phone

**Property Tab:**
- Property name, slug, description, location
- Photos gallery
- Amenities checkboxes

**Subscription Tab:**
- Current plan: "₹3,999/year"
- Next billing date
- Payment method
- Billing history
- Cancel subscription

**Hibernation Toggle:**
- Title: "Hibernation Mode"
- Description: "Temporarily hide your page"
- Warning: "Page not accessible when hibernating"

---

### 4.10 Page: dashboard-referral (Referral Program)

**Header:**
- Title: "Refer & Earn"
- Subtitle: "Earn ₹666 for every property owner you refer"

**Referral Code Card:**
- Background: gradient purple (#7C3AED to #6D28D9)
- Code: "PRIYA666"
- Copy button
- Share: WhatsApp, Copy Link

**Stats:**
- Total referred: "12 owners"
- Credits earned: "₹7,992"
- Available: "₹3,993"

**Referred Owners List:**
- Table: Name | Date | Status | Credit

---

### 4.11 Page: verification (Verification Flow)

**Stepper:** Documents → Video Call → Status

**Step 1: Upload Documents**
- Options: Property Registration, GST, Utility Bill
- Upload area: Drag & drop, 5MB max, PDF/JPG/PNG
- Button: "Continue to Video Call"

**Step 2: Schedule Video Call**
- Calendar picker
- Time slots (9 AM - 6 PM IST)
- Button: "Schedule Call"

**Step 3: Status**
- Pending: Clock icon, "24-48 hours"
- Approved: CheckCircle icon, verified badge
- Rejected: XCircle icon, resubmit option

---

### 4.12 Page: property (Public Property Page - Guest View)

**Layout:** Photo gallery + Two columns (content + booking widget)

**Photo Gallery:**
- Height: 50vh (desktop), 40vh (mobile)
- Main image + 2x2 grid
- "View all photos" button

**Property Header:**
- Property name (H1)
- Location: "Goa, India" (MapPin icon)
- Verified badge
- Rating: "4.9" + "12 reviews"

**Quick Info:**
- Guests, Bedrooms, Bathrooms

**About Section:**
- Expandable description

**Amenities:**
- Grid: 2 columns
- Icons: WiFi, Pool, Parking, AC, Kitchen, TV

**Room Types:**
- Room cards with image, name, guests, price

**Booking Widget (Sticky):**
- Price: "₹4,500/night"
- Date selection
- Guest selector
- "On Hold" warning (if applicable)
- Total calculation
- "Request to Book" button
- "Ask on WhatsApp" button

**WhatsApp CTA:**
- Pre-filled message with property name and dates

**"Travelers also viewed" Section:**
- 3 property cards horizontal scroll


---

## 5. Technical Requirements

### 5.1 Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript 5
- Tailwind CSS 3.4
- shadcn/ui components
- Lucide React icons

**Backend:**
- Supabase (Auth + Database + Storage)
- PostgreSQL (via Supabase)
- Row Level Security (RLS) policies

**Deployment:**
- Vercel (production)

### 5.2 Database Schema (Key Tables)

**profiles:** id, email, full_name, phone, avatar_url, created_at

**properties:** id, owner_id, name, slug, description, location, is_verified, verification_status, is_hibernating, subscription_status, subscription_ends_at

**rooms:** id, property_id, name, room_type, max_guests, num_beds, price_per_night, description, is_active

**bookings:** id, property_id, room_id, guest_name, guest_email, guest_phone, check_in, check_out, num_guests, status, hold_code, hold_expires_at, total_amount

**blocked_dates:** id, property_id, start_date, end_date, reason

**referrals:** id, referrer_id, referred_id, referral_code, credits_earned, status

### 5.3 Responsive Breakpoints

| Breakpoint | Width |
|------------|-------|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
| 2xl | 1536px |

---

## 6. Image Requirements

| Page | Description | Search Keywords |
|------|-------------|-----------------|
| landing-hero | iPhone mockup | "iPhone mockup property booking app UI design" |
| property-gallery-1 | Villa exterior | "luxury villa exterior swimming pool Goa India tropical" |
| property-gallery-2 | Bedroom | "luxury bedroom interior design modern villa India" |
| property-gallery-3 | Living room | "luxury living room interior villa modern design" |
| property-room-1 | Deluxe room | "deluxe hotel room interior king bed luxury modern" |
| property-room-2 | Standard room | "cozy bedroom interior homestay warm lighting" |
| login-illustration | Property illustration | "modern building property illustration gradient blue flat" |

---

## 7. Navigation Structure

### Public Navigation
| Link Text | Target |
|-----------|--------|
| Features | #features |
| Pricing | #pricing |
| How it Works | #how-it-works |
| FAQ | #faq |
| Start Free Trial | /signup |
| Login | /login |

### Dashboard Navigation (Sidebar)
| Link Text | Target | Icon |
|-----------|--------|------|
| Dashboard | /dashboard | LayoutDashboard |
| Rooms | /dashboard/rooms | Bed |
| Bookings | /dashboard/bookings | Calendar |
| Blocked Dates | /dashboard/blocked | Ban |
| Referrals | /dashboard/referral | Gift |
| Settings | /dashboard/settings | Settings |
| Verification | /dashboard/verification | Shield |

---

## 8. Animation Specifications

### Page Load
- Hero text: fadeIn + translateY(30px), 600ms, stagger 100ms
- Hero image: fadeIn + scale(0.95), 800ms
- Stats cards: fadeIn + translateY(20px), 400ms, stagger 75ms

### Scroll Animations
- Trigger: 20% visible
- Animation: fadeIn + translateY(40px)
- Duration: 500ms

### Hover Animations
- Buttons: translateY(-2px), 200ms
- Cards: translateY(-4px), shadow-lg, 300ms

### Micro-interactions
- Form focus: ring scale, 200ms
- Toggles: translateX, 200ms, ease-bounce
- Toast: slideIn 300ms, slideOut 200ms

---

## 9. Accessibility Requirements

- Color contrast: 4.5:1 minimum
- Focus rings: 2px solid trust-blue-500
- Semantic HTML elements
- ARIA labels for icon buttons
- Alt text for all images
- Respect prefers-reduced-motion

---

## 10. Error States & Empty States

### Error States
- Form errors: red-500 border, red-50 bg, AlertCircle icon
- 404: Search icon, "Page not found"
- 500: "Something went wrong"

### Empty States
- No Bookings: CalendarX icon, "Share your page link"
- No Rooms: Bed icon, "Add your first room"
- No Blocked Dates: Calendar icon, "Block dates"

---

*Document Version: 1.0*  
*Last Updated: January 2024*  
*Author: Design SubAgent*
