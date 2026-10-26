/**
 * Daily Login Streak System for Degen & Whale Tycoon
 * 7-Day Cycle with balanced, tactical rewards.
 */

export const DAILY_STREAK_REWARDS = [
  {
    day: 1,
    title: 'Fresh Capital',
    rewardType: 'cash',
    rewardAmount: 5.0,
    iconName: 'Coins',
    desc: '+$5.00 Modal Scalping Awal',
    badgeText: 'HARI 1',
    color: '#10B981', // emerald
  },
  {
    day: 2,
    title: 'Market Intel',
    rewardType: 'item',
    itemId: 'insider_radar',
    itemCount: 1,
    iconName: 'Compass',
    desc: '1x Insider Alpha Radar',
    badgeText: 'HARI 2',
    color: '#EC4899', // pink
  },
  {
    day: 3,
    title: 'Working Capital',
    rewardType: 'cash',
    rewardAmount: 70.0,
    iconName: 'Coins',
    desc: '+$70.00 Modal Tambahan',
    badgeText: 'HARI 3',
    color: '#10B981', // emerald
  },
  {
    day: 4,
    title: 'Risk Mitigation',
    rewardType: 'item',
    itemId: 'liq_shield',
    itemCount: 1,
    iconName: 'ShieldAlert',
    desc: '1x Liquidation Shield',
    badgeText: 'HARI 4',
    color: '#38BDF8', // sky
  },
  {
    day: 5,
    title: 'Scalper Frenzy',
    rewardType: 'buff',
    buffId: 'zero_fee',
    durationMinutes: 30,
    iconName: 'Percent',
    desc: 'Zero Fee Pass (30 Menit)',
    badgeText: 'HARI 5',
    color: '#A855F7', // purple
  },
  {
    day: 6,
    title: 'Market Maker',
    rewardType: 'item',
    itemId: 'pump_whistle',
    itemCount: 1,
    iconName: 'TrendingUp',
    desc: '1x Whale Pump Whistle',
    badgeText: 'HARI 6',
    color: '#F59E0B', // amber
  },
  {
    day: 7,
    title: 'Grand Whale Jackpot',
    rewardType: 'grand_jackpot',
    itemId: 'leverage_250x',
    whaleTokens: 1,
    badgeTitle: 'Disciplined Degen',
    iconName: 'Crown',
    desc: '1x Tiket 250x + 1 $WHALE + Badge',
    badgeText: 'GRAND PRIZE',
    color: '#EAB308', // gold/yellow
  }
];

/**
 * Format local date as YYYY-MM-DD
 */
export function getLocalDateString(timestamp = Date.now()) {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get yesterday's local date string
 */
export function getYesterdayDateString(timestamp = Date.now()) {
  return getLocalDateString(timestamp - 24 * 60 * 60 * 1000);
}

/**
 * Calculate current streak status based on state and current timestamp
 */
export function evaluateStreakStatus(streakState, nowTimestamp = Date.now()) {
  const todayStr = getLocalDateString(nowTimestamp);
  const yesterdayStr = getYesterdayDateString(nowTimestamp);

  const rawCount = Math.max(0, parseInt(streakState?.streakCount || 0, 10));
  const lastClaimDate = streakState?.lastClaimDate || null;
  const lastClaimTime = streakState?.lastClaimTime || 0;
  const freezeUsed = Boolean(streakState?.freezeUsed);
  const badgeUnlocked = Boolean(streakState?.badgeUnlocked);

  // If already claimed today
  if (lastClaimDate === todayStr) {
    const currentDay = ((rawCount - 1) % 7) + 1;
    // Calculate milliseconds until tomorrow 00:00:00
    const tomorrow = new Date(nowTimestamp);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilTomorrow = Math.max(0, tomorrow.getTime() - nowTimestamp);

    return {
      status: 'claimed_today',
      streakCount: rawCount,
      currentDay,
      nextDay: (currentDay % 7) + 1,
      canClaim: false,
      isMissed: false,
      msUntilNextClaim: msUntilTomorrow,
      badgeUnlocked
    };
  }

  // If never claimed before
  if (!lastClaimDate) {
    return {
      status: 'ready_to_claim',
      streakCount: 0,
      currentDay: 1,
      canClaim: true,
      isMissed: false,
      msUntilNextClaim: 0,
      badgeUnlocked
    };
  }

  // If claimed yesterday: consecutive!
  if (lastClaimDate === yesterdayStr) {
    const currentDay = (rawCount % 7) + 1;
    return {
      status: 'ready_to_claim',
      streakCount: rawCount,
      currentDay,
      canClaim: true,
      isMissed: false,
      msUntilNextClaim: 0,
      badgeUnlocked
    };
  }

  // If lastClaimDate is older than yesterday: streak missed!
  return {
    status: 'missed',
    streakCount: rawCount,
    currentDay: 1, // resets to day 1 unless freeze is used
    canClaim: true,
    isMissed: true,
    msUntilNextClaim: 0,
    badgeUnlocked
  };
}
