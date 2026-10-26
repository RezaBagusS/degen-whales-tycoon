'use client';

import React, { useState, useEffect } from 'react';
import {
  Flame,
  Coins,
  Compass,
  ShieldAlert,
  Percent,
  TrendingUp,
  Crown,
  CheckCircle2,
  Lock,
  Clock,
  Sparkles,
  X,
  Gift,
  AlertTriangle,
  User,
  ShieldCheck,
  Award
} from 'lucide-react';
import { DAILY_STREAK_REWARDS, evaluateStreakStatus } from '../../lib/dailyStreak';

const renderRewardIcon = (iconName, className) => {
  switch (iconName) {
    case 'Coins':
      return <Coins className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    case 'ShieldAlert':
      return <ShieldAlert className={className} />;
    case 'Percent':
      return <Percent className={className} />;
    case 'TrendingUp':
      return <TrendingUp className={className} />;
    case 'Crown':
      return <Crown className={className} />;
    default:
      return <Gift className={className} />;
  }
};

export default function DailyStreakModal({
  isOpen,
  onClose,
  streakState,
  onClaim,
  onRescueStreak,
  whaleTokens = 0,
  currentUser = null,
  language = 'id'
}) {
  const [countdown, setCountdown] = useState('');

  const statusInfo = evaluateStreakStatus(streakState);
  const currentDay = statusInfo.currentDay;
  const canClaim = statusInfo.canClaim;
  const isMissed = statusInfo.isMissed && (streakState?.streakCount || 0) > 0;

  // Live countdown to next calendar day
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = Math.max(0, tomorrow.getTime() - now.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-[#111622] via-[#0B0E14] to-[#07090E] border border-amber-500/30 rounded-2xl max-w-2xl w-full p-4 sm:p-5 shadow-2xl relative overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Background ambient lighting */}
        <div className="absolute -right-20 -top-20 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80 relative z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/40 text-amber-400">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                  DAILY LOGIN STREAK
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>{streakState?.streakCount || 0} HARI</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Disiplin login setiap hari untuk raih reward taktis &amp; Grand Whale Jackpot di Hari 7!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="space-y-3 py-3 overflow-y-auto pr-0.5 flex-1 relative z-10 no-scrollbar">
          {/* Streak Lost Alert Banner */}
          {isMissed && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-600/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  Streak Anda terputus karena kemarin tidak login!
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                {whaleTokens >= 3 ? (
                  <button
                    onClick={onRescueStreak}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all cursor-pointer w-full sm:w-auto justify-center"
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>Pulihkan (3 $WHALE)</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono">
                    Reset ke Hari 1
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 7 Days Balanced Proportional Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {DAILY_STREAK_REWARDS.map((item) => {
              const dayNum = item.day;
              const isPastClaimed = (statusInfo.status === 'claimed_today' && dayNum <= currentDay) ||
                (statusInfo.status === 'ready_to_claim' && dayNum < currentDay);
              const isCurrentReady = statusInfo.status === 'ready_to_claim' && dayNum === currentDay;
              const isGrandDay = dayNum === 7;

              if (isGrandDay) {
                // Day 7: Featured 2-column wide card that balances the grid
                return (
                  <div
                    key={item.day}
                    className={`col-span-2 p-3 rounded-xl border relative transition-all flex flex-col justify-between ${
                      isCurrentReady
                        ? 'bg-gradient-to-br from-amber-950/50 via-slate-900 to-amber-900/30 border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-950/60'
                        : isPastClaimed
                        ? 'bg-slate-950/50 border-emerald-500/40 opacity-75'
                        : 'bg-gradient-to-br from-amber-950/20 via-[#0B0E14] to-[#0D111A] border-amber-500/30 hover:border-amber-400/50'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-1 w-full mb-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-mono font-black px-2 py-0.5 rounded ${
                            isCurrentReady
                              ? 'bg-amber-400 text-slate-950 shadow-sm'
                              : isPastClaimed
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {item.badgeText}
                        </span>
                        <span className="text-[10px] font-bold text-amber-400/80 font-mono">
                          HARI 7
                        </span>
                      </div>

                      {isPastClaimed ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>KLAIM</span>
                        </span>
                      ) : isCurrentReady ? (
                        <span className="flex items-center gap-1 text-[10px] text-amber-300 font-bold animate-pulse">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>HARI INI</span>
                        </span>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </div>

                    {/* Featured Body */}
                    <div className="flex items-center gap-3 my-1.5 py-1">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                        style={{
                          backgroundColor: `${item.color}20`,
                          borderColor: `${item.color}60`,
                          borderWidth: 1
                        }}
                      >
                        {renderRewardIcon(item.iconName, 'w-6 h-6 text-amber-400')}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-extrabold text-amber-300 leading-tight">
                          {item.title}
                        </div>
                        <div className="text-[11px] font-mono font-semibold text-slate-200 mt-0.5">
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    {/* Grand Prize Footer Badge */}
                    <div className="pt-1.5 border-t border-amber-500/20 flex items-center justify-between text-[9px] font-mono font-bold text-amber-400">
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>GELAR: DISCIPLINED DEGEN</span>
                      </span>
                      <span className="text-amber-300/80 uppercase">
                        250X TICKET + 1 $WHALE
                      </span>
                    </div>
                  </div>
                );
              }

              // Days 1 to 6: Proportional unified cards
              return (
                <div
                  key={item.day}
                  className={`p-2.5 sm:p-3 rounded-xl border relative transition-all flex flex-col justify-between min-h-[142px] ${
                    isCurrentReady
                      ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-amber-400 ring-2 ring-amber-400/30 shadow-lg shadow-amber-950/50'
                      : isPastClaimed
                      ? 'bg-slate-950/40 border-emerald-500/30 opacity-70'
                      : 'bg-[#0B0E14] border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  {/* Top Badge & Status */}
                  <div className="flex items-center justify-between gap-1 w-full mb-1">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isCurrentReady
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : isPastClaimed
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badgeText}
                    </span>

                    {isPastClaimed ? (
                      <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 font-bold font-mono">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>KLAIM</span>
                      </span>
                    ) : isCurrentReady ? (
                      <span className="flex items-center gap-1 text-[10px] text-amber-300 font-bold animate-pulse">
                        <Sparkles className="w-3 h-3" />
                        <span>HARI INI</span>
                      </span>
                    ) : (
                      <Lock className="w-3 h-3 text-slate-600" />
                    )}
                  </div>

                  {/* Icon & Title */}
                  <div className="text-center my-auto py-1">
                    <div
                      className="w-9 h-9 rounded-xl mx-auto flex items-center justify-center mb-1.5 transition-transform"
                      style={{
                        backgroundColor: `${item.color}15`,
                        borderColor: `${item.color}40`,
                        borderWidth: 1
                      }}
                    >
                      {renderRewardIcon(item.iconName, 'w-4 h-4')}
                    </div>
                    <div className="text-xs font-bold text-white leading-tight">
                      {item.title}
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-mono font-semibold text-slate-300 mt-0.5 leading-snug">
                      {item.desc}
                    </div>
                  </div>

                  {/* Bottom Type indicator */}
                  <div className="mt-1 pt-1 border-t border-slate-800/60 text-center">
                    <span className="text-[9px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                      {item.rewardType === 'cash'
                        ? 'CASH REWARD'
                        : item.rewardType === 'buff'
                        ? 'TIMED BUFF'
                        : 'TACTICAL ITEM'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Guest / Anon Warning Banner */}
          {!currentUser && (
            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-slate-300 text-[11px] sm:text-xs">
                  <strong className="text-white">Akun Tamu (Offline):</strong> Streak tersimpan di browser ini. Tautkan akun agar streak aman lintas perangkat!
                </span>
              </div>
              <a
                href="/auth?mode=register"
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shrink-0 transition-all shadow-sm w-full sm:w-auto text-center cursor-pointer"
              >
                Buat Akun Cloud ↗
              </a>
            </div>
          )}
        </div>

        {/* Modal Footer / Action Button */}
        <div className="pt-3 border-t border-slate-800/80 relative z-10 shrink-0 space-y-2">
          {canClaim ? (
            <button
              onClick={() => onClaim(currentDay)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 font-black text-sm tracking-wide uppercase shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <Gift className="w-4 h-4 text-slate-950" />
              <span>Klaim Hadiah Hari ke-{currentDay} Sekarang!</span>
            </button>
          ) : (
            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5 flex-wrap">
                <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Hadiah Hari ke-{statusInfo.nextDay} siap diklaim dalam:</span>
                <span className="font-mono font-bold text-white text-sm bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {countdown}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
