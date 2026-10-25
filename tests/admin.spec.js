import { test, expect } from '@playwright/test';

const adminKey = process.env.ADMIN_SECRET_KEY || 'dw_admin_9x7f2026_whale';

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
        'x-admin-key': adminKey
      }
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.overview).toBeDefined();
    expect(json.overview.activeUsersNow).toBeDefined();
    expect(typeof json.overview.activeUsersNow).toBe('number');
    expect(json.playersPagination).toBeDefined();
    expect(json.tradesPagination).toBeDefined();
    expect(json.positionsPagination).toBeDefined();
  });

  test('supports pagination parameters in /api/admin/metrics', async ({ request }) => {
    const res = await request.get('/api/admin/metrics?playersPage=1&playersLimit=2&playerStatus=all', {
      headers: {
        'x-admin-key': adminKey
      }
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.players.length).toBeLessThanOrEqual(2);
    expect(json.playersPagination.page).toBe(1);
    expect(json.playersPagination.limit).toBe(2);
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
    await page.locator('input[type="password"]').fill(adminKey);
    await page.getByRole('button', { name: /Buka Dashboard Ops/i }).click();

    // Verify main ops center renders
    await expect(page.getByText('OPS CENTER')).toBeVisible();
    await expect(page.getByText('Overview & Telemetri')).toBeVisible();
    await expect(page.getByText('Online Sekarang')).toBeVisible();
    await expect(page.getByText('Whale Watcher')).toBeVisible();
    await expect(page.getByText('Risk & Degen Monitor')).toBeVisible();
    await expect(page.getByText('APM & Sentry Logs')).toBeVisible();

    // Check tabs switching and pagination presence
    await page.getByRole('button', { name: /Whale Watcher/i }).click();
    await expect(page.getByText('Whale Watcher & Player CRM')).toBeVisible();
    await expect(page.getByPlaceholder('Cari username / email...')).toBeVisible();

    await page.getByRole('button', { name: /Risk & Degen Monitor/i }).click();
    await expect(page.getByText(/Live Position Risk & Leverage Monitor/i)).toBeVisible();

    await page.getByRole('button', { name: /APM & Sentry Logs/i }).click();
    await expect(page.getByText('Sentry & APM Telemetry Engine')).toBeVisible();
  });
});
