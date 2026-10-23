// Audio FX System using Web Audio API for Degen Whale Simulator
// 100% Client-side synthetic sound generation - Zero external file dependencies

let audioCtx = null;
let isAudioMuted = false;

// Check stored mute preference safely
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('degen_sound_muted');
    if (saved !== null) {
      isAudioMuted = saved === 'true';
    }
  } catch {
    // Ignore storage errors in private mode
  }
}

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

export const isSoundMuted = () => isAudioMuted;

export const setSoundMuted = (muted) => {
  isAudioMuted = Boolean(muted);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('degen_sound_muted', String(isAudioMuted));
    } catch {}
  }
  return isAudioMuted;
};

export const toggleSoundMute = () => {
  return setSoundMuted(!isAudioMuted);
};

// Subtle mobile haptic feedback helper
const triggerHaptic = (pattern = [15]) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator && !isAudioMuted) {
    try {
      navigator.vibrate(pattern);
    } catch {}
  }
};

/**
 * 1. UI Subtle Click Sound
 * Crisp micro-click for switching tabs, timeframe, indicators, pair select
 */
export const playUiClick = () => {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  } catch {}
};

/**
 * 2. Order Placement Sound (Buy / Long or Sell / Short)
 * High-tech futuristic laser whoosh
 */
export const playOrderSound = (type = 'buy') => {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  triggerHaptic([20, 30, 20]);

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'buy') {
      // Ascending energizing laser
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    } else {
      // Descending sharp punch
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.12);
    }

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  } catch {}
};

/**
 * 3. Profit / Cha-Ching Reward Sound
 * Joyful 4-note ascending arcade chime (C5 - E5 - G5 - C6)
 */
export const playProfitSound = () => {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  triggerHaptic([30, 40, 50]);

  try {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const startTime = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const noteTime = startTime + idx * 0.055;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.14, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.2);
    });
  } catch {}
};

/**
 * 4. Stop Loss / Loss Sound
 * Muted low-frequency thud
 */
export const playLossSound = () => {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  triggerHaptic([40]);

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.24);
  } catch {}
};

/**
 * 5. Liquidation Alarm
 * Urgent dual-tone siren alert
 */
export const playLiquidationSound = () => {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  triggerHaptic([60, 40, 60, 40, 60]);

  try {
    const startTime = ctx.currentTime;
    const pulses = [
      { freq: 880, start: startTime, dur: 0.1 },
      { freq: 520, start: startTime + 0.11, dur: 0.1 },
      { freq: 880, start: startTime + 0.22, dur: 0.1 },
      { freq: 440, start: startTime + 0.33, dur: 0.15 },
    ];

    pulses.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + dur + 0.02);
    });
  } catch {}
};

/**
 * 6. Workstation Upgrade / Level Up Sound
 * Chiptune power-up fanfare
 */
export const playUpgradeSound = () => {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  triggerHaptic([25, 25, 50]);

  try {
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
    const startTime = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const noteTime = startTime + idx * 0.045;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.12, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.16);
    });
  } catch {}
};

/**
 * 7. Prestige / Rugpull Cosmic Wave Sound
 * Epic deep sub-bass drop followed by triumphant high synth swell
 */
export const playPrestigeSound = () => {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  triggerHaptic([80, 50, 100]);

  try {
    const now = ctx.currentTime;
    
    // Sub-bass sweep
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(220, now);
    subOsc.frequency.exponentialRampToValueAtTime(55, now + 0.5);
    subGain.gain.setValueAtTime(0.25, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.6);

    // Cosmic shimmer chord
    [523.25, 783.99, 1046.50, 1318.51].forEach((freq, i) => {
      const noteTime = now + 0.15 + i * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.15, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.45);
    });
  } catch {}
};
