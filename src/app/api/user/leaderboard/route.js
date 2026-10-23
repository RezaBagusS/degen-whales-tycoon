import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const topWhales = await prisma.user.findMany({
      include: {
        save: true,
        syndicate: true
      },
      take: 20
    });

    const ranked = topWhales
      .filter((u) => u.save)
      .map((u) => ({
        id: u.id,
        username: u.username,
        syndicateTag: u.syndicate?.tag || null,
        syndicateName: u.syndicate?.name || null,
        whaleTokens: u.save?.whaleTokens || 0,
        peakNetWorth: u.save?.peakNetWorth || 0,
        currentLocationLevel: u.save?.currentLocationLevel || 1,
        lastActive: u.save?.lastSavedAt
      }))
      .sort((a, b) => {
        if (b.whaleTokens !== a.whaleTokens) return b.whaleTokens - a.whaleTokens;
        return b.peakNetWorth - a.peakNetWorth;
      });

    return NextResponse.json({
      leaderboard: ranked
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard', details: error.message },
      { status: 500 }
    );
  }
}
