import { test, expect } from '@playwright/test';

test.describe('Daily Login Streak System', () => {
  test('Top navigation has Daily Streak widget and opens 7-day calendar modal', async ({ page }) => {
    await page.goto('/');

    const streakBtn = page.locator('[data-testid="btn-daily-streak"]');
    await expect(streakBtn).toBeVisible();

    // Open modal
    await streakBtn.click();

    // Verify modal content
    await expect(page.locator('text=DAILY LOGIN STREAK')).toBeVisible();
    await expect(page.getByText('Fresh Capital', { exact: true })).toBeVisible();
    await expect(page.getByText('Market Intel', { exact: true })).toBeVisible();
    await expect(page.getByText('Working Capital', { exact: true })).toBeVisible();
    await expect(page.getByText('Risk Mitigation', { exact: true })).toBeVisible();
    await expect(page.getByText('Scalper Frenzy', { exact: true })).toBeVisible();
    await expect(page.getByText('Market Maker', { exact: true })).toBeVisible();
    await expect(page.getByText('Grand Whale Jackpot', { exact: true })).toBeVisible();

    // Verify guest warning banner for anon user
    await expect(page.locator('text=Akun Tamu (Offline)')).toBeVisible();
  });

  test('Claiming Day 1 streak reward awards $5.00 and updates UI', async ({ page }) => {
    await page.goto('/');

    // Check cash initially ($10.00 default)
    const cashEl = page.locator('[data-testid="cash"]');
    await expect(cashEl).toBeVisible();

    // Open streak modal
    await page.locator('[data-testid="btn-daily-streak"]').click();

    // Click claim button inside modal
    const claimModalBtn = page.locator('button:has-text("Klaim Hadiah Hari ke-1")');
    await expect(claimModalBtn).toBeVisible();
    await claimModalBtn.click();

    // Toast message appears
    await expect(page.locator('text=Sukses Klaim Streak Hari ke-1')).toBeVisible({ timeout: 5000 });

    // Close modal
    await page.locator('button[aria-label="Tutup"]').click();

    // Verify cash increased by $5.00
    await expect(cashEl).toHaveText('$15.00');

    // Button in top nav shows streak 1d
    await expect(page.locator('[data-testid="btn-daily-streak"]')).toContainText('1d');
  });

  test('Workstation Cashier Kalender Streak button opens modal', async ({ page }) => {
    await page.goto('/');

    const calBtn = page.locator('button:has-text("Kalender Streak")');
    await expect(calBtn).toBeVisible();
    await calBtn.click();

    await expect(page.locator('text=DAILY LOGIN STREAK')).toBeVisible();
  });
});
