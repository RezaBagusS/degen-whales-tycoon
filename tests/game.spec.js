import { test, expect } from '@playwright/test';

const KEY = 'degen_whale_save_v8';
const LEGACY = 'degen_whale_save_v7';
const readSave = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), KEY);
const cashValue = async page => Number((await page.getByTestId('cash').innerText()).replace(/[$,]/g, ''));

async function start(page, overrides = {}, legacy = false) {
  await page.addInitScript(({ key, overrides }) => {
    // Neutral market makes regressions deterministic, not luck-dependent.
    let callSeq = 0;
    Math.random = () => ({
      valueOf: () => 0.5,
      toString: (radix) => (0.5 + (++callSeq) * 1e-6).toString(radix)
    });
    if (!sessionStorage.getItem('seeded')) {
      localStorage.clear();
      localStorage.setItem(key, JSON.stringify({
        version: 8, cash: 100, peakNetWorth: 100, whaleTokens: 0,
        passiveLevels: {}, activePosition: null, tradeHistory: [],
        lastDailyClaim: 0, selectedPairIdx: 0, selectedTfIdx: 0,
        marketPrices: [420.69, 1250, 69420], lastTimestamp: Date.now(),
        ...overrides
      }));
      sessionStorage.setItem('seeded', '1');
    }
  }, { key: legacy ? LEGACY : KEY, overrides });
  await page.goto('/');
  await expect(page.getByTestId('cash')).toBeVisible();
}

test('buying an upgrade starts income immediately and autosave keeps ticking', async ({ page }) => {
  await start(page);
  await page.locator('[data-testid="mode-shop"]').click();
  await page.getByRole('button', { name: 'BELI +1 $25.00', exact: true }).click();
  await page.locator('[data-testid="mode-perps"]').click();
  await expect(page.getByTestId('dps')).toHaveText('+$0.36/s');
  await expect.poll(() => cashValue(page)).toBeGreaterThan(75.15);
  await expect.poll(async () => (await readSave(page)).cash, { timeout: 7000 }).toBeGreaterThan(75.7);
  expect((await readSave(page)).passiveLevels.indikator).toBe(1);
});

test('all timeframes share one price even with an open position', async ({ page }) => {
  await start(page, { marketPrices: [777, 1250, 69420] });
  await page.getByRole('button', { name: /BUY \/ LONG/ }).click();
  for (const tf of ['15s', '30s', '1m', '5m', '15m', '30m', '1h', '4h', '1d', '5s']) {
    await page.getByRole('button', { name: tf, exact: true }).click();
    await expect(page.getByTestId('price')).toHaveText('$777.00');
    await expect(page.getByRole('button', { name: 'Close / TP', exact: true })).toBeVisible();
  }
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
  const saved = await readSave(page);
  expect(saved.activePosition.entryPrice).toBe(777);
  expect(saved.tradeHistory).toHaveLength(0);
});

test('refresh restores margin, pair, entry, TP/SL and position', async ({ page }) => {
  await start(page);
  await page.getByTestId('pair-select-trigger').click();
  await page.getByRole('button', { name: 'GORENG/IDR', exact: true }).click();
  await page.getByRole('button', { name: '2x', exact: true }).click();
  await page.getByLabel('Take Profit', { exact: true }).fill('1300');
  await page.getByLabel('Stop Loss', { exact: true }).fill('1200');
  await page.getByRole('button', { name: /BUY \/ LONG/ }).click();
  await page.waitForTimeout(300);
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
  const before = await readSave(page);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Close / TP', exact: true })).toBeVisible();
  const after = await readSave(page);
  expect(after.cash).toBe(before.cash);
  expect(after.activePosition.id).toBe(before.activePosition.id);
  expect(after.activePosition.margin).toBe(24.625);
  expect(after.activePosition.entryPrice).toBe(1250);
  expect(after.activePosition.tpPrice).toBe(1300);
  expect(after.activePosition.slPrice).toBe(1200);
  expect(after.selectedPairIdx).toBe(1);
});

