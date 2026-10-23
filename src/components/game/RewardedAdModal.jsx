'use client';

import React, { useState, useEffect } from 'react';
import { Play, Sparkles, CheckCircle2, X, ExternalLink } from 'lucide-react';
import { ADS_CONFIG } from '../../config/adsConfig';

export default function RewardedAdModal({
  isOpen,
  onClose,
  onRewardComplete,
  rewardTitle = 'Dana Talangan 20%',
  rewardAmountFormatted = '$10.00'
}) {
  const duration = ADS_CONFIG.simulator.durationSec || 5;
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(duration);
      setIsFinished(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, duration]);

  if (!isOpen) return null;

  const progressPct = Math.round(((duration - timeLeft) / duration) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B0E14] border-2 border-amber-500/60 rounded-2xl max-w-lg w-full overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Ad Header */}
        <div className="px-4 py-3 bg-[#111622] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold border border-amber-500/40 animate-pulse">
              SPONSORED REWARDED AD
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Mendanai {rewardTitle}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {!isFinished && (
              <span className="text-xs font-mono font-bold text-amber-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700">
                Selesai dalam {timeLeft}s
              </span>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup (Batal Klaim)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video / Creative Simulation Area */}
        <div className="relative bg-gradient-to-br from-[#060A14] via-[#0F172A] to-[#1E1B4B] p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[240px] overflow-hidden">
          {/* Cyberpunk Scanlines */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,136,0.08)_0%,transparent_70%)] pointer-events-none" />

          {/* Sponsor Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-400/40 flex items-center justify-center mb-4 shadow-xl shadow-amber-500/10 animate-bounce">
            <Sparkles className="w-8 h-8 text-amber-400" />
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase">
            {ADS_CONFIG.mode === 'monetag'
              ? 'Monetag Ad Network'
              : ADS_CONFIG.simulator.sponsorName}
          </h3>
          <p className="text-xs text-slate-300 max-w-sm mt-1.5 leading-relaxed">
            {ADS_CONFIG.mode === 'monetag'
              ? 'Tonton sponsor resmi untuk mencairkan hadiah talangan darurat Anda.'
              : ADS_CONFIG.simulator.sponsorTagline}
          </p>

          <div className="mt-4 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs font-mono text-emerald-400 flex items-center gap-2">
            <span>🎁 Hadiah Ditonton:</span>
            <strong>+{rewardAmountFormatted}</strong>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-400 to-[#00FF88] h-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Action Bottom Bar */}
        <div className="p-4 bg-[#111622] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            {isFinished
              ? '✓ Iklan selesai! Saldo talangan siap dicairkan.'
              : 'Tonton hingga akhir untuk mencairkan talangan.'}
          </div>

          {isFinished ? (
            <button
              onClick={() => {
                if (ADS_CONFIG.mode === 'monetag' && ADS_CONFIG.monetag.directLinkUrl) {
                  try {
                    window.open(ADS_CONFIG.monetag.directLinkUrl, '_blank', 'noopener,noreferrer');
                  } catch {
                    // Fallback if popup blocked
                  }
                }
                onRewardComplete();
                onClose();
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00FF88] to-emerald-400 hover:from-emerald-400 hover:to-[#00FF88] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer animate-pulse"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Klaim {rewardAmountFormatted} Sekarang</span>
            </button>
          ) : (
            <button
              disabled
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs uppercase tracking-wider cursor-not-allowed border border-slate-700"
            >
              Menonton ({timeLeft}s)...
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
