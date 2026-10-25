import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

function isAuthorized(request) {
  const secretKey = process.env.ADMIN_SECRET_KEY || 'dw_admin_9x7f2026_whale';
  const headerKey = request.headers.get('x-admin-key');
  const queryKey = new URL(request.url).searchParams.get('key');
  return (headerKey && headerKey === secretKey) || (queryKey && queryKey === secretKey);
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized: Admin Secret Key diperlukan' }, { status: 401 });
  }

  try {
    const broadcast = await prisma.broadcastAnnouncement.findFirst({
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      broadcast: broadcast || null
    });
  } catch (err) {
    console.error('Error in admin broadcast GET:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized: Admin Secret Key diperlukan' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { message, type = 'info', isActive = true } = body;

    if (!message && isActive) {
      return NextResponse.json({ error: 'Pesan broadcast tidak boleh kosong' }, { status: 400 });
    }

    // Deactivate previous broadcasts
    await prisma.broadcastAnnouncement.updateMany({
      data: { isActive: false }
    });

    // Create or activate the new broadcast
    const broadcast = await prisma.broadcastAnnouncement.create({
      data: {
        message: (message || '').trim(),
        type: type || 'info',
        isActive: Boolean(isActive)
      }
    });

    return NextResponse.json({
      success: true,
      message: isActive ? 'Pengumuman global berhasil disiarkan!' : 'Pengumuman dinonaktifkan.',
      broadcast
    });
  } catch (err) {
    console.error('Error in admin broadcast POST:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized: Admin Secret Key diperlukan' }, { status: 401 });
  }

  try {
    await prisma.broadcastAnnouncement.updateMany({
      data: { isActive: false }
    });

    return NextResponse.json({
      success: true,
      message: 'Semua siaran pengumuman global telah dihentikan.'
    });
  } catch (err) {
    console.error('Error in admin broadcast DELETE:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
