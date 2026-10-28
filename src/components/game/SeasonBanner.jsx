'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Utility ───────────────────────────────────────────────────────────────────
function formatMoney(v) {
  if (!v && v !== 0) return '$0.00';
  const abs = Math.abs(v);
  if (abs >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `$${(v / 1e3).toFixed(2)}K`;
  return `$${Number(v).toFixed(2)}`;
}

function pad(n) { return String(n).padStart(2, '0'); }

function Countdown({ ms }) {
  if (ms <= 0) return <span className="text-rose-400 font-bold">SEDANG DI-RESET…</span>;
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (d > 0) return <span>{d}h {pad(h)}j {pad(m)}m</span>;
  // H-1 (under 24 hours): live ticking countdown
  return (
    <span className={ms < 3 * 3600000 ? 'text-rose-400 font-mono font-black animate-pulse' : 'text-amber-400 font-mono font-bold'}>
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}

// ── Trophy badge ──────────────────────────────────────────────────────────────
function TrophyRow({ entry, isUser }) {
  const rankColors = ['text-yellow-400', 'text-slate-300', 'text-amber-600'];
  const rankColor = entry.rank <= 3 ? rankColors[entry.rank - 1] : 'text-slate-400';
  return (
    <div className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg transition-colors ${isUser ? 'bg-cyan-900/30 border border-cyan-500/30' : 'hover:bg-white/5'}`}>
      <span className={`w-6 sm:w-7 text-center font-black text-xs sm:text-sm shrink-0 ${rankColor}`}>
        {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank-1] : `#${entry.rank}`}
      </span>
      <span className="flex-1 text-xs sm:text-sm font-semibold text-white truncate min-w-0">
        @{entry.username}
        {isUser && <span className="ml-1 text-[10px] text-cyan-400 shrink-0">(kamu)</span>}
      </span>
      <span className="text-[11px] sm:text-xs text-emerald-400 font-mono font-bold shrink-0">{formatMoney(entry.peakNetWorth)}</span>
    </div>
  );
}

// ── Main SeasonBanner ─────────────────────────────────────────────────────────
export default function SeasonBanner({
  currentUsername,
  seasonTrophies = [],
  externalOpen = false,
  onExternalOpenChange = null,
  onSeasonLoaded = null
}) {
  const [season, setSeason] = useState(null);
  const [msLeft, setMsLeft] = useState(0);
  const [internalShowModal, setInternalShowModal] = useState(false);
  const [tab, setTab] = useState('live');
  const [hallOfFame, setHallOfFame] = useState([]);
  const [hofLoading, setHofLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const showModal = onExternalOpenChange ? externalOpen : internalShowModal;
  const setShowModal = useCallback((val) => {
    if (onExternalOpenChange) {
      onExternalOpenChange(val);
    } else {
      setInternalShowModal(val);
    }
  }, [onExternalOpenChange]);

  // Fetch current season
  const fetchSeason = useCallback(async () => {
    try {
      const res = await fetch('/api/season/current');
      const data = await res.json();
      if (data.success && data.season) {
        setSeason(data.season);
        setMsLeft(data.season.timeLeft?.ms || 0);
        onSeasonLoaded?.(data.season);
      }
    } catch { /* silent */ }
  }, [onSeasonLoaded]);

  useEffect(() => { fetchSeason(); }, [fetchSeason]);

  // Live countdown tick
  useEffect(() => {
    if (!season) return;
    const t = setInterval(() => setMsLeft(prev => Math.max(0, prev - 1000)), 1000);
    return () => clearInterval(t);
  }, [season]);

  // Refresh leaderboard every 60s
  useEffect(() => {
    const t = setInterval(fetchSeason, 60000);
    return () => clearInterval(t);
  }, [fetchSeason]);

  // Load Hall of Fame when tab switches
  const loadHof = useCallback(async () => {
    if (hofLoading || hallOfFame.length) return;
    setHofLoading(true);
    try {
      const res = await fetch('/api/season/leaderboard');
      const data = await res.json();
      if (data.success) setHallOfFame(data.seasons || []);
    } catch { /* silent */ }
    finally { setHofLoading(false); }
  }, [hofLoading, hallOfFame.length]);

  useEffect(() => {
    if (showModal && tab === 'hof') loadHof();
  }, [showModal, tab, loadHof]);

  if (!season) return null;

  const leaderboard = season.leaderboard || [];
  const myEntry = leaderboard.find(e => e.username === currentUsername);
  const isHMinus1 = msLeft > 0 && msLeft <= 24 * 3600000;
  const isUrgent = msLeft > 0 && msLeft < 3 * 3600000;

  return (
    <>
      {/* ── Compact Season Banner (Mobile & iPhone XR Optimized) ── */}
      {!dismissed && (
        <div
          className={`relative flex items-center justify-between gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs rounded-lg border cursor-pointer select-none transition-all ${
          isUrgent
            ? 'bg-red-950/80 border-red-500/80 shadow-lg shadow-red-950/50 animate-pulse text-red-200'
            : isHMinus1
            ? 'bg-amber-950/70 border-amber-500/60 shadow-md shadow-amber-950/40 text-amber-200'
            : 'bg-slate-900/70 border-cyan-500/20 hover:border-cyan-400/40 text-slate-300'
        }`}
        onClick={() => setShowModal(true)}
        title="Klik untuk lihat leaderboard season"
      >
        <span className="flex items-center gap-1 sm:gap-1.5 font-bold shrink-0">
          <span className={isUrgent ? 'animate-bounce' : ''}>{isUrgent ? '🚨' : isHMinus1 ? '⏳' : '🏆'}</span>
          <span className={isUrgent ? 'text-red-300' : isHMinus1 ? 'text-amber-300' : 'text-cyan-300'}>
            <span className="sm:inline hidden">Season </span>
            <span>S{season.number}</span>
          </span>
        </span>
        <span className="flex items-center gap-1 font-mono text-[10px] sm:text-xs truncate">
          {isUrgent ? (
            <span className="text-red-400 font-bold uppercase tracking-tight shrink-0">Akhir:</span>
          ) : isHMinus1 ? (
            <span className="text-amber-400 font-bold shrink-0">H-1:</span>
          ) : (
            <span className="text-slate-400 shrink-0">Sisa:</span>
          )}
          <Countdown ms={msLeft} />
        </span>
        {myEntry && (
          <span className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-300 shrink-0">
            <span className="hidden xs:inline text-slate-400">Rank:</span>
            <span className="font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-1 rounded font-mono">#{myEntry.rank}</span>
          </span>
        )}
        <span className="text-slate-500 text-xs shrink-0">▾</span>
        </div>
      )}

      {/* ── Leaderboard Modal (Responsive bottom-sheet / modal for iPhone XR) ── */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div
            className="relative w-full max-w-md bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-900/30 overflow-hidden flex flex-col max-h-[88vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-3.5 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                    <span>🏆</span> Season {season.number}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                    {isHMinus1 ? 'Hitung Mundur: ' : 'Berakhir: '}
                    <Countdown ms={msLeft} /> &nbsp;|&nbsp; {leaderboard.length} peserta
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 -mr-1 -mt-1 text-slate-400 hover:text-white text-lg leading-none rounded-lg active:bg-white/10"
                  aria-label="Tutup modal"
                >
                  ✕
                </button>
              </div>

              {/* H-1 Urgency Callout */}
              {isHMinus1 && (
                <div className={`mt-2.5 sm:mt-3 p-2.5 sm:p-3 rounded-xl border text-[11px] sm:text-xs font-mono flex items-center gap-2 ${
                  isUrgent
                    ? 'bg-rose-950/70 border-rose-500/70 text-rose-200 animate-pulse'
                    : 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                }`}>
                  <span className="text-lg shrink-0">{isUrgent ? '🚨' : '⏳'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between font-bold">
                      <span className="truncate">{isUrgent ? 'PENUTUPAN SEASON!' : 'H-1 MENUJU RESET'}</span>
                      <span className="font-black font-mono tracking-wider shrink-0"><Countdown ms={msLeft} /></span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] opacity-85 mt-0.5 leading-snug">
                      Saldo &amp; item di-reset saat waktu habis. Kunci posisi rank sekarang!
                    </p>
                  </div>
                </div>
              )}

              {/* Top 3 podium */}
              {leaderboard.length >= 3 && (
                <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-xs">
                  {[leaderboard[1], leaderboard[0], leaderboard[2]].map((e, i) => {
                    const heights = ['h-11 sm:h-14', 'h-15 sm:h-20', 'h-8 sm:h-10'];
                    const icons = ['🥈','🥇','🥉'];
                    const idx = [1,0,2][i];
                    return (
                      <div key={e.userId} className="flex flex-col items-center justify-end gap-1 min-w-0">
                        <span className="font-bold text-white truncate max-w-full text-[10px] sm:text-xs">@{e.username}</span>
                        <span className="text-emerald-400 font-mono text-[10px] sm:text-xs font-bold">{formatMoney(e.peakNetWorth)}</span>
                        <div className={`w-full ${heights[i]} rounded-t-md flex items-center justify-center text-base sm:text-lg font-black ${idx===0?'bg-yellow-500/20 border-t-2 border-yellow-400':idx===1?'bg-slate-500/20 border-t-2 border-slate-400':'bg-amber-800/20 border-t-2 border-amber-600'}`}>
                          {icons[i]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tab switch (iPhone XR friendly labels with Info tab) */}
            <div className="flex border-b border-slate-800 bg-slate-950/40 shrink-0">
              {[
                ['live', '📊 Live', '📊 Live Rankings'],
                ['info', 'ℹ️ Info', 'ℹ️ Aturan & Hadiah'],
                ['hof', '🏛️ History', '🏛️ Hall of Fame'],
                ['mytrophies', '🎖️ Trofi', '🎖️ Trofi Kamu']
              ].map(([k, shortLabel, fullLabel]) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`flex-1 py-2 sm:py-2.5 text-xs font-semibold transition-colors text-center ${
                    tab === k
                      ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="sm:hidden">{shortLabel}</span>
                  <span className="hidden sm:inline">{fullLabel}</span>
                </button>
              ))}
            </div>

            {/* Tab content (scrollable on mobile) */}
            <div className="p-3 sm:p-4 flex-1 overflow-y-auto space-y-2 overscroll-contain">
              {tab === 'info' && (
                <div className="space-y-3 font-mono text-xs text-slate-300 p-1">
                  {/* Card 1: Konsep Season */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center gap-2 font-bold text-white mb-1.5">
                      <span className="text-sm">🏆</span>
                      <span>Apa itu Season &amp; Prestige?</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Setiap Season berdurasi tertentu. Seluruh pemain bersaing mencetak rekor <strong className="text-emerald-400">Peak Net Worth</strong> tertinggi dari akumulasi hasil trading di <strong className="text-cyan-300">Semua Ticker</strong> (BTC, ETH, SOL, Meme Launchpad, dll.).
                    </p>
                  </div>

                  {/* Card 2: Mekanisme Reset */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center gap-2 font-bold text-white mb-1.5">
                      <span className="text-sm">🔄</span>
                      <span>Mekanisme Reset Akhir Season</span>
                    </div>
                    <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                      <li><strong className="text-white">Modal Cash</strong>: Kembali ke $10 (+ bonus modal juara).</li>
                      <li><strong className="text-white">Item &amp; Equipment</strong>: Di-reset ke level 1 untuk keadilan pemain baru.</li>
                      <li><strong className="text-white">Trophy &amp; Gelar</strong>: <span className="text-cyan-400 font-bold">100% Permanen</span> tersimpan abadi di tab Trofi Kamu &amp; Hall of Fame!</li>
                    </ul>
                  </div>

                  {/* Card 3: Struktur Hadiah */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center gap-2 font-bold text-white mb-2">
                      <span className="text-sm">🎁</span>
                      <span>Hadiah &amp; Kehormatan Peringkat</span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between items-center text-yellow-400">
                        <span>🥇 Juara 1 (Grand Whale)</span>
                        <span className="font-bold">+$100 Start Bonus</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span>🥈 Juara 2 (Silver Shark)</span>
                        <span className="font-bold">+$50 Start Bonus</span>
                      </div>
                      <div className="flex justify-between items-center text-amber-600">
                        <span>🥉 Juara 3 (Bronze Degen)</span>
                        <span className="font-bold">+$25 Start Bonus</span>
                      </div>
                      <div className="flex justify-between items-center text-cyan-400">
                        <span>⭐ Top 10% (Season Veteran)</span>
                        <span className="font-bold">+$5 Start Bonus</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Tips Skor High-Water Mark */}
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-emerald-300">
                    <strong className="text-emerald-400">💡 Tips:</strong> Peringkat menggunakan sistem <span className="underline">Peak Net Worth</span> (rekor tertinggi). Jika setelah profit saldo Anda turun atau terlikuidasi, skor puncak Anda di leaderboard tetap aman tidak berkurang!
                  </div>
                </div>
              )}
              {tab === 'live' && (
                leaderboard.length === 0
                  ? <p className="text-center text-slate-500 py-8 text-xs sm:text-sm">Belum ada data. Mulai trading!</p>
                  : leaderboard.map(e => <TrophyRow key={e.userId} entry={e} isUser={e.username === currentUsername} />)
              )}

              {tab === 'hof' && (
                hofLoading
                  ? <p className="text-center text-slate-500 py-8 text-xs sm:text-sm animate-pulse">Memuat…</p>
                  : hallOfFame.filter(s => !s.isActive).length === 0
                    ? <p className="text-center text-slate-500 py-8 text-xs sm:text-sm">Belum ada season yang selesai.</p>
                    : hallOfFame.filter(s => !s.isActive).map(s => (
                        <div key={s.id} className="mb-3">
                          <p className="text-[11px] sm:text-xs text-slate-500 font-bold mb-1 uppercase tracking-wide">
                            Season {s.number} — {new Date(s.resetAt || s.endDate).toLocaleDateString('id-ID')}
                          </p>
                          {(s.leaderboard || []).slice(0,3).map(e => (
                            <TrophyRow key={e.userId} entry={e} isUser={e.username === currentUsername} />
                          ))}
                        </div>
                      ))
              )}

              {tab === 'mytrophies' && (
                seasonTrophies.length === 0
                  ? <p className="text-center text-slate-500 py-8 text-xs sm:text-sm">Belum ada trophy. Jadilah Top 10% di akhir season!</p>
                  : [...seasonTrophies].reverse().map((t, i) => (
                      <div key={i} className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-lg bg-white/5">
                        <span className="text-base sm:text-lg shrink-0">{t.trophy?.split(' ')[0] || '🎖️'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{t.trophy}</p>
                          {t.title && <p className="text-[10px] text-cyan-400 truncate">{t.title}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] sm:text-[11px] text-emerald-400 font-mono font-bold">{formatMoney(t.peakNetWorth)}</p>
                          <p className="text-[9px] sm:text-[10px] text-slate-500">S{t.season} • {t.date}</p>
                        </div>
                      </div>
                    ))
              )}
            </div>

            {/* Footer hint with Safe-Area support for iPhone XR */}
            <div className="px-3.5 sm:px-4 py-2 sm:py-2.5 border-t border-slate-800 flex items-center justify-between text-[10px] sm:text-xs text-slate-400 bg-slate-950/60 shrink-0 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
              <span className="truncate mr-2">🥇+$100 &nbsp; 🥈+$50 &nbsp; 🥉+$25 start bonus</span>
              <button
                onClick={() => { setShowModal(false); setDismissed(true); }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-medium shrink-0 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
