import { test, expect } from '@playwright/test';

test.describe('Multi-Language (i18n) Features', () => {
  test('switches between Indonesian and English and persists preference across all components', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=DEGEN & WHALE');

    // Default language is Indonesian (ID)
    await expect(page.locator('text=Kamar Kos Sempit').first()).toBeVisible();
    await expect(page.locator('text=Exit Liquidity').first()).toBeVisible();
    await expect(page.locator('button:has-text("Buka Galeri")').first()).toBeVisible();

    // Check Shop translations in ID
    await page.locator('[data-testid="mode-shop"]').click();
    await expect(page.locator('button:has-text("BELI +1")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Infrastruktur")').first()).toBeVisible();

    // Click EN in Settings modal language switcher
    const openSettingsBtn = page.locator('button[aria-label="Pengaturan"], button[aria-label="Settings"]').first();
    await openSettingsBtn.click();
    const enBtn = page.getByTestId('settings-lang-en');
    await expect(enBtn).toBeVisible();
    await enBtn.click();
    await page.locator('button:has-text("✕")').click();

    // Verify translated strings in Shop (EN)
    await expect(page.locator('button:has-text("BUY +1")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Infrastructure")').first()).toBeVisible();

    // Switch back to Perps mode to check workstation and trading strings
    await page.locator('[data-testid="mode-perps"]').click();
    await expect(page.locator('text=Cramped Dorm Room').first()).toBeVisible();
    await expect(page.locator('button:has-text("Open Gallery")').first()).toBeVisible();
    await expect(page.locator('text=Take Profit (Optional):').first()).toBeVisible();

    // Check Quests tab in English
    const questsTab = page.locator('button:has-text("Quests")').first();
    await questsTab.click();
    await expect(page.locator('text=Missions & Liquidity Rewards').first()).toBeVisible();
    await expect(page.locator('button:has-text("Daily (24H)")').first()).toBeVisible();

    // Check Workstation Gallery Modal in English
    const openGalleryBtn = page.locator('button:has-text("Open Gallery")').first();
    await openGalleryBtn.click();
    await expect(page.locator('text=Workstation Evolution & 3D Ranks')).toBeVisible();
    await expect(page.locator('button:has-text("Close Gallery")')).toBeVisible();
    await page.locator('button:has-text("Close Gallery")').click();

    // Verify local storage persisted
    const storedLang = await page.evaluate(() => localStorage.getItem('degen_lang'));
    expect(storedLang).toBe('en');

    // Reload page and verify English stays active
    await page.reload();
    await page.waitForSelector('text=DEGEN & WHALE');
    await expect(page.locator('text=Cramped Dorm Room').first()).toBeVisible();

    // Switch back to Indonesian via Settings modal
    const settingsBtn = page.locator('button[aria-label="Pengaturan"], button[aria-label="Settings"]').first();
    await settingsBtn.click();
    await expect(page.locator('text=Display Language')).toBeVisible();

    // Click ID button inside settings modal
    const idModalBtn = page.getByTestId('settings-lang-id');
    await idModalBtn.click();

    // Close settings modal
    await page.locator('button:has-text("✕")').click();

    // Verify translated back to Indonesian
    await expect(page.locator('text=Kamar Kos Sempit').first()).toBeVisible();
    await page.locator('[data-testid="mode-shop"]').click();
    await expect(page.locator('button:has-text("Infrastruktur")').first()).toBeVisible();
    const storedLangId = await page.evaluate(() => localStorage.getItem('degen_lang'));
    expect(storedLangId).toBe('id');

    // Open Settings and check Game Credits modal
    await settingsBtn.click();
    const openCreditsBtn = page.getByTestId('btn-open-credits');
    await expect(openCreditsBtn).toBeVisible();
    await openCreditsBtn.click();
    await expect(page.locator('text=Reza Bagus').first()).toBeVisible();
    await expect(page.locator('text=saweria.co/rezabaguss').first()).toBeVisible();
    await page.getByTestId('btn-close-credits').click();
  });
});
