import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const broadcast = await prisma.broadcastAnnouncement.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      active: Boolean(broadcast && broadcast.message),
      broadcast: broadcast || null
    });
  } catch (err) {
    console.error('Error fetching broadcast announcement:', err);
    return NextResponse.json({ success: false, error: 'Gagal memuat pengumuman' }, { status: 500 });
  }
}
