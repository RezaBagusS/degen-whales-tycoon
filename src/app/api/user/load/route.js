import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'anon_degen';

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        save: true,
        syndicate: true
      }
    });

    if (!user || !user.save) {
      return NextResponse.json({
        found: false,
        message: 'No saved game found for user'
      });
    }

    return NextResponse.json({
      found: true,
      username: user.username,
      syndicate: user.syndicate,
      save: user.save
    });
  } catch (error) {
    console.error('Error loading game progress from DB:', error);
    return NextResponse.json(
      { error: 'Failed to load from database', details: error.message },
      { status: 500 }
    );
  }
}
