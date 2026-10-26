import { test, expect } from '@playwright/test';

const adminKey = process.env.ADMIN_SECRET_KEY || 'dw_admin_9x7f2026_whale';

const VIEWPORTS = [
  { name: 'Mobile Small (iPhone SE)', width: 375, height: 667 },
  { name: 'Mobile Modern (iPhone 14/15)', width: 393, height: 852 },
  { name: 'Mobile Android (Pixel/Galaxy)', width: 412, height: 915 },
  { name: 'Tablet Portrait (iPad Mini/Air)', width: 768, height: 1024 },
  { name: 'Desktop Standard (HD Laptop)', width: 1440, height: 900 }
];

test.describe('Responsive Design & Cross-Device Layout Audit', () => {
  for (const vp of VIEWPORTS) {
    test(`In-game UI fits without horizontal overflow on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');

      // Wait for game to render
      await expect(page.getByTestId('cash')).toBeVisible();

      // Check for horizontal overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(overflow, `Horizontal overflow detected on ${vp.name}`).toBe(false);

      // Verify header and primary trading controls fit
      await expect(page.getByTestId('cash')).toBeVisible();
      await expect(page.getByRole('button', { name: /LONG/i }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: /SHORT/i }).first()).toBeVisible();
    });

    test(`Admin Ops Center fits without horizontal overflow on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/admin');

      // Login to ops dashboard
      await page.locator('input[type="password"]').fill(adminKey);
      await page.getByRole('button', { name: /Buka Dashboard Ops/i }).click();

      // Wait for ops center to render
      await expect(page.getByText('OPS CENTER')).toBeVisible();

      // Check for document horizontal overflow on Overview Tab
      let hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(hasOverflow, `Document has horizontal overflow on Admin Overview for ${vp.name}`).toBe(false);

      // Switch to Meme Launchpad tab
      const launchpadTab = page.locator('button').filter({ hasText: /Meme Launchpad/i }).first();
      await launchpadTab.click();
      await expect(page.getByText('Live Meme Launchpad Audit Feed')).toBeVisible();

      // Check overflow on Meme Launchpad Tab
      hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(hasOverflow, `Document has horizontal overflow on Admin Launchpad for ${vp.name}`).toBe(false);

      // Switch to Whale Watcher tab
      const playersTab = page.locator('button').filter({ hasText: /Whale Watcher/i }).first();
      await playersTab.click();
      await expect(page.getByText(/Whale Watcher & Player CRM/i)).toBeVisible();

      hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(hasOverflow, `Document has horizontal overflow on Whale Watcher for ${vp.name}`).toBe(false);
    });

    test(`Auth Portal (Login & Register) fits on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/auth?mode=login');

      await expect(page.getByRole('heading', { name: /DEGEN & WHALE CLOUD/i })).toBeVisible();
      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(hasOverflow, `Document has horizontal overflow on Auth for ${vp.name}`).toBe(false);
    });
  }
});
