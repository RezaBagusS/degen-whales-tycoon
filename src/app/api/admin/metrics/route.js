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

export async function GET(request) {
  const startReq = performance.now();

  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized: Invalid Admin Secret Key' }, { status: 401 });
  }

  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 1. Measure DB ping latency
    const dbStart = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Math.round(performance.now() - dbStart);

    // 2. Overview Counts & Aggregates
    const [totalUsers, activeUsers24h, aggStats] = await Promise.all([
      prisma.user.count(),
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

    // 3. Fetch Top 100 Players
    const users = await prisma.user.findMany({
      include: {
        save: true,
        syndicate: true
      },
      take: 100,
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const activePositions = [];
    const recentTrades = [];

    const playerList = users.map(u => {
      const save = u.save;
      const history = Array.isArray(save?.tradeHistory) ? save.tradeHistory : [];
      
      // Extract active positions
      const positions = save?.savePayload?.activePositions || (save?.activePosition ? [save.activePosition] : []);
      if (Array.isArray(positions)) {
        positions.forEach(pos => {
          if (pos && pos.entryPrice) {
            activePositions.push({
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
      history.slice(-10).forEach(trade => {
        recentTrades.push({
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
        walletAddress: u.walletAddress,
        createdAt: u.createdAt,
        lastActive: save?.lastSavedAt || u.updatedAt,
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
    playerList.sort((a, b) => b.peakNetWorth - a.peakNetWorth);

    // Sort recent trades by time desc
    recentTrades.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    // Sort active positions by margin desc
    activePositions.sort((a, b) => b.margin - a.margin);

    // APM metrics
    const apm = telemetry.getMetrics();
    const duration = Math.round(performance.now() - startReq);
    telemetry.recordLatency('/api/admin/metrics', duration, 200);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      overview: {
        totalUsers,
        activeUsers24h,
        circulatingCash: aggStats._sum.cash || 0,
        totalPeakNetWorth: aggStats._sum.peakNetWorth || 0,
        totalWhaleTokens: aggStats._sum.whaleTokens || 0,
        openPositionsCount: activePositions.length,
        dbLatencyMs
      },
      apm,
      players: playerList,
      activePositions: activePositions.slice(0, 50),
      recentTrades: recentTrades.slice(0, 50)
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
