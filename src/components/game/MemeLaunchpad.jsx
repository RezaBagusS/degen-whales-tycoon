'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Rocket, 
  Flame, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  Coins, 
  Sparkles,
  Zap,
  RotateCcw,
  Radio,
  Clock
} from 'lucide-react';
import {
  getMemeLaunchpadSchedule,
  formatCountdownMmSs,
  forceTriggerMemeLaunchpad
} from './gameSchedule';

const MEME_TOKENS = [
  { symbol: '$PEPEWHALE', name: 'Pepe The Whale', color: '#10B981', dev: '0xP3p3...88a1' },
  { symbol: '$DOGEMOON', name: 'Doge To The Moon', color: '#F59E0B', dev: '0xD0g3...99b2' },
  { symbol: '$CHADSOL', name: 'Giga Chad Solana', color: '#8B5CF6', dev: '0xCh4d...77c3' },
  { symbol: '$FOMOBULL', name: 'FOMO Degen Bull', color: '#EC4899', dev: '0xF0m0...44d4' },
  { symbol: '$RUGDEV', name: 'Dev Definitely Not Rugging', color: '#EF4444', dev: '0xRugG...11e5' }
];

export default function MemeLaunchpad({
  cash = 10,
  onPlaceBet,
  onWinCash,
  formatMoney = (val) => `$${val.toFixed(2)}`,
  t = {},
  language = 'id',
  playSound = () => {},
  inventory = {},
  onUseBlackMarketItem = () => {}
}) {
  const [tokenIdx, setTokenIdx] = useState(0);
  const currentToken = MEME_TOKENS[tokenIdx];

  // Schedule & window state
  const [schedule, setSchedule] = useState(() => getMemeLaunchpadSchedule());

  useEffect(() => {
    const timer = setInterval(() => {
      const cur = getMemeLaunchpadSchedule();
      setSchedule((prev) => {
        if (!prev.isOpen && cur.isOpen) {
          // Radar countdown just finished! Window opened, instantly reset to fresh WAITING state!
          setGameState('WAITING');
          setCountdown(5);
          setIsApedIn(false);
          setIsNextRoundQueued(false);
          setHasCashedOut(false);
          setCashOutMultiplier(0);
          setMultiplier(1.00);
          multiplierRef.current = 1.00;
        }
        return cur;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Game state: 'WAITING' | 'FLYING' | 'CRASHED'
  const [gameState, setGameState] = useState('WAITING');
  const [multiplier, setMultiplier] = useState(1.00);
  const [countdown, setCountdown] = useState(5);
  const [recentCrashes, setRecentCrashes] = useState([2.45, 1.15, 14.80, 1.05, 3.20, 48.90, 1.80]);

  // Betting state
  const [betAmount, setBetAmount] = useState(1);
  const [autoCashOut, setAutoCashOut] = useState('');
  const [isApedIn, setIsApedIn] = useState(false);
  const [isNextRoundQueued, setIsNextRoundQueued] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [cashOutMultiplier, setCashOutMultiplier] = useState(0);

  // Stable callback and state references to prevent re-triggering effects on parent renders
  const playSoundRef = useRef(playSound);
  playSoundRef.current = playSound;

  const onPlaceBetRef = useRef(onPlaceBet);
  onPlaceBetRef.current = onPlaceBet;

  const onWinCashRef = useRef(onWinCash);
  onWinCashRef.current = onWinCash;

  const isApedInRef = useRef(isApedIn);
  isApedInRef.current = isApedIn;

  const isNextRoundQueuedRef = useRef(isNextRoundQueued);
  isNextRoundQueuedRef.current = isNextRoundQueued;

  const hasCashedOutRef = useRef(hasCashedOut);
  hasCashedOutRef.current = hasCashedOut;

  const autoCashOutRef = useRef(autoCashOut);
  autoCashOutRef.current = autoCashOut;

  const betAmountRef = useRef(betAmount);
  betAmountRef.current = betAmount;

  const cashRef = useRef(cash);
  cashRef.current = cash;

  const multiplierRef = useRef(multiplier);
  multiplierRef.current = multiplier;

  // References for animation loop
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const crashPointRef = useRef(2.00);
  const startTimeRef = useRef(0);
  const particlesRef = useRef([]);

  // Generate next crash multiplier (weighted probability: realistic pump.fun crash curve)
  const generateCrashPoint = useCallback(() => {
    const rand = Math.random();
    // 10% instant dev dump (<1.2x)
    if (rand < 0.10) return +(1.01 + Math.random() * 0.18).toFixed(2);
    // 50% low crash (1.2x - 2.5x)
    if (rand < 0.60) return +(1.20 + Math.random() * 1.30).toFixed(2);
    // 25% medium moon (2.5x - 7.0x)
    if (rand < 0.85) return +(2.50 + Math.random() * 4.50).toFixed(2);
    // 10% high rocket (7.0x - 25.0x)
    if (rand < 0.95) return +(7.00 + Math.random() * 18.00).toFixed(2);
    // 5% mega 100x god candle
    return +(25.00 + Math.random() * 75.00).toFixed(2);
  }, []);

  // Preset Bet helper with precision protection
  const handleSetBet = (amt) => {
    if (gameState === 'FLYING' && isApedInRef.current) return;
    const maxAllowed = Math.floor(cash * 100) / 100;
    if (maxAllowed <= 0) {
      setBetAmount(0);
      return;
    }
    const clamped = Math.max(0.1, Math.min(maxAllowed, amt));
    setBetAmount(Math.floor(clamped * 100) / 100);
  };

  // Cash Out handler
  const handleCashOut = useCallback(() => {
    if (gameState !== 'FLYING' || !isApedInRef.current || hasCashedOutRef.current) return;

    const currentMult = multiplierRef.current;
    const winTotal = betAmountRef.current * currentMult;
    setHasCashedOut(true);
    setCashOutMultiplier(currentMult);

    if (onWinCashRef.current) {
      onWinCashRef.current(winTotal);
    }
    if (playSoundRef.current) {
      playSoundRef.current('tp');
    }
  }, [gameState]);

  // Ape-In handler (supports active round or queueing for next round)
  const handleApeIn = () => {
    const canAfford = (cash + 0.0001) >= betAmount && betAmount > 0;
    if (!canAfford) return;

    if (gameState === 'WAITING') {
      if (onPlaceBetRef.current) onPlaceBetRef.current(betAmount);
      setIsApedIn(true);
      setIsNextRoundQueued(false);
      setHasCashedOut(false);
      setCashOutMultiplier(0);
      if (playSoundRef.current) playSoundRef.current('open');
    } else if (!isApedIn) {
      // Toggle queue for next launch
      setIsNextRoundQueued((prev) => {
        const next = !prev;
        if (playSoundRef.current) playSoundRef.current(next ? 'open' : 'click');
        return next;
      });
    }
  };

  // Start round countdown (paused while radar is closed)
  useEffect(() => {
    if (!schedule.isOpen) {
      setGameState('WAITING');
      setCountdown(5);
      return;
    }
    if (gameState !== 'WAITING') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Start flying!
          crashPointRef.current = generateCrashPoint();
          startTimeRef.current = performance.now();
          setGameState('FLYING');
          setMultiplier(1.00);
          multiplierRef.current = 1.00;
          particlesRef.current = [];
          if (playSoundRef.current) playSoundRef.current('click');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, schedule.isOpen, generateCrashPoint]);

  // Main Canvas & Rocket Animation Loop
  useEffect(() => {
    if (!schedule.isOpen || gameState !== 'FLYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const loop = (timestamp) => {
      if (!isRunning) return;

      const elapsedMs = timestamp - startTimeRef.current;
      // Exponential curve formula: multiplier grows faster over time
      const currentMult = +(1.00 + Math.pow(elapsedMs / 3200, 2.1)).toFixed(2);

      // Auto Cash-Out Check
      const targetAuto = parseFloat(autoCashOutRef.current);
      if (targetAuto && isApedInRef.current && !hasCashedOutRef.current && currentMult >= targetAuto) {
        handleCashOut();
      }

      // Check if rocket reached crash point
      if (currentMult >= crashPointRef.current) {
        // CRASH / DEV RUGPULL!
        multiplierRef.current = crashPointRef.current;
        setMultiplier(crashPointRef.current);
        setGameState('CRASHED');
        setRecentCrashes((prev) => [crashPointRef.current, ...prev.slice(0, 9)]);
        if (playSoundRef.current) playSoundRef.current('sl');

        // Reset for next launch after 3.5s
        setTimeout(() => {
          setTokenIdx((prev) => (prev + 1) % MEME_TOKENS.length);
          setGameState('WAITING');
          setCountdown(5);
          setMultiplier(1.00);
          multiplierRef.current = 1.00;
          setHasCashedOut(false);
          setCashOutMultiplier(0);

          const currentCash = cashRef.current;
          const currentBet = betAmountRef.current;
          if (isNextRoundQueuedRef.current && (currentCash + 0.0001) >= currentBet && currentBet > 0) {
            if (onPlaceBetRef.current) onPlaceBetRef.current(currentBet);
            setIsApedIn(true);
            setIsNextRoundQueued(false);
            if (playSoundRef.current) playSoundRef.current('open');
          } else {
            setIsApedIn(false);
            setIsNextRoundQueued(false);
          }
        }, 3500);

        return;
      }

      multiplierRef.current = currentMult;
      setMultiplier(currentMult);

      // --- CANVAS DRAWING ---
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // 1. Deep Space Cyberpunk Grid
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#040711');
      bgGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Starfield dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 25; i++) {
        const starX = ((i * 137) % w);
        const starY = ((i * 89 + elapsedMs * 0.05) % h);
        ctx.fillRect(starX, starY, 1.5, 1.5);
      }

      // 2. Flight Path Trajectory Curve
      const startX = 60;
      const startY = h - 50;
      const progressNorm = Math.min(1, elapsedMs / 10000);
      const rocketX = startX + progressNorm * (w - 140);
      const rocketY = startY - Math.min(h - 100, Math.pow(progressNorm, 1.4) * (h - 100));

      // Draw Curve
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(startX + (rocketX - startX) * 0.5, startY, rocketX, rocketY);
      ctx.strokeStyle = currentToken.color;
      ctx.lineWidth = 4;
      ctx.shadowColor = currentToken.color;
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Area under curve glow
      ctx.lineTo(rocketX, startY);
      ctx.lineTo(startX, startY);
      ctx.closePath();
      const areaGrad = ctx.createLinearGradient(0, rocketY, 0, startY);
      areaGrad.addColorStop(0, `${currentToken.color}33`);
      areaGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = areaGrad;
      ctx.fill();

      // 3. Rocket Particle Exhaust Fire
      if (Math.random() < 0.7) {
        particlesRef.current.push({
          x: rocketX - 10,
          y: rocketY + 10,
          vx: -2 - Math.random() * 3,
          vy: 2 + Math.random() * 3,
          radius: 3 + Math.random() * 4,
          alpha: 1,
          color: Math.random() > 0.5 ? '#F59E0B' : '#EF4444'
        });
      }

      // Update & Draw Particles
      for (let p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.04;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
      particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0);

      // 4. Draw Rocket Icon / Avatar
      ctx.save();
      ctx.translate(rocketX, rocketY);
      ctx.rotate(-Math.PI / 4 + 0.1);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '28px serif';
      ctx.fillText('🚀', -14, 10);
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, currentToken, handleCashOut]);

  // Current payout calculation
  const potentialPayout = isApedIn ? betAmount * multiplier : 0;
  const canAfford = (cash + 0.0001) >= betAmount && betAmount > 0;

  return (
    <div className="bg-[#0B0E14] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      
      {/* Launchpad Header Bar */}
      <div className="p-3.5 sm:p-4 bg-[#111622] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-lg border"
            style={{ 
              backgroundColor: `${currentToken.color}20`, 
              borderColor: `${currentToken.color}50`, 
              color: currentToken.color 
            }}
          >
            <Rocket className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                {currentToken.symbol}
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                PUMP.FUN SIM
              </span>
              <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                Dev: {currentToken.dev}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {currentToken.name} - {t.memeSubtitle || 'Cash Out sebelum dev melakukan RUGPULL!'}
            </p>
          </div>
        </div>

        {/* Recent Crashes Badge Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
          <span className="text-[10px] font-mono text-slate-500 shrink-0 mr-1 hidden sm:inline">
            {t.memeLastCrashes || 'Riwayat:'}
          </span>
          {recentCrashes.map((val, idx) => {
            const isHigh = val >= 10.0;
            const isMid = val >= 2.0;
            return (
              <span
                key={idx}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                  isHigh
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : isMid
                    ? 'bg-emerald-500/20 text-[#00FF88] border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}
              >
                {val.toFixed(2)}x
              </span>
            );
          })}
        </div>
      </div>

      {/* Window Active Status Bar */}
      {schedule.isOpen ? (
        <div className="bg-emerald-950/70 border-b border-emerald-500/30 px-3.5 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#00FF88] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-ping" />
            <span className="font-mono text-[11px] tracking-wide">{t.memeWindowActive || 'JENDELA FAIR LAUNCH AKTIF'}</span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">- Dev sedang deploy koin ke mempool!</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-slate-400 text-[10px] uppercase">{t.memeWindowClosesIn || 'Sisa Jendela:'}</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[#00FF88] font-black border border-emerald-500/40">
              {formatCountdownMmSs(schedule.remainingMs)}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/90 border-b border-amber-500/30 px-3.5 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span className="font-mono text-[11px] tracking-wide">{t.memeRadarStandby || 'RADAR STANDBY / MEMPOOL SCANNING'}</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
            Solana Mainnet RPC Connected
          </span>
        </div>
      )}

      {/* Main Simulation Stage: Live Canvas Rocket vs Cyber Radar Standby */}
      {schedule.isOpen ? (
        <div className="relative w-full h-64 sm:h-80 bg-slate-950 overflow-hidden flex items-center justify-center select-none">
          <canvas
            ref={canvasRef}
            width={800}
            height={320}
            className="w-full h-full object-cover block"
          />

          {/* Center Multiplier Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            {gameState === 'FLYING' && (
              <div className="text-center animate-in zoom-in-75 duration-100">
                <div 
                  className="text-5xl sm:text-7xl font-mono font-black tracking-tight drop-shadow-[0_0_35px_rgba(0,255,136,0.5)]"
                  style={{ color: currentToken.color }}
                >
                  {multiplier.toFixed(2)}x
                </div>
                <div className="text-xs sm:text-sm font-mono font-bold text-slate-300 mt-1 flex items-center justify-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>{t.memeFlying || 'ROKET MELUNCUR KE BULAN!'}</span>
                </div>
              </div>
            )}

            {gameState === 'WAITING' && (
              <div className="text-center bg-slate-950/80 p-4 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-sm">
                <div className="text-xs font-mono uppercase text-slate-400 mb-1">
                  {t.memeWaitingRocket || 'Mempersiapkan Peluncuran Koin Baru...'}
                </div>
                <div className="text-4xl sm:text-5xl font-mono font-black text-amber-400 animate-pulse">
                  {countdown}s
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {currentToken.symbol} on Solana Devnet
                </div>
              </div>
            )}

            {gameState === 'CRASHED' && (
              <div className="text-center bg-rose-950/90 p-5 rounded-2xl border-2 border-rose-500 shadow-2xl animate-bounce backdrop-blur-md">
                <div className="text-4xl sm:text-6xl font-mono font-black text-[#FF3366] drop-shadow-[0_0_25px_rgba(255,51,102,0.6)]">
                  {multiplier.toFixed(2)}x
                </div>
                <div className="text-sm sm:text-base font-extrabold text-white mt-1 flex items-center justify-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <span>{t.memeRugged || '💥 DEV RUGPULL! SEMUA LIKUIDITAS DIKOSONGKAN!'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Cashed Out Success Floating Overlay */}
          {hasCashedOut && (
            <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-xl bg-emerald-950/90 border border-[#00FF88] text-[#00FF88] text-xs font-mono font-extrabold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>CASHED OUT @ {cashOutMultiplier.toFixed(2)}x (+{formatMoney(betAmount * cashOutMultiplier)})</span>
            </div>
          )}
        </div>
      ) : (
        /* Cyber Radar Standby Stage */
        <div className="relative w-full h-64 sm:h-80 bg-slate-950 overflow-hidden flex flex-col items-center justify-center select-none border-b border-slate-800">
          {/* Concentric radar rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
            <div className="w-24 h-24 rounded-full border border-emerald-500" />
            <div className="w-48 h-48 rounded-full border border-emerald-500 absolute" />
            <div className="w-72 h-72 rounded-full border border-emerald-500 absolute" />
            <div className="w-96 h-96 rounded-full border border-emerald-500 absolute" />
            <div className="w-full h-[1px] bg-emerald-500/25 absolute" />
            <div className="h-full w-[1px] bg-emerald-500/25 absolute" />
          </div>

          {/* Radar Sweep Beam */}
          <div 
            className="absolute w-80 h-80 rounded-full pointer-events-none origin-center animate-spin"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(16, 185, 129, 0.2) 360deg)',
              animationDuration: '4s'
            }}
          />

          {/* Radar Status Center */}
          <div className="relative z-10 flex flex-col items-center text-center p-4 max-w-md">
            <div className="px-3 py-1 rounded-full bg-slate-900/95 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold flex items-center gap-2 mb-2 backdrop-blur-md shadow-xl">
              <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              <span>{t.memeRadarStandby || 'RADAR STANDBY / MEMPOOL SCANNING'}</span>
            </div>

            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-0.5">
              {t.memeNextDropEstimate || 'Estimasi Fair Launch Berikutnya:'}
            </div>

            <div className="text-4xl sm:text-6xl font-mono font-black text-amber-400 tracking-wider drop-shadow-[0_0_20px_rgba(245,158,11,0.4)] my-1">
              {formatCountdownMmSs(schedule.remainingCooldownMs)}
            </div>

            {/* Quick Actions in Radar Mode */}
            {inventory?.insider_radar > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onUseBlackMarketItem) onUseBlackMarketItem('insider_radar');
                    forceTriggerMemeLaunchpad();
                    setSchedule(getMemeLaunchpadSchedule());
                    if (playSound) playSound('tp');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{t.memeActivateRadarBtn || '⚡ Aktifkan Insider Radar'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Betting Controls & Cash Out Panel */}
      <div className="p-4 bg-[#0E1422] border-t border-slate-800 flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          
          {/* Bet Input & Presets (Col 7) */}
          <div className="sm:col-span-7 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.marginCapital || 'MODAL TARUHAN'}:</span>
              </span>
              <span className="font-mono text-slate-300">
                Saldo: <strong className="text-white">{formatMoney(cash)}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">$</span>
                <input
                  type="number"
                  disabled={gameState === 'FLYING' && isApedIn}
                  value={betAmount}
                  onChange={(e) => handleSetBet(parseFloat(e.target.value) || 0)}
                  min="0.1"
                  max={cash}
                  step="0.5"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-sm font-mono font-bold text-white outline-none focus:border-[#00FF88] transition-all disabled:opacity-50"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1">
                {[1, 5, 25].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    disabled={gameState === 'FLYING' && isApedIn}
                    onClick={() => handleSetBet(amt)}
                    className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-300 cursor-pointer transition-all disabled:opacity-50"
                  >
                    ${amt}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={gameState === 'FLYING' && isApedIn}
                  onClick={() => handleSetBet(cash * 0.5)}
                  className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-amber-400 cursor-pointer transition-all disabled:opacity-50"
                >
                  50%
                </button>
                <button
                  type="button"
                  disabled={gameState === 'FLYING' && isApedIn}
                  onClick={() => {
                    const maxAllowed = Math.floor(cash * 100) / 100;
                    setBetAmount(Math.max(0.1, maxAllowed));
                  }}
                  className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-300 border border-slate-700 cursor-pointer transition-all disabled:opacity-50"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Auto Cash-Out Optional Target */}
            <div className="flex items-center gap-2 pt-1 text-[11px]">
              <span className="text-slate-400">Auto Cash-Out:</span>
              <input
                type="number"
                placeholder="Misal 2.5x"
                value={autoCashOut}
                onChange={(e) => setAutoCashOut(e.target.value)}
                step="0.1"
                min="1.1"
                className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 font-mono text-white text-xs outline-none focus:border-[#00FF88]"
              />
              <span className="text-slate-500 text-[10px] font-mono">(Kosongkan jika manual)</span>
            </div>
          </div>

          {/* Action Button: Ape In vs Cash Out (Col 5) */}
          <div className="sm:col-span-5 flex flex-col justify-center">
            {gameState === 'FLYING' && isApedIn && !hasCashedOut ? (
              <button
                type="button"
                data-testid="meme-cash-out-btn"
                onClick={handleCashOut}
                className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-[#00FF88] to-emerald-400 hover:from-emerald-400 hover:to-[#00FF88] text-slate-950 font-black text-sm sm:text-base flex flex-col items-center justify-center gap-0.5 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer animate-pulse"
              >
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 stroke-[2.5]" />
                  <span>{t.memeCashOutBtn || 'CASH OUT SEKARANG'}</span>
                </div>
                <span className="text-xs font-mono font-bold">
                  +{formatMoney(potentialPayout)} ({multiplier.toFixed(2)}x)
                </span>
              </button>
            ) : isApedIn && hasCashedOut ? (
              <div className="w-full py-4 px-4 rounded-xl bg-emerald-950/80 border border-[#00FF88] text-[#00FF88] font-black text-center flex flex-col items-center justify-center">
                <span className="text-xs uppercase">{t.memeCashedOutSuccess || 'BERHASIL DIAMANKAN'}</span>
                <span className="text-base font-mono">+{formatMoney(betAmount * cashOutMultiplier)}</span>
              </div>
            ) : isApedIn && gameState === 'CRASHED' ? (
              <div className="w-full py-4 px-4 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-300 font-black text-center flex flex-col items-center justify-center">
                <span className="text-xs uppercase">RUGGED BY DEV</span>
                <span className="text-base font-mono">-{formatMoney(betAmount)}</span>
              </div>
            ) : !schedule.isOpen ? (
              <button
                type="button"
                data-testid="meme-ape-in-btn"
                disabled
                className="w-full py-4 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 font-black text-sm flex flex-col items-center justify-center gap-0.5 cursor-not-allowed opacity-75"
              >
                <div className="flex items-center gap-2 text-amber-400">
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>RADAR STANDBY ({formatCountdownMmSs(schedule.remainingCooldownMs)})</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 font-normal">
                  {t.memeRadarStandby || 'Menunggu sinyal fair launch berikutnya...'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                data-testid="meme-ape-in-btn"
                disabled={!canAfford || (isApedIn && gameState === 'WAITING')}
                onClick={handleApeIn}
                className={`w-full py-4 px-4 rounded-xl font-black text-sm sm:text-base flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer shadow-lg ${
                  isApedIn
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/50 shadow-emerald-950/20'
                    : isNextRoundQueued
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/60 active:scale-95'
                    : canAfford
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/30 active:scale-95 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  <span>
                    {isApedIn
                      ? '✓ SUDAH APE-IN'
                      : isNextRoundQueued
                      ? '✓ IKUT PUTARAN BERIKUTNYA'
                      : gameState === 'WAITING'
                      ? (t.memeApeInBtn || 'APE-IN TARUHAN')
                      : 'PASANG TARUHAN PUTARAN BERIKUTNYA'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold opacity-90">
                  {formatMoney(betAmount)} ({currentToken.symbol})
                  {gameState === 'WAITING' && !isApedIn && (
                    <span className="ml-1.5 text-amber-300 font-bold">({countdown}d)</span>
                  )}
                  {isNextRoundQueued && (
                    <span className="ml-1.5 text-amber-300 font-normal text-[10px]">(Klik untuk batal)</span>
                  )}
                </span>
              </button>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
