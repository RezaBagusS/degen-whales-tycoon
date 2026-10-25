import { test, expect } from '@playwright/test';

test.describe('Ads Isolation Verification', () => {
  test('Monetag vignette is NOT injected on /admin', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('#monetag-vignette-script')).toHaveCount(0);
    const scripts = await page.$$eval('script', (elements) => elements.map((el) => el.src));
    expect(scripts.some((src) => src.includes('vignette.min.js'))).toBe(false);
  });

  test('Monetag vignette is NOT injected on /login', async ({ page }) => {
    await page.goto('/login');
    await page.waitForURL('**/auth?mode=login');
    await expect(page.locator('#monetag-vignette-script')).toHaveCount(0);
    const scripts = await page.$$eval('script', (elements) => elements.map((el) => el.src));
    expect(scripts.some((src) => src.includes('vignette.min.js'))).toBe(false);
  });

  test('Monetag vignette is NOT injected on /register', async ({ page }) => {
    await page.goto('/register');
    await page.waitForURL('**/auth?mode=register');
    await expect(page.locator('#monetag-vignette-script')).toHaveCount(0);
    const scripts = await page.$$eval('script', (elements) => elements.map((el) => el.src));
    expect(scripts.some((src) => src.includes('vignette.min.js'))).toBe(false);
  });

  test('Monetag vignette is NOT injected on /auth', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.locator('#monetag-vignette-script')).toHaveCount(0);
    const scripts = await page.$$eval('script', (elements) => elements.map((el) => el.src));
    expect(scripts.some((src) => src.includes('vignette.min.js'))).toBe(false);
  });
});
