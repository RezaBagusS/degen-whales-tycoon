/**
 * Cloud Sync Utility (PostgreSQL + LocalStorage Hybrid)
 * Syncs player state to PostgreSQL backend without blocking UI or failing offline play.
 */

let lastSyncTimestamp = 0;
const SYNC_DEBOUNCE_MS = 10000; // Sync to DB max once every 10 seconds

export async function syncGameProgressToDB(gameState, username = 'anon_degen') {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  if (now - lastSyncTimestamp < SYNC_DEBOUNCE_MS) {
    return;
  }
  lastSyncTimestamp = now;

  try {
    const payload = {
      username,
      state: {
        cash: gameState.cash,
        peakNetWorth: gameState.peakNetWorth,
        whaleTokens: gameState.whaleTokens,
        currentLocationLevel: gameState.currentLocation?.level || gameState.currentLocationLevel || 1,
        upgrades: gameState.upgrades,
        inventory: gameState.inventory,
        activeEffects: gameState.activeEffects,
        activePosition: gameState.activePosition,
        tradeHistory: gameState.history?.slice(0, 50) || []
      }
    };

    const res = await fetch('/api/user/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    // Fail silently in background if DB is not active or container offline
    // LocalStorage remains 100% active and dependable
    return null;
  }
}
