-- Migration: Add comprehensive room management fields
-- Date: 2026-03-19
-- Description: Adds images, amenities, bed types, and other room details

-- Add missing columns to rooms table
ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS images text[],
ADD COLUMN IF NOT EXISTS amenities text[],
ADD COLUMN IF NOT EXISTS bed_types text[],
ADD COLUMN IF NOT EXISTS room_size integer,
ADD COLUMN IF NOT EXISTS extra_guest_charge numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS minimum_stay integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS cleaning_fee numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS check_in_time text DEFAULT '2:00 PM',
ADD COLUMN IF NOT EXISTS check_out_time text DEFAULT '11:00 AM',
ADD COLUMN IF NOT EXISTS cancellation_policy text DEFAULT 'freeCancellation';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_rooms_property_id ON public.rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_rooms_is_active ON public.rooms(is_active);

-- Create table for room images with more details
CREATE TABLE IF NOT EXISTS public.room_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  url         text NOT NULL,
  caption     text,
  sort_order  integer DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_room_images_room_id ON public.room_images(room_id);

-- Add RLS policies for room_images
ALTER TABLE public.room_images ENABLE ROW LEVEL SECURITY;

-- Owners can manage their room images
CREATE POLICY "Owners can view room images" ON public.room_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.properties p ON r.property_id = p.id
      WHERE r.id = room_images.room_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert room images" ON public.room_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.properties p ON r.property_id = p.id
      WHERE r.id = room_images.room_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete room images" ON public.room_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.properties p ON r.property_id = p.id
      WHERE r.id = room_images.room_id AND p.owner_id = auth.uid()
    )
  );

-- Update existing RLS policies for rooms to include new fields
DROP POLICY IF EXISTS "Users can view their property rooms" ON public.rooms;
CREATE POLICY "Users can view their property rooms" ON public.rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties WHERE id = rooms.property_id AND owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert rooms for their properties" ON public.rooms;
CREATE POLICY "Users can insert rooms for their properties" ON public.rooms
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties WHERE id = rooms.property_id AND owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their property rooms" ON public.rooms;
CREATE POLICY "Users can update their property rooms" ON public.rooms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.properties WHERE id = rooms.property_id AND owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their property rooms" ON public.rooms;
CREATE POLICY "Users can delete their property rooms" ON public.rooms
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.properties WHERE id = rooms.property_id AND owner_id = auth.uid()
    )
  );

-- Allow public read for active rooms (for booking site)
DROP POLICY IF EXISTS "Public can view active rooms" ON public.rooms;
CREATE POLICY "Public can view active rooms" ON public.rooms
  FOR SELECT USING (is_active = true);

COMMENT ON COLUMN public.rooms.images IS 'Array of image URLs for the room';
COMMENT ON COLUMN public.rooms.amenities IS 'Array of amenities: wifi, ac, tv, pool, etc.';
COMMENT ON COLUMN public.rooms.bed_types IS 'Array of bed types: king, queen, twin, single';
COMMENT ON COLUMN public.rooms.room_size IS 'Room size in square feet';
COMMENT ON COLUMN public.rooms.extra_guest_charge IS 'Charge per extra guest beyond max_guests';
COMMENT ON COLUMN public.rooms.minimum_stay IS 'Minimum number of nights required';
COMMENT ON COLUMN public.rooms.cleaning_fee IS 'One-time cleaning fee';
COMMENT ON COLUMN public.rooms.check_in_time IS 'Standard check-in time';
COMMENT ON COLUMN public.rooms.check_out_time IS 'Standard check-out time';
COMMENT ON COLUMN public.rooms.cancellation_policy IS 'Policy type: freeCancellation, moderate, strict';
