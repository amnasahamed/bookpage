-- ============================================================
-- SIMPLIFIED BOOKING SYSTEM SCHEMA
-- Beta Version - One Property Per Owner
-- Date: 2026-03-19
-- ============================================================

-- ============================================================
-- 1. PROPERTIES TABLE (One per owner)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.properties (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text NOT NULL,
  slug            text NOT NULL UNIQUE,
  description     text,
  location        text,
  whatsapp        text NOT NULL,
  price_per_night numeric(10,2) NOT NULL DEFAULT 0,
  currency        text DEFAULT 'INR',
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_properties_slug ON public.properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON public.properties(owner_id);

-- ============================================================
-- 2. PROPERTY IMAGES TABLE (Vertical photos for Stories-style gallery)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.property_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  url         text NOT NULL,
  caption     text,
  sort_order  integer DEFAULT 0,
  is_cover   boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- Index for property images
CREATE INDEX IF NOT EXISTS idx_property_images_property ON public.property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_sort ON public.property_images(property_id, sort_order);

-- ============================================================
-- 3. HOLDS TABLE (30-minute booking holds)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.holds (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  check_in      date NOT NULL,
  check_out     date NOT NULL,
  guest_name    text,
  guest_phone   text,
  num_guests    integer DEFAULT 1,
  whatsapp_msg  text,
  expires_at    timestamptz NOT NULL,
  status        text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'converted', 'cancelled')),
  created_at    timestamptz DEFAULT now()
);

-- Index for active holds
CREATE INDEX IF NOT EXISTS idx_holds_property ON public.holds(property_id);
CREATE INDEX IF NOT EXISTS idx_holds_expires ON public.holds(expires_at) WHERE status = 'active';

-- ============================================================
-- 4. AVAILABILITY TABLE (🟢🟡🔴 status per date)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.availability (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  date        date NOT NULL,
  status      text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'on_hold', 'booked')),
  hold_id     uuid REFERENCES public.holds(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(property_id, date)
);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_availability_property_date ON public.availability(property_id, date);
CREATE INDEX IF NOT EXISTS idx_availability_status ON public.availability(status);

-- ============================================================
-- 5. ADD MISSING COLUMNS (if they don't exist)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'is_active') THEN
    ALTER TABLE public.properties ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Properties: Owner can do everything
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view properties" ON public.properties
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Owner can insert properties" ON public.properties
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owner can update properties" ON public.properties
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owner can delete properties" ON public.properties
  FOR DELETE USING (owner_id = auth.uid());

-- Public can view active properties
CREATE POLICY "Anyone can view active properties" ON public.properties
  FOR SELECT USING (is_active = true);

-- Property Images: Owner can manage
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view property images" ON public.property_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties WHERE id = property_images.property_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Owner can insert property images" ON public.property_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties WHERE id = property_images.property_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Owner can update property images" ON public.property_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.properties WHERE id = property_images.property_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Owner can delete property images" ON public.property_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.properties WHERE id = property_images.property_id AND owner_id = auth.uid()
    )
  );

-- Public can view images for active properties
CREATE POLICY "Anyone can view images for active properties" ON public.property_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties WHERE id = property_images.property_id AND is_active = true
    )
  );

-- Availability: Owner can manage
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view availability" ON public.availability
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties WHERE id = availability.property_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Owner can insert availability" ON public.availability
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties WHERE id = availability.property_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Owner can update availability" ON public.availability
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.properties WHERE id = availability.property_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Owner can delete availability" ON public.availability
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.properties WHERE id = availability.property_id AND owner_id = auth.uid()
    )
  );

-- Public can view availability for active properties
CREATE POLICY "Anyone can view availability" ON public.availability
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties WHERE id = availability.property_id AND is_active = true
    )
  );

-- Holds: Owner can manage
ALTER TABLE public.holds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view holds" ON public.holds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties WHERE id = holds.property_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Owner can update holds" ON public.holds
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.properties WHERE id = holds.property_id AND owner_id = auth.uid()
    )
  );

-- Anyone can create holds (for booking)
CREATE POLICY "Anyone can create holds" ON public.holds
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function to create hold and update availability
CREATE OR REPLACE FUNCTION create_hold_and_update_availability(
  p_property_id uuid,
  p_check_in date,
  p_check_out date,
  p_guest_name text DEFAULT NULL,
  p_guest_phone text DEFAULT NULL,
  p_num_guests integer DEFAULT 1,
  p_whatsapp_msg text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_hold_id uuid;
  v_date date;
BEGIN
  -- Create the hold (30 minutes from now)
  INSERT INTO public.holds (
    property_id,
    check_in,
    check_out,
    guest_name,
    guest_phone,
    num_guests,
    whatsapp_msg,
    expires_at
  ) VALUES (
    p_property_id,
    p_check_in,
    p_check_out,
    p_guest_name,
    p_guest_phone,
    p_num_guests,
    p_whatsapp_msg,
    now() + interval '30 minutes'
  ) RETURNING id INTO v_hold_id;

  -- Update availability for all dates in range
  v_date := p_check_in;
  WHILE v_date < p_check_out LOOP
    INSERT INTO public.availability (
      property_id,
      date,
      status,
      hold_id
    ) VALUES (
      p_property_id,
      v_date,
      'on_hold',
      v_hold_id
    ) ON CONFLICT (property_id, date) DO UPDATE SET
      status = 'on_hold',
      hold_id = v_hold_id,
      updated_at = now();

    v_date := v_date + 1;
  END LOOP;

  RETURN v_hold_id;
END;
$$ LANGUAGE plpgsql;

-- Function to expire old holds and update availability
CREATE OR REPLACE FUNCTION expire_old_holds() RETURNS void AS $$
BEGIN
  -- Update expired holds
  UPDATE public.holds
  SET status = 'expired'
  WHERE status = 'active' AND expires_at < now();

  -- Update availability for expired holds
  UPDATE public.availability a
  SET status = 'available',
      hold_id = NULL,
      updated_at = now()
  WHERE a.status = 'on_hold'
    AND a.hold_id IN (
      SELECT id FROM public.holds WHERE status = 'expired'
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- STORAGE BUCKET FOR IMAGES
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  10485760,  -- 10MB limit for vertical photos
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for property images
CREATE POLICY "Anyone can view property images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own property images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'property-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================
-- Uncomment to add test data:
/*
INSERT INTO public.properties (name, slug, description, location, whatsapp, price_per_night)
VALUES (
  'Sunset Villa Goa',
  'sunset-villa-goa',
  'Beautiful beachfront villa with stunning sunset views',
  'Anjuna, Goa',
  '+919876543210',
  8500
);
*/
