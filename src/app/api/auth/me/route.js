import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';

export async function GET(request) {
  try {
    const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false });
    }

    const payload = verifySessionToken(sessionCookie);
    if (!payload || !payload.userId) {
      return NextResponse.json({ authenticated: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        save: true,
        syndicate: true
      }
    });

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    const rawPending = [
      ...((Array.isArray(user.save?.savePayload?.pendingCompensations)) ? user.save.savePayload.pendingCompensations : []),
      ...((Array.isArray(user.save?.activeEffects?.pendingCompensations)) ? user.save.activeEffects.pendingCompensations : [])
    ];
    const uniquePending = Array.from(new Map(rawPending.map(c => [c.id, c])).values());

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email || null,
        syndicate: user.syndicate
      },
      save: user.save?.savePayload || user.save,
      pendingCompensations: uniquePending
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
