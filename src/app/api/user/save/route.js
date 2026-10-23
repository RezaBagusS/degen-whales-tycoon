import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username = 'anon_degen', state } = body;

    if (!state) {
      return NextResponse.json({ error: 'Missing game state payload' }, { status: 400 });
    }

    // Ensure user exists or create new
    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: { username }
    });

    // Upsert game save
    const gameSave = await prisma.gameSave.upsert({
      where: { userId: user.id },
      update: {
        cash: Number(state.cash || 0),
        peakNetWorth: Number(state.peakNetWorth || state.cash || 0),
        whaleTokens: Number(state.whaleTokens || 0),
        currentLocationLevel: Number(state.currentLocationLevel || 1),
        upgrades: state.upgrades || {},
        inventory: state.inventory || {},
        activeEffects: state.activeEffects || {},
        activePosition: state.activePosition || null,
        tradeHistory: state.tradeHistory || [],
        lastSavedAt: new Date()
      },
      create: {
        userId: user.id,
        cash: Number(state.cash || 0),
        peakNetWorth: Number(state.peakNetWorth || state.cash || 0),
        whaleTokens: Number(state.whaleTokens || 0),
        currentLocationLevel: Number(state.currentLocationLevel || 1),
        upgrades: state.upgrades || {},
        inventory: state.inventory || {},
        activeEffects: state.activeEffects || {},
        activePosition: state.activePosition || null,
        tradeHistory: state.tradeHistory || [],
        lastSavedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Game progress synced with PostgreSQL',
      userId: user.id,
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
