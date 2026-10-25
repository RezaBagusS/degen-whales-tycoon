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

    if (user.isBanned) {
      const response = NextResponse.json({
        error: `Akun ini disuspend oleh Admin. Alasan: ${user.banReason || 'Pelanggaran aturan game'}`,
        isBanned: true,
        banReason: user.banReason || 'Pelanggaran aturan game',
        redirectTo: `/auth?mode=login&banned=1&reason=${encodeURIComponent(user.banReason || 'Pelanggaran aturan game')}`
      }, { status: 403 });
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    // Check existing save for pending compensations or admin reset commands
    const existingSave = await prisma.gameSave.findUnique({
      where: { userId: user.id }
    });

    if (existingSave?.activeEffects?.resetRequested || existingSave?.savePayload?.resetRequested) {
      // CLEAR the resetRequested flag immediately in DB so it only triggers ONCE and never loops
      const cleanedEffects = (typeof existingSave.activeEffects === 'object' && existingSave.activeEffects !== null)
        ? { ...existingSave.activeEffects }
        : {};
      delete cleanedEffects.resetRequested;

      const cleanedPayload = (typeof existingSave.savePayload === 'object' && existingSave.savePayload !== null)
        ? { ...existingSave.savePayload }
        : { cash: 100, peakNetWorth: 100, whaleTokens: 0 };
      delete cleanedPayload.resetRequested;

      await prisma.gameSave.update({
        where: { userId: user.id },
        data: {
          activeEffects: cleanedEffects,
          savePayload: cleanedPayload
        }
      });

      const response = NextResponse.json({
        success: true,
        resetRequired: true,
        redirectTo: '/auth?mode=login&reset=1',
        message: 'Admin telah mereset data akun Anda ke saldo awal pemula ($100). Silakan login kembali.'
      });
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    const rawPending = [
      ...((Array.isArray(existingSave?.savePayload?.pendingCompensations)) ? existingSave.savePayload.pendingCompensations : []),
      ...((Array.isArray(existingSave?.activeEffects?.pendingCompensations)) ? existingSave.activeEffects.pendingCompensations : [])
    ];
    const uniquePending = Array.from(new Map(rawPending.map(c => [c.id, c])).values());

    let effectiveCash = Number(state.cash || 0);
    let effectivePeak = Number(state.peakNetWorth || state.cash || 0);
    let effectiveTokens = Number(state.whaleTokens || 0);
    let effectiveInventory = { ...(state.inventory || {}) };
    let appliedCompensations = [];

    if (uniquePending.length > 0) {
      appliedCompensations = uniquePending;
      let addedCash = 0;
      let addedTokens = 0;
      for (const comp of uniquePending) {
        addedCash += (Number(comp.cashDelta) || 0);
        addedTokens += (Number(comp.whaleTokensDelta) || 0);
        if (comp.itemId && comp.itemQty) {
          effectiveInventory[comp.itemId] = Math.max(0, (parseInt(effectiveInventory[comp.itemId], 10) || 0) + comp.itemQty);
        }
        if (comp.itemsDelta && typeof comp.itemsDelta === 'object') {
          for (const [k, v] of Object.entries(comp.itemsDelta)) {
            effectiveInventory[k] = Math.max(0, (parseInt(effectiveInventory[k], 10) || 0) + (parseInt(v, 10) || 0));
          }
        }
      }
      effectiveCash = Math.max(0, effectiveCash + addedCash);
      effectivePeak = Math.max(effectivePeak, effectiveCash);
      effectiveTokens = Math.max(0, effectiveTokens + addedTokens);
    }

    const cleanSavePayload = {
      ...state,
      cash: effectiveCash,
      peakNetWorth: effectivePeak,
      whaleTokens: effectiveTokens,
      inventory: effectiveInventory,
      pendingCompensations: []
    };

    const cleanActiveEffects = {
      ...(state.activeEffects || {}),
      pendingCompensations: []
    };

    // Upsert game save with full payload
    const gameSave = await prisma.gameSave.upsert({
      where: { userId: user.id },
      update: {
        cash: effectiveCash,
        peakNetWorth: effectivePeak,
        whaleTokens: effectiveTokens,
        currentLocationLevel: Number(state.currentLocation?.level || state.currentLocationLevel || 1),
        upgrades: state.passiveLevels || state.upgrades || {},
        inventory: effectiveInventory,
        activeEffects: cleanActiveEffects,
        activePosition: state.activePosition || null,
        tradeHistory: state.tradeHistory || [],
        savePayload: cleanSavePayload,
        lastSavedAt: new Date()
      },
      create: {
        userId: user.id,
        cash: effectiveCash,
        peakNetWorth: effectivePeak,
        whaleTokens: effectiveTokens,
        currentLocationLevel: Number(state.currentLocation?.level || state.currentLocationLevel || 1),
        upgrades: state.passiveLevels || state.upgrades || {},
        inventory: effectiveInventory,
        activeEffects: cleanActiveEffects,
        activePosition: state.activePosition || null,
        tradeHistory: state.tradeHistory || [],
        savePayload: cleanSavePayload,
        lastSavedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: appliedCompensations.length > 0 ? 'Kompensasi diterapkan & game tersinkronisasi' : 'Game progress synced with Cloud Database',
      userId: user.id,
      username: user.username,
      savedAt: gameSave.lastSavedAt,
      compensations: appliedCompensations,
      appliedValues: appliedCompensations.length > 0 ? {
        cash: effectiveCash,
        peakNetWorth: effectivePeak,
        whaleTokens: effectiveTokens,
        inventory: effectiveInventory
      } : null
    });
  } catch (error) {
    console.error('Error saving game progress to DB:', error);
    return NextResponse.json(
      { error: 'Failed to save to database', details: error.message },
      { status: 500 }
    );
  }
}
