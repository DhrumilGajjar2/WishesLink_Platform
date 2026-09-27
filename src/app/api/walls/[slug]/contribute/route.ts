import { NextRequest, NextResponse } from 'next/server';
import { getWallBySlug, addContribution, saveUploadedPhoto } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const wall = await getWallBySlug(slug);

    if (!wall) {
      return NextResponse.json({ success: false, error: 'Wall not found' }, { status: 404 });
    }

    const contentType = req.headers.get('content-type') || '';
    let contributorName = '';
    let message = '';
    let photoUrl = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      contributorName = (formData.get('contributor_name') as string) || '';
      message = (formData.get('message') as string) || '';
      const photoFile = formData.get('photo') as File | null;
      const directPhotoUrl = (formData.get('photo_url') as string) || '';

      if (directPhotoUrl) {
        photoUrl = directPhotoUrl;
      } else if (photoFile && photoFile.size > 0) {
        const buffer = Buffer.from(await photoFile.arrayBuffer());
        photoUrl = await saveUploadedPhoto(buffer, photoFile.name || 'photo.jpg', photoFile.type || 'image/jpeg');
      }
    } else {
      // JSON body
      const body = await req.json();
      contributorName = body.contributor_name || '';
      message = body.message || '';
      photoUrl = body.photo_url || '';

      // If client uploaded a base64 encoded photo
      if (body.photo_base64 && !photoUrl) {
        const matches = body.photo_base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mime = matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          const ext = mime.split('/')[1] || 'jpg';
          photoUrl = await saveUploadedPhoto(buffer, `upload.${ext}`, mime);
        }
      }
    }

    if (!contributorName.trim()) {
      return NextResponse.json({ success: false, error: 'Your name is required' }, { status: 400 });
    }

    if (!message.trim()) {
      return NextResponse.json({ success: false, error: 'A heartfelt message is required' }, { status: 400 });
    }

    const contribution = await addContribution({
      wall_id: wall.id,
      contributor_name: contributorName.trim(),
      message: message.trim(),
      photo_url: photoUrl || '',
    });

    return NextResponse.json({ success: true, contribution }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding contribution:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
