import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const seasonNumber = searchParams.get('season'); // optional filter

    const where = seasonNumber ? { number: parseInt(seasonNumber) } : {};

    const seasons = await prisma.season.findMany({
      where,
      orderBy: { number: 'desc' },
      include: {
        leaderboard: { orderBy: { rank: 'asc' } },
      },
    });

    return NextResponse.json({ success: true, seasons });
  } catch (err) {
    console.error('Error fetching season leaderboard:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
