import { NextRequest, NextResponse } from 'next/server';
import { createWall, getAllWalls, getWallBySlug, saveUploadedPhoto, addContribution } from '@/lib/db';
import { OccasionType, ThemeType } from '@/lib/types';

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base || 'wall'}-${randomSuffix}`;
}

export async function GET() {
  try {
    const walls = await getAllWalls();
    return NextResponse.json({ success: true, walls });
  } catch (error: any) {
    console.error('Failed to get walls:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      title, 
      recipient_name, 
      occasion_type, 
      theme, 
      reveal_date, 
      description, 
      organizer_name,
      organizer_message,
      cover_photo_url: rawCoverUrl,
      cover_photo_base64
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    let shareSlug = generateSlug(title);
    let existing = await getWallBySlug(shareSlug);
    while (existing) {
      shareSlug = generateSlug(title);
      existing = await getWallBySlug(shareSlug);
    }

    // Save cover photo if provided as base64
    let coverPhotoUrl = rawCoverUrl || '';
    if (cover_photo_base64 && !coverPhotoUrl) {
      const matches = cover_photo_base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mime = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const ext = mime.split('/')[1] || 'jpg';
        coverPhotoUrl = await saveUploadedPhoto(buffer, `cover_${Date.now()}.${ext}`, mime);
      }
    }

    const newWall = await createWall({
      title: title.trim(),
      recipient_name: (recipient_name || title).trim(),
      occasion_type: (occasion_type || 'birthday') as OccasionType,
      theme: (theme || 'newspaper') as ThemeType,
      share_slug: shareSlug,
      cover_photo_url: coverPhotoUrl,
      organizer_message: organizer_message?.trim() || '',
      organizer_name: organizer_name?.trim() || '',
      reveal_date: reveal_date ? new Date(reveal_date).toISOString() : null,
      description: description?.trim() || '',
    });

    // If organizer included an opening wish & photo, also add it as the first seed contribution
    if (organizer_message?.trim() || coverPhotoUrl) {
      await addContribution({
        wall_id: newWall.id,
        contributor_name: organizer_name?.trim() || 'Wall Organizer',
        message: organizer_message?.trim() || `Happy ${occasion_type || 'celebration'}, ${recipient_name || 'friend'}!`,
        photo_url: coverPhotoUrl,
        highlight: true,
      });
    }

    return NextResponse.json({ success: true, wall: newWall }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create wall:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
