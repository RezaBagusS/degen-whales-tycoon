/**
 * Cloud Sync Utility (PostgreSQL + LocalStorage Hybrid)
 * Syncs player state to PostgreSQL backend without blocking UI or failing offline play.
 */

let lastSyncTimestamp = 0;
const SYNC_DEBOUNCE_MS = 5000; // Sync to DB max once every 5 seconds

/**
 * Fetch current authenticated user
 */
export async function fetchCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.authenticated && data.user) {
        return {
          user: data.user,
          save: data.save
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Sync game state to database
 */
export async function syncGameProgressToDB(gameState, force = false) {
  if (typeof window === 'undefined') return null;

  const now = Date.now();
  if (!force && now - lastSyncTimestamp < SYNC_DEBOUNCE_MS) {
    return null;
  }
  lastSyncTimestamp = now;

  try {
    const payload = {
      state: gameState
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

/**
 * Load cloud save for current session or username
 */
export async function loadGameProgressFromDB(username = null) {
  if (typeof window === 'undefined') return null;
  try {
    const url = username ? `/api/user/load?username=${encodeURIComponent(username)}` : '/api/user/load';
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.found && data.save) {
        return data;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Logout user
 */
export async function logoutUser() {
  if (typeof window === 'undefined') return false;
  try {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}
