import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let username = searchParams.get('username');
    let userId = null;

    // Check session cookie first
    const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;
    if (sessionCookie) {
      const payload = verifySessionToken(sessionCookie);
      if (payload && payload.userId) {
        userId = payload.userId;
      }
    }

    let user;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: { save: true, syndicate: true }
      });
    } else if (username) {
      user = await prisma.user.findUnique({
        where: { username },
        include: { save: true, syndicate: true }
      });
    }

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
      save: user.save.savePayload || user.save
    });
  } catch (error) {
    console.error('Error loading game progress from DB:', error);
    return NextResponse.json(
      { error: 'Failed to load from database', details: error.message },
      { status: 500 }
    );
  }
}
