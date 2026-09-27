import { NextRequest, NextResponse } from 'next/server';
import { getWallBySlug } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug parameter is required' }, { status: 400 });
    }

    const wall = await getWallBySlug(slug);
    if (!wall) {
      return NextResponse.json({ success: false, error: 'Wishing Wall not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, wall });
  } catch (error: any) {
    console.error('Error fetching wall:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
