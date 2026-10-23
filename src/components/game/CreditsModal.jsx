'use client';

import React from 'react';
import { Award, Heart, ExternalLink, X, Sparkles, Terminal, Code2, Users, Cpu } from 'lucide-react';
import { ADS_CONFIG } from '../../config/adsConfig';

export default function CreditsModal({ isOpen, onClose, language = 'id' }) {
  if (!isOpen) return null;

  const isEn = language === 'en';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B0E14] border-2 border-emerald-500/40 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,255,136,0.15)] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#111622] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/30">
              <Award className="w-5 h-5 text-[#00FF88]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>{isEn ? 'Game Credits & About' : 'Kredit Game & Pengembang'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-emerald-500/30">
                  v1.3.1
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                DEGEN & WHALE — Cyberpunk Solana Trading Simulator
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isEn ? 'Close' : 'Tutup'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-300">
          
          {/* Lead Creator Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-[#111622] border border-emerald-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00FF88] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                {isEn ? 'CREATOR & LEAD DEVELOPER' : 'PENCIPTA & LEAD DEVELOPER'}
              </span>
              <Terminal className="w-4 h-4 text-emerald-400 opacity-60" />
            </div>

            <div className="text-base font-black text-white flex items-center gap-2">
              <span>Reza Bagus</span>
              <span className="text-xs font-mono font-normal text-slate-400">(@rezabaguss)</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {isEn
                ? 'Game Concept, Core Simulator Mechanics, Market Simulation Algorithm & Full-Stack Development.'
                : 'Konsep Game, Mekanika Simulator Trading, Algoritma Pasar & Pengembangan Full-Stack.'}
            </p>
          </div>

          {/* Credits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Tech Stack & Audio */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-1.5 text-white font-bold mb-1">
                <Cpu className="w-3.5 h-3.5 text-[#00FF88]" />
                <span>{isEn ? 'Engine & Tech' : 'Teknologi & Engine'}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Next.js App Router, React 19, Canvas 2D Living Candle Physics, Web Audio API Synth Engine.
              </p>
            </div>

            {/* Design & Dioramas */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-1.5 text-white font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isEn ? 'Art & Aesthetics' : 'Seni & Diorama'}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                7 Tiers Cyberpunk Workstation Evolution, Live Rocket Launchpad, Matrix & Neon UI/UX.
              </p>
            </div>
          </div>

          {/* Special Thanks Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-white font-bold mb-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isEn ? 'Special Thanks' : 'Ucapan Terima Kasih Khusus'}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isEn
                ? 'To all early Solana degens, meme traders who survived rugpulls, and diamond hands chasing the Sovereign Whale status.'
                : 'Untuk semua trader degen Solana, pencari cuan pump.fun yang bertahan dari rugpull, serta para diamond hands pemburu status Sovereign Whale.'}
            </p>
          </div>

          {/* Support Developer via Saweria */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-amber-400 fill-amber-400/40" />
                <span>{isEn ? 'Support the Creator' : 'Dukung / Traktir Pembuat Game'}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isEn
                  ? 'Appreciate the game? Buy the developer a coffee via Saweria (QRIS, GoPay, OVO, Dana).'
                  : 'Suka dengan gamenya? Traktir kopi developer via Saweria (QRIS, GoPay, Dana, OVO).'}
              </p>
            </div>

            <a
              href={ADS_CONFIG.donation.saweriaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <span>saweria.co/rezabaguss</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#111622] border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-mono text-slate-400">
            &copy; 2026 DEGEN & WHALE &bull; Reza Bagus
          </span>
          <button
            data-testid="btn-close-credits"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            {isEn ? 'Close' : 'Tutup'}
          </button>
        </div>

      </div>
    </div>
  );
}