test('pairs can change with an active position while position stays open', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: /BUY \/ LONG/ }).click();
  await expect(page.getByRole('button', { name: 'Close / TP', exact: true })).toBeVisible();
  await page.getByTestId('pair-select-trigger').click();
  await page.getByRole('button', { name: 'WHALE/USD', exact: true }).click();
  await expect(page.getByTestId('price')).toHaveText('$69420.00');
  await expect(page.getByRole('button', { name: 'Close / TP', exact: true })).toBeVisible();
  const saved = await readSave(page);
  expect(saved.activePosition.pairSymbol).toBe('DEGEN/USDT');
});

test('invalid long and short TP/SL never debit cash or open a position', async ({ page }) => {
  await start(page);
  await page.getByLabel('Take Profit', { exact: true }).fill('400');
  await page.getByRole('button', { name: /BUY \/ LONG/ }).click();
  await expect(page.getByTestId('cash')).toHaveText('$100.00');
  await page.getByLabel('Take Profit', { exact: true }).fill('500');
  await page.getByRole('button', { name: /SELL \/ SHORT/ }).click();
  await expect(page.getByTestId('cash')).toHaveText('$100.00');
  await page.getByLabel('Take Profit', { exact: true }).fill('');
  await page.getByLabel('Stop Loss', { exact: true }).fill('500');
  await page.getByRole('button', { name: /BUY \/ LONG/ }).click();
  await expect(page.getByTestId('cash')).toHaveText('$100.00');
  expect((await readSave(page)).activePosition).toBeNull();
});

test('legacy save migrates without erasing cash, levels, tokens or history', async ({ page }) => {
  await start(page, {
    cash: 432, peakNetWorth: 1000, whaleTokens: 2, passiveLevels: { indikator: 3 },
    tradeHistory: [{ id: 1, pair: 'DEGEN/USDT', type: 'LONG', leverage: 2, pnl: 5, roi: 10 }]
  }, true);
  const saved = await readSave(page);
  expect(saved.cash).toBeGreaterThanOrEqual(432);
  expect(saved.whaleTokens).toBe(2);
  expect(saved.passiveLevels.indikator).toBe(3);
  expect(saved.tradeHistory).toHaveLength(1);
  expect(saved.version).toBe(8);
});

test('offline income is capped at 8 hours and is not awarded twice', async ({ page }) => {
  await start(page, { passiveLevels: { indikator: 1 }, lastTimestamp: Date.now() - 12 * 3600000 });
  await expect(page.getByText('Bot & Kru Tetap Bekerja!')).toBeVisible();
  const first = await readSave(page);
  expect(first.cash).toBeCloseTo(100 + 28800 * 0.38 * 0.95, 1);
  await page.getByRole('button', { name: 'Sudah masuk kas, lanjut' }).click();
  await page.reload();
  await expect(page.getByText('Bot & Kru Tetap Bekerja!')).toHaveCount(0);
  const second = await readSave(page);
  expect(second.cash - first.cash).toBeLessThan(2);
});

test('clicking 2x profit on offline earnings doubles the profit and dismisses the modal immediately', async ({ page }) => {
  await start(page, { passiveLevels: { indikator: 1 }, lastTimestamp: Date.now() - 3600000 });
  await expect(page.getByText('Bot & Kru Tetap Bekerja!')).toBeVisible();
  const initialCash = (await readSave(page)).cash;

  // Click 2x doubler button
  await page.getByRole('button', { name: /Gandakan 2x/ }).click();

  // Modal must be dismissed immediately without blocking user
  await expect(page.getByText('Bot & Kru Tetap Bekerja!')).toHaveCount(0);

  // Cash must reflect the 2x doubled bonus
  const saved = await readSave(page);
  expect(saved.cash).toBeGreaterThan(initialCash);
});

