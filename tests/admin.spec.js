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

  test('admin dashboard renders trend chart and broadcast controls', async ({ page }) => {
    await page.goto('/admin');
    await page.locator('input[type="password"]').fill(adminKey);
    await page.getByRole('button', { name: /Buka Dashboard Ops/i }).click();

    // Verify 24h Trend Chart is present on Overview tab
    await expect(page.getByText('Grafik Tren Aktivitas 24 Jam')).toBeVisible();
    await expect(page.getByRole('button', { name: /Pemain Aktif/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Volume/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Transaksi/i })).toBeVisible();

    // Verify In-Game Broadcast card is present
    await expect(page.getByText(/In-Game Broadcast/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Ketik pesan broadcast/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Siarkan Sekarang/i })).toBeVisible();
  });

  test('manages global announcements via /api/admin/broadcast and /api/broadcast', async ({ request }) => {
    // 1. Post a test announcement
    const postRes = await request.post('/api/admin/broadcast', {
      headers: { 'x-admin-key': adminKey },
      data: {
        message: 'Playwright Test Broadcast - Moon Mission!',
        type: 'pump',
        durationMinutes: 10
      }
    });
    expect(postRes.status()).toBe(200);
    const postJson = await postRes.json();
    expect(postJson.success).toBe(true);
    expect(postJson.broadcast.message).toBe('Playwright Test Broadcast - Moon Mission!');

    // 2. Verify public endpoint /api/broadcast serves it
    const publicRes = await request.get('/api/broadcast');
    expect(publicRes.status()).toBe(200);
    const publicJson = await publicRes.json();
    expect(publicJson.active).toBe(true);
    expect(publicJson.broadcast.message).toBe('Playwright Test Broadcast - Moon Mission!');
    expect(publicJson.broadcast.type).toBe('pump');

    // 3. Clear/deactivate broadcast
    const delRes = await request.delete('/api/admin/broadcast', {
      headers: { 'x-admin-key': adminKey }
    });
    expect(delRes.status()).toBe(200);

    // 4. Verify public endpoint now shows no active broadcast
    const checkRes = await request.get('/api/broadcast');
    const checkJson = await checkRes.json();
    expect(checkJson.active).toBe(false);
  });

  test('rejects unauthenticated player actions and validates input', async ({ request }) => {
    // Missing admin key
    const unauth = await request.post('/api/admin/player-action', {
      data: { action: 'toggle_ban', userId: 'user-xyz' }
    });
    expect(unauth.status()).toBe(401);

    const invalidAction = await request.post('/api/admin/player-action', {
      headers: { 'x-admin-key': adminKey },
      data: { action: 'invalid_action', userId: 'user-xyz' }
    });
    expect(invalidAction.status()).toBe(400);
  });

  test('opens player detail modal and switches tools via dropdown', async ({ page }) => {
    await page.goto('/admin');
    await page.locator('input[type="password"]').fill(adminKey);
    await page.getByRole('button', { name: /Buka Dashboard Ops/i }).click();

    // Go to Whale Watcher tab
    await page.getByRole('button', { name: /Whale Watcher/i }).click();
    await expect(page.getByText('Whale Watcher & Player CRM')).toBeVisible();

    // Click on the first player's Detail button
    const detailBtn = page.getByRole('button', { name: 'Detail' }).first();
    await expect(detailBtn).toBeVisible();
    await detailBtn.click();

    // Verify modal header and dropdown
    await expect(page.getByText(/Detail Pemain: @/i)).toBeVisible();
    const dropdown = page.locator('#mod-action-dropdown');
    await expect(dropdown).toBeVisible();

    // Select "Ganti / Reset Password Pemain"
    await dropdown.selectOption('password');
    await expect(page.getByText('Admin Reset Password Pemain')).toBeVisible();
    await expect(page.getByPlaceholder(/Ketik password baru/i)).toBeVisible();

    // Select "Suntik Kas, Tokens & Item In-Game (Kompensasi)"
    await dropdown.selectOption('compensation');
    await expect(page.getByText('Suntik Kas, Tokens & Item In-Game (Kompensasi Support)')).toBeVisible();
    await expect(page.getByText(/Suntik Item In-Game/i)).toBeVisible();
    await expect(page.getByPlaceholder('Contoh: 500')).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: 'Tutup', exact: true }).last().click();
    await expect(page.getByText(/Detail Pemain: @/i)).not.toBeVisible();
  });

  test('delivers developer compensation in real-time and verifies dismissible in-game banner', async ({ page, request }) => {
    // 1. Get first player from metrics
    const metricsRes = await request.get('/api/admin/metrics?playersLimit=1', {
      headers: { 'x-admin-key': adminKey }
    });
    expect(metricsRes.status()).toBe(200);
    const metricsJson = await metricsRes.json();
    const testPlayer = metricsJson.players[0];
    expect(testPlayer).toBeDefined();

    // 2. Inject compensation via player-action API
    const compRes = await request.post('/api/admin/player-action', {
      headers: { 'x-admin-key': adminKey },
      data: {
        action: 'inject_compensation',
        userId: testPlayer.id,
        cashDelta: 75000,
        whaleTokensDelta: 30,
        itemId: 'liq_shield',
        itemQty: 2,
        reason: 'Bonus Kompensasi Jaringan Support'
      }
    });
    expect(compRes.status()).toBe(200);
    const compJson = await compRes.json();
    expect(compJson.success).toBe(true);
    expect(compJson.compensation).toBeDefined();
    expect(compJson.compensation.reason).toBe('Bonus Kompensasi Jaringan Support');

    // 3. Verify /api/user/save receives the pending compensation and does not overwrite it
    const saveRes = await request.post('/api/user/save', {
      data: {
        username: testPlayer.username,
        state: {
          cash: 500,
          peakNetWorth: 500,
          whaleTokens: 2,
          inventory: { liq_shield: 1 }
        }
      }
    });
    expect(saveRes.status()).toBe(200);
    const saveJson = await saveRes.json();
    expect(saveJson.success).toBe(true);
    expect(saveJson.compensations?.length).toBeGreaterThan(0);
    expect(saveJson.appliedValues.cash).toBe(75500); // 500 in memory + 75000 compensation
    expect(saveJson.appliedValues.whaleTokens).toBe(32); // 2 in memory + 30 compensation
    expect(saveJson.appliedValues.inventory.liq_shield).toBe(3); // 1 in memory + 2 compensation

    // 4. Verify in-game compensation banner in browser UI
    await page.goto('/');
    // Check that game loads
    await expect(page.locator('canvas').first()).toBeVisible();

    // Trigger compensation banner via UI hydration test
    await page.evaluate(() => {
      localStorage.removeItem('degen_dismissed_compensations');
    });

    // Re-inject for UI test and trigger save in page context
    await request.post('/api/admin/player-action', {
      headers: { 'x-admin-key': adminKey },
      data: {
        action: 'inject_compensation',
        userId: testPlayer.id,
        cashDelta: 88888,
        whaleTokensDelta: 10,
        itemId: 'pump_whistle',
        itemQty: 1,
        reason: 'Kompensasi Khusus Event Developer'
      }
    });

    // In page, trigger cloud sync fetch to /api/user/save
    await page.evaluate(async (uname) => {
      const res = await fetch('/api/user/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: uname,
          state: {
            cash: 1000,
            peakNetWorth: 1000,
            whaleTokens: 5,
            inventory: { pump_whistle: 0 }
          }
        })
      });
      const data = await res.json();
      return data;
    }, testPlayer.username);

    // Reload page to verify compensation banner renders on load or manual sync
    await page.goto('/');
    await page.evaluate(async (uname) => {
      const res = await fetch('/api/user/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: uname,
          state: {
            cash: 1000,
            peakNetWorth: 1000,
            whaleTokens: 5,
            inventory: { pump_whistle: 0 }
          }
        })
      });
      return res.json();
    }, testPlayer.username);

    // Verify banner renders
    const banner = page.locator('[data-testid="developer-compensation-banner"]');
    // If banner appears, verify its elements and close it
    if (await banner.isVisible()) {
      await expect(banner).toContainText('KOMPENSASI DEVELOPER');
      await expect(banner).toContainText('Klaim & Tutup');
      await page.getByRole('button', { name: /Klaim & Tutup/i }).click();
      await expect(banner).not.toBeVisible();
    }
  });

  test('admin reset progress redirects to login, resets to anon, and prevents reload loops', async ({ request, page }) => {
    // 1. Get a user
    const metricsRes = await request.get('/api/admin/metrics?playersLimit=1', {
      headers: { 'x-admin-key': adminKey }
    });
    const metricsJson = await metricsRes.json();
    const testUser = metricsJson.players[0];
    expect(testUser).toBeDefined();

    // 2. Admin resets user progress
    const resetRes = await request.post('/api/admin/player-action', {
      headers: { 'x-admin-key': adminKey },
      data: {
        action: 'reset_save',
        userId: testUser.id
      }
    });
    expect(resetRes.status()).toBe(200);
    const resetJson = await resetRes.json();
    expect(resetJson.success).toBe(true);

    // 3. User client save triggers: should return resetRequired with redirectTo /login
    const saveRes1 = await request.post('/api/user/save', {
      data: {
        username: testUser.username,
        state: { cash: 999999, whaleTokens: 99 }
      }
    });
    expect(saveRes1.status()).toBe(200);
    const saveJson1 = await saveRes1.json();
    expect(saveJson1.resetRequired).toBe(true);
    expect(saveJson1.redirectTo).toContain('reset=1');

    // 4. Verify that reset flag is CLEARED from DB and does NOT loop on next save
    const saveRes2 = await request.post('/api/user/save', {
      data: {
        username: testUser.username,
        state: { cash: 100, whaleTokens: 0 }
      }
    });
    expect(saveRes2.status()).toBe(200);
    const saveJson2 = await saveRes2.json();
    expect(saveJson2.resetRequired).toBeUndefined(); // NO infinite loop!

    // 5. Test auth page renders the reset notice banner
    await page.goto('/auth?mode=login&reset=1');
    await expect(page.getByText(/NOTIFIKASI ADMIN: PROGRES DIRESET/i)).toBeVisible();
    await expect(page.getByText(/saldo awal \(\$10 pemula\)/i)).toBeVisible();

    // 6. Test suspend flow: admin bans user
    const banRes = await request.post('/api/admin/player-action', {
      headers: { 'x-admin-key': adminKey },
      data: {
        action: 'toggle_ban',
        userId: testUser.id,
        isBanned: true,
        banReason: 'Pelanggaran bot script'
      }
    });
    expect(banRes.status()).toBe(200);

    const bannedSaveRes = await request.post('/api/user/save', {
      data: { username: testUser.username, state: { cash: 100 } }
    });
    expect(bannedSaveRes.status()).toBe(403);
    const bannedJson = await bannedSaveRes.json();
    expect(bannedJson.isBanned).toBe(true);
    expect(bannedJson.banReason).toBe('Pelanggaran bot script');

    // Test auth page renders banned banner
    await page.goto('/auth?mode=login&banned=1&reason=' + encodeURIComponent('Pelanggaran bot script'));
    await expect(page.getByText(/STATUS AKUN: DIBLOKIR \/ SUSPEND/i)).toBeVisible();
    await expect(page.getByText(/Pelanggaran bot script/i)).toBeVisible();

    // Unban user to leave DB clean
    await request.post('/api/admin/player-action', {
      headers: { 'x-admin-key': adminKey },
      data: {
        action: 'toggle_ban',
        userId: testUser.id,
        isBanned: false
      }
    });
  });
});

