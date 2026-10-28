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
    <div className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${isUser ? 'bg-cyan-900/30 border border-cyan-500/30' : 'hover:bg-white/5'}`}>
      <span className={`w-7 text-center font-black text-sm ${rankColor}`}>
        {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank-1] : `#${entry.rank}`}
      </span>
      <span className="flex-1 text-sm font-semibold text-white truncate">
        @{entry.username}
        {isUser && <span className="ml-1 text-[10px] text-cyan-400">(kamu)</span>}
      </span>
      <span className="text-xs text-emerald-400 font-mono">{formatMoney(entry.peakNetWorth)}</span>
    </div>
  );
}

// ── Main SeasonBanner ─────────────────────────────────────────────────────────
export default function SeasonBanner({ currentUsername, seasonTrophies = [] }) {
  const [season, setSeason] = useState(null);
  const [msLeft, setMsLeft] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState('live');
  const [hallOfFame, setHallOfFame] = useState([]);
  const [hofLoading, setHofLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Fetch current season
  const fetchSeason = useCallback(async () => {
    try {
      const res = await fetch('/api/season/current');
      const data = await res.json();
      if (data.success && data.season) {
        setSeason(data.season);
        setMsLeft(data.season.timeLeft?.ms || 0);
      }
    } catch { /* silent */ }
  }, []);

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

  if (!season || dismissed) return null;

  const leaderboard = season.leaderboard || [];
  const myEntry = leaderboard.find(e => e.username === currentUsername);
  const isHMinus1 = msLeft > 0 && msLeft <= 24 * 3600000;
  const isUrgent = msLeft > 0 && msLeft < 3 * 3600000;

  return (
    <>
      {/* ── Compact Season Banner ── */}
      <div
        className={`relative flex items-center justify-between gap-2 px-3 py-1.5 text-xs rounded-lg border cursor-pointer select-none transition-all ${
          isUrgent
            ? 'bg-red-950/80 border-red-500/80 shadow-lg shadow-red-950/50 animate-pulse text-red-200'
            : isHMinus1
            ? 'bg-amber-950/70 border-amber-500/60 shadow-md shadow-amber-950/40 text-amber-200'
            : 'bg-slate-900/70 border-cyan-500/20 hover:border-cyan-400/40 text-slate-300'
        }`}
        onClick={() => setShowModal(true)}
        title="Klik untuk lihat leaderboard season"
      >
        <span className="flex items-center gap-1.5 font-bold">
          <span className={isUrgent ? 'animate-bounce' : ''}>{isUrgent ? '🚨' : isHMinus1 ? '⏳' : '🏆'}</span>
          <span className={isUrgent ? 'text-red-300' : isHMinus1 ? 'text-amber-300' : 'text-cyan-300'}>
            Season {season.number}
          </span>
        </span>
        <span className="flex items-center gap-1">
          {isUrgent ? (
            <span className="text-red-400 font-bold uppercase tracking-tight">Berakhir:</span>
          ) : isHMinus1 ? (
            <span className="text-amber-400 font-bold">H-1 Berakhir:</span>
          ) : (
            <span className="text-slate-400">Sisa:</span>
          )}
          <Countdown ms={msLeft} />
        </span>
        {myEntry && (
          <span className="hidden sm:flex items-center gap-1 text-slate-300">
            Rank kamu: <span className="font-bold text-white">#{myEntry.rank}</span>
          </span>
        )}
        <span className="text-slate-500 ml-1">▾</span>
      </div>

      {/* ── Leaderboard Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="relative w-full max-w-md bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-900/30 overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-black text-white">🏆 Season {season.number}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isHMinus1 ? 'Hitung Mundur Akhir: ' : 'Berakhir: '}
                    <Countdown ms={msLeft} /> &nbsp;|&nbsp; {leaderboard.length} peserta
                  </p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-xl leading-none">✕</button>
              </div>

              {/* H-1 Urgency Callout */}
              {isHMinus1 && (
                <div className={`mt-3 p-3 rounded-xl border text-xs font-mono flex items-center gap-2.5 ${
                  isUrgent
                    ? 'bg-rose-950/70 border-rose-500/70 text-rose-200 animate-pulse'
                    : 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                }`}>
                  <span className="text-xl">{isUrgent ? '🚨' : '⏳'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between font-bold">
                      <span>{isUrgent ? 'HITUNG MUNDUR PENUTUPAN!' : 'H-1 MENUJU RESET SEASON'}</span>
                      <span className="font-black font-mono tracking-wider"><Countdown ms={msLeft} /></span>
                    </div>
                    <p className="text-[11px] opacity-85 mt-0.5 leading-snug">
                      Saldo &amp; item akan di-reset saat waktu habis. Kunci posisi Peak Net Worth untuk raih Trophy &amp; Start Bonus!
                    </p>
                  </div>
                </div>
              )}

              {/* Top 3 podium */}
              {leaderboard.length >= 3 && (
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  {[leaderboard[1], leaderboard[0], leaderboard[2]].map((e, i) => {
                    const heights = ['h-14','h-20','h-10'];
                    const icons = ['🥈','🥇','🥉'];
                    const idx = [1,0,2][i];
                    return (
                      <div key={e.userId} className="flex flex-col items-center justify-end gap-1">
                        <span className="font-bold text-white truncate max-w-full">@{e.username}</span>
                        <span className="text-emerald-400 font-mono">{formatMoney(e.peakNetWorth)}</span>
                        <div className={`w-full ${heights[i]} rounded-t-md flex items-center justify-center text-lg font-black ${idx===0?'bg-yellow-500/20 border-t-2 border-yellow-400':idx===1?'bg-slate-500/20 border-t-2 border-slate-400':'bg-amber-800/20 border-t-2 border-amber-600'}`}>
                          {icons[i]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tab switch */}
            <div className="flex border-b border-slate-800">
              {[['live','📊 Live Rankings'],['hof','🏛️ Hall of Fame'],['mytrophies','🎖️ Trofi Kamu']].map(([k,label]) => (
                <button key={k} onClick={() => setTab(k)}
                  className={`flex-1 py-2 text-xs font-semibold transition-colors ${tab===k ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20' : 'text-slate-400 hover:text-white'}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-4 max-h-72 overflow-y-auto space-y-1">
              {tab === 'live' && (
                leaderboard.length === 0
                  ? <p className="text-center text-slate-500 py-8 text-sm">Belum ada data. Mulai trading!</p>
                  : leaderboard.map(e => <TrophyRow key={e.userId} entry={e} isUser={e.username === currentUsername} />)
              )}

              {tab === 'hof' && (
                hofLoading
                  ? <p className="text-center text-slate-500 py-8 text-sm animate-pulse">Memuat…</p>
                  : hallOfFame.filter(s => !s.isActive).length === 0
                    ? <p className="text-center text-slate-500 py-8 text-sm">Belum ada season yang selesai.</p>
                    : hallOfFame.filter(s => !s.isActive).map(s => (
                        <div key={s.id} className="mb-3">
                          <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wide">Season {s.number} — {new Date(s.resetAt||s.endDate).toLocaleDateString('id-ID')}</p>
                          {(s.leaderboard||[]).slice(0,3).map(e => <TrophyRow key={e.userId} entry={e} isUser={e.username===currentUsername} />)}
                        </div>
                      ))
              )}

              {tab === 'mytrophies' && (
                seasonTrophies.length === 0
                  ? <p className="text-center text-slate-500 py-8 text-sm">Belum ada trophy. Jadilah Top 10% di akhir season!</p>
                  : [...seasonTrophies].reverse().map((t, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5">
                        <span className="text-lg">{t.trophy?.split(' ')[0] || '🎖️'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{t.trophy}</p>
                          {t.title && <p className="text-[10px] text-cyan-400">{t.title}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-emerald-400 font-mono">{formatMoney(t.peakNetWorth)}</p>
                          <p className="text-[10px] text-slate-500">S{t.season} • {t.date}</p>
                        </div>
                      </div>
                    ))
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
              <span>🥇+$100 &nbsp; 🥈+$50 &nbsp; 🥉+$25 bonus modal start season baru</span>
              <button onClick={() => { setShowModal(false); setDismissed(true); }} className="text-slate-600 hover:text-slate-400">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
