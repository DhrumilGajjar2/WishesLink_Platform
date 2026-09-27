-- =========================================================
-- Digital Wishing Wall - Supabase Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com)
-- =========================================================

-- 1. Create walls table
CREATE TABLE IF NOT EXISTS public.walls (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    occasion_type TEXT NOT NULL DEFAULT 'birthday',
    theme TEXT NOT NULL DEFAULT 'newspaper',
    share_slug TEXT NOT NULL UNIQUE,
    cover_photo_url TEXT,
    organizer_message TEXT,
    organizer_name TEXT,
    reveal_date TIMESTAMP WITH TIME ZONE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_walls_slug ON public.walls (share_slug);

-- 2. Create contributions table
CREATE TABLE IF NOT EXISTS public.contributions (
    id TEXT PRIMARY KEY,
    wall_id TEXT NOT NULL REFERENCES public.walls(id) ON DELETE CASCADE,
    contributor_name TEXT NOT NULL,
    message TEXT NOT NULL,
    photo_url TEXT,
    highlight BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contributions_wall_id ON public.contributions (wall_id);

-- 3. Row Level Security (RLS) Policies
ALTER TABLE public.walls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read walls" ON public.walls FOR SELECT USING (true);
CREATE POLICY "Allow public insert walls" ON public.walls FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read contributions" ON public.contributions FOR SELECT USING (true);
CREATE POLICY "Allow public insert contributions" ON public.contributions FOR INSERT WITH CHECK (true);

-- 4. Storage Bucket Setup
INSERT INTO storage.buckets (id, name, public) 
VALUES ('wishing-wall-photos', 'wishing-wall-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public photo uploads" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'wishing-wall-photos');

CREATE POLICY "Allow public photo read" ON storage.objects
    FOR SELECT USING (bucket_id = 'wishing-wall-photos');
