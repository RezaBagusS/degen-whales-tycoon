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

    if (user.isBanned) {
      const response = NextResponse.json({
        authenticated: false,
        isBanned: true,
        banReason: user.banReason || 'Pelanggaran aturan game',
        redirectTo: `/auth?mode=login&banned=1&reason=${encodeURIComponent(user.banReason || 'Pelanggaran aturan game')}`
      }, { status: 403 });
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    if (user.save?.activeEffects?.resetRequested || user.save?.savePayload?.resetRequested) {
      const cleanedEffects = (typeof user.save.activeEffects === 'object' && user.save.activeEffects !== null)
        ? { ...user.save.activeEffects }
        : {};
      delete cleanedEffects.resetRequested;

      const cleanedPayload = (typeof user.save.savePayload === 'object' && user.save.savePayload !== null)
        ? { ...user.save.savePayload }
        : { cash: 10, peakNetWorth: 10, whaleTokens: 0 };
      delete cleanedPayload.resetRequested;

      await prisma.gameSave.update({
        where: { userId: user.id },
        data: {
          activeEffects: cleanedEffects,
          savePayload: cleanedPayload
        }
      });

      const response = NextResponse.json({
        authenticated: false,
        resetRequired: true,
        redirectTo: '/auth?mode=login&reset=1',
        message: 'Admin telah mereset data akun Anda ke saldo awal pemula ($10).'
      });
      response.cookies.delete(COOKIE_NAME);
      return response;
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
