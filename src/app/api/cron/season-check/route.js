import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/season-check
 * Called by Vercel Cron every hour to check if active season has expired.
 * Configure in vercel.json: { "crons": [{ "path": "/api/cron/season-check", "schedule": "0 * * * *" }] }
 */
export async function GET(request) {
  // Vercel cron auth
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'dw_cron_season_2026';
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const activeSeason = await prisma.season.findFirst({
      where: { isActive: true },
      orderBy: { number: 'desc' },
    });

    if (!activeSeason) {
      return NextResponse.json({ skipped: true, reason: 'No active season' });
    }

    const now = new Date();
    const isExpired = now >= new Date(activeSeason.endDate);

    if (!isExpired) {
      const msLeft = new Date(activeSeason.endDate).getTime() - now.getTime();
      const hoursLeft = Math.floor(msLeft / 3600000);

      // Send 24-hour (H-1) warning broadcast
      if (hoursLeft <= 24 && hoursLeft > 23) {
        await prisma.broadcastAnnouncement.updateMany({ data: { isActive: false } });
        await prisma.broadcastAnnouncement.create({
          data: {
            message: `⏳ H-1 SEASON ${activeSeason.number} BERAKHIR! Sisa waktu kurang dari 24 jam. Kunci posisi terbaikmu di leaderboard untuk amankan Trophy permanen! 🏆`,
            type: 'warning',
            isActive: true,
          },
        });
      }

      // Send 3-hour warning broadcast
      if (hoursLeft <= 3 && hoursLeft > 2) {
        await prisma.broadcastAnnouncement.updateMany({ data: { isActive: false } });
        await prisma.broadcastAnnouncement.create({
          data: {
            message: `⚠️ Season ${activeSeason.number} berakhir dalam ~3 JAM! Cek posisi kamu di leaderboard sekarang. Top 3 dapat trophy permanen + bonus modal! 🏆`,
            type: 'warning',
            isActive: true,
          },
        });
      }

      return NextResponse.json({ skipped: true, reason: `Season still active. ${hoursLeft}h left.` });
    }

    // ── Season expired → trigger end via internal API call ──
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const adminKey = process.env.ADMIN_SECRET_KEY || 'dw_admin_9x7f2026_whale';

    const endRes = await fetch(`${protocol}://${host}/api/admin/season/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
      },
    });
    const endData = await endRes.json();

    if (!endData.success) {
      throw new Error(endData.error || 'Season end failed');
    }

    // Auto-create next season (14 days)
    const nextRes = await fetch(`${protocol}://${host}/api/admin/season/end`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
      },
      body: JSON.stringify({ durationDays: 14 }),
    });
    const nextData = await nextRes.json();

    return NextResponse.json({
      triggered: true,
      endResult: endData.message,
      nextSeason: nextData.season?.number,
    });
  } catch (err) {
    console.error('Cron season-check error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