test('hack timeout charges exactly once', async ({ page }) => {
  await start(page, {
    activeEvent: { id: 'hack-test', type: 'HACK', title: 'Hack test', desc: 'Test', timer: 1 }
  });
  await expect.poll(() => cashValue(page)).toBe(75);
  await page.waitForTimeout(1400);
  expect(await cashValue(page)).toBe(75);
  expect((await readSave(page)).activeEvent).toBeNull();
});

test('hack rescue awards one bonus and cancels the penalty', async ({ page }) => {
  await start(page, {
    activeEvent: { id: 'rescue-test', type: 'HACK', title: 'Hack test', desc: 'Test', timer: 4 }
  });
  await page.getByRole('button', { name: /WITHDRAW KE COLD WALLET/ }).click();
  await expect(page.getByTestId('cash')).toHaveText('$105.00');
  await page.waitForTimeout(4200);
  await expect(page.getByTestId('cash')).toHaveText('$105.00');
});

test('liquidation settles only once and persists recovery', async ({ page }) => {
  await start(page, { marketPrices: [415, 1250, 69420], activePosition: {
    id: 'liq-test', type: 'LONG', pairSymbol: 'DEGEN/USDT', margin: 20,
    leverage: 100, entryPrice: 420.69, liqPrice: 416
  } });
  await expect(page.getByText('MARGIN CALL / LIQUIDATED!', { exact: true })).toBeVisible();
  await expect.poll(async () => (await readSave(page)).tradeHistory.length).toBe(1);
  await page.getByRole('button', { name: 'Klaim Dana Talangan 20%', exact: true }).click();
  await expect(page.getByTestId('cash')).toHaveText('$105.00');
  await page.reload();
  await expect(page.getByTestId('cash')).toHaveText('$105.00');
  expect((await readSave(page)).tradeHistory).toHaveLength(1);
  expect((await readSave(page)).activePosition).toBeNull();
});

test('take profit settles once using the shared market price', async ({ page }) => {
  await start(page, { marketPrices: [450, 1250, 69420], activePosition: {
    id: 'tp-test', type: 'LONG', pairSymbol: 'DEGEN/USDT', margin: 20,
    leverage: 2, entryPrice: 400, liqPrice: 216, tpPrice: 440, slPrice: 380
  } });
  await expect.poll(async () => (await readSave(page)).tradeHistory.length).toBe(1);
  const saved = await readSave(page);
  expect(saved.cash).toBeCloseTo(124.95, 1);
  expect(saved.activePosition).toBeNull();
});

test('daily aid cannot be reclaimed after refresh and button stays disabled', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: 'Klaim Bantuan $5.00', exact: true }).click();
  await expect(page.getByTestId('cash')).toHaveText('$105.00');
  await expect(page.getByRole('button', { name: 'Sudah Diklaim Hari Ini', exact: true })).toBeDisabled();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Sudah Diklaim Hari Ini', exact: true })).toBeDisabled();
  await expect(page.getByTestId('cash')).toHaveText('$105.00');
});

