import { test, expect } from '@playwright/test';

test.describe('Ads Isolation Verification', () => {
  test('Monetag ads are NOT injected on /admin', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('#monetag-vignette-script')).toHaveCount(0);
    await expect(page.locator('#monetag-onclick-script')).toHaveCount(0);
    const scripts = await page.$$eval('script', (elements) => elements.map((el) => el.src));
    expect(scripts.some((src) => src.includes('vignette.min.js'))).toBe(false);
    expect(scripts.some((src) => src.includes('al5sm.com') || src.includes('alwingulla.com'))).toBe(false);
  });

  test('Monetag ads are NOT injected on /login', async ({ page }) => {
    await page.goto('/login');
    await page.waitForURL('**/auth?mode=login');
    await expect(page.locator('#monetag-vignette-script')).toHaveCount(0);
    await expect(page.locator('#monetag-onclick-script')).toHaveCount(0);
    const scripts = await page.$$eval('script', (elements) => elements.map((el) => el.src));
    expect(scripts.some((src) => src.includes('vignette.min.js'))).toBe(false);
    expect(scripts.some((src) => src.includes('al5sm.com') || src.includes('alwingulla.com'))).toBe(false);
  });

  test('Monetag ads are NOT injected on /register', async ({ page }) => {
    await page.goto('/register');
    await page.waitForURL('**/auth?mode=register');
    await expect(page.locator('#monetag-vignette-script')).toHaveCount(0);
    await expect(page.locator('#monetag-onclick-script')).toHaveCount(0);
    const scripts = await page.$$eval('script', (elements) => elements.map((el) => el.src));
    expect(scripts.some((src) => src.includes('vignette.min.js'))).toBe(false);
    expect(scripts.some((src) => src.includes('al5sm.com') || src.includes('alwingulla.com'))).toBe(false);
  });

  test('Monetag ads are NOT injected on /auth', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.locator('#monetag-vignette-script')).toHaveCount(0);
    await expect(page.locator('#monetag-onclick-script')).toHaveCount(0);
    const scripts = await page.$$eval('script', (elements) => elements.map((el) => el.src));
    expect(scripts.some((src) => src.includes('vignette.min.js'))).toBe(false);
    expect(scripts.some((src) => src.includes('al5sm.com') || src.includes('alwingulla.com'))).toBe(false);
  });

  test('Monetag OnClick suppresses script if within 4-hour interval', async ({ page }) => {
    // Seed localStorage with a timestamp from 1 hour ago (< 4 hours cooldown)
    await page.addInitScript(() => {
      localStorage.setItem('degen_monetag_onclick_last_ts', String(Date.now() - 3600000));
    });
    await page.goto('/');
    await expect(page.locator('#monetag-onclick-script')).toHaveCount(0);
  });
});
