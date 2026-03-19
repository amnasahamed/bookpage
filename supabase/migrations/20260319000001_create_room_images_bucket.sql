-- Migration: Create Supabase Storage Buckets
-- Date: 2026-03-19
-- Description: Creates storage buckets for room images

-- Insert storage bucket for room images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'room-images',
  'room-images',
  true,
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for room images (public read)
CREATE POLICY "Public can view room images"
ON storage.objects FOR SELECT
USING (bucket_id = 'room-images');

-- Create storage policy for authenticated users to upload
CREATE POLICY "Authenticated users can upload room images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'room-images'
  AND auth.role() = 'authenticated'
);

-- Create storage policy for authenticated users to update their own images
CREATE POLICY "Users can update their own room images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'room-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policy for authenticated users to delete their own images
CREATE POLICY "Users can delete their own room images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'room-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

