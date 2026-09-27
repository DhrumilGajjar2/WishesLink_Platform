import fs from 'fs';
import path from 'path';
import { Wall, Contribution, WallWithContributions } from './types';
import { SEED_WALLS } from './mockData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

interface StoreData {
  walls: Wall[];
  contributions: Contribution[];
}

function ensureLocalStore(): StoreData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    const initialWalls: Wall[] = [];
    const initialContributions: Contribution[] = [];

    for (const seed of SEED_WALLS) {
      const { contributions, ...wall } = seed;
      initialWalls.push(wall);
      initialContributions.push(...contributions);
    }

    const data: StoreData = {
      walls: initialWalls,
      contributions: initialContributions,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return data;
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { walls: [], contributions: [] };
  }
}

function saveLocalStore(data: StoreData) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getWallBySlug(slug: string): Promise<WallWithContributions | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: wall, error: wallError } = await supabase
        .from('walls')
        .select('*')
        .eq('share_slug', slug)
        .single();

      if (wallError || !wall) {
        // Fallback to check local seed if not found in remote
        return getLocalWallBySlug(slug);
      }

      const { data: contributions, error: contError } = await supabase
        .from('contributions')
        .select('*')
        .eq('wall_id', wall.id)
        .order('created_at', { ascending: false });

      if (contError) {
        console.error('Error fetching contributions from Supabase:', contError);
      }

      return {
        ...wall,
        contributions: contributions || [],
      };
    } catch (e) {
      console.warn('Supabase query failed, falling back to local store:', e);
      return getLocalWallBySlug(slug);
    }
  }

  return getLocalWallBySlug(slug);
}

function getLocalWallBySlug(slug: string): WallWithContributions | null {
  const store = ensureLocalStore();
  const wall = store.walls.find((w) => w.share_slug.toLowerCase() === slug.toLowerCase());
  if (!wall) return null;

  const contributions = store.contributions
    .filter((c) => c.wall_id === wall.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return {
    ...wall,
    contributions,
  };
}

export async function getAllWalls(): Promise<Wall[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('walls')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase getAllWalls error:', e);
    }
  }
  const store = ensureLocalStore();
  return store.walls;
}

export async function createWall(wallData: Omit<Wall, 'id' | 'created_at'>): Promise<Wall> {
  const newWall: Wall = {
    ...wallData,
    id: `wall_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('walls')
        .insert([newWall])
        .select()
        .single();

      if (!error && data) {
        return data;
      }
      console.error('Supabase createWall error:', error);
    } catch (e) {
      console.warn('Supabase createWall failed, saving locally:', e);
    }
  }

  const store = ensureLocalStore();
  store.walls.unshift(newWall);
  saveLocalStore(store);
  return newWall;
}

export async function addContribution(
  contributionData: Omit<Contribution, 'id' | 'created_at'>
): Promise<Contribution> {
  const newContribution: Contribution = {
    ...contributionData,
    id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('contributions')
        .insert([newContribution])
        .select()
        .single();

      if (!error && data) {
        return data;
      }
      console.error('Supabase addContribution error:', error);
    } catch (e) {
      console.warn('Supabase addContribution failed, saving locally:', e);
    }
  }

  const store = ensureLocalStore();
  store.contributions.unshift(newContribution);
  saveLocalStore(store);
  return newContribution;
}

export async function saveUploadedPhoto(
  buffer: Buffer,
  originalFilename: string,
  contentType: string
): Promise<string> {
  const safeFilename = `${Date.now()}-${originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  // If Supabase Storage is configured, upload to 'wishing-wall-photos' bucket
  if (isSupabaseConfigured && supabase) {
    try {
      const bucketName = 'wishing-wall-photos';
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(safeFilename, buffer, {
          contentType,
          upsert: true,
        });

      if (!error) {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(safeFilename);
        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else {
        console.warn('Supabase storage upload error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase storage exception, falling back to local file storage:', err);
    }
  }

  // Fallback: save to public/uploads
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  const filePath = path.join(UPLOADS_DIR, safeFilename);
  fs.writeFileSync(filePath, buffer);
  return `/uploads/${safeFilename}`;
}
