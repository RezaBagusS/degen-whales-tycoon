'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Users,
  Activity,
  DollarSign,
  TrendingUp,
  Cpu,
  RefreshCw,
  Search,
  ExternalLink,
  Lock,
  LogOut,
  Clock,
  Database,
  Radio,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Server,
  Layers,
  Sparkles
} from 'lucide-react';

const LOCATION_NAMES = {
  1: 'Kamar Kos Sempit',
  2: 'Warnet VIP 24 Jam',
  3: 'Ruko Glodok 2 Lantai',
  4: 'Penthouse Office SCBD',
  5: 'Private Island Whale',
  6: 'Moon Shadow Citadel',
  7: 'Singularity Architect'
};

const formatMoney = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '$0.00';
  const num = Number(val);
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function AdminDashboard() {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'players' | 'risk' | 'apm'
  const [autoRefreshSec, setAutoRefreshSec] = useState(10);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchPlayer, setSearchPlayer] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [, startTransition] = useTransition();

  // Load saved admin key from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = sessionStorage.getItem('degen_admin_key');
      if (savedKey) {
        setAdminKey(savedKey);
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Fetch metrics function
  const fetchMetrics = useCallback(async (keyToUse = adminKey) => {
    if (!keyToUse) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/metrics?key=${encodeURIComponent(keyToUse)}`);
      if (res.status === 401) {
        setIsAuthenticated(false);
        setAuthError('Kunci Admin tidak valid! Periksa kembali ADMIN_SECRET_KEY Anda.');
        sessionStorage.removeItem('degen_admin_key');
        setLoading(false);
        return;
      }
      const json = await res.json();
      if (json.success) {
        startTransition(() => {
          setData(json);
          setLastUpdated(new Date());
          setIsAuthenticated(true);
          setAuthError('');
        });
      } else {
        setAuthError(json.error || 'Gagal memuat data telemetri');
      }
    } catch (err) {
      setAuthError('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  // Initial fetch on authenticated
  useEffect(() => {
    if (isAuthenticated && adminKey) {
      fetchMetrics(adminKey);
    }
  }, [isAuthenticated, adminKey, fetchMetrics]);

  // Auto-refresh timer
  useEffect(() => {
    if (!isAuthenticated || autoRefreshSec <= 0) return;
    const interval = setInterval(() => {
      fetchMetrics(adminKey);
    }, autoRefreshSec * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefreshSec, adminKey, fetchMetrics]);

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (!adminKey.trim()) {
      setAuthError('Silakan masukkan Secret Key Admin');
      return;
    }
    sessionStorage.setItem('degen_admin_key', adminKey.trim());
    fetchMetrics(adminKey.trim());
  };

  const handleLogout = () => {
    sessionStorage.removeItem('degen_admin_key');
    setAdminKey('');
    setIsAuthenticated(false);
    setData(null);
  };

  // If not authenticated, render Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0B0F19] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-amber-500" />
          
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/10">
              <Lock className="w-7 h-7 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold font-mono tracking-tight text-white">DEGEN &amp; WHALE OPS</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">Platform Telemetry &amp; Live Monitoring Center</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold block mb-1.5">
                Admin Secret Key
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Masukkan Secret Key..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white font-mono text-sm outline-none transition-all placeholder:text-slate-600"
                autoFocus
              />
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                Default dev key: <code className="text-emerald-400/80">degen_admin_2026</code>
              </span>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm uppercase font-mono tracking-wider shadow-lg shadow-emerald-500/20 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Memverifikasi...' : 'Buka Dashboard Ops'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <Link
              href="/"
              className="text-xs font-mono text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              ← Kembali ke Game
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filtered players
  const filteredPlayers = (data?.players || []).filter(p =>
    p.username.toLowerCase().includes(searchPlayer.toLowerCase()) ||
    (p.syndicateTag && p.syndicateTag.toLowerCase().includes(searchPlayer.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm sm:text-base text-white tracking-wide">
                DEGEN &amp; WHALE <span className="text-emerald-400">OPS CENTER</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                v1.5.0
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Monitoring
              </span>
              <span>•</span>
              <span>DB Ping: <strong className="text-emerald-400">{data?.overview?.dbLatencyMs ?? 0}ms</strong></span>
              {lastUpdated && (
                <>
                  <span>•</span>
                  <span>Update: {lastUpdated.toLocaleTimeString()}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Auto Refresh Select */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={autoRefreshSec}
              onChange={(e) => setAutoRefreshSec(Number(e.target.value))}
              aria-label="Interval Pembaruan Otomatis"
              className="bg-transparent text-slate-300 font-mono outline-none cursor-pointer"
            >
              <option value={0}>Auto-refresh: Off</option>
              <option value={5}>Auto-refresh: 5s</option>
              <option value={10}>Auto-refresh: 10s</option>
              <option value={30}>Auto-refresh: 30s</option>
            </select>
          </div>

          <button
            onClick={() => fetchMetrics(adminKey)}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white cursor-pointer transition-all active:scale-95"
            title="Refresh Sekarang"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <span>Play Game</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 cursor-pointer transition-all active:scale-95"
            title="Keluar Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-5">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'overview'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Overview &amp; Telemetri</span>
          </button>

          <button
            onClick={() => setActiveTab('players')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'players'
                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Whale Watcher ({data?.players?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('risk')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'risk'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Risk &amp; Degen Monitor ({data?.activePositions?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('apm')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'apm'
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>APM &amp; Sentry Logs ({data?.apm?.errorCountTotal || 0})</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & TELEMETRI */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-5">
            {/* 6 Top Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="bg-[#0B0F19] p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-mono font-semibold uppercase">Total Pemain</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl sm:text-2xl font-mono font-black text-white">
                  {data?.overview?.totalUsers ?? '...'}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">Terdaftar di DB</div>
              </div>

              <div className="bg-[#0B0F19] p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-mono font-semibold uppercase">DAU (24 Jam)</span>
                  <Activity className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-xl sm:text-2xl font-mono font-black text-sky-400">
                  {data?.overview?.activeUsers24h ?? '...'}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">Pemain Aktif Hari Ini</div>
              </div>

              <div className="bg-[#0B0F19] p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-mono font-semibold uppercase">Circulating Cash</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-lg sm:text-xl font-mono font-black text-[#00FF88] truncate" title={String(data?.overview?.circulatingCash)}>
                  {formatMoney(data?.overview?.circulatingCash || 0)}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">Total Saldo Tunai</div>
              </div>

              <div className="bg-[#0B0F19] p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-mono font-semibold uppercase">Whale Tokens</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xl sm:text-2xl font-mono font-black text-amber-400">
                  {(data?.overview?.totalWhaleTokens || 0).toLocaleString()}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">Total Token Beredar</div>
              </div>

              <div className="bg-[#0B0F19] p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-mono font-semibold uppercase">Posisi Terbuka</span>
                  <Layers className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-xl sm:text-2xl font-mono font-black text-purple-400">
                  {data?.overview?.openPositionsCount ?? 0}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">Posisi Trading Aktif</div>
              </div>

              <div className="bg-[#0B0F19] p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-mono font-semibold uppercase">DB Ping Latency</span>
                  <Database className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-xl sm:text-2xl font-mono font-black text-white">
                  {data?.overview?.dbLatencyMs ?? 0} <span className="text-xs font-normal text-slate-500">ms</span>
                </div>
                <div className="text-[10px] font-mono text-emerald-400 mt-1">● PostgreSQL Sehat</div>
              </div>
            </div>

            {/* Server Vitals & APM Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-[#0B0F19] border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono font-bold text-sm text-white">System Runtime &amp; Server Health</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Next.js 16 App Router
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">Heap Used</span>
                    <span className="text-base font-mono font-bold text-white">{data?.apm?.memory?.heapUsedMb || 0} MB</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">Process RSS</span>
                    <span className="text-base font-mono font-bold text-white">{data?.apm?.memory?.rssMb || 0} MB</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">API Avg Latency</span>
                    <span className="text-base font-mono font-bold text-sky-400">{data?.apm?.latency?.avgMs || 0} ms</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">Server Uptime</span>
                    <span className="text-base font-mono font-bold text-emerald-400">
                      {Math.floor((data?.apm?.uptimeSec || 0) / 60)} m {Math.floor((data?.apm?.uptimeSec || 0) % 60)} s
                    </span>
                  </div>
                </div>
              </div>

              {/* Sentry / Error Telemetry Status */}
              <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-purple-400" />
                    Sentry APM Status
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    data?.apm?.sentryConfigured
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {data?.apm?.sentryConfigured ? '● Sentry Active' : '● Internal Telemetry'}
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-400 leading-relaxed">
                  {data?.apm?.sentryConfigured ? (
                    <span className="text-emerald-400">
                      DSN Sentry aktif! Seluruh error runtime diteruskan otomatis ke proyek Sentry Anda.
                    </span>
                  ) : (
                    <span>
                      Error runtime ditangkap via in-memory ring buffer. Tambahkan <code>SENTRY_DSN</code> di <code>.env</code> untuk meneruskan ke Sentry cloud.
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setActiveTab('apm')}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Lihat Error Logs ({data?.apm?.errorCountTotal || 0})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Recent Trades Live Stream */}
            <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                  <span className="font-mono font-bold text-sm text-white">Live Global Trade Stream</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">50 Transaksi Terbaru</span>
              </div>

              {(!data?.recentTrades || data.recentTrades.length === 0) ? (
                <div className="text-center py-8 text-slate-500 font-mono text-xs">
                  Belum ada riwayat transaksi yang tercatat di database.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                        <th className="py-2 px-3">Waktu</th>
                        <th className="py-2 px-3">Pemain</th>
                        <th className="py-2 px-3">Pair</th>
                        <th className="py-2 px-3">Arah / Lev</th>
                        <th className="py-2 px-3">Harga Entry / Exit</th>
                        <th className="py-2 px-3 text-right">PnL Realized</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {data.recentTrades.slice(0, 15).map((t, idx) => {
                        const isWin = (t.pnl || 0) >= 0;
                        return (
                          <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                            <td className="py-2 px-3 text-slate-500 text-[11px]">
                              {t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : '-'}
                            </td>
                            <td className="py-2 px-3 font-semibold text-white">
                              {t.username}
                            </td>
                            <td className="py-2 px-3 text-sky-300 font-bold">
                              {t.pairSymbol || 'DEGEN/USDT'}
                            </td>
                            <td className="py-2 px-3">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                t.type === 'LONG' ? 'bg-emerald-500/10 text-[#00FF88]' : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                {t.type} {t.leverage}x
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-400 text-[11px]">
                              {formatMoney(t.entryPrice)} → {formatMoney(t.exitPrice)}
                            </td>
                            <td className={`py-2 px-3 text-right font-bold ${isWin ? 'text-[#00FF88]' : 'text-rose-400'}`}>
                              {isWin ? '+' : ''}{formatMoney(t.pnl)} ({isWin ? '+' : ''}{(t.roi || 0).toFixed(1)}%)
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: WHALE WATCHER (PLAYER CRM) */}
        {activeTab === 'players' && (
          <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-mono font-bold text-base text-white">Whale Watcher &amp; Player CRM</h2>
                <p className="text-xs font-mono text-slate-400">Pantau seluruh pemain terdaftar, level kekayaan, dan inventaris</p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchPlayer}
                  onChange={(e) => setSearchPlayer(e.target.value)}
                  placeholder="Cari username pemain..."
                  className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white outline-none focus:border-sky-500 w-full sm:w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="py-2.5 px-3">Peringkat</th>
                    <th className="py-2.5 px-3">Username</th>
                    <th className="py-2.5 px-3">Workstation</th>
                    <th className="py-2.5 px-3 text-right">Saldo Kas</th>
                    <th className="py-2.5 px-3 text-right">Peak Net Worth</th>
                    <th className="py-2.5 px-3 text-center">Tokens</th>
                    <th className="py-2.5 px-3 text-center">Trades</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPlayers.map((player, idx) => (
                    <tr key={player.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-3 text-slate-500 font-bold">#{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{player.username}</span>
                          {player.syndicateTag && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                              [{player.syndicateTag}]
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Aktif: {player.lastActive ? new Date(player.lastActive).toLocaleDateString() : '-'}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-slate-300 font-semibold">
                          {LOCATION_NAMES[player.currentLocationLevel] || `Tier ${player.currentLocationLevel}`}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-emerald-400">
                        {formatMoney(player.cash)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-white">
                        {formatMoney(player.peakNetWorth)}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-amber-400">
                        {player.whaleTokens}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-400">
                        {player.tradeCount}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedPlayer(player)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Detail Pemain */}
            {selectedPlayer && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#0B0F19] border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="font-mono font-bold text-base text-white flex items-center gap-2">
                        <span>Detail Pemain: {selectedPlayer.username}</span>
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400">ID: {selectedPlayer.id}</span>
                    </div>
                    <button
                      onClick={() => setSelectedPlayer(null)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block mb-1">Saldo Tunai:</span>
                      <strong className="text-[#00FF88] text-sm">{formatMoney(selectedPlayer.cash)}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block mb-1">Peak Net Worth:</span>
                      <strong className="text-white text-sm">{formatMoney(selectedPlayer.peakNetWorth)}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block mb-1">Whale Tokens:</span>
                      <strong className="text-amber-400 text-sm">{selectedPlayer.whaleTokens}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block mb-1">Posisi Aktif:</span>
                      <strong className="text-sky-400 text-sm">{selectedPlayer.activePositionsCount} Posisi</strong>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase mb-2">Inventaris Black Market</h4>
                    <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Pump Whistle:</span>
                        <strong className="text-white">{selectedPlayer.inventory?.pump_whistle || 0}</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Dump Horn:</span>
                        <strong className="text-white">{selectedPlayer.inventory?.dump_horn || 0}</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Liq Shield:</span>
                        <strong className="text-white">{selectedPlayer.inventory?.liq_shield || 0}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setSelectedPlayer(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RISK & DEGEN MONITOR */}
        {activeTab === 'risk' && (
          <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-mono font-bold text-base text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Live Position Risk &amp; Leverage Monitor
                </h2>
                <p className="text-xs font-mono text-slate-400">Pantau seluruh posisi leverage tinggi pemain di seluruh market</p>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                Total Posisi: {data?.activePositions?.length || 0}
              </span>
            </div>

            {(!data?.activePositions || data.activePositions.length === 0) ? (
              <div className="text-center py-12 text-slate-500 font-mono text-xs">
                Tidak ada posisi trading yang sedang aktif saat ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                      <th className="py-2.5 px-3">Pemain</th>
                      <th className="py-2.5 px-3">Pair Asset</th>
                      <th className="py-2.5 px-3">Arah &amp; Leverage</th>
                      <th className="py-2.5 px-3 text-right">Margin</th>
                      <th className="py-2.5 px-3 text-right">Total Notional</th>
                      <th className="py-2.5 px-3 text-right">Harga Entry</th>
                      <th className="py-2.5 px-3 text-right">Harga Likuidasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {data.activePositions.map((pos) => {
                      const notional = pos.margin * pos.leverage;
                      const isHighLeverage = pos.leverage >= 50;
                      return (
                        <tr key={pos.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 px-3 font-semibold text-white">
                            {pos.username}
                          </td>
                          <td className="py-3 px-3 text-sky-400 font-bold">
                            {pos.pairSymbol}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              pos.type === 'LONG'
                                ? 'bg-emerald-500/10 text-[#00FF88] border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {pos.type} {pos.leverage}x
                            </span>
                            {isHighLeverage && (
                              <span className="ml-1.5 text-[9px] px-1 py-0.2 rounded bg-amber-500/15 text-amber-400 font-black">
                                DEGEN
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-300 font-semibold">
                            {formatMoney(pos.margin)}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-white">
                            {formatMoney(notional)}
                          </td>
                          <td className="py-3 px-3 text-right text-sky-300">
                            {formatMoney(pos.entryPrice)}
                          </td>
                          <td className="py-3 px-3 text-right text-rose-400 font-bold">
                            {formatMoney(pos.liqPrice)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: APM & ERROR TRACKING */}
        {activeTab === 'apm' && (
          <div className="flex flex-col gap-5">
            {/* Sentry & APM Setup Helper */}
            <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-purple-400" />
                  <span className="font-mono font-bold text-sm text-white">Sentry &amp; APM Telemetry Engine</span>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  Ring Buffer: 200 Slots
                </span>
              </div>

              <p className="text-xs font-mono text-slate-400 leading-relaxed">
                Setiap kali error terjadi di browser client pemain maupun di server API, sistem ini menangkap stack trace lengkap secara non-blocking dan menyimpannya di telemetry store.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 flex flex-col gap-1.5">
                <div className="font-semibold text-sky-400">⚡ Cara Mengaktifkan Sentry Cloud External:</div>
                <div className="text-[11px] text-slate-400">
                  Tambahkan variabel berikut pada file <code>.env</code> Anda:
                </div>
                <code className="text-emerald-400 bg-slate-950 px-2 py-1 rounded text-[11px] select-all">
                  SENTRY_DSN=https://YOUR_KEY@o0.ingest.sentry.io/PROJECT_ID
                </code>
              </div>
            </div>

            {/* Error Logs Table */}
            <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-mono font-bold text-sm text-white">Daftar Error Runtime Terbaru</h3>
                  <span className="text-[11px] font-mono text-slate-400">Total Tercatat: {data?.apm?.errorCountTotal || 0} Error</span>
                </div>
              </div>

              {(!data?.apm?.errorsRecent || data.apm.errorsRecent.length === 0) ? (
                <div className="text-center py-12 text-slate-500 font-mono text-xs flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
                  <span>Sistem Berjalan Mulus! Tidak ada error runtime yang tercatat.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {data.apm.errorsRecent.map((err) => (
                    <div key={err.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2 font-mono text-xs">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            err.source === 'server' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}>
                            {err.source.toUpperCase()}
                          </span>
                          <span className="text-slate-400 text-[11px]">{err.route}</span>
                        </div>
                        <span className="text-slate-500 text-[10px]">
                          {new Date(err.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-rose-300 font-semibold text-xs break-all">
                        {err.message}
                      </div>

                      {err.stack && (
                        <details className="text-[10px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 overflow-x-auto">
                          <summary className="cursor-pointer text-slate-500 hover:text-slate-300">
                            Lihat Stack Trace
                          </summary>
                          <pre className="mt-2 whitespace-pre text-[10px] text-slate-400 leading-tight">
                            {err.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
