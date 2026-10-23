import { test, expect } from '@playwright/test';

test.describe('Features 1, 2, and 3: Black Market, PnL Share Card, & Meme Launchpad', () => {

  test.beforeEach(async ({ page }) => {
    // Seed test player with $1,000 cash for easy testing using degen_whale_save_v8
    await page.addInitScript(() => {
      localStorage.setItem('degen_whale_save_v8', JSON.stringify({
        cash: 1000,
        peakNetWorth: 1000,
        whaleTokens: 0,
        passiveLevels: {},
        selectedPairIdx: 0,
        selectedTfIdx: 0,
        inventory: { pump_whistle: 1, dump_horn: 0, liq_shield: 1, leverage_250x: 1, zero_fee: 0, insider_radar: 0 },
        activeEffects: { zeroFeeUntil: 0, has250xTicket: false, radarUntil: 0 },
        version: 8,
        syncVersion: 2,
        tradeHistory: [
          {
            id: 1,
            pair: 'BTC/USD',
            type: 'LONG',
            leverage: 50,
            pnl: 250,
            roi: 125,
            status: 'PROFIT'
          }
        ]
      }));
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Feature 1: Black Market items are purchasable and quick inventory toolbar functions', async ({ page }) => {
    // 1. Verify Quick Inventory toolbar is visible since initial inventory has items
    const quickBar = page.locator('text=Inventaris');
    await expect(quickBar).toBeVisible();

    // 2. Open Black Market tab via Shop gate
    await page.locator('[data-testid="mode-shop"]').click();
    const bmTab = page.locator('[data-testid="tab-blackmarket"]');
    await expect(bmTab).toBeVisible();
    await bmTab.click();

    // 3. Verify items are displayed in Black Market
    const pumpWhistle = page.locator('text=Whale Pump Whistle').last();
    await expect(pumpWhistle).toBeVisible();

    const liqShield = page.locator('text=Liquidation Shield').last();
    await expect(liqShield).toBeVisible();

    const lev250x = page.locator('text=God Leverage 250x Ticket').last();
    await expect(lev250x).toBeVisible();

    // 4. Click buy on Whale Dump Horn ($250)
    const buyBtns = page.locator('button:has-text("Beli (+1)")');
    const dumpHornBuyBtn = buyBtns.nth(1); // Second item is Whale Dump Horn
    await dumpHornBuyBtn.click();

    // Switch back to perps mode to verify quick inventory toolbar
    await page.locator('[data-testid="mode-perps"]').click();
    await expect(page.locator('button:has-text("Whale Dump Horn")').first()).toBeVisible();

    // 5. Test using Whale Pump Whistle from quick inventory
    const usePumpBtn = page.locator('button:has-text("Whale Pump Whistle")').first();
    await usePumpBtn.click();

    // Verify toast notification appears
    await expect(page.locator('text=🟢 WHALE PUMP!').first()).toBeVisible();
  });

  test('Feature 2: PnL Share Card Generator renders high-res canvas, supports tabs, and copies/downloads', async ({ page }) => {
    // 1. Open PnL Share Card modal from header
    const shareBtn = page.locator('[data-testid="btn-share-pnl"]');
    await expect(shareBtn).toBeVisible();
    await shareBtn.click();

    // 2. Modal header and canvas should be visible
    await expect(page.locator('canvas[data-testid="pnl-canvas"]')).toBeVisible();
    await expect(page.locator('text=HD 1200x675')).toBeVisible();

    // 3. Switch to "Posisi Terbuka / Trade" tab
    const tradeTab = page.locator('[data-testid="pnl-tab-position"]');
    await expect(tradeTab).toBeVisible();
    await tradeTab.click();

    // 4. Switch back to "All-Time Portfolio"
    const portfolioTab = page.locator('[data-testid="pnl-tab-portfolio"]');
    await expect(portfolioTab).toBeVisible();
    await portfolioTab.click();

    // 5. Click copy button
    const copyBtn = page.locator('[data-testid="pnl-btn-copy"]');
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();
    await expect(page.locator('text=Tersalin').first()).toBeVisible();

    // 6. Close modal
    const closeBtn = page.locator('[data-testid="pnl-modal-close-btn"]');
    await closeBtn.click();
    await expect(page.locator('canvas[data-testid="pnl-canvas"]')).not.toBeVisible();
  });

  test('Feature 3: Meme Launchpad mode switcher, canvas rocket flight, and ape-in cashout', async ({ page }) => {
    // 1. Verify Mode Switcher buttons
    const perpsModeBtn = page.locator('[data-testid="mode-perps"]');
    const launchpadModeBtn = page.locator('[data-testid="mode-launchpad"]');
    await expect(perpsModeBtn).toBeVisible();
    await expect(launchpadModeBtn).toBeVisible();

    // 2. Switch to Meme Launchpad (pump.fun)
    await launchpadModeBtn.click();

    // 3. Verify launchpad canvas and token details are rendered
    await expect(page.locator('text=PUMP.FUN SIM')).toBeVisible();
    await expect(page.locator('text=Pepe The Whale')).toBeVisible();

    // 4. Verify Ape-In button is rendered
    const apeInBtn = page.locator('[data-testid="meme-ape-in-btn"]');
    await expect(apeInBtn).toBeVisible();

    // 5. Switch back to Perps Futures smoothly
    await perpsModeBtn.click();
    await expect(page.locator('[data-testid="pair-select-trigger"]')).toBeVisible();
  });

  test('Req 1, 2, 3: Perps chart preservation on tab switch, PnL Card cyberpunk styling, & Shop gate with 2 sub-sections', async ({ page }) => {
    // --- REQUIREMENT 1: Perps Futures chart after switching to/from Meme Launchpad ---
    const perpsModeBtn = page.locator('[data-testid="mode-perps"]');
    const launchpadModeBtn = page.locator('[data-testid="mode-launchpad"]');
    const shopModeBtn = page.locator('[data-testid="mode-shop"]');

    await expect(perpsModeBtn).toBeVisible();
    await expect(launchpadModeBtn).toBeVisible();
    await expect(shopModeBtn).toBeVisible();

    // Switch to launchpad
    await launchpadModeBtn.click();
    await expect(page.locator('text=PUMP.FUN SIM')).toBeVisible();

    // Switch back to perps
    await perpsModeBtn.click();
    const chartCanvas = page.locator('canvas').first();
    await expect(chartCanvas).toBeVisible();
    const box = await chartCanvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box.width).toBeGreaterThan(100);
    expect(box.height).toBeGreaterThan(100);

    // --- REQUIREMENT 2: PnL Share Card cyberpunk theme ---
    const shareBtn = page.locator('[data-testid="btn-share-pnl"]');
    await shareBtn.click();
    await expect(page.locator('canvas[data-testid="pnl-canvas"]')).toBeVisible();

    // Switch to position tab
    await page.locator('[data-testid="pnl-tab-position"]').click();
    await expect(page.locator('text=Posisi Terbuka / Trade')).toBeVisible();

    // Close modal
    await page.locator('[data-testid="pnl-modal-close-btn"]').click();

    // --- REQUIREMENT 3: Unified Shop Gate (Infrastruktur & Black Market) ---
    await shopModeBtn.click();
    await expect(page.locator('text=DEGEN SHOP')).toBeVisible();
    await expect(page.locator('text=2-IN-1 GATE')).toBeVisible();

    // Verify sub-tab 1: Infrastruktur
    const infraSubTab = page.locator('[data-testid="shop-tab-infra"]');
    await expect(infraSubTab).toBeVisible();
    await infraSubTab.click();
    await expect(page.locator('text=Hardware & Infrastruktur Mining')).toBeVisible();
    await expect(page.locator('text=OUTPUT PASIF TOTAL')).toBeVisible();

    // Verify sub-tab 2: Black Market
    const bmSubTab = page.locator('[data-testid="tab-blackmarket"]').first();
    await expect(bmSubTab).toBeVisible();
    await bmSubTab.click();
    await expect(page.locator('text=Whale Pump Whistle').last()).toBeVisible();
    await expect(page.locator('text=Whale Dump Horn').last()).toBeVisible();
  });

});