test('hard reset requires confirmation and clears cooldown, boosts and position', async ({ page }) => {
  await start(page, {
    passiveLevels: { indikator: 1 }, whaleTokens: 2,
    lastDailyClaim: Date.now(), bullRunLeft: 20,
    activePosition: { id: 'reset-pos', type: 'LONG', pairSymbol: 'DEGEN/USDT',
      margin: 10, leverage: 2, entryPrice: 420.69, liqPrice: 220 }
  });
  await page.getByRole('button', { name: 'Pengaturan', exact: true }).click();
  await expect(page.getByRole('button', { name: /Trigger Bull|Trigger Hack/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Hard Reset', exact: true }).click();
  expect((await readSave(page)).whaleTokens).toBe(2);
  await page.getByRole('button', { name: 'Ya, hapus progres', exact: true }).click();
  await expect(page.getByTestId('cash')).toHaveText('$10.00');
  await expect.poll(async () => (await readSave(page)).whaleTokens).toBe(0);
  const saved = await readSave(page);
  expect(saved.lastDailyClaim).toBe(0);
  expect(saved.bullRunLeft).toBe(0);
  expect(saved.activePosition).toBeNull();
  expect(saved.passiveLevels.indikator).toBe(0);
  await page.reload();
  await expect(page.getByTestId('cash')).toHaveText('$10.00');
});

test('prestige stops old DPS immediately and preserves new tokens', async ({ page }) => {
  await start(page, { cash: 50000, peakNetWorth: 50000, passiveLevels: { indikator: 10 } });
  await page.getByRole('button', { name: /Whale:/ }).click();
  await page.getByRole('button', { name: /Eksekusi Rugpull/ }).click();
  await expect(page.getByTestId('dps')).toHaveText('+$5.00/s');
  expect(await cashValue(page)).toBeLessThan(50);
  expect(await cashValue(page)).toBeGreaterThanOrEqual(10);
  await page.waitForTimeout(1100);
  expect((await readSave(page)).whaleTokens).toBe(1);
});

test('unavailable browser storage shows a warning without crashing', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () { throw new Error('Storage blocked'); };
  });
  await page.goto('/');
  await expect(page.getByRole('alert').filter({ hasText: 'Penyimpanan browser gagal' })).toBeVisible();
  await page.getByRole('button', { name: 'Klaim Bantuan $5.00', exact: true }).click();
  await expect(page.getByTestId('cash')).toHaveText('$15.00');
});


test('mobile layout fits viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
  await page.getByRole('button', { name: 'Pengaturan', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Hard Reset', exact: true })).toBeVisible();
});

test('opening second tab shows lock overlay and take over switches leader', async ({ context, page }) => {
  await start(page);
  await expect(page.getByTestId('cash')).toBeVisible();

  const page2 = await context.newPage();
  await page2.goto('/');

  await expect(page2.getByText('Sesi Aktif di Tab Lain')).toBeVisible();
  await page2.getByRole('button', { name: /Gunakan di Tab Ini/ }).click();
  await expect(page2.getByText('Sesi Aktif di Tab Lain')).toHaveCount(0);
  await expect(page.getByText('Sesi Aktif di Tab Lain')).toBeVisible();
});

test('TP and SL display estimated dollar return and can be adjusted while position is open', async ({ page }) => {
  await start(page);
  await page.getByLabel('Take Profit', { exact: true }).fill('450');
  await expect(page.getByText(/Est\. Cuan \(LONG\):/)).toBeVisible();
  await page.getByLabel('Stop Loss', { exact: true }).fill('400');
  await expect(page.getByText(/Est\. Rugi \(LONG\):/)).toBeVisible();

  await page.getByRole('button', { name: /BUY \/ LONG/ }).click();
  await expect(page.getByRole('button', { name: 'Close / TP', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /TP:/ })).toBeVisible();

  await page.getByRole('button', { name: /TP:/ }).click();
  await expect(page.getByText('Atur TP & SL Posisi')).toBeVisible();

  await page.getByRole('button', { name: '+50%' }).click();
  await page.getByRole('button', { name: '-25%' }).click();
  await expect(page.getByText(/Est\. Keuntungan:/)).toBeVisible();
  await expect(page.getByText(/Est\. Kerugian:/)).toBeVisible();

  await page.getByRole('button', { name: 'Simpan TP/SL' }).click();
  await expect(page.getByText('Atur TP & SL Posisi')).toHaveCount(0);

  const saved = await readSave(page);
  expect(saved.activePosition.tpPrice).toBeGreaterThan(saved.activePosition.entryPrice);
  expect(saved.activePosition.slPrice).toBeLessThan(saved.activePosition.entryPrice);
});

