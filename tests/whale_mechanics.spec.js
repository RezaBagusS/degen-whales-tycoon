import { test, expect } from '@playwright/test';

test.describe('Whale Mechanics & Market Protection', () => {

  test('1x per day limit for Whale Whistle & Horn and Crypto Real immunity', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('degen_whale_save_v8', JSON.stringify({
        cash: 10000,
        peakNetWorth: 10000,
        whaleTokens: 0,
        passiveLevels: {},
        selectedPairIdx: 0, // DEGEN/USDT (degen_perps)
        selectedTfIdx: 0,
        inventory: { pump_whistle: 5, dump_horn: 5, liq_shield: 1, leverage_250x: 0, zero_fee: 0, insider_radar: 0 },
        dailyWhaleUsage: {},
        activeEffects: { zeroFeeUntil: 0, has250xTicket: false, radarUntil: 0 },
        version: 8,
        syncVersion: 2,
        tradeHistory: []
      }));
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // 1. Quick Inventory toolbar shows Whale Pump Whistle
    const whistleBtn = page.locator('button:has-text("Whale Pump Whistle")').first();
    await expect(whistleBtn).toBeVisible({ timeout: 10000 });

    // 2. First usage on DEGEN/USDT succeeds
    await whistleBtn.click();
    await expect(page.locator('text=🟢 WHALE PUMP!').first()).toBeVisible({ timeout: 5000 });

    // 3. Second usage on the same day is blocked with 1x/day warning toast
    await whistleBtn.click();
    await expect(page.locator('text=Batas harian tercapai').first()).toBeVisible({ timeout: 5000 });

    // 4. Check that badge "Dipakai Hari Ini" is displayed
    await expect(page.locator('text=Dipakai Hari Ini').first()).toBeVisible();

    // 5. Switch to a Crypto Real pair (BTC/USDT is index 1 or selected from dropdown)
    // Click pair selector
    const pairTrigger = page.locator('button:has-text("DEGEN/USDT")').first();
    await pairTrigger.click();

    const btcOption = page.locator('button:has-text("BTC/USDT")').first();
    if (await btcOption.isVisible()) {
      await btcOption.click();

      // Whale Dump Horn is still unused today, let's try using it on BTC/USDT
      const dumpBtn = page.locator('button:has-text("Whale Dump Horn")').first();
      await expect(dumpBtn).toBeVisible();
      await dumpBtn.click();

      // Expect crypto real immunity warning
      await expect(page.locator('text=kebal manipulasi').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('Black Market displays Degen Perps badges for Whistle and Horn', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('degen_whale_save_v8', JSON.stringify({
        cash: 10000,
        peakNetWorth: 10000,
        whaleTokens: 0,
        passiveLevels: {},
        selectedPairIdx: 0,
        selectedTfIdx: 0,
        inventory: { pump_whistle: 0, dump_horn: 0 },
        dailyWhaleUsage: {},
        activeEffects: {},
        version: 8,
        syncVersion: 2,
        tradeHistory: []
      }));
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Open Shop -> Black Market
    await page.locator('[data-testid="mode-shop"]').click();
    const bmTab = page.locator('[data-testid="tab-blackmarket"]');
    await expect(bmTab).toBeVisible();
    await bmTab.click();

    // Verify 1x/Hari • Degen Perps badge is displayed on Whale Pump Whistle card
    await expect(page.locator('text=1x/Hari • Degen Perps').first()).toBeVisible();
  });
});
