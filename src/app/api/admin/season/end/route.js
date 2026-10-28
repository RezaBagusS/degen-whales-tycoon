import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

// ── helpers ──────────────────────────────────────────────────────────────────

function isAuthorized(request) {
  const secret = process.env.ADMIN_SECRET_KEY || 'dw_admin_9x7f2026_whale';
  const h = request.headers.get('x-admin-key');
  const q = new URL(request.url).searchParams.get('key');
  return (h && h === secret) || (q && q === secret);
}

const PRIZE_POOL = { first: 100, second: 50, third: 25, top10pct: 5 };

function trophyForRank(rank, seasonNum) {
  if (rank === 1) return { trophy: `🐋 Grand Whale Trophy S${seasonNum}`, title: `Whale Supremacy S${seasonNum}`, headStart: PRIZE_POOL.first };
  if (rank === 2) return { trophy: `🦈 Silver Shark Trophy S${seasonNum}`, title: `Apex Predator S${seasonNum}`,  headStart: PRIZE_POOL.second };
  if (rank === 3) return { trophy: `🐟 Bronze Degen Trophy S${seasonNum}`, title: `Seasoned Degen S${seasonNum}`, headStart: PRIZE_POOL.third };
  return { trophy: `⭐ Season Veteran S${seasonNum}`, title: `Degen Elite S${seasonNum}`, headStart: PRIZE_POOL.top10pct };
}

// ── POST /api/admin/season/end  (admin only) ──────────────────────────────────
export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Find active season
    const activeSeason = await prisma.season.findFirst({ where: { isActive: true }, orderBy: { number: 'desc' } });
    if (!activeSeason) {
      return NextResponse.json({ error: 'Tidak ada season aktif.' }, { status: 400 });
    }

    // 2. Snapshot leaderboard from GameSave (sorted by peakNetWorth desc)
    const saves = await prisma.gameSave.findMany({
      include: { user: { select: { id: true, username: true } } },
      orderBy: { peakNetWorth: 'desc' },
    });

    const totalPlayers = saves.length;
    const top10pctCutoff = Math.max(3, Math.ceil(totalPlayers * 0.1));

    const leaderboardEntries = saves.map((save, idx) => {
      const rank = idx + 1;
      const isTop10 = rank <= top10pctCutoff;
      const { trophy, title, headStart } = trophyForRank(rank <= 3 ? rank : (isTop10 ? 4 : 99), activeSeason.number);
      return {
        seasonId: activeSeason.id,
        userId: save.userId,
        username: save.user?.username || 'Unknown',
        rank,
        peakNetWorth: save.peakNetWorth,
        trophy: rank <= 3 || isTop10 ? trophy : `🎖️ Season ${activeSeason.number} Participant`,
        seasonTitle: rank <= 3 || isTop10 ? title : '',
        headStart: rank <= 3 ? headStart : (isTop10 ? PRIZE_POOL.top10pct : 0),
      };
    });

    // 3. Write leaderboard snapshot
    await prisma.seasonLeaderboard.createMany({ data: leaderboardEntries, skipDuplicates: true });

    // 4. Add trophy to each player's permanent hall + reset their save
    await Promise.all(
      saves.map(async (save) => {
        const entry = leaderboardEntries.find((e) => e.userId === save.userId);
        if (!entry) return;

        const existingTrophies = Array.isArray(save.seasonTrophies) ? save.seasonTrophies : [];
        const newTrophy = {
          season: activeSeason.number,
          rank: entry.rank,
          trophy: entry.trophy,
          title: entry.seasonTitle,
          peakNetWorth: entry.peakNetWorth,
          date: new Date().toISOString().split('T')[0],
        };

        await prisma.gameSave.update({
          where: { id: save.id },
          data: {
            // ── RESET fields ──
            cash: 10 + entry.headStart,          // base $10 + head-start bonus
            peakNetWorth: 10 + entry.headStart,
            whaleTokens: 0,                      // confirmed: reset to 0
            currentLocationLevel: 1,
            upgrades: {},
            inventory: { pump_whistle: 0, dump_horn: 0, liq_shield: 0, leverage_250x: 0, zero_fee: 0, insider_radar: 0 },
            activeEffects: { zeroFeeUntil: 0, has250xTicket: false, radarUntil: 0 },
            activePosition: null,
            tradeHistory: [],
            savePayload: null,
            // ── PERMANENT fields (kept) ──
            seasonTrophies: [...existingTrophies, newTrophy],
            currentSeasonId: null,               // will be set when new season starts
          },
        });
      })
    );

    // 5. Mark season as ended
    await prisma.season.update({
      where: { id: activeSeason.id },
      data: { isActive: false, resetAt: new Date() },
    });

    // 6. Broadcast announcement for season end
    await prisma.broadcastAnnouncement.updateMany({ data: { isActive: false } });
    await prisma.broadcastAnnouncement.create({
      data: {
        message: `🏆 Season ${activeSeason.number} SELESAI! Semua saldo telah direset. Trophy & titel pemenang tersimpan selamanya. Season ${activeSeason.number + 1} segera dimulai! 🐋`,
        type: 'success',
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Season ${activeSeason.number} berhasil diakhiri. ${saves.length} pemain direset.`,
      leaderboard: leaderboardEntries.slice(0, 10),
    });
  } catch (err) {
    console.error('Error ending season:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ── PUT /api/admin/season/end  → Create next season ────────────────────────
export async function PUT(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const durationDays = body.durationDays || 14;

    const lastSeason = await prisma.season.findFirst({ orderBy: { number: 'desc' } });
    const nextNumber = lastSeason ? lastSeason.number + 1 : 1;

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const season = await prisma.season.create({
      data: {
        number: nextNumber,
        startDate,
        endDate,
        isActive: true,
        prizePool: PRIZE_POOL,
      },
    });

    // Update all saves with new seasonId
    await prisma.gameSave.updateMany({ data: { currentSeasonId: season.id } });

    // Broadcast new season start
    await prisma.broadcastAnnouncement.updateMany({ data: { isActive: false } });
    await prisma.broadcastAnnouncement.create({
      data: {
        message: `🚀 Season ${nextNumber} telah dimulai! Durasi ${durationDays} hari. Semua pemain mulai dari $10. Jadilah 🐋 Grand Whale dan menangkan trophy permanen!`,
        type: 'info',
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, season });
  } catch (err) {
    console.error('Error creating next season:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
