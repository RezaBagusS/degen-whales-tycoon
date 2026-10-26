import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { telemetry } from '../../../../lib/telemetry';

const DEFAULT_ADMIN_KEY = 'degen_admin_2026';

function verifyAdmin(request) {
  const secret = process.env.ADMIN_SECRET_KEY || DEFAULT_ADMIN_KEY;
  const headerKey = request.headers.get('x-admin-key');
  const queryKey = request.nextUrl.searchParams.get('key');
  const cookieKey = request.cookies.get('admin_key')?.value;

  const provided = headerKey || queryKey || cookieKey;
  return provided && provided.trim() === secret.trim();
}

let schemaEnsured = false;
async function ensureSchema() {
  if (schemaEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isBanned" BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "banReason" TEXT;
      CREATE TABLE IF NOT EXISTS "BroadcastAnnouncement" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "message" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'info',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "expiresAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    schemaEnsured = true;
  } catch (err) {
    console.warn('Auto schema ensure notice:', err.message);
  }
}

export async function GET(request) {
  const startReq = performance.now();

  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized: Invalid Admin Secret Key' }, { status: 401 });
  }

  try {
    // Ensure all columns and tables exist in DB (e.g. on new production branches)
    await ensureSchema();

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Pagination query params
    const playersPage = Math.max(1, parseInt(searchParams.get('playersPage') || '1', 10));
    const playersLimit = Math.max(1, Math.min(100, parseInt(searchParams.get('playersLimit') || '10', 10)));
    const searchPlayer = (searchParams.get('searchPlayer') || '').trim().toLowerCase();
    const playerStatus = searchParams.get('playerStatus') || 'all'; // 'all' | 'online' | 'active24h'

    const tradesPage = Math.max(1, parseInt(searchParams.get('tradesPage') || '1', 10));
    const tradesLimit = Math.max(1, Math.min(100, parseInt(searchParams.get('tradesLimit') || '10', 10)));

    const positionsPage = Math.max(1, parseInt(searchParams.get('positionsPage') || '1', 10));
    const positionsLimit = Math.max(1, Math.min(100, parseInt(searchParams.get('positionsLimit') || '10', 10)));

    const now = Date.now();
    const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

    // 1. Measure DB ping latency
    const dbStart = performance.now();
    let dbLatencyMs = 0;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Math.round(performance.now() - dbStart);
    } catch {
      dbLatencyMs = 999;
    }

    // 2. Overview Counts & Aggregates (Real-time Online vs 24h Active)
    let totalUsers = 0;
    let activeUsersNow = 0;
    let activeUsers24h = 0;
    let aggStats = { _sum: { cash: 0, peakNetWorth: 0, whaleTokens: 0 } };

    try {
      const [uCount, nowCount, dayCount, sumStats] = await Promise.all([
        prisma.user.count(),
        prisma.gameSave.count({
          where: {
            updatedAt: { gte: fiveMinutesAgo }
          }
        }),
        prisma.gameSave.count({
          where: {
            updatedAt: { gte: twentyFourHoursAgo }
          }
        }),
        prisma.gameSave.aggregate({
          _sum: {
            cash: true,
            peakNetWorth: true,
            whaleTokens: true
          }
        })
      ]);
      totalUsers = uCount;
      activeUsersNow = nowCount;
      activeUsers24h = dayCount;
      aggStats = sumStats;
    } catch (aggErr) {
      console.warn('Overview aggregates query notice:', aggErr.message);
    }

    // 3. Fetch All Users with GameSaves for complete aggregation
    let users = [];
    try {
      users = await prisma.user.findMany({
        include: {
          save: true,
          syndicate: true
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
    } catch (usersErr) {
      console.warn('User findMany full relation failed, using raw query fallback:', usersErr.message);
      try {
        const rawUsers = await prisma.$queryRaw`
          SELECT u.id, u.username, u.email, u."walletAddress", u."createdAt", u."updatedAt"
          FROM "User" u
          ORDER BY u."updatedAt" DESC
        `;
        const rawSaves = await prisma.$queryRaw`
          SELECT * FROM "GameSave"
        `;
        const saveMap = new Map();
        if (Array.isArray(rawSaves)) {
          for (const s of rawSaves) {
            saveMap.set(s.userId, s);
          }
        }
        users = (Array.isArray(rawUsers) ? rawUsers : []).map(u => ({
          ...u,
          isBanned: false,
          banReason: null,
          save: saveMap.get(u.id) || null,
          syndicate: null
        }));
      } catch (rawErr) {
        console.error('User raw query fallback failed:', rawErr.message);
        users = [];
      }
    }

    if (totalUsers === 0 && users.length > 0) {
      totalUsers = users.length;
    }

    const allActivePositions = [];
    const allRecentTrades = [];

    const allPlayerList = users.map(u => {
      const save = u.save;
      const history = Array.isArray(save?.tradeHistory) ? save.tradeHistory : [];
      const lastActiveDate = save?.lastSavedAt ? new Date(save.lastSavedAt) : (u.updatedAt ? new Date(u.updatedAt) : new Date(u.createdAt));
      const lastActiveMs = (lastActiveDate && !isNaN(lastActiveDate.getTime())) ? lastActiveDate.getTime() : 0;
      
      const isOnline = lastActiveMs > 0 && (now - lastActiveMs <= 5 * 60 * 1000);
      const isActive24h = lastActiveMs > 0 && (now - lastActiveMs <= 24 * 60 * 60 * 1000);

      // Extract active positions
      const positions = save?.savePayload?.activePositions || (save?.activePosition ? [save.activePosition] : []);
      if (Array.isArray(positions)) {
        positions.forEach(pos => {
          if (pos && pos.entryPrice) {
            allActivePositions.push({
              id: pos.id || `${u.username}-${pos.pairSymbol}`,
              username: u.username,
              userId: u.id,
              pairSymbol: pos.pairSymbol || 'DEGEN/USDT',
              type: pos.type || 'LONG',
              leverage: pos.leverage || 10,
              margin: pos.margin || 0,
              entryPrice: pos.entryPrice || 0,
              liqPrice: pos.liqPrice || 0,
              openedAt: pos.openedAt || save.lastSavedAt
            });
          }
        });
      }

      // Collect trades for global trade feed
      history.slice(-15).forEach(trade => {
        allRecentTrades.push({
          ...trade,
          timestamp: trade.timestamp || (typeof trade.id === 'number' && trade.id > 1700000000000 ? trade.id : save.lastSavedAt),
          pairSymbol: trade.pairSymbol || trade.pair || 'DEGEN/USDT',
          username: u.username,
          userId: u.id
        });
      });

      return {
        id: u.id,
        username: u.username,
        email: u.email || null,
        walletAddress: u.walletAddress,
        createdAt: u.createdAt,
        lastActive: (lastActiveDate && !isNaN(lastActiveDate.getTime())) ? lastActiveDate.toISOString() : new Date().toISOString(),
        isOnline,
        isActive24h,
        isBanned: Boolean(u.isBanned),
        banReason: u.banReason || null,
        cash: save?.cash || 0,
        peakNetWorth: save?.peakNetWorth || 0,
        whaleTokens: save?.whaleTokens || 0,
        currentLocationLevel: save?.currentLocationLevel || 1,
        tradeCount: history.length,
        activePositionsCount: positions.length,
        syndicateTag: u.syndicate?.tag || null,
        inventory: save?.inventory || {}
      };
    });

    // Sort players by peakNetWorth desc
    allPlayerList.sort((a, b) => b.peakNetWorth - a.peakNetWorth);

    // Sort recent trades by time desc
    allRecentTrades.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    // Sort active positions by margin desc
    allActivePositions.sort((a, b) => b.margin - a.margin);

    // Filter players by search and status
    let filteredPlayers = allPlayerList;
    if (searchPlayer) {
      filteredPlayers = filteredPlayers.filter(p =>
        p.username.toLowerCase().includes(searchPlayer) ||
        (p.email && p.email.toLowerCase().includes(searchPlayer)) ||
        (p.syndicateTag && p.syndicateTag.toLowerCase().includes(searchPlayer))
      );
    }
    if (playerStatus === 'online') {
      filteredPlayers = filteredPlayers.filter(p => p.isOnline);
    } else if (playerStatus === 'active24h') {
      filteredPlayers = filteredPlayers.filter(p => p.isActive24h);
    }

    // Paginate players
    const totalPlayers = filteredPlayers.length;
    const paginatedPlayers = filteredPlayers.slice((playersPage - 1) * playersLimit, playersPage * playersLimit);

    // Paginate recent trades
    const totalTrades = allRecentTrades.length;
    const paginatedTrades = allRecentTrades.slice((tradesPage - 1) * tradesLimit, tradesPage * tradesLimit);

    // Paginate active positions
    const totalPositions = allActivePositions.length;
    const paginatedPositions = allActivePositions.slice((positionsPage - 1) * positionsLimit, positionsPage * positionsLimit);

    // 24-hour hourly trend aggregation
    const hourlyActivity = [];
    const oneHourMs = 60 * 60 * 1000;
    for (let i = 23; i >= 0; i--) {
      const bucketStart = new Date(now - (i + 1) * oneHourMs);
      const bucketEnd = new Date(now - i * oneHourMs);
      const hourLabel = `${String(bucketEnd.getHours()).padStart(2, '0')}:00`;

      // Players active in this hour
      const activeInHour = allPlayerList.filter(p => {
        const t = new Date(p.lastActive).getTime();
        return !isNaN(t) && t >= bucketStart.getTime() && t < bucketEnd.getTime();
      }).length;

      // Trades in this hour
      const tradesInHour = allRecentTrades.filter(tr => {
        const t = new Date(tr.timestamp || 0).getTime();
        return !isNaN(t) && t >= bucketStart.getTime() && t < bucketEnd.getTime();
      });

      const volumeInHour = tradesInHour.reduce((acc, tr) => acc + Math.abs(tr.pnl || 0), 0);

      hourlyActivity.push({
        hour: hourLabel,
        activeUsers: activeInHour,
        tradesCount: tradesInHour.length,
        volume: Math.round(volumeInHour * 100) / 100
      });
    }

    // Active broadcast announcement
    let activeBroadcast = null;
    try {
      activeBroadcast = await prisma.broadcastAnnouncement.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' }
      });
    } catch {
      activeBroadcast = null;
    }

    // APM metrics
    const apm = telemetry.getMetrics();
    const duration = Math.round(performance.now() - startReq);
    telemetry.recordLatency('/api/admin/metrics', duration, 200);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      overview: {
        totalUsers,
        activeUsersNow,
        activeUsers24h,
        circulatingCash: aggStats._sum.cash || 0,
        totalPeakNetWorth: aggStats._sum.peakNetWorth || 0,
        totalWhaleTokens: aggStats._sum.whaleTokens || 0,
        openPositionsCount: allActivePositions.length,
        dbLatencyMs
      },
      activeBroadcast: activeBroadcast || null,
      hourlyActivity,
      apm,
      players: paginatedPlayers,
      playersPagination: {
        page: playersPage,
        limit: playersLimit,
        total: totalPlayers,
        totalPages: Math.max(1, Math.ceil(totalPlayers / playersLimit))
      },
      activePositions: paginatedPositions,
      positionsPagination: {
        page: positionsPage,
        limit: positionsLimit,
        total: totalPositions,
        totalPages: Math.max(1, Math.ceil(totalPositions / positionsLimit))
      },
      recentTrades: paginatedTrades,
      tradesPagination: {
        page: tradesPage,
        limit: tradesLimit,
        total: totalTrades,
        totalPages: Math.max(1, Math.ceil(totalTrades / tradesLimit))
      }
    });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    telemetry.recordError({
      message: error.message,
      stack: error.stack,
      route: '/api/admin/metrics',
      source: 'server'
    });

    return NextResponse.json(
      { error: 'Failed to fetch admin metrics', details: error.message },
      { status: 500 }
    );
  }
}
