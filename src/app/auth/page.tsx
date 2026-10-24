'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';

const SAVE_KEY = 'degen_whale_save_v8';
const LEGACY_SAVE_KEY = 'degen_whale_save_v7';

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [syncLocalProgress, setSyncLocalProgress] = useState(true);
  
  const [localProgressInfo, setLocalProgressInfo] = useState<{ cash: number; peak: number; tokens: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Check if player has existing progress in localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem(LEGACY_SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setLocalProgressInfo({
            cash: Number(parsed.cash || 10),
            peak: Number(parsed.peakNetWorth || parsed.cash || 10),
            tokens: Number(parsed.whaleTokens || 0)
          });
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      setErrorMsg('Username wajib diisi');
      return;
    }
    if (!password) {
      setErrorMsg('Password wajib diisi');
      return;
    }

    if (tab === 'register') {
      if (password.length < 6) {
        setErrorMsg('Password minimal 6 karakter');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Konfirmasi password tidak cocok');
        return;
      }
    }

    setLoading(true);

    try {
      let localSaveState = null;
      if (tab === 'register' && syncLocalProgress) {
        try {
          const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem(LEGACY_SAVE_KEY);
          if (raw) {
            localSaveState = JSON.parse(raw);
          }
        } catch {}
      }

      const endpoint = tab === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload = tab === 'register'
        ? { username: cleanUsername, password, localSaveState }
        : { username: cleanUsername, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Terjadi kesalahan saat otentikasi.');
        setLoading(false);
        return;
      }

      setSuccessMsg(
        tab === 'register'
          ? '🎉 Akun berhasil didaftarkan! Mengarahkan ke game...'
          : '✓ Login berhasil! Memuat data tersinkron...'
      );

      // If cloud save returned from DB, hydrate it into localStorage
      if (data.save) {
        try {
          const cloudState = data.save;
          localStorage.setItem(SAVE_KEY, JSON.stringify({
            ...cloudState,
            version: 8,
            syncVersion: 2,
            lastTimestamp: Date.now()
          }));
        } catch (storageErr) {
          console.warn('Storage sync warn:', storageErr);
        }
      }

      setTimeout(() => {
        router.push('/');
      }, 1200);

    } catch (err: any) {
      setErrorMsg('Gagal terhubung ke server. Periksa koneksi internet Anda.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-[#00FF88] selection:text-slate-950 font-sans">
      
      {/* Cyberpunk Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Radial Neon Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Back Link */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Trading Floor (Guest Mode)</span>
          </Link>
        </div>

        {/* Auth Card */}
        <div className="bg-[#0B0E14] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          
          {/* Neon Top Edge Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500" />

          {/* Header Title & Logo */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10 text-emerald-400">
              <Cloud className="w-6 h-6 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              DEGEN &amp; WHALE CLOUD
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Simpan akun &amp; lanjutkan permainan di browser atau laptop mana saja tanpa hilang riwayat.
            </p>
          </div>

          {/* Tabs: Login vs Register */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#111622] rounded-xl border border-slate-800 mb-6 font-mono text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'login'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Masuk (Login)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'register'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daftar Akun</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error & Success Banners */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Field: Username */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Username Akun</span>
                <span className="text-[10px] text-slate-500 lowercase font-normal">tanpa spasi</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="contoh: degen_sultan"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#111622] border border-slate-700 rounded-xl text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Field: Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                <span>Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-9 pr-10 py-2.5 bg-[#111622] border border-slate-700 rounded-xl text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field: Confirm Password (Register only) */}
            {tab === 'register' && (
              <div className="space-y-1.5 animate-in fade-in duration-150">
                <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                  <span>Ulangi Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password Anda"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#111622] border border-slate-700 rounded-xl text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Local Progress Detected Notice & Sync Checkbox (Register tab) */}
            {tab === 'register' && localProgressInfo && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <Cloud className="w-4 h-4 shrink-0" />
                  <span>Progres Lokal Ditemukan di Browser ini!</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Saldo: <strong className="text-white">${localProgressInfo.cash.toFixed(2)}</strong> | Token: <strong className="text-white">{localProgressInfo.tokens} Whale</strong>
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-1 text-[11px] text-slate-200">
                  <input
                    type="checkbox"
                    checked={syncLocalProgress}
                    onChange={(e) => setSyncLocalProgress(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900 cursor-pointer"
                  />
                  <span>Tautkan dan simpan progres ini ke akun baru</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span>Menghubungkan ke Cloud...</span>
              ) : tab === 'register' ? (
                <>
                  <span>Daftar &amp; Aktifkan Cloud Sync</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Masuk &amp; Sinkronkan Progres</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Features Info */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Multi-device sync</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Anti riwayat hilang</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Autosave Cloud</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Gratis</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
