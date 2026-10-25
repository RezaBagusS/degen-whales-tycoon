import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

function isAuthorized(request) {
  const secretKey = process.env.ADMIN_SECRET_KEY || 'dw_admin_9x7f2026_whale';
  const headerKey = request.headers.get('x-admin-key');
  const queryKey = new URL(request.url).searchParams.get('key');
  return (headerKey && headerKey === secretKey) || (queryKey && queryKey === secretKey);
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized: Admin Secret Key diperlukan' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, userId } = body;

    const validActions = ['toggle_ban', 'inject_compensation', 'reset_save'];
    if (!action || !validActions.includes(action)) {
      return NextResponse.json({ error: 'Action tidak valid atau tidak didukung' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID wajib diisi' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { save: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    // 1. ACTION: TOGGLE BAN / SUSPEND
    if (action === 'toggle_ban') {
      const { isBanned, banReason } = body;
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          isBanned: Boolean(isBanned),
          banReason: isBanned ? (banReason || 'Pelanggaran aturan fair play / eksploitasi sistem') : null
        }
      });

      return NextResponse.json({
        success: true,
        message: isBanned
          ? `Akun @${user.username} berhasil disuspend/diblokir.`
          : `Status suspend akun @${user.username} telah dicabut.`,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          isBanned: updatedUser.isBanned,
          banReason: updatedUser.banReason
        }
      });
    }

    // 2. ACTION: INJECT COMPENSATION / DANA TALANGAN & IN-GAME ITEMS
    if (action === 'inject_compensation') {
      const cashDelta = parseFloat(body.cashDelta || 0);
      const whaleTokensDelta = parseInt(body.whaleTokensDelta || 0, 10);
      const itemId = body.itemId;
      const itemQty = parseInt(body.itemQty || 0, 10);
      const itemsDelta = body.itemsDelta;
      const reason = body.reason || 'Kompensasi / Bantuan Support Admin';

      const ITEM_NAMES = {
        pump_whistle: 'Whale Pump Whistle',
        dump_horn: 'Whale Dump Horn',
        liq_shield: 'Liquidation Shield',
        leverage_250x: 'God Leverage 250x Ticket',
        zero_fee: 'Zero-Fee VIP Pass',
        insider_radar: 'Insider Alpha Radar'
      };

      if (isNaN(cashDelta) && isNaN(whaleTokensDelta) && !itemId && !itemsDelta) {
        return NextResponse.json({ error: 'Nilai kompensasi atau item tidak valid' }, { status: 400 });
      }

      if (!user.save) {
        return NextResponse.json({ error: 'GameSave pemain belum terbuat di database' }, { status: 400 });
      }

      const currentCash = user.save.cash || 0;
      const currentPeak = user.save.peakNetWorth || currentCash;
      const currentTokens = user.save.whaleTokens || 0;

      const newCash = Math.max(0, currentCash + (isNaN(cashDelta) ? 0 : cashDelta));
      const newPeak = Math.max(currentPeak, newCash);
      const newTokens = Math.max(0, currentTokens + (isNaN(whaleTokensDelta) ? 0 : whaleTokensDelta));

      // Calculate updated inventory
      const currentInventory = (typeof user.save.inventory === 'object' && user.save.inventory !== null)
        ? { ...user.save.inventory }
        : (typeof user.save.savePayload?.inventory === 'object' && user.save.savePayload?.inventory !== null)
        ? { ...user.save.savePayload.inventory }
        : { pump_whistle: 0, dump_horn: 0, liq_shield: 0, leverage_250x: 0, zero_fee: 0, insider_radar: 0 };

      let itemLogText = '';
      if (itemId && itemQty !== 0 && ITEM_NAMES[itemId]) {
        currentInventory[itemId] = Math.max(0, (parseInt(currentInventory[itemId], 10) || 0) + itemQty);
        itemLogText = `${itemQty >= 0 ? '+' : ''}${itemQty} ${ITEM_NAMES[itemId]}`;
      }

      if (typeof itemsDelta === 'object' && itemsDelta !== null) {
        const addedItems = [];
        for (const [k, v] of Object.entries(itemsDelta)) {
          const qty = parseInt(v, 10) || 0;
          if (qty !== 0 && ITEM_NAMES[k]) {
            currentInventory[k] = Math.max(0, (parseInt(currentInventory[k], 10) || 0) + qty);
            addedItems.push(`${qty >= 0 ? '+' : ''}${qty} ${ITEM_NAMES[k]}`);
          }
        }
        if (addedItems.length > 0) {
          itemLogText = addedItems.join(', ');
        }
      }

      // Append compensation log into tradeHistory for transparency
      const existingHistory = Array.isArray(user.save.tradeHistory) ? user.save.tradeHistory : [];
      const compensationLog = {
        id: `comp-${Date.now()}`,
        timestamp: new Date().toISOString(),
        pairSymbol: 'ADMIN/GRANT',
        type: (cashDelta >= 0 && whaleTokensDelta >= 0) ? 'GRANT' : 'DEDUCT',
        leverage: 1,
        entryPrice: 0,
        exitPrice: 0,
        pnl: isNaN(cashDelta) ? 0 : cashDelta,
        note: itemLogText ? `${reason} [Items: ${itemLogText}]` : reason
      };

      // Compensation entry queue for delivery to active/idle player clients
      const compensationEntry = {
        id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        cashDelta: isNaN(cashDelta) ? 0 : cashDelta,
        whaleTokensDelta: isNaN(whaleTokensDelta) ? 0 : whaleTokensDelta,
        itemId: itemId || null,
        itemQty: itemQty || 0,
        itemsDelta: itemsDelta || null,
        itemNames: itemLogText || '',
        reason: reason || 'Kompensasi / Bantuan Support Admin'
      };

      const existingPending = [
        ...((Array.isArray(user.save.savePayload?.pendingCompensations)) ? user.save.savePayload.pendingCompensations : []),
        ...((Array.isArray(user.save.activeEffects?.pendingCompensations)) ? user.save.activeEffects.pendingCompensations : [])
      ];
      // Keep unique by ID
      const uniquePendingMap = new Map();
      for (const p of existingPending) {
        if (p && p.id) uniquePendingMap.set(p.id, p);
      }
      uniquePendingMap.set(compensationEntry.id, compensationEntry);
      const updatedPending = Array.from(uniquePendingMap.values());

      const existingEffects = (typeof user.save.activeEffects === 'object' && user.save.activeEffects !== null)
        ? { ...user.save.activeEffects }
        : {};
      existingEffects.pendingCompensations = updatedPending;

      const existingPayload = typeof user.save.savePayload === 'object' && user.save.savePayload !== null
        ? {
            ...user.save.savePayload,
            cash: newCash,
            peakNetWorth: newPeak,
            whaleTokens: newTokens,
            inventory: currentInventory,
            pendingCompensations: updatedPending
          }
        : {
            cash: newCash,
            peakNetWorth: newPeak,
            whaleTokens: newTokens,
            inventory: currentInventory,
            pendingCompensations: updatedPending
          };

      const updatedSave = await prisma.gameSave.update({
        where: { userId },
        data: {
          cash: newCash,
          peakNetWorth: newPeak,
          whaleTokens: newTokens,
          inventory: currentInventory,
          activeEffects: existingEffects,
          tradeHistory: [compensationLog, ...existingHistory].slice(0, 50),
          savePayload: existingPayload,
          lastSavedAt: new Date()
        }
      });

      const messageParts = [];
      if (cashDelta !== 0) messageParts.push(`${cashDelta >= 0 ? '+$' + cashDelta.toLocaleString() : '-$' + Math.abs(cashDelta).toLocaleString()} Kas`);
      if (whaleTokensDelta !== 0) messageParts.push(`${whaleTokensDelta >= 0 ? '+' : ''}${whaleTokensDelta} Tokens`);
      if (itemLogText) messageParts.push(itemLogText);

      return NextResponse.json({
        success: true,
        message: `Kompensasi berhasil disuntikkan ke akun @${user.username}: ${messageParts.join(', ') || 'Item diperbarui'}.`,
        compensation: compensationEntry,
        save: {
          cash: updatedSave.cash,
          peakNetWorth: updatedSave.peakNetWorth,
          whaleTokens: updatedSave.whaleTokens,
          inventory: currentInventory
        }
      });
    }

    // 3. ACTION: RESET SAVE PROGRESS
    if (action === 'reset_save') {
      if (!user.save) {
        return NextResponse.json({ error: 'GameSave pemain tidak ditemukan' }, { status: 400 });
      }

      const defaultSave = {
        cash: 100.0,
        peakNetWorth: 100.0,
        whaleTokens: 0,
        currentLocationLevel: 1,
        upgrades: {},
        inventory: {
          pump_whistle: 0,
          dump_horn: 0,
          liq_shield: 0,
          leverage_250x: 0,
          zero_fee: 0,
          insider_radar: 0
        },
        activeEffects: { zeroFeeUntil: 0, has250xTicket: false, radarUntil: 0, resetRequested: true },
        activePosition: null,
        tradeHistory: [],
        savePayload: { resetRequested: true },
        lastSavedAt: new Date()
      };

      await prisma.gameSave.update({
        where: { userId },
        data: defaultSave
      });

      return NextResponse.json({
        success: true,
        message: `Progres GameSave untuk @${user.username} berhasil direset ke status awal ($100 saldo pemula).`
      });
    }

    return NextResponse.json({ error: `Aksi '${action}' tidak dikenali` }, { status: 400 });
  } catch (err) {
    console.error('Error in admin player-action:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
