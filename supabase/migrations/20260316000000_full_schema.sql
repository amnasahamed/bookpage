-- ============================================================
-- BookPage Full Schema Migration
-- Brings remote DB in line with app requirements
-- ============================================================

-- ============================================================
-- 1. PROFILES — add missing columns
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone            text,
  ADD COLUMN IF NOT EXISTS avatar_url       text,
  ADD COLUMN IF NOT EXISTS referral_code    text UNIQUE,
  ADD COLUMN IF NOT EXISTS credits_earned   integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at       timestamptz NOT NULL DEFAULT now();

-- ============================================================
-- 2. PROPERTIES — rename admin_id → owner_id, add missing columns
-- ============================================================

-- Rename admin_id to owner_id (app uses owner_id everywhere)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'properties'
      AND column_name  = 'admin_id'
  ) THEN
    ALTER TABLE public.properties RENAME COLUMN admin_id TO owner_id;
  END IF;
END $$;

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS is_verified          boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_status  text NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending','approved','rejected')),
  ADD COLUMN IF NOT EXISTS is_hibernating       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS subscription_status  text NOT NULL DEFAULT 'trial'
    CHECK (subscription_status IN ('trial','active','expired','cancelled')),
  ADD COLUMN IF NOT EXISTS subscription_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS location_lat         double precision,
  ADD COLUMN IF NOT EXISTS location_lng         double precision;

-- ============================================================
-- 3. ROOMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rooms (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id    uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name           text NOT NULL,
  room_type      text,
  description    text,
  max_guests     integer NOT NULL DEFAULT 2,
  num_beds       integer NOT NULL DEFAULT 1,
  price_per_night numeric(10,2) NOT NULL DEFAULT 0,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  room_id         uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  guest_name      text NOT NULL,
  guest_email     text,
  guest_phone     text,
  check_in        date NOT NULL,
  check_out       date NOT NULL,
  num_guests      integer NOT NULL DEFAULT 1,
  status          text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','cancelled','completed','no_show')),
  hold_code       text,
  hold_expires_at timestamptz,
  total_amount    numeric(10,2),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. BLOCKED DATES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  start_date  date NOT NULL,
  end_date    date NOT NULL,
  reason      text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT blocked_dates_valid_range CHECK (end_date >= start_date)
);

-- ============================================================
-- 6. REFERRALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.referrals (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  referral_code text NOT NULL,
  credits_earned integer NOT NULL DEFAULT 0,
  status        text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','completed','expired')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 7. AUTO-UPDATE updated_at triggers
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rooms_updated_at ON public.rooms;
CREATE TRIGGER rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS bookings_updated_at ON public.bookings;
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 8. AUTO-CREATE PROFILE on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    upper(substring(replace(NEW.id::text, '-', ''), 1, 8))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 9. ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals     ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "profiles_select_own"    ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"    ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"    ON public.profiles;

DROP POLICY IF EXISTS "properties_select_all"  ON public.properties;
DROP POLICY IF EXISTS "properties_select_own"  ON public.properties;
DROP POLICY IF EXISTS "properties_insert_own"  ON public.properties;
DROP POLICY IF EXISTS "properties_update_own"  ON public.properties;
DROP POLICY IF EXISTS "properties_delete_own"  ON public.properties;

DROP POLICY IF EXISTS "rooms_select_all"       ON public.rooms;
DROP POLICY IF EXISTS "rooms_manage_own"       ON public.rooms;

DROP POLICY IF EXISTS "bookings_select_owner"  ON public.bookings;
DROP POLICY IF EXISTS "bookings_insert_guest"  ON public.bookings;
DROP POLICY IF EXISTS "bookings_update_owner"  ON public.bookings;

DROP POLICY IF EXISTS "blocked_select_all"     ON public.blocked_dates;
DROP POLICY IF EXISTS "blocked_manage_own"     ON public.blocked_dates;

DROP POLICY IF EXISTS "referrals_select_own"   ON public.referrals;
DROP POLICY IF EXISTS "referrals_insert_own"   ON public.referrals;

-- PROFILES policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- PROPERTIES policies
-- Anyone can read properties (for public listing pages)
CREATE POLICY "properties_select_all" ON public.properties
  FOR SELECT USING (true);

CREATE POLICY "properties_insert_own" ON public.properties
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "properties_update_own" ON public.properties
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "properties_delete_own" ON public.properties
  FOR DELETE USING (auth.uid() = owner_id);

-- ROOMS policies
-- Anyone can read rooms (for public property pages)
CREATE POLICY "rooms_select_all" ON public.rooms
  FOR SELECT USING (true);

-- Only property owner can manage rooms
CREATE POLICY "rooms_manage_own" ON public.rooms
  FOR ALL USING (
    auth.uid() = (
      SELECT owner_id FROM public.properties WHERE id = property_id
    )
  );

-- BOOKINGS policies
-- Property owner can see all bookings for their property
CREATE POLICY "bookings_select_owner" ON public.bookings
  FOR SELECT USING (
    auth.uid() = (
      SELECT owner_id FROM public.properties WHERE id = property_id
    )
  );

-- Anyone (guests) can insert a booking
CREATE POLICY "bookings_insert_guest" ON public.bookings
  FOR INSERT WITH CHECK (true);

-- Only property owner can update bookings
CREATE POLICY "bookings_update_owner" ON public.bookings
  FOR UPDATE USING (
    auth.uid() = (
      SELECT owner_id FROM public.properties WHERE id = property_id
    )
  );

-- BLOCKED DATES policies
-- Anyone can read blocked dates (for availability checks)
CREATE POLICY "blocked_select_all" ON public.blocked_dates
  FOR SELECT USING (true);

-- Only property owner can manage blocked dates
CREATE POLICY "blocked_manage_own" ON public.blocked_dates
  FOR ALL USING (
    auth.uid() = (
      SELECT owner_id FROM public.properties WHERE id = property_id
    )
  );

-- REFERRALS policies
CREATE POLICY "referrals_select_own" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "referrals_insert_own" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- ============================================================
-- 10. INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_properties_owner_id   ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_slug        ON public.properties(slug);
CREATE INDEX IF NOT EXISTS idx_rooms_property_id      ON public.rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property_id   ON public.bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status        ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_property ON public.blocked_dates(property_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id  ON public.referrals(referrer_id);
