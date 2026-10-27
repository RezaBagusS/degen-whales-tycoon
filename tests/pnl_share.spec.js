import { test, expect } from '@playwright/test';

test.describe('Viral PnL Share Card Generator & Certified Shiller Achievement', () => {
  test('Header has Flex PnL button and opens PnL Share Card Modal', async ({ page }) => {
    await page.goto('/');

    const shareBtn = page.locator('[data-testid="btn-share-pnl"]');
    await expect(shareBtn).toBeVisible();

    // Verify initial unclaimed bonus indicator (+$100)
    await expect(shareBtn).toContainText('+$100');

    // Click to open modal
    await shareBtn.click();

    // Verify modal elements
    await expect(page.locator('[data-testid="pnl-modal-title"]')).toBeVisible();
    await expect(page.locator('text=HADIAH PERDANA')).toBeVisible();
    await expect(page.locator('[data-testid="pnl-canvas"]')).toBeVisible();
    await expect(page.locator('[data-testid="pnl-btn-threads"]')).toBeVisible();
    await expect(page.locator('[data-testid="pnl-btn-x"]')).toBeVisible();
    await expect(page.locator('[data-testid="pnl-btn-download"]')).toBeVisible();
    await expect(page.locator('[data-testid="pnl-btn-copy"]')).toBeVisible();

    // Switch between 1:1 Square and 16:9 Banner
    await page.locator('[data-testid="pnl-format-landscape"]').click();
    await page.waitForTimeout(200);
    await page.locator('[data-testid="pnl-format-square"]').click();
    await page.waitForTimeout(200);

    // Close modal
    await page.locator('[data-testid="pnl-modal-close-x"]').click();
    await expect(page.locator('[data-testid="pnl-modal-title"]')).not.toBeVisible();
  });

  test('Sharing PnL card unlocks Certified Shiller badge and awards +$100.00 Cash', async ({ page }) => {
    await page.goto('/');

    const cashEl = page.locator('[data-testid="cash"]');
    await expect(cashEl).toBeVisible();
    const initialCashText = await cashEl.innerText();
    const initialCash = parseFloat(initialCashText.replace('$', ''));

    // Open PnL modal
    await page.locator('[data-testid="btn-share-pnl"]').click();
    await expect(page.locator('[data-testid="pnl-modal-title"]')).toBeVisible();

    // Click Download PNG button (which triggers share achievement)
    const downloadPromise = page.waitForEvent('download').catch(() => null);
    await page.locator('[data-testid="pnl-btn-download"]').click();
    await downloadPromise;

    // Toast alert for unlocked achievement appears
    await expect(page.locator('text=ACHIEVEMENT DIBUKA').first()).toBeVisible({ timeout: 5000 });

    // Inside modal, achievement banner updates to active
    await expect(page.locator('text=Gelar 📢 Certified Shiller aktif!')).toBeVisible();

    // Close modal
    await page.locator('[data-testid="pnl-modal-close-x"]').click();

    // Cash has increased by $100.00
    const expectedCash = (initialCash + 100).toFixed(2);
    await expect(cashEl).toHaveText(`$${expectedCash}`);

    // Workstation HUD displays 📢 Certified Shiller badge
    await expect(page.locator('[data-testid="hud-shiller-badge"]')).toBeVisible();

    // Header Flex PnL button no longer shows +$100 indicator
    const shareBtn = page.locator('[data-testid="btn-share-pnl"]');
    await expect(shareBtn.locator('text=+$100')).not.toBeVisible();
  });

  test('Active position displays Flex PnL button which pre-fills position data in modal', async ({ page }) => {
    await page.goto('/');

    // Open a long position (click BUY / LONG)
    const buyBtn = page.locator('button:has-text("BUY / LONG")');
    if (await buyBtn.isVisible()) {
      await buyBtn.click();
      await page.waitForTimeout(500);

      // Check for Flex button in active position
      const flexPosBtn = page.locator('[data-testid^="btn-flex-pos-"]').first();
      await expect(flexPosBtn).toBeVisible();

      // Click Flex button
      await flexPosBtn.click();

      // PnL modal opens in trade mode
      await expect(page.locator('text=Viral PnL Share Card Generator')).toBeVisible();
      await expect(page.locator('[data-testid="pnl-canvas"]')).toBeVisible();

      // Close modal
      await page.locator('[data-testid="pnl-modal-close-x"]').click();
    }
  });
});
