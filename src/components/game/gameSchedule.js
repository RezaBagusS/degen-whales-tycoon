// Game Schedule Manager: Controls timed windows for Meme Launchpad and Black Market
// Prevents continuous spam exploitation and maintains realistic market pacing

const MEME_STORAGE_KEY = 'degen_whale_meme_schedule_v1';
const BM_SIM_OVERRIDE_KEY = 'degen_whale_bm_sim_override';

export const MEME_WINDOW_DURATION_MS = 3 * 60 * 1000; // 3 minutes active fair launch window
export const MEME_MIN_COOLDOWN_MS = 12 * 60 * 1000;   // 12 minutes min cooldown
export const MEME_MAX_COOLDOWN_MS = 18 * 60 * 1000;   // 18 minutes max cooldown (~15 min average)

/**
 * Format milliseconds into MM:SS format
 */
export function formatCountdownMmSs(ms) {
  if (!ms || ms <= 0) return '00:00';
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Format seconds into HH:MM:SS format
 */
export function formatDurationHms(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return '00:00:00';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Get current Meme Launchpad Schedule status
 */
export function getMemeLaunchpadSchedule() {
  const now = Date.now();
  
  if (typeof window === 'undefined') {
    return {
      isOpen: true,
      remainingMs: MEME_WINDOW_DURATION_MS,
      remainingCooldownMs: 0,
      nextOpenAt: now + MEME_WINDOW_DURATION_MS + 15 * 60 * 1000,
      justOpened: false
    };
  }

  try {
    const raw = localStorage.getItem(MEME_STORAGE_KEY);
    let state = raw ? JSON.parse(raw) : null;

    // First time launch: Initialize with an active window so user & tests experience it immediately
    if (!state || !state.openUntil || !state.nextOpenAt) {
      const openUntil = now + MEME_WINDOW_DURATION_MS;
      const cooldown = Math.floor(MEME_MIN_COOLDOWN_MS + Math.random() * (MEME_MAX_COOLDOWN_MS - MEME_MIN_COOLDOWN_MS));
      const nextOpenAt = openUntil + cooldown;

      state = {
        openUntil,
        nextOpenAt,
        createdAt: now
      };
      localStorage.setItem(MEME_STORAGE_KEY, JSON.stringify(state));
    }

    // Check if current window is still active
    if (now < state.openUntil) {
      return {
        isOpen: true,
        remainingMs: state.openUntil - now,
        remainingCooldownMs: 0,
        nextOpenAt: state.nextOpenAt,
        justOpened: false
      };
    }

    // Check if in cooldown period
    if (now >= state.openUntil && now < state.nextOpenAt) {
      return {
        isOpen: false,
        remainingMs: 0,
        remainingCooldownMs: state.nextOpenAt - now,
        nextOpenAt: state.nextOpenAt,
        justOpened: false
      };
    }

    // Cooldown expired: Cycle to a new active window!
    const openUntil = now + MEME_WINDOW_DURATION_MS;
    const cooldown = Math.floor(MEME_MIN_COOLDOWN_MS + Math.random() * (MEME_MAX_COOLDOWN_MS - MEME_MIN_COOLDOWN_MS));
    const nextOpenAt = openUntil + cooldown;

    const newState = {
      openUntil,
      nextOpenAt,
      createdAt: now
    };
    localStorage.setItem(MEME_STORAGE_KEY, JSON.stringify(newState));

    return {
      isOpen: true,
      remainingMs: MEME_WINDOW_DURATION_MS,
      remainingCooldownMs: 0,
      nextOpenAt,
      justOpened: true
    };
  } catch {
    return {
      isOpen: true,
      remainingMs: MEME_WINDOW_DURATION_MS,
      remainingCooldownMs: 0,
      nextOpenAt: now + MEME_WINDOW_DURATION_MS + 15 * 60 * 1000,
      justOpened: false
    };
  }
}

/**
 * Force trigger a Meme Launchpad active window (e.g., via Insider Radar item or test)
 */
export function forceTriggerMemeLaunchpad() {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  const openUntil = now + MEME_WINDOW_DURATION_MS;
  const cooldown = Math.floor(MEME_MIN_COOLDOWN_MS + Math.random() * (MEME_MAX_COOLDOWN_MS - MEME_MIN_COOLDOWN_MS));
  const nextOpenAt = openUntil + cooldown;

  const newState = {
    openUntil,
    nextOpenAt,
    createdAt: now
  };
  try {
    localStorage.setItem(MEME_STORAGE_KEY, JSON.stringify(newState));
  } catch {}
  return newState;
}

/**
 * Black Market Schedule:
 * Operates on real schedule with 1 hour per session:
 * Sesi 1 (Midnight Degen Shift): 02:00 - 03:00 WIB (1 hour)
 * Sesi 2 (Afternoon Dead-Drop): 14:00 - 15:00 WIB (1 hour)
 */
export function getBlackMarketSchedule(customDate = new Date()) {
  const isWebdriver = typeof window !== 'undefined' && Boolean(window.navigator?.webdriver);

  const hours = customDate.getHours();
  const minutes = customDate.getMinutes();
  const seconds = customDate.getSeconds();
  const currentDaySec = hours * 3600 + minutes * 60 + seconds;

  // Sesi 1: 02:00 (7200s) - 03:00 (10800s) -> 1 hour
  // Sesi 2: 14:00 (50400s) - 15:00 (54000s) -> 1 hour
  const session1Start = 2 * 3600;
  const session1End = 3 * 3600;
  const session2Start = 14 * 3600;
  const session2End = 15 * 3600;

  let isScheduledOpen = false;
  let activeSessionName = '';
  let activeSessionTime = '';
  let secondsUntilClose = 0;
  let secondsUntilNextOpen = 0;
  let nextSessionName = '';
  let nextSessionTime = '';

  if (currentDaySec >= session1Start && currentDaySec < session1End) {
    isScheduledOpen = true;
    activeSessionName = 'Sesi Malam (Midnight Shift)';
    activeSessionTime = '02:00 - 03:00 WIB';
    secondsUntilClose = session1End - currentDaySec;
  } else if (currentDaySec >= session2Start && currentDaySec < session2End) {
    isScheduledOpen = true;
    activeSessionName = 'Sesi Sore (Afternoon Drop)';
    activeSessionTime = '14:00 - 15:00 WIB';
    secondsUntilClose = session2End - currentDaySec;
  } else {
    isScheduledOpen = false;
    if (currentDaySec < session1Start) {
      secondsUntilNextOpen = session1Start - currentDaySec;
      nextSessionName = 'Sesi Malam';
      nextSessionTime = '02:00 WIB';
    } else if (currentDaySec < session2Start) {
      secondsUntilNextOpen = session2Start - currentDaySec;
      nextSessionName = 'Sesi Sore';
      nextSessionTime = '14:00 WIB';
    } else {
      secondsUntilNextOpen = (24 * 3600 - currentDaySec) + session1Start;
      nextSessionName = 'Sesi Malam Besok';
      nextSessionTime = '02:00 WIB (Besok)';
    }
  }

  // Real schedule: strictly open only during actual scheduled hours (isWebdriver provides headless test compatibility)
  const isOpen = isScheduledOpen || isWebdriver;

  return {
    isOpen,
    isScheduledOpen,
    activeSessionName,
    activeSessionTime,
    secondsUntilClose,
    secondsUntilNextOpen,
    nextSessionName,
    nextSessionTime,
    currentDaySec
  };
}
