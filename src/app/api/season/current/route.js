import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const season = await prisma.season.findFirst({
      where: { isActive: true },
      orderBy: { number: 'desc' },
      include: {
        leaderboard: {
          orderBy: { rank: 'asc' },
          take: 10,
        },
      },
    });

    if (!season) {
      return NextResponse.json({ success: true, season: null });
    }

    // Compute time remaining
    const now = new Date();
    const msLeft = new Date(season.endDate).getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.floor(msLeft / 86400000));
    const hoursLeft = Math.max(0, Math.floor((msLeft % 86400000) / 3600000));
    const minutesLeft = Math.max(0, Math.floor((msLeft % 3600000) / 60000));

    return NextResponse.json({
      success: true,
      season: {
        ...season,
        timeLeft: { days: daysLeft, hours: hoursLeft, minutes: minutesLeft, ms: msLeft },
        isEnding: msLeft > 0 && msLeft < 3 * 3600000, // last 3 hours warning
        isHMinus1: msLeft > 0 && msLeft <= 24 * 3600000, // H-1 (under 24 hours)
        isExpired: msLeft <= 0,
      },
    });
  } catch (err) {
    console.error('Error fetching current season:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
