import { test, expect } from '@playwright/test';

test.describe('Admin & Ops Monitoring Dashboard', () => {
  test('rejects unauthenticated API requests to /api/admin/metrics', async ({ request }) => {
    const res = await request.get('/api/admin/metrics');
    expect(res.status()).toBe(401);
    const json = await res.json();
    expect(json.error).toMatch(/Unauthorized/i);
  });

  test('accepts authenticated API requests with x-admin-key', async ({ request }) => {
    const res = await request.get('/api/admin/metrics', {
      headers: {
        'x-admin-key': 'degen_admin_2026'
      }
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.overview).toBeDefined();
    expect(json.apm).toBeDefined();
    expect(Array.isArray(json.players)).toBe(true);
  });

  test('records client telemetry errors via /api/telemetry/report', async ({ request }) => {
    const res = await request.post('/api/telemetry/report', {
      data: {
        type: 'error',
        message: 'Test Telemetry Client Error',
        route: '/test-route'
      }
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  test('admin dashboard renders login gate and logs in with secret key', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByText('DEGEN & WHALE OPS')).toBeVisible();
    await expect(page.getByRole('button', { name: /Buka Dashboard Ops/i })).toBeVisible();

    // Fill in secret key and submit
    await page.locator('input[type="password"]').fill('degen_admin_2026');
    await page.getByRole('button', { name: /Buka Dashboard Ops/i }).click();

    // Verify main ops center renders
    await expect(page.getByText('OPS CENTER')).toBeVisible();
    await expect(page.getByText('Overview & Telemetri')).toBeVisible();
    await expect(page.getByText('Whale Watcher')).toBeVisible();
    await expect(page.getByText('Risk & Degen Monitor')).toBeVisible();
    await expect(page.getByText('APM & Sentry Logs')).toBeVisible();

    // Check tabs switching
    await page.getByRole('button', { name: /Whale Watcher/i }).click();
    await expect(page.getByText('Whale Watcher & Player CRM')).toBeVisible();

    await page.getByRole('button', { name: /Risk & Degen Monitor/i }).click();
    await expect(page.getByText(/Live Position Risk & Leverage Monitor/i)).toBeVisible();

    await page.getByRole('button', { name: /APM & Sentry Logs/i }).click();
    await expect(page.getByText('Sentry & APM Telemetry Engine')).toBeVisible();
  });
});
