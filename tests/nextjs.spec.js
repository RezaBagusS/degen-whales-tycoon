import { test, expect } from '@playwright/test';

test('App Router mounts game without hydration errors', async ({ page }) => {
  const problems = [];
  page.on('pageerror', error => problems.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' && /hydration|did not match|server rendered/i.test(message.text())) {
      problems.push(message.text());
    }
  });
  await page.goto('/');
  await expect(page.getByTestId('cash')).toHaveText('$10.00');
  await expect(page).toHaveTitle('Degen & Whale | Trading Floor Simulator');
  await expect(page.locator('html')).toHaveAttribute('lang', 'id');
  await page.getByRole('button', { name: /BUY \/ LONG/ }).click();
  await expect(page.getByRole('button', { name: 'Close / TP', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Close / TP', exact: true })).toBeVisible();
  expect(problems).toEqual([]);
});

test('missing randomUUID does not prevent trading', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Crypto.prototype, 'randomUUID', { configurable: true, value: undefined });
  });
  await page.goto('/');
  await page.getByRole('button', { name: /BUY \/ LONG/ }).click();
  await expect(page.getByRole('button', { name: 'Close / TP', exact: true })).toBeVisible();
});

test('blocked storage does not prevent startup', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() { throw new DOMException('Storage unavailable', 'SecurityError'); },
    });
  });
  await page.goto('/');
  await expect(page.getByTestId('cash')).toHaveText('$10.00');
  await expect(page.getByRole('alert').filter({ hasText: 'Penyimpanan browser gagal' })).toBeVisible();
});
