import { test, expect } from '@playwright/test';

test.describe('Deep Exploration & Level Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`Console Error: ${msg.text()}`);
      }
    });
    page.on('pageerror', (err) => {
      console.error(`Page Unhandled Error: ${err.message}`);
    });
  });

  const allLevels = [
    { level: 1, netWorth: 10, tokens: 0, name: 'Kamar Kos Sempit', badge: 'Exit Liquidity' },
    { level: 2, netWorth: 30000, tokens: 0, name: 'Warnet VIP 24 Jam', badge: 'Scalper Receh' },
    { level: 3, netWorth: 6000000, tokens: 1, name: 'Ruko 2 Lantai', badge: 'Bandar Lokal' },
    { level: 4, netWorth: 2000000000, tokens: 5, name: 'Penthouse SCBD', badge: 'Market Mover' },
    { level: 5, netWorth: 600000000000, tokens: 20, name: 'Sovereign Whale Private Island', badge: 'Sovereign Whale' },
    { level: 6, netWorth: 300000000000000, tokens: 75, name: 'Shadow Citadel di Bulan', badge: 'Interplanetary Syndicate' },
    { level: 7, netWorth: 60000000000000000, tokens: 250, name: 'The Architect of Singularity', badge: 'God of Liquidity' },
  ];

  for (const tl of allLevels) {
    test(`level ${tl.level} progression and diorama: ${tl.name}`, async ({ page }) => {
      await page.addInitScript(({ tl }) => {
        const KEY = 'degen_whale_save_v8';
        localStorage.clear();
        localStorage.setItem(KEY, JSON.stringify({
          version: 8,
          cash: tl.netWorth,
          peakNetWorth: tl.netWorth,
          whaleTokens: tl.tokens,
          lastTimestamp: Date.now(),
        }));
      }, { tl });

      await page.goto('/');
      await page.waitForSelector('text=DEGEN & WHALE');

      // Verify level name, badge, and workstation tier on UI
      await expect(page.locator(`text=${tl.name}`).first()).toBeVisible();
      await expect(page.locator(`text=${tl.badge}`).first()).toBeVisible();
      await expect(page.locator(`text=WORKSTATION LV.${tl.level}`).first()).toBeVisible();
    });
  }

  test('explore workstation gallery modal and all 7 tiers preview', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=DEGEN & WHALE');

    const openGalleryBtn = page.locator('button:has-text("Buka Galeri")').first();
    await openGalleryBtn.click();
    await expect(page.locator('text=Evolusi Workstation & Rank 3D')).toBeVisible();

    const levels = [
      'Kamar Kos Sempit',
      'Warnet VIP 24 Jam',
      'Ruko 2 Lantai',
      'Penthouse SCBD',
      'Sovereign Whale Private Island',
      'Shadow Citadel di Bulan',
      'The Architect of Singularity'
    ];
    for (const lvlName of levels) {
      await expect(page.locator(`text=${lvlName}`).first()).toBeVisible();
    }

    await page.locator('button[title="Tutup"]').first().click();
    await expect(page.locator('text=Evolusi Workstation & Rank 3D')).not.toBeVisible();
  });

  test('explore trading features, TP/SL, timeframes, indicators and drawing tools', async ({ page }) => {
    // Start with ample cash for trading
    await page.addInitScript(() => {
      localStorage.setItem('degen_whale_save_v8', JSON.stringify({
        version: 8,
        cash: 1000,
        peakNetWorth: 1000,
        whaleTokens: 0,
        lastTimestamp: Date.now(),
      }));
    });

    await page.goto('/');
    await page.waitForSelector('text=DEGEN & WHALE');

    // 1. Switch timeframe
    const tf5m = page.locator('button:has-text("15m")').first();
    if (await tf5m.isVisible()) {
      await tf5m.click();
    }

    // 2. Switch indicators (e.g., BOLL, RSI)
    const bollBtn = page.locator('button:has-text("BOLL")').first();
    if (await bollBtn.isVisible()) {
      await bollBtn.click();
    }

    // 3. Open a Long position with TP & SL
    const tpInput = page.locator('input[placeholder*="TP"]').first();
    if (await tpInput.isVisible()) {
      await tpInput.fill('450');
    }
    const slInput = page.locator('input[placeholder*="SL"]').first();
    if (await slInput.isVisible()) {
      await slInput.fill('400');
    }

    const buyBtn = page.locator('button:has-text("BUY / LONG")').first();
    await buyBtn.click();

    // Confirm active position appears
    await expect(page.locator('button:has-text("Close / TP")').first()).toBeVisible();

    // 4. Test Drawing Tools: Horizontal Line
    const hLineBtn = page.locator('button[title*="Garis Horizontal"]').first();
    if (await hLineBtn.isVisible()) {
      await hLineBtn.click();
      // Click canvas to place horizontal line
      const canvas = page.locator('canvas').first();
      await canvas.click({ position: { x: 250, y: 180 } });
    }

    // 5. Test Market Close
    const closeBtn = page.locator('button:has-text("Close / TP")').first();
    await closeBtn.click();
    await expect(page.locator('button:has-text("Close / TP")')).not.toBeVisible();
  });

  test('explore sidebar collapse toggle, missions drawer, audio settings, and prestige dialog', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('degen_whale_save_v8', JSON.stringify({
        version: 8,
        cash: 50000,
        peakNetWorth: 50000,
        whaleTokens: 0,
        passiveLevels: { indikator: 1 },
        lastTimestamp: Date.now(),
      }));
    });

    await page.goto('/');
    await page.waitForSelector('text=DEGEN & WHALE');

    // 1. Test Sidebar Toggle (Collapse / Expand)
    const collapseBtn = page.locator('button[title*="Infrastruktur"]').first();
    if (await collapseBtn.isVisible()) {
      await collapseBtn.click();
      // Chart expands, sidebar hides
      await page.waitForTimeout(400);
      // Click again to expand
      await collapseBtn.click();
      await page.waitForTimeout(400);
    }

    // 2. Test Audio Settings Toggle
    const soundBtn = page.locator('button[title*="Suara"]').first();
    if (await soundBtn.isVisible()) {
      await soundBtn.click(); // Mute
      await soundBtn.click(); // Unmute
    }

    // 3. Test Prestige / Eksekusi Rugpull Dialog
    const rugpullBtn = page.locator('button:has-text("Eksekusi Rugpull")').first();
    if (await rugpullBtn.isVisible()) {
      await rugpullBtn.click();
      await expect(page.locator('text=EKSEKUSI RUGPULL (PRESTIGE)')).toBeVisible();
      // Close prestige modal
      const cancelBtn = page.locator('button:has-text("Batal")').first();
      await cancelBtn.click();
      await expect(page.locator('text=EKSEKUSI RUGPULL (PRESTIGE)')).not.toBeVisible();
    }
  });
});
