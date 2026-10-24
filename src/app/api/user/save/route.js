import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { state } = body;

    if (!state) {
      return NextResponse.json({ error: 'Missing game state payload' }, { status: 400 });
    }

    // Determine user: either from cookie session or passed username
    let userId = null;
    let username = body.username || 'anon_degen';

    const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;
    if (sessionCookie) {
      const payload = verifySessionToken(sessionCookie);
      if (payload && payload.userId) {
        userId = payload.userId;
        username = payload.username;
      }
    }

    let user;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else {
      user = await prisma.user.upsert({
        where: { username },
        update: {},
        create: { username }
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Upsert game save with full payload
    const gameSave = await prisma.gameSave.upsert({
      where: { userId: user.id },
      update: {
        cash: Number(state.cash || 0),
        peakNetWorth: Number(state.peakNetWorth || state.cash || 0),
        whaleTokens: Number(state.whaleTokens || 0),
        currentLocationLevel: Number(state.currentLocation?.level || state.currentLocationLevel || 1),
        upgrades: state.passiveLevels || state.upgrades || {},
        inventory: state.inventory || {},
        activeEffects: state.activeEffects || {},
        activePosition: state.activePosition || null,
        tradeHistory: state.tradeHistory || [],
        savePayload: state,
        lastSavedAt: new Date()
      },
      create: {
        userId: user.id,
        cash: Number(state.cash || 0),
        peakNetWorth: Number(state.peakNetWorth || state.cash || 0),
        whaleTokens: Number(state.whaleTokens || 0),
        currentLocationLevel: Number(state.currentLocation?.level || state.currentLocationLevel || 1),
        upgrades: state.passiveLevels || state.upgrades || {},
        inventory: state.inventory || {},
        activeEffects: state.activeEffects || {},
        activePosition: state.activePosition || null,
        tradeHistory: state.tradeHistory || [],
        savePayload: state,
        lastSavedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Game progress synced with Cloud Database',
      userId: user.id,
      username: user.username,
      savedAt: gameSave.lastSavedAt
    });
  } catch (error) {
    console.error('Error saving game progress to DB:', error);
    return NextResponse.json(
      { error: 'Failed to save to database', details: error.message },
      { status: 500 }
    );
  }
}
