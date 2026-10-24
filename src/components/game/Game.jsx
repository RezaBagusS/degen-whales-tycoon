'use client';

// Bugfix edition: preserve the original Indonesian trading terminal.
// Navy surfaces, green/rose prices, system sans + mono, chart left / upgrades right.
// Signature: the living candle chart. Quiet, reliable persistence over new UI clutter.
import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import RuntimeGuard from './RuntimeGuard';
import {
  isSoundMuted,
  toggleSoundMute,
  playUiClick,
  playOrderSound,
  playProfitSound,
  playLossSound,
  playLiquidationSound,
  playUpgradeSound,
  playPrestigeSound
} from './audio';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  ShieldAlert,
  Award,
  Share2,
  Settings,
  RefreshCw,
  DollarSign,
  Cpu,
  Users,
  Monitor,
  Bot,
  Activity,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Play,
  Crown,
  Sparkles,
  Volume2,
  VolumeX,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Lock,
  Copy,
  Download,
  Terminal,
  Briefcase,
  Building2,
  Rocket,
  Coins,
  MousePointer,
  Eye,
  Clock,
  Gift,
  Server,
  Sliders,
  RotateCcw,
  Target,
  ChevronDown,
  Search,
  X,
  Minus,
  Square,
  PenTool,
  Trash2,
  PanelRightClose,
  PanelRightOpen,
  Globe,
  ShoppingBag,
  Store,
  Heart,
  ExternalLink
} from 'lucide-react';
import { TRANSLATIONS } from '../../i18n/translations';
import { BlackMarketTab, InventoryQuickBar, BLACK_MARKET_ITEMS } from './BlackMarket';
import PnlShareModal from './PnlShareModal';
import MemeLaunchpad from './MemeLaunchpad';
import { DegenShop } from './DegenShop';
import { ADS_CONFIG } from '../../config/adsConfig';
import RewardedAdModal from './RewardedAdModal';
import CreditsModal from './CreditsModal';
import { syncGameProgressToDB } from '../../lib/cloudSync';
import { liveCryptoFeed } from '../../lib/liveCryptoFeed';
import {
  getMemeLaunchpadSchedule,
  formatCountdownMmSs,
  getBlackMarketSchedule
} from './gameSchedule';

const formatMoney = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '$0.00';
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  if (absNum < 1000) return `${sign}$${absNum.toFixed(2)}`;
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];
  const tier = Math.floor(Math.log10(absNum) / 3);
  if (tier === 0) return `${sign}$${absNum.toFixed(2)}`;
  const suffix = suffixes[Math.min(tier, suffixes.length - 1)];
  const scale = Math.pow(10, tier * 3);
  const scaled = absNum / scale;
  return `${sign}$${scaled.toFixed(2)}${suffix}`;
};

const formatCountdown = (seconds) => {
  const s = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const formatNumber = (num) => {
  if (num < 1000) return Math.floor(num).toString();
  return formatMoney(num).replace('$', '');
};

const DRAWING_COLORS = [
  '#38BDF8', // Sky Blue (Neutral / Trend)
  '#00FF88', // Emerald Green (Support / Long)
  '#FF3366', // Rose Red (Resistance / Short)
  '#F59E0B', // Amber Gold (Key Level)
  '#C084FC', // Purple (Consolidation)
];

const hexToRgba = (hex, alpha = 1) => {
  if (!hex || typeof hex !== 'string') return `rgba(56, 189, 248, ${alpha})`;
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(56, 189, 248, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const calculateEMA = (candles, period) => {
  if (!candles || candles.length < period) return new Array(candles?.length || 0).fill(null);
  const result = new Array(candles.length).fill(null);
  const multiplier = 2 / (period + 1);

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  let prevEma = sum / period;
  result[period - 1] = prevEma;

  for (let i = period; i < candles.length; i++) {
    prevEma = (candles[i].close - prevEma) * multiplier + prevEma;
    result[i] = prevEma;
  }
  return result;
};

const calculateBollingerBands = (candles, period = 20, multiplier = 2) => {
  if (!candles || candles.length < period) {
    return {
      upper: new Array(candles?.length || 0).fill(null),
      middle: new Array(candles?.length || 0).fill(null),
      lower: new Array(candles?.length || 0).fill(null),
    };
  }
  const upper = new Array(candles.length).fill(null);
  const middle = new Array(candles.length).fill(null);
  const lower = new Array(candles.length).fill(null);

  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += candles[i - j].close;
    }
    const sma = sum / period;
    let varianceSum = 0;
    for (let j = 0; j < period; j++) {
      varianceSum += Math.pow(candles[i - j].close - sma, 2);
    }
    const stdDev = Math.sqrt(varianceSum / period);
    middle[i] = sma;
    upper[i] = sma + multiplier * stdDev;
    lower[i] = sma - multiplier * stdDev;
  }
  return { upper, middle, lower };
};

const findHitDrawing = (x, y, drawings, coords) => {
  if (!drawings || !coords) return null;
  if (x > coords.chartWidth || y >= coords.chartHeight - 2 || y < 15) return null;
  const { toY, timeToX } = coords;

  for (let i = drawings.length - 1; i >= 0; i--) {
    const d = drawings[i];

    if (d.type === 'horizontal') {
      const lineY = toY(d.price);
      if (Math.abs(y - lineY) <= 9 && x <= coords.chartWidth && lineY <= coords.chartHeight - 4) {
        return { drawing: d, anchor: 'horizontal' };
      }
    } else if (d.type === 'trendline') {
      const x1 = timeToX(d.p1.time);
      const y1 = toY(d.p1.price);
      const x2 = timeToX(d.p2.time);
      const y2 = toY(d.p2.price);

      // Check endpoints first (anchor handles)
      if (Math.hypot(x - x1, y - y1) <= 12) {
        return { drawing: d, anchor: 'p1' };
      }
      if (Math.hypot(x - x2, y - y2) <= 12) {
        return { drawing: d, anchor: 'p2' };
      }

      // Check line segment
      const dx = x2 - x1;
      const dy = y2 - y1;
      const lenSq = dx * dx + dy * dy;
      if (lenSq > 0) {
        const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / lenSq));
        const px = x1 + t * dx;
        const py = y1 + t * dy;
        if (Math.hypot(x - px, y - py) <= 9) {
          return { drawing: d, anchor: 'body' };
        }
      }
    } else if (d.type === 'box') {
      const x1 = timeToX(d.p1.time);
      const y1 = toY(d.p1.price);
      const x2 = timeToX(d.p2.time);
      const y2 = toY(d.p2.price);

      // Check 4 corners
      if (Math.hypot(x - x1, y - y1) <= 12) return { drawing: d, anchor: 'p1' };
      if (Math.hypot(x - x2, y - y2) <= 12) return { drawing: d, anchor: 'p2' };
      if (Math.hypot(x - x1, y - y2) <= 12) return { drawing: d, anchor: 'corner_bl' };
      if (Math.hypot(x - x2, y - y1) <= 12) return { drawing: d, anchor: 'corner_tr' };

      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);

      if (x >= minX - 8 && x <= maxX + 8 && y >= minY - 8 && y <= maxY + 8) {
        return { drawing: d, anchor: 'body' };
      }
    } else if (d.type === 'freehand' && d.points && d.points.length > 1) {
      for (let p = 0; p < d.points.length - 1; p++) {
        const px1 = timeToX(d.points[p].time);
        const py1 = toY(d.points[p].price);
        const px2 = timeToX(d.points[p + 1].time);
        const py2 = toY(d.points[p + 1].price);

        const dx = px2 - px1;
        const dy = py2 - py1;
        const lenSq = dx * dx + dy * dy;
        if (lenSq > 0) {
          const t = Math.max(0, Math.min(1, ((x - px1) * dx + (y - py1) * dy) / lenSq));
          const cx = px1 + t * dx;
          const cy = py1 + t * dy;
          if (Math.hypot(x - cx, y - cy) <= 9) {
            return { drawing: d, anchor: 'body' };
          }
        }
      }
    }
  }
  return null;
};

const calculatePnlEstimate = (targetPrice, entryPrice, margin, leverage, type) => {
  if (
    targetPrice === null ||
    targetPrice === undefined ||
    entryPrice === null ||
    entryPrice === undefined ||
    margin === null ||
    margin === undefined ||
    leverage === null ||
    leverage === undefined
  ) {
    return null;
  }
  const tPrice = Number(targetPrice);
  const ePrice = Number(entryPrice);
  const m = Number(margin);
  const lev = Number(leverage);
  if (isNaN(tPrice) || isNaN(ePrice) || isNaN(m) || isNaN(lev) || tPrice <= 0 || ePrice <= 0 || m <= 0 || lev <= 0) {
    return null;
  }
  const isLong = type === 'LONG';
  const diffRatio = isLong
    ? (tPrice - ePrice) / ePrice
    : (ePrice - tPrice) / ePrice;
  const roiPercent = diffRatio * lev * 100;
  const pnlDollar = m * (roiPercent / 100);
  const closingTax = pnlDollar > 0 ? pnlDollar * 0.01 : 0;
  const netPnlDollar = pnlDollar > 0 ? pnlDollar - closingTax : pnlDollar;
  const returnCash = Math.max(0, m + netPnlDollar);

  return {
    diffRatio,
    roiPercent,
    pnlDollar,
    netPnlDollar,
    returnCash,
    isProfit: pnlDollar >= 0
  };
};

const PASSIVE_UPGRADES = [
  {
    id: 'indikator',
    name: 'Indikator Garis Keramat',
    baseCost: 25,
    costScale: 1.22,
    baseDps: 0.38,
    icon: Activity,
    desc: 'Menggambar garis support/resistance sesuka hati.',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30'
  },
  {
    id: 'vip_grup',
    name: "Grup VIP Sinyal 'Pasti Cuan'",
    baseCost: 280,
    costScale: 1.25,
    baseDps: 2.2,
    icon: Users,
    desc: 'Ikut arahan suhu, kadang TP, sering nyangkut.',
    color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30'
  },
  {
    id: 'monitor_4x',
    name: 'Layar Monitor Vertical (4x)',
    baseCost: 4200,
    costScale: 1.28,
    baseDps: 15,
    icon: Monitor,
    desc: 'Makin banyak layar, makin terlihat pro di depan teman.',
    color: 'from-purple-500/20 to-fuchsia-500/10 border-purple-500/30'
  },
  {
    id: 'sniper_bot',
    name: 'Sniper Bot (Solana/DEX)',
    baseCost: 75000,
    costScale: 1.30,
    baseDps: 110,
    icon: Bot,
    desc: 'Beli token meme di detik ke-0 sebelum dev-nya kabur.',
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30'
  },
  {
    id: 'quant_dev',
    name: 'Sewa Quant Developer',
    baseCost: 1500000,
    costScale: 1.32,
    baseDps: 900,
    icon: Terminal,
    desc: 'Lulusan olimpiade matematika yang gak pernah tidur.',
    color: 'from-cyan-500/20 to-sky-500/10 border-cyan-500/30'
  },
  {
    id: 'ai_cluster',
    name: 'Agentic AI Trading Cluster',
    baseCost: 45000000,
    costScale: 1.34,
    baseDps: 7800,
    icon: Cpu,
    desc: 'Server GPU yang memprediksi cuitan tokoh dunia.',
    color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30'
  },
  {
    id: 'own_exchange',
    name: 'Bikin Exchange & Koin Sendiri',
    baseCost: 2000000000,
    costScale: 1.35,
    baseDps: 75000,
    icon: Building2,
    desc: 'Kenapa harus trading kalau bisa makan fee dari trader lain?',
    color: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/40'
  },
  {
    id: 'lobby_reg',
    name: 'Tim Lobi Regulator & Pajak',
    baseCost: 95000000000,
    costScale: 1.36,
    baseDps: 880000,
    icon: Briefcase,
    desc: 'Mengatur undang-undang bursa agar selalu menguntungkan bandar.',
    color: 'from-indigo-500/20 to-violet-500/10 border-indigo-500/40'
  },
  {
    id: 'quantum_arb',
    name: 'Satelit Arbitrase Kuantum',
    baseCost: 6000000000000,
    costScale: 1.37,
    baseDps: 13000000,
    icon: Rocket,
    desc: 'Front-running transaksi seluruh dunia dari orbit rendah bumi.',
    color: 'from-teal-500/20 to-emerald-500/10 border-teal-500/40'
  },
  {
    id: 'central_bank',
    name: 'Akuisisi Mesin Cetak Bank Sentral',
    baseCost: 350000000000000,
    costScale: 1.38,
    baseDps: 260000000,
    icon: Coins,
    desc: 'Brrr! Cetak likuiditas tak terbatas kapan pun portofolio merah.',
    color: 'from-amber-400/30 to-yellow-600/20 border-amber-400/60'
  }
];

const LOCATION_TIERS = [
  {
    level: 1,
    name: 'Kamar Kos Sempit',
    sub: 'Laptop Kentang & Kipas Angin Berdebu',
    reqNetWorth: 0,
    reqWhaleTokens: 0,
    upkeepRate: 0.05,
    badge: 'Exit Liquidity',
    quote: '"Modal uang makan semester ini, yakin besok beli Lambo."',
    bgGrad: 'from-slate-900 via-slate-800 to-zinc-900',
    accent: 'text-slate-400',
    image: '/levels/level-1.jpg'
  },
  {
    level: 2,
    name: 'Warnet VIP 24 Jam',
    sub: 'Paket Malam + Es Teh Jumbo',
    reqNetWorth: 25000,
    reqWhaleTokens: 0,
    upkeepRate: 0.10,
    badge: 'Scalper Receh',
    quote: '"Chart 1 menit adalah jalan ninjaku."',
    bgGrad: 'from-blue-950 via-slate-900 to-indigo-950',
    accent: 'text-blue-400',
    image: '/levels/level-2.jpg'
  },
  {
    level: 3,
    name: 'Ruko 2 Lantai',
    sub: 'Kantor Trading & Markas Komunitas',
    reqNetWorth: 5000000,
    reqWhaleTokens: 1,
    upkeepRate: 0.15,
    badge: 'Bandar Lokal',
    quote: '"Jangan lupa masuk grup VIP saya, slot terbatas!"',
    bgGrad: 'from-emerald-950 via-slate-900 to-teal-950',
    accent: 'text-emerald-400',
    image: '/levels/level-3.jpg'
  },
  {
    level: 4,
    name: 'Penthouse SCBD',
    sub: 'Pemandangan Gedung Pencakar Langit',
    reqNetWorth: 1500000000,
    reqWhaleTokens: 5,
    upkeepRate: 0.20,
    badge: 'Market Mover',
    quote: '"Ritel panik jual, kita serok bawah sambil ngopi."',
    bgGrad: 'from-purple-950 via-slate-900 to-fuchsia-950',
    accent: 'text-purple-400',
    image: '/levels/level-4.jpg'
  },
  {
    level: 5,
    name: 'Sovereign Whale Private Island',
    sub: 'Satelit Pribadi & Bunker Server Bawah Tanah',
    reqNetWorth: 500000000000,
    reqWhaleTokens: 20,
    upkeepRate: 0.25,
    badge: 'Sovereign Whale',
    quote: '"Saya tidak membaca chart. Sayalah yang menggambar chart."',
    bgGrad: 'from-amber-950 via-slate-900 to-yellow-950',
    accent: 'text-amber-400',
    image: '/levels/level-5.jpg'
  },
  {
    level: 6,
    name: 'Shadow Citadel di Bulan',
    sub: 'Server Kuantum Nol-Gravitasi & Bebas Yurisdiksi Bumi',
    reqNetWorth: 250000000000000,
    reqWhaleTokens: 75,
    upkeepRate: 0.30,
    badge: 'Interplanetary Syndicate',
    quote: '"Pajak bumi tidak berlaku di kawah Mare Tranquillitatis."',
    bgGrad: 'from-cyan-950 via-slate-900 to-blue-950',
    accent: 'text-cyan-400',
    image: '/levels/level-6.jpg'
  },
  {
    level: 7,
    name: 'The Architect of Singularity',
    sub: 'Pengendali Tunggal Algoritma Ekonomi Global',
    reqNetWorth: 50000000000000000,
    reqWhaleTokens: 250,
    upkeepRate: 0.40,
    badge: 'God of Liquidity',
    quote: '"Uang hanyalah angka di dalam simulasi yang saya ciptakan."',
    bgGrad: 'from-rose-950 via-amber-950 to-slate-950',
    accent: 'text-rose-400',
    image: '/levels/level-7.jpg'
  }
];

const LOCATION_ARCHITECTURE_CONFIG = {
  1: {
    type: 'room',
    name: 'Kamar Kos Isometrik',
    badge: '3D MAKET KOS',
    clipPath: 'polygon(50% 3%, 95% 25%, 95% 75%, 50% 97%, 5% 75%, 5% 25%)',
    pedestalBorder: 'border-slate-500/50',
    pedestalGlow: 'from-slate-500/25',
    accentColor: '#94A3B8',
    glowColor: 'rgba(148, 163, 184, 0.45)',
  },
  2: {
    type: 'pod',
    name: 'Cyber Station Hexagon',
    badge: '3D POD WARNET',
    clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
    pedestalBorder: 'border-sky-500/50',
    pedestalGlow: 'from-sky-500/25',
    accentColor: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.55)',
  },
  3: {
    type: 'house',
    name: 'Rumah & Ruko 2 Lantai',
    badge: '3D FISIK RUMAH & RUKO',
    clipPath: 'polygon(50% 0%, 94% 22%, 86% 25%, 86% 96%, 14% 96%, 14% 25%, 6% 22%)',
    pedestalBorder: 'border-emerald-500/50',
    pedestalGlow: 'from-emerald-500/30',
    accentColor: '#00FF88',
    glowColor: 'rgba(0, 255, 136, 0.55)',
  },
  4: {
    type: 'tower',
    name: 'Gedung Menara SCBD',
    badge: '3D MENARA TOWER',
    clipPath: 'polygon(50% 0%, 56% 12%, 68% 16%, 68% 38%, 82% 44%, 82% 100%, 18% 100%, 18% 44%, 32% 38%, 32% 16%, 44% 12%)',
    pedestalBorder: 'border-purple-500/50',
    pedestalGlow: 'from-purple-500/30',
    accentColor: '#C084FC',
    glowColor: 'rgba(192, 132, 252, 0.55)',
  },
  5: {
    type: 'island',
    name: 'Pulau Tropis Melayang',
    badge: '3D FLOATING ISLAND',
    clipPath: 'polygon(15% 30%, 35% 14%, 65% 16%, 88% 28%, 98% 52%, 84% 82%, 50% 96%, 16% 82%, 2% 52%)',
    pedestalBorder: 'border-amber-500/50',
    pedestalGlow: 'from-amber-500/30',
    accentColor: '#FBBF24',
    glowColor: 'rgba(251, 191, 36, 0.55)',
  },
  6: {
    type: 'dome',
    name: 'Lunar Observatory Dome',
    badge: '3D KUBAH BULAN',
    clipPath: 'polygon(50% 2%, 78% 14%, 96% 42%, 88% 84%, 50% 98%, 12% 84%, 4% 42%, 22% 14%)',
    pedestalBorder: 'border-cyan-500/50',
    pedestalGlow: 'from-cyan-500/30',
    accentColor: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.55)',
  },
  7: {
    type: 'quantum',
    name: 'Kristal Singularitas Kuantum',
    badge: '3D OKTAHEDRON KOSMIK',
    clipPath: 'polygon(50% 0%, 98% 50%, 50% 100%, 2% 50%)',
    pedestalBorder: 'border-pink-500/50',
    pedestalGlow: 'from-pink-500/30',
    accentColor: '#F472B6',
    glowColor: 'rgba(244, 114, 182, 0.6)',
  },
};

const NEWS_TICKER_ITEMS = [
  '🚨 BREAKING: Developer koin $CUAN mengaku lupa password wallet likuiditas, investor menangis di grup Telegram.',
  '📈 ANALISIS: Pakar menyebutkan grafik akan bergerak ke kanan hari ini dengan probabilitas 100%.',
  '☕ LIFESTYLE: Tren pekerja SCBD beli kopi susu pakai Paylater demi sisa gaji bisa di-all-in ke koin anjing.',
  '⚠️ REGULASI: Pemerintah mempertimbangkan pajak khusus untuk trader yang suka pamer PnL hijau tapi modal $5.',
  '🔥 VIRAL: Mahasiswa semester 3 tidak sengaja beli saham perusahaan tambang karena salah ketik kode ticker, malah untung 400%.',
  '🤖 TECH: AI Trading Bot terbaru mogok kerja dan memilih curhat tentang tekanan mental menghadapi market sideways.',
  '🐋 WHALE ALERT: Dompet misterius baru saja memindahkan $500 Juta dari dompet kanan ke dompet kiri.'
];

const MARKET_PAIRS = [
  { symbol: 'DEGEN/USDT', name: 'Degen Whale Token', basePrice: 420.69, vol: 0.00035, category: 'degen', precision: 2, marketType: 'degen_perps' },
  { symbol: 'GORENG/IDR', name: 'Gorengan Saham IDR', basePrice: 1250.0, vol: 0.00050, category: 'degen', precision: 2, marketType: 'degen_perps' },
  { symbol: 'WHALE/USD', name: 'Whale Syndicate Index', basePrice: 69420.0, vol: 0.00012, category: 'top', precision: 2, marketType: 'degen_perps' },
  { symbol: 'BTC/USDT', name: 'Bitcoin', basePrice: 67450.0, vol: 0.00015, category: 'top', precision: 2, marketType: 'crypto_real', liveTicker: 'BTCUSDT' },
  { symbol: 'ETH/USDT', name: 'Ethereum', basePrice: 3480.0, vol: 0.00022, category: 'top', precision: 2, marketType: 'crypto_real', liveTicker: 'ETHUSDT' },
  { symbol: 'SOL/USDT', name: 'Solana', basePrice: 106.50, vol: 0.00032, category: 'top', precision: 2, marketType: 'crypto_real', liveTicker: 'SOLUSDT' },
  { symbol: 'BNB/USDT', name: 'Binance Coin', basePrice: 585.00, vol: 0.00020, category: 'top', precision: 2, marketType: 'crypto_real', liveTicker: 'BNBUSDT' },
  { symbol: 'DOGE/USDT', name: 'Dogecoin', basePrice: 0.1521, vol: 0.00045, category: 'top', precision: 4, marketType: 'crypto_real', liveTicker: 'DOGEUSDT' },
  { symbol: 'AVAX/USDT', name: 'Avalanche', basePrice: 28.50, vol: 0.00035, category: 'top', precision: 2, marketType: 'crypto_real', liveTicker: 'AVAXUSDT' },
  { symbol: 'LINK/USDT', name: 'Chainlink', basePrice: 11.80, vol: 0.00030, category: 'top', precision: 2, marketType: 'crypto_real', liveTicker: 'LINKUSDT' }
];

// Base precision for trading pairs according to real market standards (Binance / TradingView) - Max 4 decimals
export const getPairPrecision = (pairOrSymbol, price = null) => {
  let pair = null;
  if (typeof pairOrSymbol === 'string') {
    pair = MARKET_PAIRS.find((p) => p.symbol === pairOrSymbol);
  } else if (pairOrSymbol && typeof pairOrSymbol === 'object') {
    pair = pairOrSymbol;
  }
  if (pair && typeof pair.precision === 'number') {
    return Math.min(4, Math.max(2, pair.precision));
  }
  const checkPrice = price !== null && !isNaN(price) ? Math.abs(price) : (pair?.basePrice || 100);
  if (checkPrice < 1) return 4;
  if (checkPrice < 10) return 3;
  return 2;
};

// Dynamic chart price axis precision that adapts when zoomed in or when price steps are tight - Max 4 decimals
export const getDynamicAxisPrecision = (priceRange, basePrecision = 2) => {
  if (!priceRange || priceRange <= 0) return Math.min(4, Math.max(2, basePrecision));
  const step = priceRange / 6;
  let neededDecimals = 2;
  if (step < 0.002) neededDecimals = 4;
  else if (step < 0.02) neededDecimals = 3;
  else neededDecimals = 2;

  return Math.min(4, Math.max(basePrecision, neededDecimals));
};

export const formatPairPrice = (price, decimals = 2) => {
  if (price === null || price === undefined || isNaN(price)) return '$0.00';
  const dec = Math.min(4, Math.max(2, decimals));
  return `$${Number(price).toFixed(dec)}`;
};


const TIMEFRAMES = [
  { label: '5s', seconds: 5 },
  { label: '15s', seconds: 15 },
  { label: '30s', seconds: 30 },
  { label: '1m', seconds: 60 },
  { label: '5m', seconds: 300 },
  { label: '15m', seconds: 900 },
  { label: '30m', seconds: 1800 },
  { label: '1h', seconds: 3600 },
  { label: '4h', seconds: 14400 },
  { label: '1d', seconds: 86400 }
];

const getTodayDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const initialQuestStats = {
  totalTradesOpened: 0,
  totalTradesClosed: 0,
  profitableTrades: 0,
  switchedPairOrTf: false,
  usedTpSl: false,
  highLevWin: false
};

const initialDailyQuestState = {
  date: getTodayDateStr(),
  tradesCount: 0,
  profitTotal: 0,
  usedTpSl: false,
  upgradesBought: 0,
  claimed: {}
};

const MILESTONE_QUESTS = [
  {
    id: 'first_trade',
    phase: 1,
    title: 'Buka Posisi Pertama',
    desc: 'Buka 1 posisi leverage trading (LONG atau SHORT).',
    reward: 1.50,
    check: (stats, game) => (stats.totalTradesOpened || 0) >= 1 || game.activePosition != null || (game.tradeHistory && game.tradeHistory.length > 0),
    progressText: (stats, game) => (stats.totalTradesOpened >= 1 || game.activePosition != null || (game.tradeHistory && game.tradeHistory.length > 0)) ? '1/1' : '0/1',
    progressPct: (stats, game) => (stats.totalTradesOpened >= 1 || game.activePosition != null || (game.tradeHistory && game.tradeHistory.length > 0)) ? 100 : 0
  },
  {
    id: 'switch_pair',
    phase: 1,
    title: 'Analisis Multi-Aset',
    desc: 'Ganti koin pasangan trading atau ganti timeframe chart.',
    reward: 1.50,
    check: (stats) => Boolean(stats.switchedPairOrTf),
    progressText: (stats) => stats.switchedPairOrTf ? '1/1' : '0/1',
    progressPct: (stats) => stats.switchedPairOrTf ? 100 : 0
  },
  {
    id: 'close_profit',
    phase: 1,
    title: 'Cuan Pertama',
    desc: 'Tutup posisi trading dalam kondisi profit bersih > $0.',
    reward: 2.00,
    check: (stats, game) => (stats.profitableTrades || 0) >= 1 || (game.tradeHistory && game.tradeHistory.some(t => t.pnl > 0)),
    progressText: (stats, game) => ((stats.profitableTrades || 0) >= 1 || (game.tradeHistory && game.tradeHistory.some(t => t.pnl > 0))) ? '1/1' : '0/1',
    progressPct: (stats, game) => ((stats.profitableTrades || 0) >= 1 || (game.tradeHistory && game.tradeHistory.some(t => t.pnl > 0))) ? 100 : 0
  },
  {
    id: 'use_tpsl',
    phase: 1,
    title: 'Trader Disiplin',
    desc: 'Pasang Take Profit atau Stop Loss pada posisi trading aktif.',
    reward: 2.50,
    check: (stats, game) => Boolean(stats.usedTpSl) || Boolean(game.activePosition?.tpPrice || game.activePosition?.slPrice),
    progressText: (stats, game) => (stats.usedTpSl || Boolean(game.activePosition?.tpPrice || game.activePosition?.slPrice)) ? '1/1' : '0/1',
    progressPct: (stats, game) => (stats.usedTpSl || Boolean(game.activePosition?.tpPrice || game.activePosition?.slPrice)) ? 100 : 0
  },
  {
    id: 'first_upgrade',
    phase: 2,
    title: 'Pasang Indikator Bot',
    desc: 'Beli upgrade Indikator Teknikal Lv 1 untuk passive income.',
    reward: 3.00,
    check: (stats, game) => (game.passiveLevels?.indikator || 0) >= 1 || Object.values(game.passiveLevels || {}).some(v => v > 0),
    progressText: (stats, game) => ((game.passiveLevels?.indikator || 0) >= 1 || Object.values(game.passiveLevels || {}).some(v => v > 0)) ? '1/1' : '0/1',
    progressPct: (stats, game) => ((game.passiveLevels?.indikator || 0) >= 1 || Object.values(game.passiveLevels || {}).some(v => v > 0)) ? 100 : 0
  },
  {
    id: 'daily_login',
    phase: 2,
    title: 'Klaim Bansos Harian',
    desc: 'Klaim bantuan dana harian di panel kasir workstation.',
    reward: 2.50,
    check: (stats, game) => (game.lastDailyClaim || 0) > 0,
    progressText: (stats, game) => (game.lastDailyClaim || 0) > 0 ? '1/1' : '0/1',
    progressPct: (stats, game) => (game.lastDailyClaim || 0) > 0 ? 100 : 0
  },
  {
    id: 'trade_streak_5',
    phase: 2,
    title: 'Scalper Rajin',
    desc: 'Selesaikan total 5 kali transaksi trading leverage.',
    reward: 5.00,
    check: (stats, game) => Math.max(stats.totalTradesClosed || 0, game.tradeHistory ? game.tradeHistory.length : 0) >= 5,
    progressText: (stats, game) => `${Math.min(5, Math.max(stats.totalTradesClosed || 0, game.tradeHistory ? game.tradeHistory.length : 0))}/5`,
    progressPct: (stats, game) => Math.min(100, Math.floor((Math.max(stats.totalTradesClosed || 0, game.tradeHistory ? game.tradeHistory.length : 0) / 5) * 100))
  },
  {
    id: 'buy_vip',
    phase: 2,
    title: 'Grup VIP Sinyal',
    desc: 'Beli upgrade Komunitas Grup VIP Sinyal Lv 1.',
    reward: 15.00,
    check: (stats, game) => (game.passiveLevels?.vip_grup || 0) >= 1,
    progressText: (stats, game) => (game.passiveLevels?.vip_grup || 0) >= 1 ? '1/1' : '0/1',
    progressPct: (stats, game) => (game.passiveLevels?.vip_grup || 0) >= 1 ? 100 : 0
  },
  {
    id: 'networth_100',
    phase: 3,
    title: 'Trader Konsisten',
    desc: 'Capai Peak Net Worth sebesar $100.00.',
    reward: 20.00,
    check: (stats, game) => (game.peakNetWorth || 0) >= 100,
    progressText: (stats, game) => `$${Math.min(100, Math.floor(game.peakNetWorth || 0))}/$100`,
    progressPct: (stats, game) => Math.min(100, Math.floor(((game.peakNetWorth || 0) / 100) * 100))
  },
  {
    id: 'high_leverage_win',
    phase: 3,
    title: 'Degen Berani',
    desc: 'Menangkan trade dengan leverage tinggi 50x atau 100x.',
    reward: 30.00,
    check: (stats, game) => Boolean(stats.highLevWin) || (game.tradeHistory && game.tradeHistory.some(t => t.pnl > 0 && t.leverage >= 50)),
    progressText: (stats, game) => (stats.highLevWin || (game.tradeHistory && game.tradeHistory.some(t => t.pnl > 0 && t.leverage >= 50))) ? '1/1' : '0/1',
    progressPct: (stats, game) => (stats.highLevWin || (game.tradeHistory && game.tradeHistory.some(t => t.pnl > 0 && t.leverage >= 50))) ? 100 : 0
  },
  {
    id: 'networth_1k',
    phase: 3,
    title: 'Whale Komersial',
    desc: 'Capai Peak Net Worth sebesar $1,000.00.',
    reward: 50.00,
    check: (stats, game) => (game.peakNetWorth || 0) >= 1000,
    progressText: (stats, game) => `$${Math.min(1000, Math.floor(game.peakNetWorth || 0))}/$1,000`,
    progressPct: (stats, game) => Math.min(100, Math.floor(((game.peakNetWorth || 0) / 1000) * 100))
  },
  {
    id: 'dps_10',
    phase: 3,
    title: 'Mesin Passive Income',
    desc: 'Capai pendapatan pasif (Net DPS) minimal $10.00/detik.',
    reward: 150.00,
    check: (stats, game) => (game.currentDps || 0) >= 10,
    progressText: (stats, game) => `$${(game.currentDps || 0).toFixed(1)}/$10.0/s`,
    progressPct: (stats, game) => Math.min(100, Math.floor(((game.currentDps || 0) / 10) * 100))
  }
];

const DAILY_QUESTS = [
  {
    id: 'daily_trade_3',
    title: 'Scalping Harian',
    desc: 'Lakukan 3 kali trading hari ini.',
    reward: 2.50,
    target: 3,
    getProgress: (daily) => daily.tradesCount || 0,
    progressText: (daily) => `${Math.min(3, daily.tradesCount || 0)}/3`,
    progressPct: (daily) => Math.min(100, Math.floor(((daily.tradesCount || 0) / 3) * 100))
  },
  {
    id: 'daily_profit_5',
    title: 'Cuan Harian',
    desc: 'Kumpulkan total cuan trading $5.00 hari ini.',
    reward: 2.50,
    target: 5,
    getProgress: (daily) => daily.profitTotal || 0,
    progressText: (daily) => `$${Math.min(5, Math.max(0, daily.profitTotal || 0)).toFixed(2)}/$5.00`,
    progressPct: (daily) => Math.min(100, Math.floor((Math.max(0, daily.profitTotal || 0) / 5) * 100))
  },
  {
    id: 'daily_tpsl',
    title: 'Disiplin Risk Management',
    desc: 'Pasang TP atau SL pada posisi aktif hari ini.',
    reward: 2.00,
    target: 1,
    getProgress: (daily) => daily.usedTpSl ? 1 : 0,
    progressText: (daily) => daily.usedTpSl ? '1/1' : '0/1',
    progressPct: (daily) => daily.usedTpSl ? 100 : 0
  },
  {
    id: 'daily_check_infra',
    title: 'Perawatan Rig',
    desc: 'Beli atau upgrade minimal 1 infrastruktur pasif hari ini.',
    reward: 3.00,
    target: 1,
    getProgress: (daily) => daily.upgradesBought || 0,
    progressText: (daily) => `${Math.min(1, daily.upgradesBought || 0)}/1`,
    progressPct: (daily) => Math.min(100, Math.floor(((daily.upgradesBought || 0) / 1) * 100))
  }
];

const SAVE_KEY = 'degen_whale_save_v8';
const LEGACY_SAVE_KEY = 'degen_whale_save_v7';
const TAB_SYNC_CHANNEL = 'degen_whale_tab_sync';
const MAX_OFFLINE_SECONDS = 8 * 60 * 60;
let localIdSequence = 0;
// IDs need uniqueness within this simulation, not a secure-context-only API.
const makeId = () => `game-${Date.now().toString(36)}-${(++localIdSequence).toString(36)}-${Math.random().toString(36).slice(2)}`;
const emptyLevels = () => Object.fromEntries(PASSIVE_UPGRADES.map(u => [u.id, 0]));
const finiteNonnegative = (n, fallback = 0) =>
  typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : fallback;

// No random market moves while the app is closed. Only
// unboosted passive income accrues, capped at eight hours; positions resume intact.
function loadGame() {
  const fresh = {
    cash: 10, peakNetWorth: 10, whaleTokens: 0, passiveLevels: emptyLevels(),
    activePosition: null, tradeHistory: [], lastDailyClaim: 0,
    lastWhaleFaucetClaim: 0,
    selectedPairIdx: 0, selectedTfIdx: 0,
    marketPrices: MARKET_PAIRS.map(p => p.basePrice),
    bullRunLeft: 0, bearMarketLeft: 0, activeEvent: null,
    liquidationAlert: null, offline: null,
    claimedMilestones: {},
    questStats: { ...initialQuestStats },
    dailyQuestState: { ...initialDailyQuestState },
    inventory: { pump_whistle: 0, dump_horn: 0, liq_shield: 0, leverage_250x: 0, zero_fee: 0, insider_radar: 0 },
    activeEffects: { zeroFeeUntil: 0, has250xTicket: false, radarUntil: 0 },
    dailyWhaleUsage: { lastWhistleDate: null, lastDumpDate: null }
  };
  const initialAnchor = fresh.marketPrices[0] || MARKET_PAIRS[0].basePrice;
  fresh.candlesticksByTf = generateSynchronousCandlesForPair(0, initialAnchor);
  try {
    const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem(LEGACY_SAVE_KEY);
    if (!raw) return fresh;
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object') return fresh;
    const levels = Object.fromEntries(PASSIVE_UPGRADES.map(u => [
      u.id, Math.floor(finiteNonnegative(saved.passiveLevels?.[u.id]))
    ]));
    const tokens = Math.floor(finiteNonnegative(saved.whaleTokens));
    const peak = finiteNonnegative(saved.peakNetWorth, 10);
    const location = [...LOCATION_TIERS].reverse().find(t =>
      peak >= t.reqNetWorth && tokens >= t.reqWhaleTokens) || LOCATION_TIERS[0];
    const seconds = Math.min(MAX_OFFLINE_SECONDS, Math.max(0,
      (Date.now() - finiteNonnegative(saved.lastTimestamp, Date.now())) / 1000));
    const whaleDividend = tokens * 5.0;
    const dps = (PASSIVE_UPGRADES.reduce((sum, u) => sum + levels[u.id] * u.baseDps, 0)
      * (1 + tokens * 0.5) * (1 - location.upkeepRate)) + whaleDividend;
    const earned = finiteNonnegative(seconds >= 5 ? seconds * dps : 0);
    const prices = MARKET_PAIRS.map((p, i) =>
      Math.max(0.00001, finiteNonnegative(saved.marketPrices?.[i], p.basePrice)));
    let pairIdx = Number.isInteger(saved.selectedPairIdx) &&
      MARKET_PAIRS[saved.selectedPairIdx] ? saved.selectedPairIdx : 0;
    const pos = saved.activePosition;
    const posPair = MARKET_PAIRS.findIndex(p => p.symbol === pos?.pairSymbol);
    const validPos = pos && posPair >= 0 && ['LONG', 'SHORT'].includes(pos.type)
      && [2, 10, 50, 100].includes(pos.leverage)
      && Number.isFinite(pos.margin) && pos.margin > 0
      && Number.isFinite(pos.entryPrice) && pos.entryPrice > 0
      && Number.isFinite(pos.liqPrice) && pos.liqPrice > 0;
    const parseCandlesticks = (raw) => {
      if (!raw || typeof raw !== 'object') return {};
      const result = {};
      for (const [k, arr] of Object.entries(raw)) {
        if (!Array.isArray(arr)) continue;
        const validCandles = arr
          .filter(c => c && Number.isFinite(c.open) && Number.isFinite(c.high)
            && Number.isFinite(c.low) && Number.isFinite(c.close) && Number.isFinite(c.time))
          .map(c => ({
            open: Math.max(0.01, c.open),
            high: Math.max(0.01, c.high),
            low: Math.max(0.01, c.low),
            close: Math.max(0.01, c.close),
            time: Math.floor(c.time)
          }))
          .slice(-300);
        if (validCandles.length > 0) {
          result[k] = validCandles;
        }
      }
      return result;
    };
    let savedCandles = (saved.syncVersion >= 2) ? parseCandlesticks(saved.candlesticksByTf) : {};
    const selectedTf = Number.isInteger(saved.selectedTfIdx) && TIMEFRAMES[saved.selectedTfIdx]
      ? saved.selectedTfIdx : 0;
    const activePairKey = `${pairIdx}-${selectedTf}`;
    if (!savedCandles[activePairKey] || savedCandles[activePairKey].length === 0) {
      const anchorP = prices[pairIdx] || MARKET_PAIRS[pairIdx].basePrice;
      const generated = generateSynchronousCandlesForPair(pairIdx, anchorP);
      savedCandles = { ...savedCandles, ...generated };
    }
    const todayStr = getTodayDateStr();
    const savedDaily = saved.dailyQuestState;
    const validDaily = savedDaily && savedDaily.date === todayStr ? {
      date: todayStr,
      tradesCount: finiteNonnegative(savedDaily.tradesCount, 0),
      profitTotal: finiteNonnegative(savedDaily.profitTotal, 0),
      usedTpSl: Boolean(savedDaily.usedTpSl),
      upgradesBought: finiteNonnegative(savedDaily.upgradesBought, 0),
      claimed: (savedDaily.claimed && typeof savedDaily.claimed === 'object') ? savedDaily.claimed : {}
    } : {
      date: todayStr,
      tradesCount: 0,
      profitTotal: 0,
      usedTpSl: false,
      upgradesBought: 0,
      claimed: {}
    };

    const validQuestStats = {
      totalTradesOpened: finiteNonnegative(saved.questStats?.totalTradesOpened, 0),
      totalTradesClosed: finiteNonnegative(saved.questStats?.totalTradesClosed, 0),
      profitableTrades: finiteNonnegative(saved.questStats?.profitableTrades, 0),
      switchedPairOrTf: Boolean(saved.questStats?.switchedPairOrTf),
      usedTpSl: Boolean(saved.questStats?.usedTpSl),
      highLevWin: Boolean(saved.questStats?.highLevWin)
    };

    const validClaimedMilestones = (saved.claimedMilestones && typeof saved.claimedMilestones === 'object')
      ? saved.claimedMilestones
      : {};

    const validInventory = (saved.inventory && typeof saved.inventory === 'object') ? {
      pump_whistle: finiteNonnegative(saved.inventory.pump_whistle, 0),
      dump_horn: finiteNonnegative(saved.inventory.dump_horn, 0),
      liq_shield: finiteNonnegative(saved.inventory.liq_shield, 0),
      leverage_250x: finiteNonnegative(saved.inventory.leverage_250x, 0),
      zero_fee: finiteNonnegative(saved.inventory.zero_fee, 0),
      insider_radar: finiteNonnegative(saved.inventory.insider_radar, 0)
    } : { ...fresh.inventory };

    const validEffects = (saved.activeEffects && typeof saved.activeEffects === 'object') ? {
      zeroFeeUntil: finiteNonnegative(saved.activeEffects.zeroFeeUntil, 0),
      has250xTicket: Boolean(saved.activeEffects.has250xTicket),
      radarUntil: finiteNonnegative(saved.activeEffects.radarUntil, 0)
    } : { ...fresh.activeEffects };

    return {
      ...fresh,
      inventory: validInventory,
      activeEffects: validEffects,
      dailyWhaleUsage: (saved.dailyWhaleUsage && typeof saved.dailyWhaleUsage === 'object') ? saved.dailyWhaleUsage : { ...fresh.dailyWhaleUsage },
      cash: finiteNonnegative(saved.cash, 10) + earned,
      peakNetWorth: peak, whaleTokens: tokens, passiveLevels: levels,
      lastDailyClaim: Math.min(Date.now(), finiteNonnegative(saved.lastDailyClaim)),
      lastWhaleFaucetClaim: finiteNonnegative(saved.lastWhaleFaucetClaim, 0),
      tradeHistory: Array.isArray(saved.tradeHistory) ? saved.tradeHistory
        .filter(t => t && typeof t.pair === 'string' && Number.isFinite(t.pnl)
          && Number.isFinite(t.roi)).slice(0, 20) : [],
      selectedPairIdx: pairIdx,
      selectedTfIdx: Number.isInteger(saved.selectedTfIdx) && TIMEFRAMES[saved.selectedTfIdx]
        ? saved.selectedTfIdx : 0,
      marketPrices: prices,
      candlesticksByTf: savedCandles,
      activePosition: validPos ? {
        ...pos, id: pos.id || makeId(),
        tpPrice: finiteNonnegative(pos.tpPrice) || null,
        slPrice: finiteNonnegative(pos.slPrice) || null,
        openedAt: finiteNonnegative(pos.openedAt, Date.now())
      } : null,
      bullRunLeft: Math.max(0, finiteNonnegative(saved.bullRunLeft) - seconds),
      bearMarketLeft: Math.max(0, finiteNonnegative(saved.bearMarketLeft) - seconds),
      // Resume an unresolved alert instead of allowing refresh to erase it.
      activeEvent: saved.activeEvent && ['BULL', 'HACK', 'SEC_CRACKDOWN'].includes(saved.activeEvent.type)
        && Number.isFinite(saved.activeEvent.timer) && saved.activeEvent.timer > 0
        ? { ...saved.activeEvent, id: saved.activeEvent.id || makeId() } : null,
      liquidationAlert: saved.liquidationAlert &&
        Number.isFinite(saved.liquidationAlert.lostAmount) ? saved.liquidationAlert : null,
      offline: earned > 0 ? { seconds: Math.floor(seconds), earned } : null,
      claimedMilestones: validClaimedMilestones,
      questStats: validQuestStats,
      dailyQuestState: validDaily
    };
  } catch {
    return fresh;
  }
}

function generateSynchronousCandlesForPair(pairIdx, anchorPrice) {
  const pair = MARKET_PAIRS[pairIdx] || MARKET_PAIRS[0];
  const vol = pair.vol;
  const now = Date.now();

  function aggregate(sourceBars, targetSeconds) {
    const targetMs = targetSeconds * 1000;
    const groups = new Map();

    for (let i = 0; i < sourceBars.length; i++) {
      const b = sourceBars[i];
      const bucketTime = Math.floor(b.time / targetMs) * targetMs;
      let grp = groups.get(bucketTime);
      if (!grp) {
        grp = [];
        groups.set(bucketTime, grp);
      }
      grp.push(b);
    }

    const res = [];
    const sortedBuckets = Array.from(groups.keys()).sort((a, b) => a - b);
    for (let i = 0; i < sortedBuckets.length; i++) {
      const t = sortedBuckets[i];
      const list = groups.get(t);
      const first = list[0];
      const last = list[list.length - 1];

      let maxH = -Infinity;
      let minL = Infinity;
      for (let j = 0; j < list.length; j++) {
        const item = list[j];
        if (item.high > maxH) maxH = item.high;
        if (item.low < minL) minL = item.low;
      }

      res.push({
        open: first.open,
        close: last.close,
        high: maxH,
        low: minL,
        time: t
      });
    }
    return res;
  }

  // 1. Bangun bar 5s untuk rentang waktu recent (sekitar 4 jam)
  // yang selaras sempurna ke batas 30m dan berakhir tepat di anchorPrice pada waktu sekarang
  const current30mBucket = Math.floor(now / 1800000) * 1800000;
  const current5sBucket = Math.floor(now / 5000) * 5000;
  const elapsed5sSince30m = Math.floor((current5sBucket - current30mBucket) / 5000);
  const num5sBars = 19000 + elapsed5sSince30m + 1;
  const raw5s = [];
  let pClose = anchorPrice;

  for (let i = num5sBars - 1; i >= 0; i--) {
    const t = current5sBucket - i * 5000;
    const change = (Math.random() - 0.498) * vol * Math.sqrt(5);
    const open = pClose;
    const close = Math.max(0.00001, open * (1 + change));
    const wick1 = Math.random() * vol * 0.3 * open;
    const wick2 = Math.random() * vol * 0.3 * open;
    const high = Math.max(open, close) + wick1;
    const low = Math.max(0.00001, Math.min(open, close) - wick2);
    raw5s.push({ open, high, low, close, time: t });
    pClose = close;
  }

  // Offset agar bar 5s terakhir berakhir tepat di anchorPrice
  const offset5s = anchorPrice - pClose;
  const bars5s = raw5s.map((b, idx, arr) => {
    const isLast = idx === arr.length - 1;
    const open = Math.max(0.00001, b.open + offset5s);
    const close = isLast ? anchorPrice : Math.max(0.00001, b.close + offset5s);
    return {
      open,
      close,
      high: Math.max(open, close, b.high + offset5s),
      low: Math.max(0.00001, Math.min(open, close, b.low + offset5s)),
      time: b.time
    };
  });

  // 2. Bangun bar 15m dari bars5s untuk rentang recent
  const recentBars15m = aggregate(bars5s, 900);
  const oldestRecent15m = recentBars15m[0];

  // 3. Bangun bar 15m historis makro sebelum rentang recent hingga 52 hari ke belakang
  const numMacro15m = 5000;
  const rawMacro15m = [];
  let macroClose = oldestRecent15m.open;
  const oldestTime = oldestRecent15m.time;

  for (let i = numMacro15m; i >= 1; i--) {
    const t = oldestTime - i * 900000;
    const change = (Math.random() - 0.498) * vol * Math.sqrt(900);
    const open = macroClose;
    const close = Math.max(0.00001, open * (1 + change));
    const wick1 = Math.random() * vol * 0.3 * open;
    const wick2 = Math.random() * vol * 0.3 * open;
    const high = Math.max(open, close) + wick1;
    const low = Math.max(0.00001, Math.min(open, close) - wick2);
    rawMacro15m.push({ open, high, low, close, time: t });
    macroClose = close;
  }

  // Offset macro bars agar bar paling akhir dari macro menyambung tepat ke oldestRecent15m.open
  const offsetMacro = oldestRecent15m.open - macroClose;
  const fullBars15m = rawMacro15m.map((b, idx, arr) => {
    const isLast = idx === arr.length - 1;
    const open = Math.max(0.00001, b.open + offsetMacro);
    const close = isLast ? oldestRecent15m.open : Math.max(0.00001, b.close + offsetMacro);
    return {
      open,
      close,
      high: Math.max(open, close, b.high + offsetMacro),
      low: Math.max(0.00001, Math.min(open, close, b.low + offsetMacro)),
      time: b.time
    };
  }).concat(recentBars15m);

  // 4. Bangun seluruh timeframe dari master bars dengan agregasi finansial murni
  const fullBars30m = aggregate(fullBars15m, 1800);
  const fullBars1h  = aggregate(fullBars15m, 3600);
  const fullBars4h  = aggregate(fullBars15m, 14400);
  const fullBars1d  = aggregate(fullBars15m, 86400);

  const fullBars1m  = aggregate(bars5s, 60);
  const fullBars5m  = aggregate(fullBars1m, 300);

  const fullBars30s = aggregate(bars5s, 30);
  const fullBars15s = aggregate(bars5s, 15);

  const result = {
    [`${pairIdx}-0`]: bars5s.slice(-300),
    [`${pairIdx}-1`]: fullBars15s.slice(-300),
    [`${pairIdx}-2`]: fullBars30s.slice(-300),
    [`${pairIdx}-3`]: fullBars1m.slice(-300),
    [`${pairIdx}-4`]: fullBars5m.slice(-300),
    [`${pairIdx}-5`]: fullBars15m.slice(-300),
    [`${pairIdx}-6`]: fullBars30m.slice(-300),
    [`${pairIdx}-7`]: fullBars1h.slice(-300),
    [`${pairIdx}-8`]: fullBars4h.slice(-300),
    [`${pairIdx}-9`]: fullBars1d.slice(-300)
  };

  return result;
}

export default function App() {
  return <RuntimeGuard><TradingGame /></RuntimeGuard>;
}

function TradingGame() {
  const [initial] = useState(loadGame);
  const [cash, setCash] = useState(initial.cash);
  const [peakNetWorth, setPeakNetWorth] = useState(initial.peakNetWorth);
  const [whaleTokens, setWhaleTokens] = useState(initial.whaleTokens);

  const [passiveLevels, setPassiveLevels] = useState(initial.passiveLevels);

  const [bullRunLeft, setBullRunLeft] = useState(initial.bullRunLeft);
  const [bearMarketLeft, setBearMarketLeft] = useState(initial.bearMarketLeft);
  const [activeEvent, setActiveEvent] = useState(initial.activeEvent);
  const [liquidationAlert, setLiquidationAlert] = useState(initial.liquidationAlert);
  const [offlineModal, setOfflineModal] = useState(initial.offline);
  const [lastDailyClaim, setLastDailyClaim] = useState(initial.lastDailyClaim);
  const [lastWhaleFaucetClaim, setLastWhaleFaucetClaim] = useState(initial.lastWhaleFaucetClaim || 0);
  const [saveError, setSaveError] = useState(false);

  const [selectedPairIdx, setSelectedPairIdx] = useState(initial.selectedPairIdx);
  const [selectedTfIdx, setSelectedTfIdx] = useState(initial.selectedTfIdx);
  const [candlesticksByTf, setCandlesticksByTf] = useState(initial.candlesticksByTf || {});
  const candlesticksByTfRef = useRef(initial.candlesticksByTf || {});
  const marketPricesRef = useRef(initial.marketPrices);
  const [currentPrice, setCurrentPrice] = useState(initial.marketPrices[initial.selectedPairIdx]);
  
  const [betPercent, setBetPercent] = useState(25);
  const [leverage, setLeverage] = useState(10);
  const [tpInput, setTpInput] = useState('');
  const [slInput, setSlInput] = useState('');

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustTpInput, setAdjustTpInput] = useState('');
  const [adjustSlInput, setAdjustSlInput] = useState('');
  const [adjustError, setAdjustError] = useState('');

  const [activePosition, setActivePosition] = useState(initial.activePosition);
  const [tradeHistory, setTradeHistory] = useState(initial.tradeHistory);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [mousePos, setMousePos] = useState({ x: null, y: null });

  const [showPnlModal, setShowPnlModal] = useState(false);
  const [showPrestigeModal, setShowPrestigeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showWorkstationGallery, setShowWorkstationGallery] = useState(false);
  const [showRewardedAdModal, setShowRewardedAdModal] = useState(false);
  const [adRewardType, setAdRewardType] = useState('cash_reward'); // 'liquidation_bailout' | 'cash_reward'
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [activeTab, setActiveTab] = useState('quests');
  const [toastMessage, setToastMessage] = useState(null);

  // Feature 1: Black Market Inventory & Power-Up States
  const [inventory, setInventory] = useState(initial.inventory || {
    pump_whistle: 0, dump_horn: 0, liq_shield: 0, leverage_250x: 0, zero_fee: 0, insider_radar: 0
  });
  const [activeEffects, setActiveEffects] = useState(initial.activeEffects || {
    zeroFeeUntil: 0, has250xTicket: false, radarUntil: 0
  });
  const [dailyWhaleUsage, setDailyWhaleUsage] = useState(initial.dailyWhaleUsage || {
    lastWhistleDate: null, lastDumpDate: null
  });
  const [whaleWarBanner, setWhaleWarBanner] = useState(false);
  const whaleActionHistoryRef = useRef([]);
  const meanReversionRef = useRef({ deltaPerStep: 0, stepsLeft: 0 });

  // Feature 3: Trading Mode ('perps' = chart & futures, 'launchpad' = pump.fun meme rocket)
  const [tradingMode, setTradingMode] = useState('perps');

  // Timed Windows & Schedule for Meme Launchpad & Black Market
  const [memeSchedule, setMemeSchedule] = useState(() => getMemeLaunchpadSchedule());
  const [bmSchedule, setBmSchedule] = useState(() => getBlackMarketSchedule());

  // Multi-Language i18n State (id: Bahasa Indonesia, en: English)
  const [language, setLanguage] = useState(() => {
    if (typeof window === 'undefined') return 'id';
    try {
      return localStorage.getItem('degen_lang') || 'id';
    } catch {
      return 'id';
    }
  });

  const switchLanguage = (lang) => {
    setLanguage(lang);
    try {
      localStorage.setItem('degen_lang', lang);
    } catch {}
    playUiClick();
  };

  const t = useMemo(() => TRANSLATIONS[language] || TRANSLATIONS.id, [language]);

  const [claimedMilestones, setClaimedMilestones] = useState(initial.claimedMilestones || {});
  const [questStats, setQuestStats] = useState(initial.questStats || initialQuestStats);
  const [dailyQuestState, setDailyQuestState] = useState(initial.dailyQuestState || initialDailyQuestState);
  const [questCategoryTab, setQuestCategoryTab] = useState('all');

  const [isLiveFeedConnected, setIsLiveFeedConnected] = useState(false);
  const liveCryptoStatsRef = useRef({});
  const realignedPairsRef = useRef({});

  // Smoothly realign historical candlesticks to match live exchange price without artificial pump/dump gap
  const realignCandlesToLivePrice = useCallback((pIdx, livePrice) => {
    if (!livePrice || isNaN(livePrice) || livePrice <= 0) return;

    setCandlesticksByTf(prevMap => {
      let changed = false;
      const nextMap = { ...prevMap };

      TIMEFRAMES.forEach((_, tfIdx) => {
        const key = `${pIdx}-${tfIdx}`;
        const list = prevMap[key];
        if (list && list.length > 0) {
          const lastBar = list[list.length - 1];
          if (lastBar && lastBar.close > 0) {
            const disparity = Math.abs(livePrice - lastBar.close) / lastBar.close;
            // If disparity is significant (> 0.6%), scale historical candles smoothly so the last bar matches live price
            if (disparity > 0.006) {
              const ratio = livePrice / lastBar.close;
              nextMap[key] = list.map(c => ({
                ...c,
                open: Number((c.open * ratio).toFixed(6)),
                high: Number((c.high * ratio).toFixed(6)),
                low: Number((c.low * ratio).toFixed(6)),
                close: Number((c.close * ratio).toFixed(6))
              }));
              changed = true;
            }
          }
        }
      });

      if (changed) {
        candlesticksByTfRef.current = nextMap;
        return nextMap;
      }
      return prevMap;
    });
  }, []);

  const fetchLiveKlinesForPair = useCallback((pairIdx, tfIdx) => {
    const pair = MARKET_PAIRS[pairIdx];
    if (!pair || pair.marketType !== 'crypto_real') return;
    const binanceIntervals = {
      3: '1m',
      4: '5m',
      5: '15m',
      6: '30m',
      7: '1h',
      8: '4h',
      9: '1d'
    };
    const interval = binanceIntervals[tfIdx];
    if (!interval) return;

    const key = `${pairIdx}-${tfIdx}`;
    liveCryptoFeed.fetchKlines(pair.symbol, interval, 120).then(klines => {
      if (klines && klines.length > 0) {
        setCandlesticksByTf(prev => {
          const next = { ...prev, [key]: klines };
          candlesticksByTfRef.current = next;
          return next;
        });
      }
    }).catch(() => {});
  }, []);

  // Subscribe to Live Crypto Price Feed (Binance WebSocket & Vision REST Fallback)
  useEffect(() => {
    const unsubscribe = liveCryptoFeed.subscribe((liveMap) => {
      liveCryptoStatsRef.current = liveMap;
      if (Object.keys(liveMap).length > 0) {
        setIsLiveFeedConnected(true);
      }

      MARKET_PAIRS.forEach((pair, pIdx) => {
        if (pair.marketType === 'crypto_real' && liveMap[pair.symbol]) {
          const liveData = liveMap[pair.symbol];
          const newPrice = liveData.price;
          marketPricesRef.current[pIdx] = newPrice;

          // Realign historical candles so chart smoothly anchors to live exchange price
          if (!realignedPairsRef.current[pIdx]) {
            realignCandlesToLivePrice(pIdx, newPrice);
            realignedPairsRef.current[pIdx] = true;
          }

          // If this pair is active, update currentPrice immediately
          if (latest.current?.selectedPairIdx === pIdx) {
            setCurrentPrice(newPrice);
          }
        }
      });
    });

    return () => unsubscribe();
  }, [realignCandlesToLivePrice]);

  useEffect(() => {
    const today = getTodayDateStr();
    if (dailyQuestState.date !== today) {
      setDailyQuestState({
        date: today,
        tradesCount: 0,
        profitTotal: 0,
        usedTpSl: false,
        upgradesBought: 0,
        claimed: {}
      });
    }
  }, [dailyQuestState.date]);



  // Binance-Style Pair Selector Dropdown State
  const [isPairDropdownOpen, setIsPairDropdownOpen] = useState(false);
  const [pairSearchQuery, setPairSearchQuery] = useState('');
  const [pairCategoryFilter, setPairCategoryFilter] = useState('all');
  const pairDropdownRef = useRef(null);

  useEffect(() => {
    if (!isPairDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (pairDropdownRef.current && !pairDropdownRef.current.contains(e.target)) {
        setIsPairDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsPairDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPairDropdownOpen]);

  const filteredPairs = useMemo(() => {
    return MARKET_PAIRS.map((pair, originalIdx) => ({ pair, originalIdx }))
      .filter(({ pair }) => {
        if (pairSearchQuery.trim()) {
          const q = pairSearchQuery.toLowerCase();
          const matchSymbol = pair.symbol.toLowerCase().includes(q);
          const matchName = pair.name?.toLowerCase().includes(q);
          if (!matchSymbol && !matchName) return false;
        }
        if (pairCategoryFilter === 'top' || pairCategoryFilter === 'crypto_real') {
          return pair.marketType === 'crypto_real' || pair.category === 'top';
        }
        if (pairCategoryFilter === 'meme' || pairCategoryFilter === 'degen') {
          return pair.marketType === 'degen_perps' || pair.category === 'meme' || pair.category === 'degen';
        }
        if (pairCategoryFilter === 'hasPos') {
          return activePosition?.pairSymbol === pair.symbol;
        }
        return true;
      });
  }, [pairSearchQuery, pairCategoryFilter, activePosition]);

  // Chart TradingView-Style Interactive X & Y Axis Zoom & 2D Panning
  const [chartXZoom, setChartXZoom] = useState(1);
  const [chartYZoom, setChartYZoom] = useState(1);
  const [chartPanX, setChartPanX] = useState(0); // in pixels horizontally
  const [chartPanY, setChartPanY] = useState(0); // in price units vertically
  const [isPanningChart, setIsPanningChart] = useState(false);
  const isPanningChartRef = useRef(false);
  const panStartRef = useRef({ mouseX: 0, mouseY: 0, startPanX: 0, startPanY: 0, priceRange: 1, chartHeight: 300 });
  const [candleTick, setCandleTick] = useState(0);
  const isDraggingAxisRef = useRef(null);
  const dragAxisStartRef = useRef({ x: 0, y: 0, zoomX: 1, zoomY: 1 });

  // Reset pan offsets when changing market pair or timeframe
  useEffect(() => {
    setChartPanX(0);
    setChartPanY(0);
  }, [selectedPairIdx, selectedTfIdx]);

  // Global mouseup listener to guarantee panning state releases cleanly
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isPanningChartRef.current) {
        isPanningChartRef.current = false;
        setIsPanningChart(false);
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const handleXAxisMouseDown = (e) => {
    e.preventDefault();
    isDraggingAxisRef.current = 'X';
    dragAxisStartRef.current = { x: e.clientX, y: e.clientY, zoomX: chartXZoom, zoomY: chartYZoom };

    const handleMouseMove = (moveEvent) => {
      if (isDraggingAxisRef.current !== 'X') return;
      const dx = moveEvent.clientX - dragAxisStartRef.current.x;
      // Dragging right (dx > 0) -> Zoom In | Dragging left (dx < 0) -> Zoom Out
      const nextZoom = Math.max(0.25, Math.min(3.5, dragAxisStartRef.current.zoomX + dx * 0.008));
      setChartXZoom(Number(nextZoom.toFixed(2)));
    };

    const handleMouseUp = () => {
      isDraggingAxisRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleYAxisMouseDown = (e) => {
    e.preventDefault();
    isDraggingAxisRef.current = 'Y';
    dragAxisStartRef.current = { x: e.clientX, y: e.clientY, zoomX: chartXZoom, zoomY: chartYZoom };

    const handleMouseMove = (moveEvent) => {
      if (isDraggingAxisRef.current !== 'Y') return;
      const dy = moveEvent.clientY - dragAxisStartRef.current.y;
      // Dragging up (dy < 0) -> Zoom In vertically | Dragging down (dy > 0) -> Zoom Out vertically
      const nextZoom = Math.max(0.3, Math.min(4.5, dragAxisStartRef.current.zoomY - dy * 0.01));
      setChartYZoom(Number(nextZoom.toFixed(2)));
    };

    const handleMouseUp = () => {
      isDraggingAxisRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleXAxisTouchStart = (e) => {
    if (!e.touches[0]) return;
    isDraggingAxisRef.current = 'X';
    dragAxisStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, zoomX: chartXZoom, zoomY: chartYZoom };

    const handleTouchMove = (moveEvent) => {
      if (isDraggingAxisRef.current !== 'X' || !moveEvent.touches[0]) return;
      const dx = moveEvent.touches[0].clientX - dragAxisStartRef.current.x;
      const nextZoom = Math.max(0.25, Math.min(3.5, dragAxisStartRef.current.zoomX + dx * 0.008));
      setChartXZoom(Number(nextZoom.toFixed(2)));
    };

    const handleTouchEnd = () => {
      isDraggingAxisRef.current = null;
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

  const handleYAxisTouchStart = (e) => {
    if (!e.touches[0]) return;
    isDraggingAxisRef.current = 'Y';
    dragAxisStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, zoomX: chartXZoom, zoomY: chartYZoom };

    const handleTouchMove = (moveEvent) => {
      if (isDraggingAxisRef.current !== 'Y' || !moveEvent.touches[0]) return;
      const dy = moveEvent.touches[0].clientY - dragAxisStartRef.current.y;
      const nextZoom = Math.max(0.3, Math.min(4.5, dragAxisStartRef.current.zoomY - dy * 0.01));
      setChartYZoom(Number(nextZoom.toFixed(2)));
    };

    const handleTouchEnd = () => {
      isDraggingAxisRef.current = null;
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

  const canvasRef = useRef(null);
  const latest = useRef(null);
  const settledPositionRef = useRef(null);
  const handledEventRef = useRef(null);
  const tabId = useRef(makeId()).current;
  const channelRef = useRef(null);
  const [isLockedByOtherTab, setIsLockedByOtherTab] = useState(false);
  const isLockedRef = useRef(false);

  const triggerToast = useCallback((msg, type = 'info') => {
    setToastMessage({ msg, type, id: Date.now() });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const curMeme = getMemeLaunchpadSchedule();
      setMemeSchedule((prev) => {
        if (!prev.isOpen && curMeme.isOpen) {
          triggerToast(t?.memeWindowOpenedToast || '🚀 [RADAR MEME] Token baru terdeteksi di Pump.fun! Jendela Fair Launch dibuka 3 menit!', 'warning');
        }
        return curMeme;
      });
      setBmSchedule(getBlackMarketSchedule());
    }, 1000);
    return () => clearInterval(timer);
  }, [t, triggerToast]);

  const [isMuted, setIsMuted] = useState(() => isSoundMuted());
  const handleToggleSound = useCallback(() => {
    const next = toggleSoundMute();
    setIsMuted(next);
    if (!next) {
      playUiClick();
    }
    triggerToast(next ? 'Suara game dinonaktifkan (Muted)' : 'Suara game diaktifkan (Unmuted)', 'info');
  }, [triggerToast]);

  // Technical Indicators State (EMA 20, EMA 50, EMA 200, Bollinger Bands)
  const [indicators, setIndicators] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('degen_whale_indicators');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return { ema20: true, ema50: true, ema200: false, bollinger: false };
  });

  const toggleIndicator = useCallback((key) => {
    setIndicators((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('degen_whale_indicators', JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  }, []);

  // Sidebar Open State (Collapsible Infrastructure / Quests Sidebar)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('degen_whale_sidebar_open');
        if (saved !== null) return saved === 'true';
      } catch (e) {}
    }
    return true;
  });

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('degen_whale_sidebar_open', String(next));
      } catch (e) {}
      return next;
    });
  }, []);

  // TradingView-Style Drawing Tools State
  const [activeDrawingTool, setActiveDrawingTool] = useState(null); // 'trendline' | 'horizontal' | 'box' | 'freehand' | null
  const [drawingColor, setDrawingColor] = useState(DRAWING_COLORS[0]);
  const [pendingDrawing, setPendingDrawing] = useState(null);
  const [selectedDrawingId, setSelectedDrawingId] = useState(null);
  const [drawingsByPair, setDrawingsByPair] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('degen_whale_drawings');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {};
  });

  const chartCoordsRef = useRef(null);
  const isFreehandRef = useRef(false);
  const freehandPointsRef = useRef([]);
  const dragInteractionRef = useRef(null);
  const wasDraggingRef = useRef(false);
  const dragDistanceRef = useRef(0);
  const dragTpSlRef = useRef(null);
  const [hoveredAdjustable, setHoveredAdjustable] = useState(null);
  const [draggingTpSlType, setDraggingTpSlType] = useState(null);

  const currentMarketPair = MARKET_PAIRS[selectedPairIdx] || MARKET_PAIRS[0];
  const currentPairSymbol = currentMarketPair?.symbol || 'GORENG/IDR';
  const currentPairDrawings = useMemo(() => {
    return drawingsByPair[currentPairSymbol] || [];
  }, [drawingsByPair, currentPairSymbol]);

  const selectedDrawing = useMemo(() => {
    if (!selectedDrawingId) return null;
    return currentPairDrawings.find((d) => d.id === selectedDrawingId) || null;
  }, [selectedDrawingId, currentPairDrawings]);

  // Synchronized 24h trend calculation: uses the 1D candle open price of today
  // ensuring that when the 1D daily candle is green (close >= open), 24h trend is strictly positive (+) green.
  const getPair24hStats = useCallback((pIdx, priceOverride = null) => {
    const pair = MARKET_PAIRS[pIdx] || MARKET_PAIRS[0];
    const liveP = priceOverride !== null ? priceOverride : (marketPricesRef.current?.[pIdx] ?? pair.basePrice);
    const dailyKey = `${pIdx}-9`;
    let dailyList = candlesticksByTfRef.current?.[dailyKey];
    if (!dailyList || dailyList.length === 0) {
      const syncMap = generateSynchronousCandlesForPair(pIdx, liveP);
      candlesticksByTfRef.current = { ...candlesticksByTfRef.current, ...syncMap };
      dailyList = syncMap[dailyKey];
    }
    const lastBar = dailyList && dailyList.length > 0 ? dailyList[dailyList.length - 1] : null;
    let open24h = (lastBar && Number.isFinite(lastBar.open) && lastBar.open > 0) ? lastBar.open : pair.basePrice;
    const liveStats = liveCryptoStatsRef.current?.[pair.symbol];
    if (pair.marketType === 'crypto_real' && liveStats && Number.isFinite(liveStats.open24h) && liveStats.open24h > 0) {
      open24h = liveStats.open24h;
    }
    const changeDollar = liveP - open24h;
    const changePct = open24h > 0 ? (changeDollar / open24h) * 100 : 0;
    return {
      open24h,
      changeDollar,
      changePct,
      isUp: changePct >= 0
    };
  }, []);

  const saveNewDrawing = useCallback((newDrawing) => {
    setDrawingsByPair((prev) => {
      const pairList = prev[currentPairSymbol] || [];
      const next = { ...prev, [currentPairSymbol]: [...pairList, newDrawing] };
      try {
        localStorage.setItem('degen_whale_drawings', JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  }, [currentPairSymbol]);

  const handleDeleteSelectedDrawing = useCallback(() => {
    if (!selectedDrawingId) return;
    setDrawingsByPair((prev) => {
      const pairList = prev[currentPairSymbol] || [];
      const nextList = pairList.filter((d) => d.id !== selectedDrawingId);
      const next = { ...prev, [currentPairSymbol]: nextList };
      try {
        localStorage.setItem('degen_whale_drawings', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    setSelectedDrawingId(null);
    triggerToast('Gambar berhasil dihapus!', 'info');
  }, [selectedDrawingId, currentPairSymbol, triggerToast]);

  const handleUpdateSelectedDrawingColor = useCallback((color) => {
    if (!selectedDrawingId) return;
    setDrawingsByPair((prev) => {
      const pairList = prev[currentPairSymbol] || [];
      const nextList = pairList.map((d) => (d.id === selectedDrawingId ? { ...d, color } : d));
      const next = { ...prev, [currentPairSymbol]: nextList };
      try {
        localStorage.setItem('degen_whale_drawings', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    setDrawingColor(color);
  }, [selectedDrawingId, currentPairSymbol]);

  const handleUndoDrawing = useCallback(() => {
    setDrawingsByPair((prev) => {
      const pairList = prev[currentPairSymbol] || [];
      if (pairList.length === 0) return prev;
      const nextList = pairList.slice(0, -1);
      const next = { ...prev, [currentPairSymbol]: nextList };
      try {
        localStorage.setItem('degen_whale_drawings', JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
    setPendingDrawing(null);
    setSelectedDrawingId(null);
    triggerToast('Gambar terakhir berhasil dibatalkan', 'info');
  }, [currentPairSymbol, triggerToast]);

  const handleClearDrawings = useCallback(() => {
    setDrawingsByPair((prev) => {
      const next = { ...prev, [currentPairSymbol]: [] };
      try {
        localStorage.setItem('degen_whale_drawings', JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
    setPendingDrawing(null);
    setSelectedDrawingId(null);
    triggerToast(`Semua gambar di ${currentPairSymbol} berhasil dibersihkan!`, 'info');
  }, [currentPairSymbol, triggerToast]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        return;
      }
      if (e.key === 'Escape') {
        setActiveDrawingTool(null);
        setPendingDrawing(null);
        setSelectedDrawingId(null);
        isFreehandRef.current = false;
        freehandPointsRef.current = [];
        dragInteractionRef.current = null;
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedDrawingId) {
          e.preventDefault();
          handleDeleteSelectedDrawing();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        handleUndoDrawing();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDrawingId, handleDeleteSelectedDrawing, handleUndoDrawing]);

  const handleCanvasClick = useCallback((e) => {
    // If user was dragging an existing drawing, ignore the subsequent click event to prevent accidental duplicate creation
    if (wasDraggingRef.current) {
      wasDraggingRef.current = false;
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const coords = chartCoordsRef.current;
    if (!coords) return;
    if (x > coords.chartWidth || y >= coords.chartHeight - 4 || y < 15) return;

    if (!activeDrawingTool) {
      const hit = findHitDrawing(x, y, currentPairDrawings, coords);
      if (!hit) {
        setSelectedDrawingId(null);
      }
      return;
    }

    const clampedY = Math.max(15, Math.min(coords.chartHeight - 6, y));
    const clickPrice = coords.toPrice(clampedY);
    const clickTime = coords.xToTime(x);

    if (activeDrawingTool === 'horizontal') {
      const newDrawing = {
        id: makeId(),
        type: 'horizontal',
        price: clickPrice,
        color: drawingColor,
        createdAt: Date.now()
      };
      saveNewDrawing(newDrawing);
      // Auto-exit tool to standard pointer mode and select the newly created line
      setActiveDrawingTool(null);
      setSelectedDrawingId(newDrawing.id);
      triggerToast(`Garis Support/Resistance dibuat pada ${formatPairPrice(clickPrice, getPairPrecision(MARKET_PAIRS[selectedPairIdx] || MARKET_PAIRS[0], clickPrice))}`, 'info');
    } else if (activeDrawingTool === 'trendline') {
      if (!pendingDrawing) {
        setPendingDrawing({
          type: 'trendline',
          p1: { time: clickTime, price: clickPrice },
          color: drawingColor
        });
      } else {
        const newDrawing = {
          id: makeId(),
          type: 'trendline',
          p1: pendingDrawing.p1,
          p2: { time: clickTime, price: clickPrice },
          color: drawingColor,
          createdAt: Date.now()
        };
        saveNewDrawing(newDrawing);
        setPendingDrawing(null);
        setActiveDrawingTool(null);
        setSelectedDrawingId(newDrawing.id);
        triggerToast('Garis Tren (Trendline) berhasil dibuat!', 'info');
      }
    } else if (activeDrawingTool === 'box') {
      if (!pendingDrawing) {
        setPendingDrawing({
          type: 'box',
          p1: { time: clickTime, price: clickPrice },
          color: drawingColor
        });
      } else {
        const newDrawing = {
          id: makeId(),
          type: 'box',
          p1: pendingDrawing.p1,
          p2: { time: clickTime, price: clickPrice },
          color: drawingColor,
          createdAt: Date.now()
        };
        saveNewDrawing(newDrawing);
        setPendingDrawing(null);
        setActiveDrawingTool(null);
        setSelectedDrawingId(newDrawing.id);
        triggerToast('Area Supply & Demand Zone berhasil dibuat!', 'info');
      }
    }
  }, [activeDrawingTool, pendingDrawing, drawingColor, currentPairDrawings, saveNewDrawing, triggerToast]);

  const handleCanvasMouseDown = useCallback((e) => {
    wasDraggingRef.current = false;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const coords = chartCoordsRef.current;
    if (!coords || x > coords.chartWidth || y >= coords.chartHeight - 4 || y < 15) return;

    if (activeDrawingTool === 'freehand') {
      isFreehandRef.current = true;
      const startPoint = { time: coords.xToTime(x), price: coords.toPrice(y) };
      freehandPointsRef.current = [startPoint];
      setPendingDrawing({
        type: 'freehand',
        points: [startPoint],
        color: drawingColor
      });
      return;
    }

    // Interactive TP/SL Dragging (Drag to adjust TP and SL directly on chart)
    if (activePosition && activePosition.pairSymbol === currentPairSymbol && !activeDrawingTool) {
      if (activePosition.tpPrice && Math.abs(y - coords.toY(activePosition.tpPrice)) <= 10) {
        dragTpSlRef.current = { type: 'TP', startY: y, initialPrice: activePosition.tpPrice };
        setDraggingTpSlType('TP');
        wasDraggingRef.current = true;
        playUiClick();
        return;
      }
      if (activePosition.slPrice && Math.abs(y - coords.toY(activePosition.slPrice)) <= 10) {
        dragTpSlRef.current = { type: 'SL', startY: y, initialPrice: activePosition.slPrice };
        setDraggingTpSlType('SL');
        wasDraggingRef.current = true;
        playUiClick();
        return;
      }
    }

    // Always check if clicking on an existing drawing.
    // If clicking an existing drawing, prioritize selecting/moving it rather than spawning an accidental duplicate!
    const hit = findHitDrawing(x, y, currentPairDrawings, coords);
    if (hit) {
      setActiveDrawingTool(null);
      setPendingDrawing(null);
      setSelectedDrawingId(hit.drawing.id);
      dragInteractionRef.current = {
        drawingId: hit.drawing.id,
        anchor: hit.anchor,
        startMouseX: x,
        startMouseY: y,
        initialDrawing: JSON.parse(JSON.stringify(hit.drawing)),
        startTime: coords.xToTime(x),
        startPrice: coords.toPrice(y),
      };
      return;
    }

    if (!activeDrawingTool) {
      setSelectedDrawingId(null);
      // TradingView-style 2D Panning (Drag horizontally & vertically)
      isPanningChartRef.current = true;
      setIsPanningChart(true);
      panStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        startPanX: chartPanX,
        startPanY: chartPanY,
        priceRange: coords.priceRange || 1,
        chartHeight: coords.chartHeight || 300,
      };
      wasDraggingRef.current = false;
    }
  }, [activeDrawingTool, drawingColor, currentPairDrawings, activePosition, currentPairSymbol, chartPanX, chartPanY]);

  const handleCanvasMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    setMousePos({ x, y });

    const coords = chartCoordsRef.current;
    if (!coords) return;

    // 0. Live TradingView 2D Panning (Horizontally & Vertically)
    if (isPanningChartRef.current) {
      const dx = e.clientX - panStartRef.current.mouseX;
      const dy = e.clientY - panStartRef.current.mouseY;
      if (Math.hypot(dx, dy) > 3) {
        wasDraggingRef.current = true;
      }
      const nextPanX = panStartRef.current.startPanX + dx;
      setChartPanX(nextPanX);

      const pRange = panStartRef.current.priceRange || coords.priceRange || 1;
      const cH = panStartRef.current.chartHeight || coords.chartHeight || 300;
      const deltaPrice = dy * (pRange / (cH - 30));
      const nextPanY = panStartRef.current.startPanY + deltaPrice;
      setChartPanY(nextPanY);
      return;
    }

    // 1. Live Interactive Dragging of TP / SL lines
    if (dragTpSlRef.current && activePosition) {
      wasDraggingRef.current = true;
      const curPair = MARKET_PAIRS.find((p) => p.symbol === activePosition.pairSymbol) || MARKET_PAIRS[selectedPairIdx] || MARKET_PAIRS[0];
      const precision = getPairPrecision(curPair, activePosition.entryPrice);
      const clampedY = Math.max(15, Math.min(coords.chartHeight - 6, y));
      let newPrice = Number(coords.toPrice(clampedY).toFixed(precision));
      const isLong = activePosition.type === 'LONG';
      const entry = activePosition.entryPrice;
      const liq = activePosition.liqPrice;

      if (dragTpSlRef.current.type === 'TP') {
        if (isLong) {
          newPrice = Math.max(Number((entry * 1.002).toFixed(precision)), newPrice);
        } else {
          newPrice = Math.min(Number((entry * 0.998).toFixed(precision)), newPrice);
        }
        setActivePosition((prev) => (prev ? { ...prev, tpPrice: newPrice } : null));
      } else if (dragTpSlRef.current.type === 'SL') {
        if (isLong) {
          newPrice = Math.min(Number((entry * 0.998).toFixed(precision)), Math.max(Number((liq * 1.005).toFixed(precision)), newPrice));
        } else {
          newPrice = Math.max(Number((entry * 1.002).toFixed(precision)), Math.min(Number((liq * 0.995).toFixed(precision)), newPrice));
        }
        setActivePosition((prev) => (prev ? { ...prev, slPrice: newPrice } : null));
      }
      return;
    }

    // 2. Hover detection over TP / SL lines for cursor feedback
    if (activePosition && activePosition.pairSymbol === currentPairSymbol && !activeDrawingTool && !dragInteractionRef.current) {
      let hitAdjust = null;
      if (activePosition.tpPrice && Math.abs(y - coords.toY(activePosition.tpPrice)) <= 10) {
        hitAdjust = 'TP';
      } else if (activePosition.slPrice && Math.abs(y - coords.toY(activePosition.slPrice)) <= 10) {
        hitAdjust = 'SL';
      }
      setHoveredAdjustable(hitAdjust);
    } else {
      setHoveredAdjustable(null);
    }

    if (activeDrawingTool === 'freehand' && isFreehandRef.current) {
      if (x <= coords.chartWidth && y <= coords.chartHeight - 4 && y >= 15) {
        const nextPoint = { time: coords.xToTime(x), price: coords.toPrice(y) };
        freehandPointsRef.current.push(nextPoint);
        setPendingDrawing({
          type: 'freehand',
          points: [...freehandPointsRef.current],
          color: drawingColor
        });
      }
      return;
    }

    // Interactive Repositioning / Reshaping of drawing
    if (dragInteractionRef.current && !activeDrawingTool) {
      const { drawingId, anchor, initialDrawing, startTime, startPrice, startMouseX, startMouseY } = dragInteractionRef.current;
      const movedDist = Math.hypot(x - startMouseX, y - startMouseY);
      if (movedDist > 3) {
        wasDraggingRef.current = true;
      }

      const clampedY = Math.max(15, Math.min(coords.chartHeight - 6, y));
      const currentPrice = coords.toPrice(clampedY);
      const currentTime = coords.xToTime(x);
      const deltaPrice = currentPrice - startPrice;
      const deltaTime = currentTime - startTime;

      setDrawingsByPair((prev) => {
        const pairList = prev[currentPairSymbol] || [];
        const nextList = pairList.map((d) => {
          if (d.id !== drawingId) return d;

          // Drag whole drawing (MOVE / REPOSITION)
          if (anchor === 'body' || anchor === 'horizontal') {
            if (d.type === 'horizontal') {
              return { ...d, price: initialDrawing.price + deltaPrice };
            }
            if (d.type === 'trendline' || d.type === 'box') {
              return {
                ...d,
                p1: { time: initialDrawing.p1.time + deltaTime, price: initialDrawing.p1.price + deltaPrice },
                p2: { time: initialDrawing.p2.time + deltaTime, price: initialDrawing.p2.price + deltaPrice },
              };
            }
            if (d.type === 'freehand' && initialDrawing.points) {
              return {
                ...d,
                points: initialDrawing.points.map((pt) => ({
                  time: pt.time + deltaTime,
                  price: pt.price + deltaPrice,
                })),
              };
            }
          }

          // Drag specific anchor handle (RESHAPE)
          if (anchor === 'p1') {
            return { ...d, p1: { time: currentTime, price: currentPrice } };
          }
          if (anchor === 'p2') {
            return { ...d, p2: { time: currentTime, price: currentPrice } };
          }
          if (anchor === 'corner_bl' && d.type === 'box') {
            return {
              ...d,
              p1: { time: currentTime, price: initialDrawing.p1.price },
              p2: { time: initialDrawing.p2.time, price: currentPrice },
            };
          }
          if (anchor === 'corner_tr' && d.type === 'box') {
            return {
              ...d,
              p1: { time: initialDrawing.p1.time, price: currentPrice },
              p2: { time: currentTime, price: initialDrawing.p2.price },
            };
          }

          return d;
        });

        return { ...prev, [currentPairSymbol]: nextList };
      });
    }
  }, [activeDrawingTool, drawingColor, currentPairSymbol, activePosition]);

  const handleCanvasMouseUp = useCallback(() => {
    if (isPanningChartRef.current) {
      isPanningChartRef.current = false;
      setIsPanningChart(false);
    }

    if (dragTpSlRef.current) {
      const { type } = dragTpSlRef.current;
      dragTpSlRef.current = null;
      setDraggingTpSlType(null);
      setHoveredAdjustable(null);
      playUiClick();
      triggerToast(`Target ${type === 'TP' ? 'Take Profit (TP)' : 'Stop Loss (SL)'} berhasil digeser dan disimpan!`, 'info');
      return;
    }

    if (activeDrawingTool === 'freehand' && isFreehandRef.current) {
      isFreehandRef.current = false;
      wasDraggingRef.current = true;
      if (freehandPointsRef.current && freehandPointsRef.current.length > 2) {
        const newDrawing = {
          id: makeId(),
          type: 'freehand',
          points: [...freehandPointsRef.current],
          color: drawingColor,
          createdAt: Date.now()
        };
        saveNewDrawing(newDrawing);
        setActiveDrawingTool(null);
        setSelectedDrawingId(newDrawing.id);
        triggerToast('Coretan analisis berhasil disimpan!', 'info');
      }
      freehandPointsRef.current = [];
      setPendingDrawing(null);
      return;
    }

    if (dragInteractionRef.current) {
      dragInteractionRef.current = null;
      setDrawingsByPair((currentMap) => {
        try {
          localStorage.setItem('degen_whale_drawings', JSON.stringify(currentMap));
        } catch (e) {}
        return currentMap;
      });
    }
  }, [activeDrawingTool, drawingColor, saveNewDrawing, triggerToast]);

  const handleCanvasTouchStart = useCallback((e) => {
    if (!e.touches[0] || activeDrawingTool) return;
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    const coords = chartCoordsRef.current;
    if (!coords || x > coords.chartWidth || y >= coords.chartHeight - 4 || y < 15) return;

    isPanningChartRef.current = true;
    setIsPanningChart(true);
    panStartRef.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      startPanX: chartPanX,
      startPanY: chartPanY,
      priceRange: coords.priceRange || 1,
      chartHeight: coords.chartHeight || 300,
    };
  }, [activeDrawingTool, chartPanX, chartPanY]);

  const handleCanvasTouchMove = useCallback((e) => {
    if (!isPanningChartRef.current || !e.touches[0]) return;
    const touch = e.touches[0];
    const dx = touch.clientX - panStartRef.current.mouseX;
    const dy = touch.clientY - panStartRef.current.mouseY;
    if (Math.hypot(dx, dy) > 3) {
      wasDraggingRef.current = true;
    }
    const nextPanX = panStartRef.current.startPanX + dx;
    setChartPanX(nextPanX);

    const pRange = panStartRef.current.priceRange || 1;
    const cH = panStartRef.current.chartHeight || 300;
    const deltaPrice = dy * (pRange / (cH - 30));
    const nextPanY = panStartRef.current.startPanY + deltaPrice;
    setChartPanY(nextPanY);
  }, []);

  const handleCanvasTouchEnd = useCallback(() => {
    if (isPanningChartRef.current) {
      isPanningChartRef.current = false;
      setIsPanningChart(false);
    }
  }, []);

  const handleTakeOverSession = useCallback(() => {
    const fresh = loadGame();
    setCash(fresh.cash);
    setPeakNetWorth(fresh.peakNetWorth);
    setWhaleTokens(fresh.whaleTokens);
    setPassiveLevels(fresh.passiveLevels);
    setActivePosition(fresh.activePosition);
    setTradeHistory(fresh.tradeHistory);
    setLastDailyClaim(fresh.lastDailyClaim);
    setSelectedPairIdx(fresh.selectedPairIdx);
    setSelectedTfIdx(fresh.selectedTfIdx);
    setBullRunLeft(fresh.bullRunLeft);
    setBearMarketLeft(fresh.bearMarketLeft);
    setActiveEvent(fresh.activeEvent);
    setLiquidationAlert(fresh.liquidationAlert);
    marketPricesRef.current = fresh.marketPrices;
    setCurrentPrice(fresh.marketPrices[fresh.selectedPairIdx]);

    isLockedRef.current = false;
    setIsLockedByOtherTab(false);

    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'CLAIM_LOCK', tabId });
    }
    triggerToast('Sesi trading berhasil dialihkan ke tab ini!', 'info');
  }, [tabId, triggerToast]);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const livePositionStats = useMemo(() => {
    if (!activePosition) return null;
    const posPairIdx = MARKET_PAIRS.findIndex(p => p.symbol === activePosition.pairSymbol);
    const posPrice = posPairIdx >= 0 && marketPricesRef.current[posPairIdx]
      ? marketPricesRef.current[posPairIdx]
      : currentPrice;

    const diffRatio =
      activePosition.type === 'LONG'
        ? (posPrice - activePosition.entryPrice) / activePosition.entryPrice
        : (activePosition.entryPrice - posPrice) / activePosition.entryPrice;
    const rawRoiPercent = diffRatio * activePosition.leverage * 100;
    const roiPercent = rawRoiPercent;
    const pnlDollar = activePosition.margin * (roiPercent / 100);
    const equity = Math.max(0, activePosition.margin + pnlDollar);
    return { roiPercent, pnlDollar, equity, rawRoiPercent, rawPnlDollar: pnlDollar, posPrice };
  }, [activePosition, currentPrice, selectedPairIdx]);

  const netWorth = useMemo(() => {
    const posEquity = livePositionStats ? livePositionStats.equity : 0;
    return cash + posEquity;
  }, [cash, livePositionStats]);

  useEffect(() => {
    if (netWorth > peakNetWorth) {
      setPeakNetWorth(netWorth);
    }
  }, [netWorth, peakNetWorth]);

  useEffect(() => {
    if (!activePosition && isAdjustModalOpen) {
      setIsAdjustModalOpen(false);
    }
  }, [activePosition, isAdjustModalOpen]);

  const orderRawMargin = cash * (betPercent / 100);
  const orderEffectiveMargin = Math.max(0, orderRawMargin * (1 - 0.015));

  const orderTpEst = useMemo(() => {
    const p = parseFloat(tpInput);
    if (!p || isNaN(p) || p <= 0 || orderEffectiveMargin <= 0) return null;
    const isAbove = p > currentPrice;
    const isBelow = p < currentPrice;
    if (!isAbove && !isBelow) return null;
    const type = isAbove ? 'LONG' : 'SHORT';
    const est = calculatePnlEstimate(p, currentPrice, orderEffectiveMargin, leverage, type);
    return { ...est, plannedType: type };
  }, [tpInput, currentPrice, orderEffectiveMargin, leverage]);

  const orderSlEst = useMemo(() => {
    const p = parseFloat(slInput);
    if (!p || isNaN(p) || p <= 0 || orderEffectiveMargin <= 0) return null;
    const isBelow = p < currentPrice;
    const isAbove = p > currentPrice;
    if (!isBelow && !isAbove) return null;
    const type = isBelow ? 'LONG' : 'SHORT';
    const est = calculatePnlEstimate(p, currentPrice, orderEffectiveMargin, leverage, type);
    return { ...est, plannedType: type };
  }, [slInput, currentPrice, orderEffectiveMargin, leverage]);

  const activePosTpEst = useMemo(() => {
    if (!activePosition || !activePosition.tpPrice) return null;
    return calculatePnlEstimate(
      activePosition.tpPrice,
      activePosition.entryPrice,
      activePosition.margin,
      activePosition.leverage,
      activePosition.type
    );
  }, [activePosition]);

  const activePosSlEst = useMemo(() => {
    if (!activePosition || !activePosition.slPrice) return null;
    return calculatePnlEstimate(
      activePosition.slPrice,
      activePosition.entryPrice,
      activePosition.margin,
      activePosition.leverage,
      activePosition.type
    );
  }, [activePosition]);

  const modalTpEst = useMemo(() => {
    if (!activePosition) return null;
    const p = parseFloat(adjustTpInput);
    if (!p || isNaN(p) || p <= 0) return null;
    const isLong = activePosition.type === 'LONG';
    const isValid = isLong ? p > activePosition.entryPrice : p < activePosition.entryPrice;
    if (!isValid) return { isValid: false };
    const est = calculatePnlEstimate(
      p,
      activePosition.entryPrice,
      activePosition.margin,
      activePosition.leverage,
      activePosition.type
    );
    return { ...est, isValid: true };
  }, [activePosition, adjustTpInput]);

  const modalSlEst = useMemo(() => {
    if (!activePosition) return null;
    const p = parseFloat(adjustSlInput);
    if (!p || isNaN(p) || p <= 0) return null;
    const isLong = activePosition.type === 'LONG';
    const isValidSide = isLong ? p < activePosition.entryPrice : p > activePosition.entryPrice;
    const isLiqBreached = isLong ? p <= activePosition.liqPrice : p >= activePosition.liqPrice;
    if (!isValidSide || isLiqBreached) {
      return {
        isValid: false,
        isLiqBreached,
        isValidSide
      };
    }
    const est = calculatePnlEstimate(
      p,
      activePosition.entryPrice,
      activePosition.margin,
      activePosition.leverage,
      activePosition.type
    );
    return { ...est, isValid: true };
  }, [activePosition, adjustSlInput]);

  const isDailyClaimed = useMemo(() => {
    if (!lastDailyClaim || lastDailyClaim <= 0) return false;
    const cooldownMs = 24 * 60 * 60 * 1000;
    return (Date.now() - lastDailyClaim) < cooldownMs;
  }, [lastDailyClaim]);

  const prestigeMultiplier = useMemo(() => {
    return 1 + whaleTokens * 0.5;
  }, [whaleTokens]);

  const activeBoostMultiplier = useMemo(() => {
    let mult = 1;
    if (bullRunLeft > 0) mult *= 5;
    if (bearMarketLeft > 0) mult *= 0.45;
    return mult;
  }, [bullRunLeft, bearMarketLeft]);

  const totalMultiplier = prestigeMultiplier * activeBoostMultiplier;

  const currentLocation = useMemo(() => {
    let loc = LOCATION_TIERS[0];
    for (const t of LOCATION_TIERS) {
      if (peakNetWorth >= t.reqNetWorth && whaleTokens >= t.reqWhaleTokens) {
        loc = t;
      }
    }
    return loc;
  }, [peakNetWorth, whaleTokens]);

  const nextLocation = useMemo(() => {
    return LOCATION_TIERS.find((t) => t.level === currentLocation.level + 1) || null;
  }, [currentLocation]);

  const baseDps = useMemo(() => {
    return PASSIVE_UPGRADES.reduce((acc, item) => {
      const lvl = passiveLevels[item.id] || 0;
      return acc + lvl * item.baseDps;
    }, 0);
  }, [passiveLevels]);

  const grossDps = baseDps * totalMultiplier;
  const upkeepDrain = grossDps * (currentLocation.upkeepRate || 0);
  const whaleDividend = (whaleTokens || 0) * 5.0;
  const currentDps = Math.max(0, grossDps - upkeepDrain) + whaleDividend;

  const claimableWhaleTokens = useMemo(() => {
    if (peakNetWorth < 50000) return 0;
    const totalPotential = Math.floor(Math.pow(peakNetWorth / 50000, 0.28));
    return Math.max(0, totalPotential - whaleTokens);
  }, [peakNetWorth, whaleTokens]);

  const isPhase1Completed = useMemo(() => {
    const phase1Quests = MILESTONE_QUESTS.filter((q) => q.phase === 1);
    return phase1Quests.length > 0 && phase1Quests.every((q) => Boolean(claimedMilestones[q.id]));
  }, [claimedMilestones]);

  const hasBoughtIndikator = (passiveLevels?.indikator || 0) >= 1;
  const isPhase2Unlocked = isPhase1Completed && hasBoughtIndikator;

  const isPhase2Completed = useMemo(() => {
    const phase2Quests = MILESTONE_QUESTS.filter((q) => q.phase === 2);
    return phase2Quests.length > 0 && phase2Quests.every((q) => Boolean(claimedMilestones[q.id]));
  }, [claimedMilestones]);

  const hasBoughtVip = (passiveLevels?.vip_grup || 0) >= 1;
  const isPhase3Unlocked = isPhase2Unlocked && isPhase2Completed && hasBoughtVip;

  const unclaimedQuestCount = useMemo(() => {
    let count = 0;
    const gameSnapshot = {
      activePosition,
      tradeHistory,
      peakNetWorth,
      currentDps,
      passiveLevels,
      lastDailyClaim
    };

    for (const q of MILESTONE_QUESTS) {
      if (claimedMilestones[q.id]) continue;
      if (q.phase === 2 && !isPhase2Unlocked) continue;
      if (q.phase === 3 && !isPhase3Unlocked) continue;
      if (q.check(questStats, gameSnapshot)) {
        count++;
      }
    }

    for (const q of DAILY_QUESTS) {
      if (!dailyQuestState.claimed?.[q.id] && q.getProgress(dailyQuestState) >= q.target) {
        count++;
      }
    }

    return count;
  }, [
    claimedMilestones,
    questStats,
    dailyQuestState,
    activePosition,
    tradeHistory,
    peakNetWorth,
    currentDps,
    passiveLevels,
    lastDailyClaim,
    isPhase2Unlocked,
    isPhase3Unlocked
  ]);

  const handleClaimMilestone = (questId) => {
    const quest = MILESTONE_QUESTS.find((q) => q.id === questId);
    if (!quest) return;
    if (quest.phase === 2 && !isPhase2Unlocked) return;
    if (quest.phase === 3 && !isPhase3Unlocked) return;
    if (claimedMilestones[questId]) return;

    const gameSnapshot = {
      activePosition,
      tradeHistory,
      peakNetWorth,
      currentDps,
      passiveLevels,
      lastDailyClaim
    };

    if (!quest.check(questStats, gameSnapshot)) return;

    setCash((c) => c + quest.reward);
    setClaimedMilestones((prev) => ({ ...prev, [questId]: true }));
    playProfitSound();
    triggerToast(`Misi Selesai: "${quest.title}"! Hadiah +${formatMoney(quest.reward)} masuk kas!`, 'success');
  };

  const handleClaimDaily = (questId) => {
    const quest = DAILY_QUESTS.find((q) => q.id === questId);
    if (!quest) return;
    if (dailyQuestState.claimed?.[questId]) return;
    if (quest.getProgress(dailyQuestState) < quest.target) return;

    setCash((c) => c + quest.reward);
    playProfitSound();
    setDailyQuestState((prev) => ({
      ...prev,
      claimed: { ...prev.claimed, [questId]: true }
    }));
    triggerToast(`Tugas Harian Selesai: "${quest.title}"! Hadiah +${formatMoney(quest.reward)} masuk kas!`, 'success');
  };

  useLayoutEffect(() => {
    latest.current = {
      cash, peakNetWorth: Math.max(peakNetWorth, netWorth), whaleTokens, passiveLevels,
      activePosition, tradeHistory, lastDailyClaim, lastWhaleFaucetClaim, selectedPairIdx, selectedTfIdx,
      bullRunLeft, bearMarketLeft, activeEvent, liquidationAlert, currentDps,
      currentLocation, claimedMilestones, questStats, dailyQuestState,
      inventory, activeEffects, dailyWhaleUsage
    };
  });

  const saveGame = useCallback(() => {
    if (isLockedRef.current) return;
    if (!latest.current) return;
    const { currentDps: _dps, ...state } = latest.current;
    const trimmedCandles = {};
    if (candlesticksByTfRef.current && typeof candlesticksByTfRef.current === 'object') {
      for (const [k, arr] of Object.entries(candlesticksByTfRef.current)) {
        if (Array.isArray(arr) && arr.length > 0) {
          trimmedCandles[k] = arr.slice(-100);
        }
      }
    }

    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        ...state,
        candlesticksByTf: trimmedCandles,
        version: 8,
        syncVersion: 2,
        marketPrices: [...marketPricesRef.current],
        tradeHistory: (state.tradeHistory || []).slice(0, 20),
        lastTimestamp: Date.now()
      }));
      setSaveError(false);
      // Background sync to PostgreSQL database
      syncGameProgressToDB(state);
    } catch {
      // Fallback: If full payload fails (e.g. QuotaExceededError), try saving essential core progress without heavy candles
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({
          ...state,
          candlesticksByTf: {},
          version: 8,
          syncVersion: 2,
          marketPrices: [...marketPricesRef.current],
          tradeHistory: (state.tradeHistory || []).slice(0, 10),
          lastTimestamp: Date.now()
        }));
        setSaveError(false);
      } catch {
        setSaveError(true);
      }
    }
  }, []);

  const exportSaveBackup = useCallback(() => {
    try {
      if (!latest.current) return;
      const { currentDps: _dps, ...state } = latest.current;
      const backupData = {
        ...state,
        version: 8,
        syncVersion: 2,
        marketPrices: [...marketPricesRef.current],
        tradeHistory: (state.tradeHistory || []).slice(0, 20),
        lastTimestamp: Date.now()
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `degen-whale-save-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerToast('File backup progres berhasil diunduh!', 'success');
    } catch {
      triggerToast('Gagal mengunduh file backup.', 'danger');
    }
  }, [triggerToast]);

  const initCandlesForPairAndTf = useCallback((pairIdx, tfIdx) => {
    const key = `${pairIdx}-${tfIdx}`;
    if (candlesticksByTfRef.current[key]?.length > 0) return;

    const pair = MARKET_PAIRS[pairIdx];
    const livePrice = (pair?.marketType === 'crypto_real' && liveCryptoStatsRef.current?.[pair.symbol]?.price)
      ? liveCryptoStatsRef.current[pair.symbol].price
      : marketPricesRef.current[pairIdx];
    const anchorPrice = livePrice || pair?.basePrice || 100;
    const syncMap = generateSynchronousCandlesForPair(pairIdx, anchorPrice);
    candlesticksByTfRef.current = {
      ...candlesticksByTfRef.current,
      ...syncMap
    };
    setCandlesticksByTf(prev => ({
      ...prev,
      ...syncMap
    }));

    if (pair && pair.marketType === 'crypto_real') {
      fetchLiveKlinesForPair(pairIdx, tfIdx);
    }
  }, [fetchLiveKlinesForPair]);

  // Pre-initialize candles across all timeframes for the active pair so switching timeframes
  // is instantaneous, 100% synchronous, and shares the exact same tick stream without changing prices or PnL.
  useEffect(() => {
    const key = `${selectedPairIdx}-${selectedTfIdx}`;
    if (!candlesticksByTf[key] || candlesticksByTf[key].length === 0) {
      initCandlesForPairAndTf(selectedPairIdx, selectedTfIdx);
    }
    const pair = MARKET_PAIRS[selectedPairIdx];
    if (pair && pair.marketType === 'crypto_real') {
      const p = marketPricesRef.current[selectedPairIdx] || pair.basePrice;
      realignCandlesToLivePrice(selectedPairIdx, p);
      fetchLiveKlinesForPair(selectedPairIdx, selectedTfIdx);
    }
  }, [selectedPairIdx, selectedTfIdx, candlesticksByTf, initCandlesForPairAndTf, realignCandlesToLivePrice, fetchLiveKlinesForPair]);

  useEffect(() => {
    saveGame(); // Also commits migration and offline earnings exactly once per load.
    const saveInterval = setInterval(saveGame, 3000);
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') saveGame();
    };
    window.addEventListener('pagehide', saveGame);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(saveInterval);
      window.removeEventListener('pagehide', saveGame);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [saveGame]);

  // Commit transactions immediately; the fixed timer covers continuous income.
  useEffect(() => {
    saveGame();
  }, [passiveLevels, whaleTokens, tradeHistory, lastDailyClaim,
    Boolean(activePosition), activeEvent?.type, Boolean(liquidationAlert), saveGame]);

  // Multi-tab synchronization and locking via BroadcastChannel to prevent save overwrites
  useEffect(() => {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;

    const channel = new BroadcastChannel(TAB_SYNC_CHANNEL);
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const data = event.data;
      if (!data || data.tabId === tabId) return;

      if (data.type === 'QUERY_LOCK') {
        // If this tab is currently the active leader, inform the inquirer
        if (!isLockedRef.current) {
          channel.postMessage({ type: 'LOCK_ACK', activeTabId: tabId });
        }
      } else if (data.type === 'LOCK_ACK') {
        // Another active tab is present elsewhere; lock this tab
        isLockedRef.current = true;
        setIsLockedByOtherTab(true);
      } else if (data.type === 'CLAIM_LOCK') {
        // Another tab has taken over the active session
        if (!isLockedRef.current) {
          saveGame();
        }
        isLockedRef.current = true;
        setIsLockedByOtherTab(true);
      } else if (data.type === 'RELEASE_LOCK') {
        // Previous leader closed; if this tab is visible, automatically take over
        if (isLockedRef.current && typeof document !== 'undefined' && document.visibilityState === 'visible') {
          handleTakeOverSession();
        }
      } else if (data.type === 'HARD_RESET') {
        const fresh = loadGame();
        setCash(fresh.cash);
        setPeakNetWorth(fresh.peakNetWorth);
        setWhaleTokens(fresh.whaleTokens);
        setPassiveLevels(fresh.passiveLevels);
        setActivePosition(fresh.activePosition);
        setTradeHistory(fresh.tradeHistory);
        setLastDailyClaim(fresh.lastDailyClaim);
        setSelectedPairIdx(fresh.selectedPairIdx);
        setSelectedTfIdx(fresh.selectedTfIdx);
        setBullRunLeft(fresh.bullRunLeft);
        setBearMarketLeft(fresh.bearMarketLeft);
        setActiveEvent(fresh.activeEvent);
        setLiquidationAlert(fresh.liquidationAlert);
        candlesticksByTfRef.current = fresh.candlesticksByTf || {};
        setCandlesticksByTf(fresh.candlesticksByTf || {});
        marketPricesRef.current = fresh.marketPrices;
        setCurrentPrice(fresh.marketPrices[fresh.selectedPairIdx]);
        setClaimedMilestones(fresh.claimedMilestones || {});
        setQuestStats(fresh.questStats || { ...initialQuestStats });
        setDailyQuestState(fresh.dailyQuestState || { ...initialDailyQuestState });
      }
    };

    // Query if an active session already exists in another tab
    channel.postMessage({ type: 'QUERY_LOCK', tabId });

    const handleBeforeUnload = () => {
      if (!isLockedRef.current) {
        channel.postMessage({ type: 'RELEASE_LOCK', tabId });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      channel.close();
      channelRef.current = null;
    };
  }, [tabId, saveGame, handleTakeOverSession]);

  useEffect(() => {
    const tickerTimer = setInterval(() => {
      setTickerIdx((prev) => (prev + 1) % NEWS_TICKER_ITEMS.length);
    }, 8000);
    return () => clearInterval(tickerTimer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const w = Math.round(rect.width);
          const h = Math.round(rect.height);
          canvasRef.current.width = w;
          canvasRef.current.height = h;
          setCanvasSize({ width: w, height: h });
        }
      }
    };
    handleResize();

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && canvasRef.current) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(canvasRef.current);
    }

    window.addEventListener('resize', handleResize);
    const t0 = setTimeout(handleResize, 10);
    const t1 = setTimeout(handleResize, 50);
    const t2 = setTimeout(handleResize, 150);
    const t3 = setTimeout(handleResize, 320);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isSidebarOpen, tradingMode]);

  const activeCandles = useMemo(() => {
    const key = `${selectedPairIdx}-${selectedTfIdx}`;
    const fromState = candlesticksByTf[key];
    if (fromState && fromState.length > 0) return fromState;
    const fromRef = candlesticksByTfRef.current[key];
    if (fromRef && fromRef.length > 0) return fromRef;

    // Safety net: Always immediately guarantee a populated candle stream
    const pair = MARKET_PAIRS[selectedPairIdx] || MARKET_PAIRS[0];
    const livePrice = (pair?.marketType === 'crypto_real' && liveCryptoStatsRef.current?.[pair.symbol]?.price)
      ? liveCryptoStatsRef.current[pair.symbol].price
      : marketPricesRef.current[selectedPairIdx] || pair.basePrice;
    const syncMap = generateSynchronousCandlesForPair(selectedPairIdx, livePrice);
    candlesticksByTfRef.current = { ...candlesticksByTfRef.current, ...syncMap };
    return syncMap[key] || [];
  }, [candlesticksByTf, selectedPairIdx, selectedTfIdx]);

  const displayCandle = useMemo(() => {
    if (!activeCandles || activeCandles.length === 0) return null;
    const chartWidth = canvasSize.width > 80 ? canvasSize.width - 80 : 600;
    const baseCandles = Math.max(45, Math.min(140, Math.round(chartWidth / 11)));
    const targetCandleCount = Math.max(12, Math.min(activeCandles.length, Math.round(baseCandles / chartXZoom)));
    const slotWidth = chartWidth / targetCandleCount;
    const lastIdx = activeCandles.length - 1;

    if (mousePos.x !== null && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const actualChartWidth = rect.width - 80;
      if (mousePos.x <= actualChartWidth && mousePos.x >= 0) {
        const candleOffsetFromLast = (mousePos.x - chartPanX - (actualChartWidth - slotWidth * 0.5)) / slotWidth;
        const hoveredIdx = Math.round(lastIdx + candleOffsetFromLast);
        if (hoveredIdx >= 0 && hoveredIdx < activeCandles.length) {
          return activeCandles[hoveredIdx];
        }
      }
    }
    return activeCandles[lastIdx];
  }, [activeCandles, mousePos, chartXZoom, chartPanX, canvasSize.width]);

  const indicatorData = useMemo(() => {
    if (!activeCandles || activeCandles.length === 0) return null;
    return {
      ema20: calculateEMA(activeCandles, 20),
      ema50: calculateEMA(activeCandles, 50),
      ema200: calculateEMA(activeCandles, 200),
      bollinger: calculateBollingerBands(activeCandles, 20, 2),
    };
  }, [activeCandles]);

  const currentIndicatorValues = useMemo(() => {
    if (!indicatorData || !activeCandles || activeCandles.length === 0) return {};
    let targetIdx = activeCandles.length - 1;
    if (displayCandle) {
      const idx = activeCandles.findIndex((c) => c.time === displayCandle.time);
      if (idx !== -1) targetIdx = idx;
    }
    return {
      ema20: indicatorData.ema20 ? indicatorData.ema20[targetIdx] : null,
      ema50: indicatorData.ema50 ? indicatorData.ema50[targetIdx] : null,
      ema200: indicatorData.ema200 ? indicatorData.ema200[targetIdx] : null,
      bbUpper: indicatorData.bollinger?.upper ? indicatorData.bollinger.upper[targetIdx] : null,
      bbMiddle: indicatorData.bollinger?.middle ? indicatorData.bollinger.middle[targetIdx] : null,
      bbLower: indicatorData.bollinger?.lower ? indicatorData.bollinger.lower[targetIdx] : null,
    };
  }, [indicatorData, activeCandles, displayCandle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width || 600;
    const height = canvas.height || 320;

    ctx.clearRect(0, 0, width, height);

    const activePairConfig = MARKET_PAIRS[selectedPairIdx] || MARKET_PAIRS[0];
    const pairBasePrecision = getPairPrecision(activePairConfig, currentPrice);
    const rightAxisWidth = pairBasePrecision >= 4 ? 88 : 80;
    const initialChartWidth = Math.max(200, width - rightAxisWidth);
    const chartWidth = width - rightAxisWidth;
    const bottomAxisHeight = 24;
    const chartHeight = height - bottomAxisHeight;

    const baseCandles = Math.max(45, Math.min(140, Math.round(initialChartWidth / 11)));
    const targetCandleCount = Math.max(12, Math.min(activeCandles.length, Math.round(baseCandles / chartXZoom)));
    const slotWidth = chartWidth / targetCandleCount;
    const lastCandleIdx = activeCandles.length - 1;

    // Direct pixel coordinate mapping with chartPanX
    const getCandleX = (k) => chartWidth - slotWidth * 0.5 - (lastCandleIdx - k) * slotWidth + chartPanX;

    // Filter which candles are within the visible viewport (plus 3 candles margin)
    const minVisibleK = Math.max(0, Math.floor(lastCandleIdx - (chartWidth + 3 * slotWidth + chartPanX) / slotWidth));
    const maxVisibleK = Math.min(lastCandleIdx, Math.ceil(lastCandleIdx - (-3 * slotWidth + chartPanX) / slotWidth));

    const visibleCandleItems = [];
    for (let k = minVisibleK; k <= maxVisibleK; k++) {
      if (activeCandles[k]) {
        visibleCandleItems.push({ candle: activeCandles[k], index: k, x: getCandleX(k) });
      }
    }

    const candlesForScale = visibleCandleItems.length > 0 
      ? visibleCandleItems.map((item) => item.candle)
      : activeCandles.slice(-targetCandleCount);

    let candleMin = Infinity;
    let candleMax = -Infinity;

    candlesForScale.forEach((c) => {
      if (c.low < candleMin) candleMin = c.low;
      if (c.high > candleMax) candleMax = c.high;
    });

    if (currentPrice < candleMin) candleMin = currentPrice;
    if (currentPrice > candleMax) candleMax = currentPrice;

    // Pastikan range candle memiliki tinggi visual minimal agar candle tidak gepeng
    let candleSpan = candleMax - candleMin;
    const minSpan = Math.max(0.01, currentPrice * 0.008);
    if (candleSpan < minSpan) {
      const center = (candleMax + candleMin) / 2;
      candleMin = center - minSpan / 2;
      candleMax = center + minSpan / 2;
      candleSpan = candleMax - candleMin;
    }

    let viewMin = candleMin;
    let viewMax = candleMax;

    // Skala Y berpusat pada candlestick. Posisi aktif hanya memperluas skala jika levelnya
    // berada pada pair yang sedang dilihat. JANGAN biarkan liquidation jauh meledakkan skala!
    const isPosOnActivePair = activePosition && activePosition.pairSymbol === MARKET_PAIRS[selectedPairIdx]?.symbol;
    if (isPosOnActivePair) {
      const maxProximity = candleSpan * 1.8;

      // Sertakan entry price jika dekat dengan lilin
      if (Math.abs(activePosition.entryPrice - currentPrice) <= maxProximity) {
        viewMin = Math.min(viewMin, activePosition.entryPrice);
        viewMax = Math.max(viewMax, activePosition.entryPrice);
      }

      // Liq price hanya disertakan jika harga sudah sangat mendekati liquidation (kondisi kritis)
      if (Math.abs(activePosition.liqPrice - currentPrice) <= maxProximity * 0.75) {
        viewMin = Math.min(viewMin, activePosition.liqPrice);
        viewMax = Math.max(viewMax, activePosition.liqPrice);
      }

      // TP & SL hanya disertakan jika dekat dengan lilin
      if (activePosition.tpPrice && Math.abs(activePosition.tpPrice - currentPrice) <= maxProximity) {
        viewMin = Math.min(viewMin, activePosition.tpPrice);
        viewMax = Math.max(viewMax, activePosition.tpPrice);
      }
      if (activePosition.slPrice && Math.abs(activePosition.slPrice - currentPrice) <= maxProximity) {
        viewMin = Math.min(viewMin, activePosition.slPrice);
        viewMax = Math.max(viewMax, activePosition.slPrice);
      }
    }

    const effectiveSpan = viewMax - viewMin;
    const centerPrice = (viewMax + viewMin) / 2 + chartPanY;
    // TradingView-Style Interactive Y-Zoom: stretch or compress vertical span
    const scaledSpan = effectiveSpan / chartYZoom;
    const pricePadding = scaledSpan * 0.16;
    const minPrice = Math.max(0.0001, centerPrice - scaledSpan / 2 - pricePadding);
    const maxPrice = centerPrice + scaledSpan / 2 + pricePadding;
    const priceRange = maxPrice - minPrice;
    const dynamicPrecision = getDynamicAxisPrecision(priceRange, pairBasePrecision);

    const toY = (price) => chartHeight - ((price - minPrice) / (priceRange || 1)) * (chartHeight - 30) - 15;
    const toPrice = (y) => maxPrice - ((y - 15) / (chartHeight - 30)) * priceRange;

    // Helper untuk menggambar rounded pill
    const drawPill = (x, y, w, h, radius, fillColor, strokeColor, strokeWidth = 1) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x + radius, y);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
      }
      if (strokeColor) {
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
      }
    };

    const candleWidth = Math.max(1, Math.min(22, slotWidth * 0.72));
    const wickLineWidth = slotWidth < 3 ? 1 : (slotWidth < 6 ? 1.2 : 1.5);

    const intervalMs = (TIMEFRAMES[selectedTfIdx]?.seconds || 60) * 1000;
    const lastCandleTime = activeCandles[lastCandleIdx]?.time || Date.now();

    const timeToX = (time) => {
      const candleDiff = (time - lastCandleTime) / intervalMs;
      return (chartWidth - slotWidth * 0.5 + chartPanX) + candleDiff * slotWidth;
    };

    const xToTime = (x) => {
      const candleDiff = (x - chartPanX - (chartWidth - slotWidth * 0.5)) / slotWidth;
      return Math.round(lastCandleTime + candleDiff * intervalMs);
    };

    chartCoordsRef.current = {
      minPrice,
      maxPrice,
      priceRange,
      chartWidth,
      chartHeight,
      slotWidth,
      sliceCandles: candlesForScale,
      toY,
      toPrice,
      timeToX,
      xToTime,
    };

    // =========================================================================
    // 1. CLIPPED MAIN CHART CANVAS AREA
    // Strictly confines all chart drawings, candles, and indicators to [0, 0, chartWidth, chartHeight].
    // Positively guarantees drawings will NEVER bleed into Time X Axis or Right Price Axis.
    // =========================================================================
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, chartWidth, chartHeight);
    ctx.clip();

    // Chart grid lines horizontal
    ctx.strokeStyle = '#141D2B';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 6; i++) {
      const y = 15 + ((chartHeight - 30) / 6) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();
    }

    // 1.1 Render Bollinger Bands Cloud & Lines (Under Candlesticks)
    if (indicators.bollinger && indicatorData?.bollinger) {
      const upperPts = [];
      const lowerPts = [];
      const middlePts = [];

      visibleCandleItems.forEach(({ index: k, x }) => {
        const u = indicatorData.bollinger.upper[k];
        const m = indicatorData.bollinger.middle[k];
        const l = indicatorData.bollinger.lower[k];
        if (u !== null && !isNaN(u) && l !== null && !isNaN(l)) {
          upperPts.push({ x, y: toY(u) });
          lowerPts.push({ x, y: toY(l) });
          if (m !== null && !isNaN(m)) middlePts.push({ x, y: toY(m) });
        }
      });

      if (upperPts.length > 1) {
        ctx.fillStyle = 'rgba(99, 102, 241, 0.08)';
        ctx.beginPath();
        ctx.moveTo(upperPts[0].x, upperPts[0].y);
        upperPts.forEach((p) => ctx.lineTo(p.x, p.y));
        for (let i = lowerPts.length - 1; i >= 0; i--) {
          ctx.lineTo(lowerPts[i].x, lowerPts[i].y);
        }
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#818CF8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        upperPts.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        ctx.beginPath();
        lowerPts.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        if (middlePts.length > 1) {
          ctx.strokeStyle = 'rgba(129, 140, 248, 0.5)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          middlePts.forEach((p, idx) => {
            if (idx === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }

    // 1.2 Render EMAs (EMA 20, EMA 50, EMA 200)
    const drawEmaLine = (values, color, lineWidth = 1.5) => {
      if (!values) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      let started = false;
      visibleCandleItems.forEach(({ index: k, x }) => {
        const val = values[k];
        if (val !== null && !isNaN(val)) {
          const y = toY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      if (started) ctx.stroke();
    };

    if (indicators.ema20 && indicatorData?.ema20) {
      drawEmaLine(indicatorData.ema20, '#F59E0B', 1.5);
    }
    if (indicators.ema50 && indicatorData?.ema50) {
      drawEmaLine(indicatorData.ema50, '#38BDF8', 1.5);
    }
    if (indicators.ema200 && indicatorData?.ema200) {
      drawEmaLine(indicatorData.ema200, '#C084FC', 1.8);
    }

    // 1.3 Render Candlesticks
    visibleCandleItems.forEach(({ candle: c, x }) => {
      const isGreen = c.close >= c.open;
      const color = isGreen ? '#00FF88' : '#FF3366';

      ctx.strokeStyle = color;
      ctx.lineWidth = wickLineWidth;
      ctx.beginPath();
      ctx.moveTo(x, toY(c.high));
      ctx.lineTo(x, toY(c.low));
      ctx.stroke();

      const yOpen = toY(c.open);
      const yClose = toY(c.close);
      const bodyY = Math.min(yOpen, yClose);
      const bodyH = Math.max(1.5, Math.abs(yClose - yOpen));

      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyH);
    });

    // 1.4 Current price horizontal line
    const markY = toY(currentPrice);
    if (markY >= 15 && markY <= chartHeight - 15) {
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, markY);
      ctx.lineTo(chartWidth, markY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 1.5 Active position indicators (Clean & refined minimalist styling ala TradingView)
    if (isPosOnActivePair) {
      const drawPositionLineInChart = (price, color, label, isAdjustable = false, dragType = null) => {
        if (!price || isNaN(price)) return;
        const y = toY(price);
        if (y < 15 || y > chartHeight - 15) return;

        const isBeingDragged = Boolean(dragType && draggingTpSlType === dragType);
        const isHovered = Boolean(dragType && hoveredAdjustable === dragType && !activeDrawingTool);

        // Clean subtle dashed line across the chart (no thick bulky glow)
        ctx.strokeStyle = isBeingDragged ? '#FFFFFF' : (isHovered ? '#FFFFFF' : color);
        ctx.lineWidth = isBeingDragged ? 1.5 : (isHovered ? 1.3 : 1.0);
        ctx.setLineDash(isBeingDragged ? [] : (isAdjustable ? [5, 4] : [4, 4]));
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Sleek concise text: if ENTRY, display live running PnL. If TP/SL, display target dollar outcome.
        let tagText = `${label} ${formatPairPrice(price, pairBasePrecision)}`;
        let pillColor = color;

        if (label === 'ENTRY' && activePosition) {
          const isLong = activePosition.type === 'LONG';
          const diff = isLong ? currentPrice - activePosition.entryPrice : activePosition.entryPrice - currentPrice;
          const roi = (diff / activePosition.entryPrice) * activePosition.leverage * 100;
          const pnl = activePosition.margin * (roi / 100);
          const pnlSign = pnl >= 0 ? '+' : '-';
          const pnlStr = `${pnlSign}${formatMoney(Math.abs(pnl))}`;
          const roiStr = `${pnlSign}${Math.abs(roi).toFixed(1)}%`;
          tagText = `ENTRY ${formatPairPrice(price, pairBasePrecision)} (${pnlStr} / ${roiStr})`;
          pillColor = pnl >= 0 ? '#10B981' : '#F43F5E';
        } else if (isBeingDragged && activePosition) {
          const isLong = activePosition.type === 'LONG';
          const diff = isLong ? price - activePosition.entryPrice : activePosition.entryPrice - price;
          const estRoi = (diff / activePosition.entryPrice) * activePosition.leverage * 100;
          const estDollar = activePosition.margin * (estRoi / 100);
          const estStr = estDollar >= 0 ? `+${formatMoney(estDollar)}` : `-${formatMoney(Math.abs(estDollar))}`;
          tagText = `${label} ${formatPairPrice(price, pairBasePrecision)} (${estStr})`;
          pillColor = '#FFFFFF';
        } else if (isAdjustable && activePosition) {
          const isLong = activePosition.type === 'LONG';
          const diff = isLong ? price - activePosition.entryPrice : activePosition.entryPrice - price;
          const estRoi = (diff / activePosition.entryPrice) * activePosition.leverage * 100;
          const estDollar = activePosition.margin * (estRoi / 100);
          const estStr = estDollar >= 0 ? `+${formatMoney(estDollar)}` : `-${formatMoney(Math.abs(estDollar))}`;
          tagText = `${label} ${formatPairPrice(price, pairBasePrecision)} (${estStr}) ⇅`;
        }

        ctx.font = 'bold 9px monospace';
        const tagWidth = ctx.measureText(tagText).width + 14;
        const tagX = (chartWidth - tagWidth) / 2;
        const tagH = 16;
        
        // Sleek minimal pill: dark navy background (#0B0F19), clean 1px border matching line
        drawPill(tagX, y - tagH / 2, tagWidth, tagH, 3.5, '#0B0F19', isBeingDragged ? '#FFFFFF' : pillColor, 1);
        ctx.fillStyle = isBeingDragged ? '#FFFFFF' : pillColor;
        ctx.fillText(tagText, tagX + 7, y + 3.2);
      };

      drawPositionLineInChart(activePosition.entryPrice, '#38BDF8', 'ENTRY', false, null);
      drawPositionLineInChart(activePosition.liqPrice, '#F43F5E', 'LIQ', false, null);
      if (activePosition.tpPrice) drawPositionLineInChart(activePosition.tpPrice, '#10B981', 'TP', true, 'TP');
      if (activePosition.slPrice) drawPositionLineInChart(activePosition.slPrice, '#F59E0B', 'SL', true, 'SL');

      // Off-screen Liquidation Navigator Pill (TradingView-style off-chart alert)
      if (activePosition.liqPrice > maxPrice) {
        const distPct = (((activePosition.liqPrice - currentPrice) / currentPrice) * 100).toFixed(1);
        const liqText = `▲ LIQ: ${formatPairPrice(activePosition.liqPrice, pairBasePrecision)} (+${distPct}%)`;
        ctx.font = 'bold 9.5px monospace';
        const pillW = ctx.measureText(liqText).width + 16;
        drawPill(chartWidth - pillW - 10, 14, pillW, 20, 5, 'rgba(244, 63, 94, 0.15)', '#F43F5E', 1);
        ctx.fillStyle = '#FB7185';
        ctx.fillText(liqText, chartWidth - pillW - 2, 27.5);
      } else if (activePosition.liqPrice < minPrice) {
        const distPct = (((currentPrice - activePosition.liqPrice) / currentPrice) * 100).toFixed(1);
        const liqText = `▼ LIQ: ${formatPairPrice(activePosition.liqPrice, pairBasePrecision)} (-${distPct}%)`;
        ctx.font = 'bold 9.5px monospace';
        const pillW = ctx.measureText(liqText).width + 16;
        drawPill(chartWidth - pillW - 10, chartHeight - 26, pillW, 20, 5, 'rgba(244, 63, 94, 0.15)', '#F43F5E', 1);
        ctx.fillStyle = '#FB7185';
        ctx.fillText(liqText, chartWidth - pillW - 2, chartHeight - 12.5);
      }

      // Off-screen TP/SL Navigator Pills if outside view
      if (activePosition.tpPrice && activePosition.tpPrice > maxPrice) {
        const tpText = `▲ TP: ${formatPairPrice(activePosition.tpPrice, pairBasePrecision)}`;
        ctx.font = 'bold 9px monospace';
        const pillW = ctx.measureText(tpText).width + 12;
        drawPill(chartWidth - pillW - 10, 38, pillW, 18, 4, 'rgba(16, 185, 129, 0.15)', '#10B981', 1);
        ctx.fillStyle = '#34D399';
        ctx.fillText(tpText, chartWidth - pillW - 4, 50.5);
      } else if (activePosition.tpPrice && activePosition.tpPrice < minPrice) {
        const tpText = `▼ TP: ${formatPairPrice(activePosition.tpPrice, pairBasePrecision)}`;
        ctx.font = 'bold 9px monospace';
        const pillW = ctx.measureText(tpText).width + 12;
        drawPill(chartWidth - pillW - 10, chartHeight - 48, pillW, 18, 4, 'rgba(16, 185, 129, 0.15)', '#10B981', 1);
        ctx.fillStyle = '#34D399';
        ctx.fillText(tpText, chartWidth - pillW - 4, chartHeight - 35.5);
      }

      if (activePosition.slPrice && activePosition.slPrice > maxPrice) {
        const slText = `▲ SL: ${formatPairPrice(activePosition.slPrice, pairBasePrecision)}`;
        ctx.font = 'bold 9px monospace';
        const pillW = ctx.measureText(slText).width + 12;
        drawPill(chartWidth - pillW - 10, 60, pillW, 18, 4, 'rgba(245, 158, 11, 0.15)', '#F59E0B', 1);
        ctx.fillStyle = '#FBBF24';
        ctx.fillText(slText, chartWidth - pillW - 4, 72.5);
      } else if (activePosition.slPrice && activePosition.slPrice < minPrice) {
        const slText = `▼ SL: ${formatPairPrice(activePosition.slPrice, pairBasePrecision)}`;
        ctx.font = 'bold 9px monospace';
        const pillW = ctx.measureText(slText).width + 12;
        drawPill(chartWidth - pillW - 10, chartHeight - 70, pillW, 18, 4, 'rgba(245, 158, 11, 0.15)', '#F59E0B', 1);
        ctx.fillStyle = '#FBBF24';
        ctx.fillText(slText, chartWidth - pillW - 4, chartHeight - 57.5);
      }
    }

    // Helper to draw clean circular anchor handle
    const drawAnchorHandle = (ax, ay) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(ax, ay, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ax, ay, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#0284C7';
      ctx.fill();
      ctx.restore();
    };

    // 1.6 Render Saved User Drawings (Strictly confined inside chart clipping region)
    currentPairDrawings.forEach((d) => {
      const isSelected = d.id === selectedDrawingId;

      if (d.type === 'horizontal') {
        const y = toY(d.price);
        if (y >= 0 && y <= chartHeight) {
          // Glow highlight if selected
          if (isSelected) {
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(chartWidth, y);
            ctx.stroke();
          }

          ctx.strokeStyle = d.color;
          ctx.lineWidth = isSelected ? 2.5 : 1.5;
          ctx.setLineDash(isSelected ? [] : [6, 4]);
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(chartWidth, y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Drag handle pill if selected (only within chart)
          if (isSelected && y >= 12 && y <= chartHeight - 12) {
            drawPill(chartWidth / 2 - 28, y - 9, 56, 18, 4, '#0B0F19', '#38BDF8');
            ctx.fillStyle = '#38BDF8';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('⠿ Geser', chartWidth / 2 - 19, y + 3.5);
          }
        }
      } else if (d.type === 'trendline') {
        const x1 = timeToX(d.p1.time);
        const y1 = toY(d.p1.price);
        const x2 = timeToX(d.p2.time);
        const y2 = toY(d.p2.price);

        // Glow highlight if selected
        if (isSelected) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        ctx.strokeStyle = d.color;
        ctx.lineWidth = isSelected ? 2.8 : 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        if (isSelected) {
          drawAnchorHandle(x1, y1);
          drawAnchorHandle(x2, y2);
        } else {
          ctx.fillStyle = d.color;
          ctx.beginPath();
          ctx.arc(x1, y1, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x2, y2, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (d.type === 'box') {
        const x1 = timeToX(d.p1.time);
        const y1 = toY(d.p1.price);
        const x2 = timeToX(d.p2.time);
        const y2 = toY(d.p2.price);

        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        const boxW = Math.max(2, maxX - minX);
        const boxH = Math.max(2, maxY - minY);

        // Glow highlight if selected
        if (isSelected) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.lineWidth = 4;
          ctx.strokeRect(minX - 2, minY - 2, boxW + 4, boxH + 4);
        }

        ctx.fillStyle = hexToRgba(d.color, isSelected ? 0.25 : 0.18);
        ctx.fillRect(minX, minY, boxW, boxH);
        ctx.strokeStyle = d.color;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.setLineDash(isSelected ? [] : [4, 2]);
        ctx.strokeRect(minX, minY, boxW, boxH);
        ctx.setLineDash([]);

        if (isSelected) {
          drawAnchorHandle(x1, y1);
          drawAnchorHandle(x2, y2);
          drawAnchorHandle(x1, y2);
          drawAnchorHandle(x2, y1);
        }
      } else if (d.type === 'freehand' && d.points && d.points.length > 1) {
        if (isSelected) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          d.points.forEach((pt, pIdx) => {
            const px = timeToX(pt.time);
            const py = toY(pt.price);
            if (pIdx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.stroke();
        }

        ctx.strokeStyle = d.color;
        ctx.lineWidth = isSelected ? 2.8 : 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        d.points.forEach((pt, pIdx) => {
          const px = timeToX(pt.time);
          const py = toY(pt.price);
          if (pIdx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }
    });

    // 1.7 Render Pending Live Drawing Preview
    if (pendingDrawing) {
      if (pendingDrawing.type === 'trendline' && mousePos.x !== null && mousePos.y !== null && mousePos.x <= chartWidth) {
        const x1 = timeToX(pendingDrawing.p1.time);
        const y1 = toY(pendingDrawing.p1.price);
        const x2 = mousePos.x;
        const y2 = mousePos.y;

        ctx.strokeStyle = pendingDrawing.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = pendingDrawing.color;
        ctx.beginPath();
        ctx.arc(x1, y1, 4, 0, Math.PI * 2);
        ctx.arc(x2, y2, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (pendingDrawing.type === 'box' && mousePos.x !== null && mousePos.y !== null && mousePos.x <= chartWidth) {
        const x1 = timeToX(pendingDrawing.p1.time);
        const y1 = toY(pendingDrawing.p1.price);
        const x2 = mousePos.x;
        const y2 = mousePos.y;

        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);

        ctx.fillStyle = hexToRgba(pendingDrawing.color, 0.15);
        ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
        ctx.strokeStyle = pendingDrawing.color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
        ctx.setLineDash([]);
      } else if (pendingDrawing.type === 'freehand' && pendingDrawing.points && pendingDrawing.points.length > 1) {
        ctx.strokeStyle = pendingDrawing.color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        pendingDrawing.points.forEach((pt, pIdx) => {
          const px = timeToX(pt.time);
          const py = toY(pt.price);
          if (pIdx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }
    } else if (activeDrawingTool === 'horizontal' && mousePos.x !== null && mousePos.y !== null && mousePos.x <= chartWidth && mousePos.y >= 15 && mousePos.y <= chartHeight - 15) {
      // Live horizontal line preview on hover
      ctx.strokeStyle = drawingColor;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(chartWidth, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
    // =========================================================================
    // END CLIPPED MAIN CHART CANVAS AREA
    // =========================================================================

    // =========================================================================
    // 2. RIGHT PRICE Y-AXIS (Rendered on top layer)
    // =========================================================================
    ctx.fillStyle = '#0B0F17';
    ctx.fillRect(chartWidth, 0, rightAxisWidth, chartHeight);

    // Garis batas vertikal sumbu kanan
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartWidth, 0);
    ctx.lineTo(chartWidth, chartHeight);
    ctx.stroke();

    // Grid labels harga sumbu kanan
    ctx.fillStyle = '#64748B';
    ctx.font = dynamicPrecision >= 5 ? '9px monospace' : (dynamicPrecision === 4 ? '9.5px monospace' : '10px monospace');
    for (let i = 0; i <= 6; i++) {
      const y = 15 + ((chartHeight - 30) / 6) * i;
      const pVal = maxPrice - (i / 6) * priceRange;
      ctx.fillText(formatPairPrice(pVal, dynamicPrecision), chartWidth + 7, y + 4);
    }

    // Price Pills for Horizontal Drawings (Only within visible price axis, never covering AUTO button or Time Axis)
    currentPairDrawings.forEach((d) => {
      if (d.type === 'horizontal') {
        const y = toY(d.price);
        if (y >= 10 && y <= chartHeight - 14) {
          drawPill(chartWidth + 3, y - 8, rightAxisWidth - 6, 16, 3, d.color, null);
          ctx.fillStyle = '#07090E';
          ctx.font = dynamicPrecision >= 5 ? 'bold 8.5px monospace' : 'bold 9px monospace';
          ctx.fillText(formatPairPrice(d.price, dynamicPrecision), chartWidth + 7, y + 4);
        }
      }
    });

    // Active position right axis price pills
    if (isPosOnActivePair) {
      const drawPositionPricePill = (price, color) => {
        if (!price || isNaN(price)) return;
        const y = toY(price);
        if (y < 12 || y > chartHeight - 14) return;
        drawPill(chartWidth + 3, y - 8, rightAxisWidth - 6, 16, 3, color, null);
        ctx.fillStyle = '#07090E';
        ctx.font = dynamicPrecision >= 5 ? 'bold 8.5px monospace' : 'bold 9.5px monospace';
        ctx.fillText(formatPairPrice(price, dynamicPrecision), chartWidth + 7, y + 3.5);
      };

      drawPositionPricePill(activePosition.entryPrice, '#38BDF8');
      drawPositionPricePill(activePosition.liqPrice, '#F43F5E');
      if (activePosition.tpPrice) drawPositionPricePill(activePosition.tpPrice, '#10B981');
      if (activePosition.slPrice) drawPositionPricePill(activePosition.slPrice, '#F59E0B');
    }

    // Current price right axis pill & countdown
    if (markY >= 10 && markY <= chartHeight - 14) {
      drawPill(chartWidth + 3, markY - 9, rightAxisWidth - 6, 18, 4, '#38BDF8', null);
      ctx.fillStyle = '#07090E';
      ctx.font = dynamicPrecision >= 5 ? 'bold 9px monospace' : 'bold 10px monospace';
      ctx.fillText(formatPairPrice(currentPrice, dynamicPrecision), chartWidth + 7, markY + 4);

      const currentTf = TIMEFRAMES[selectedTfIdx] || TIMEFRAMES[0];
      const tfMs = currentTf.seconds * 1000;
      const nowMs = Date.now();
      const candleCloseTime = Math.floor(nowMs / tfMs) * tfMs + tfMs;
      const remainingSec = Math.max(0, Math.ceil((candleCloseTime - nowMs) / 1000));
      const countdownStr = formatCountdown(remainingSec);

      const countdownY = (markY + 11 + 15 <= chartHeight - 14) ? markY + 11 : markY - 26;
      if (countdownY >= 6 && countdownY <= chartHeight - 14) {
        drawPill(chartWidth + 3, countdownY, rightAxisWidth - 6, 15, 3, '#0B0F19', '#0284C7');
        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(countdownStr, chartWidth + 3 + (rightAxisWidth - 6) / 2, countdownY + 11);
        ctx.textAlign = 'left';
      }
    }

    // =========================================================================
    // 3. BOTTOM TIME X-AXIS (Rendered on top layer, solid non-bleeding background)
    // =========================================================================
    ctx.fillStyle = '#07090E';
    ctx.fillRect(0, chartHeight, width, bottomAxisHeight);
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, chartHeight);
    ctx.lineTo(width, chartHeight);
    ctx.stroke();

    const formatCandleTime = (timeMs, seconds) => {
      const d = new Date(timeMs);
      if (seconds >= 86400) {
        return `${d.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][d.getMonth()]}`;
      }
      if (seconds >= 3600) {
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${d.getDate()}/${d.getMonth()+1} ${hh}:${mm}`;
      }
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      return seconds < 60 ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
    };

    const currentTf = TIMEFRAMES[selectedTfIdx] || TIMEFRAMES[0];
    if (visibleCandleItems.length > 0) {
      ctx.fillStyle = '#64748B';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      const step = Math.max(1, Math.floor(visibleCandleItems.length / 6));
      let lastDrawnX = -999;
      const minDistance = 75; // minimum horizontal pixels between time labels to avoid jumbled overlap
      for (let i = 0; i < visibleCandleItems.length; i += step) {
        const item = visibleCandleItems[i];
        if (item.x >= 35 && item.x <= chartWidth - 35 && (item.x - lastDrawnX) >= minDistance) {
          ctx.fillText(formatCandleTime(item.candle.time, currentTf.seconds), item.x, chartHeight + 16);
          lastDrawnX = item.x;
        }
      }
      ctx.textAlign = 'left';
    }

    // =========================================================================
    // 4. CROSSHAIR & HOVER TIME/PRICE TOOLTIPS
    // =========================================================================
    if (mousePos.x !== null && mousePos.y !== null && mousePos.x <= chartWidth && mousePos.y >= 15 && mousePos.y <= chartHeight - 4) {
      const hoverPrice = toPrice(mousePos.y);

      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);

      ctx.beginPath();
      ctx.moveTo(mousePos.x, 15);
      ctx.lineTo(mousePos.x, chartHeight);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(chartWidth, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Right axis price pill
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(chartWidth, mousePos.y - 10, rightAxisWidth, 20);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = dynamicPrecision >= 5 ? 'bold 9px monospace' : 'bold 10px monospace';
      ctx.fillText(formatPairPrice(hoverPrice, dynamicPrecision), chartWidth + 6, mousePos.y + 4);

      // Bottom axis hover time pill
      const hoveredTime = xToTime(mousePos.x);
      const hoverTimeText = formatCandleTime(hoveredTime, currentTf.seconds);
      ctx.font = 'bold 9px monospace';
      const pillW = ctx.measureText(hoverTimeText).width + 12;
      const pillX = Math.max(2, Math.min(chartWidth - pillW - 2, mousePos.x - pillW / 2));
      drawPill(pillX, chartHeight + 3, pillW, 18, 4, '#1E293B', '#334155');
      ctx.fillStyle = '#E2E8F0';
      ctx.fillText(hoverTimeText, pillX + 6, chartHeight + 15.5);
    }
  }, [activeCandles, activePosition, canvasSize, mousePos, currentPrice, selectedTfIdx, chartXZoom, chartYZoom, chartPanX, chartPanY, candleTick, indicators, indicatorData, drawingsByPair, pendingDrawing, activeDrawingTool, drawingColor, selectedPairIdx, selectedDrawingId, hoveredAdjustable, draggingTpSlType]);

  useEffect(() => {
    let lastTick = performance.now();
    let priceElapsed = 0;
    let lastSec = Math.floor(Date.now() / 1000);
    const interval = setInterval(() => {
      if (isLockedRef.current) {
        lastTick = performance.now();
        return;
      }
      const now = performance.now();
      const dt = Math.max(0, Math.min(1, (now - lastTick) / 1000));
      lastTick = now;

      const currentSec = Math.floor(Date.now() / 1000);
      if (currentSec !== lastSec) {
        lastSec = currentSec;
        setCandleTick(currentSec);
      }
      const state = latest.current;
      if (!state) return;
      if (state.currentDps > 0) {
        const inc = state.currentDps * dt;
        setCash((prev) => prev + inc);
      }

      setBullRunLeft(prev => Math.max(0, prev - dt));
      setBearMarketLeft(prev => Math.max(0, prev - dt));

      priceElapsed += dt;
      if (priceElapsed >= 0.2) {
        priceElapsed %= 0.2;
        const pairIdx = state.selectedPairIdx;
        const spikeMult = Math.random() < 0.012 ? (Math.random() < 0.5 ? 1.5 : -1.5) : 1;
        const isRadarActive = Boolean(state.activeEffects?.radarUntil && state.activeEffects.radarUntil > Date.now());
        const drift = isRadarActive ? 0.44 : state.bullRunLeft > 0 ? 0.48 : state.bearMarketLeft > 0 ? 0.52 : 0.5;

        // 3. Mean Reversion Gravitasi Pasar (rebound alami menarik 45% lonjakan secara bertahap)
        let meanPull = 0;
        if (meanReversionRef.current && meanReversionRef.current.stepsLeft > 0) {
          meanPull = meanReversionRef.current.deltaPerStep;
          meanReversionRef.current.stepsLeft -= 1;
        }

        // Simulasi pergerakan harga untuk pair degen_perps; pair crypto_real digerakkan oleh feed live bursa!
        MARKET_PAIRS.forEach((pair, pIdx) => {
          if (pair.marketType === 'crypto_real' && liveCryptoStatsRef.current?.[pair.symbol]) {
            // Harga terkunci dan sinkron secara presisi dengan data live Binance
            return;
          }
          const prevPrice = marketPricesRef.current[pIdx];
          const reversionAdjustment = (pIdx === pairIdx) ? meanPull : 0;
          const nextPrice = Math.max(0.00001,
            prevPrice + (Math.random() - drift) * pair.vol * prevPrice * spikeMult - reversionAdjustment);
          marketPricesRef.current[pIdx] = nextPrice;
        });

        const activePairPrice = marketPricesRef.current[pairIdx];
        setCurrentPrice(activePairPrice);
        const nowMs = Date.now();

        // Update candlestick untuk pair aktif dan pair yang memiliki posisi terbuka
        setCandlesticksByTf(prevMap => {
          const next = { ...prevMap };
          const pairsToUpdate = new Set([pairIdx]);
          if (state.activePosition) {
            const posIdx = MARKET_PAIRS.findIndex(p => p.symbol === state.activePosition.pairSymbol);
            if (posIdx >= 0) pairsToUpdate.add(posIdx);
          }

          pairsToUpdate.forEach(pIdx => {
            const pPrice = marketPricesRef.current[pIdx];
            TIMEFRAMES.forEach((tf, tfIdx) => {
              const key = `${pIdx}-${tfIdx}`;
              let list = prevMap[key] || candlesticksByTfRef.current[key];
              if (!list?.length) {
                const syncMap = generateSynchronousCandlesForPair(pIdx, pPrice);
                next[key] = syncMap[key] || [];
                return;
              }
              const last = list[list.length - 1];
              const time = Math.floor(nowMs / (tf.seconds * 1000)) * tf.seconds * 1000;
              next[key] = last.time === time ? [
                ...list.slice(0, -1),
                { ...last, close: pPrice, high: Math.max(last.high, pPrice),
                  low: Math.min(last.low, pPrice) }
              ] : [...list.slice(-299), {
                open: last.close, close: pPrice,
                high: Math.max(last.close, pPrice), low: Math.min(last.close, pPrice), time
              }];
            });
          });
          candlesticksByTfRef.current = next;
          return next;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activePosition) return;
    if (settledPositionRef.current === activePosition.id) return;

    const posPairIdx = MARKET_PAIRS.findIndex(p => p.symbol === activePosition.pairSymbol);
    const posPrice = posPairIdx >= 0 && marketPricesRef.current[posPairIdx]
      ? marketPricesRef.current[posPairIdx]
      : currentPrice;

    const isLong = activePosition.type === 'LONG';
    const isPriceLiq = isLong ? posPrice <= activePosition.liqPrice : posPrice >= activePosition.liqPrice;
    const isTpHit = activePosition.tpPrice && (isLong ? posPrice >= activePosition.tpPrice : posPrice <= activePosition.tpPrice);
    const isSlHit = activePosition.slPrice && (isLong ? posPrice <= activePosition.slPrice : posPrice >= activePosition.slPrice);
    const isRoiLiq = livePositionStats && livePositionStats.roiPercent <= -95;

    if (isPriceLiq || isRoiLiq) {
      settledPositionRef.current = activePosition.id;

      // Feature 1: Liquidation Shield Defense Consumable
      if ((inventory?.liq_shield || 0) > 0) {
        setInventory((prev) => ({
          ...prev,
          liq_shield: Math.max(0, (prev.liq_shield || 0) - 1)
        }));
        const refund = activePosition.margin * 0.85;
        const lost = activePosition.margin - refund;
        setCash((c) => c + refund);
        playProfitSound();
        triggerToast(t.toastLiqShieldSaved || '🛡️ LIQUIDATION SHIELD PECAH! 85% modal margin berhasil diselamatkan!', 'warning');
        setTradeHistory((prev) => [
          {
            id: Date.now(),
            pair: activePosition.pairSymbol,
            type: activePosition.type,
            leverage: activePosition.leverage,
            pnl: -lost,
            roi: -15,
            status: 'DEFENDED'
          },
          ...prev.slice(0, 19)
        ]);
        setActivePosition(null);
        return;
      }

      playLiquidationSound();
      const lost = activePosition.margin;
      setLiquidationAlert({
        lostAmount: lost,
        pair: activePosition.pairSymbol,
        leverage: activePosition.leverage,
        type: activePosition.type
      });
      setTradeHistory((prev) => [
        {
          id: Date.now(),
          pair: activePosition.pairSymbol,
          type: activePosition.type,
          leverage: activePosition.leverage,
          pnl: -lost,
          roi: -100,
          status: 'LIQUIDATED'
        },
        ...prev.slice(0, 19)
      ]);
      setActivePosition(null);
    } else if (isTpHit) {
      closePosition(true, 'TAKE PROFIT (TP)');
    } else if (isSlHit) {
      closePosition(true, 'STOP LOSS (SL)');
    }
  }, [currentPrice, activePosition, livePositionStats]);

  const triggerRandomEvent = useCallback((forcedType = null) => {
    const loc = latest.current?.currentLocation || currentLocation;
    const canHack = (loc?.level || 1) >= 3; // Mulai muncul dari rank Bandar Lokal ke atas
    const roll = Math.random();
    let type = forcedType;
    if (!type) {
      if (canHack) {
        type = roll < 0.25 ? 'BULL' : roll < 0.65 ? 'HACK' : 'SEC_CRACKDOWN';
      } else {
        type = roll < 0.45 ? 'BULL' : 'SEC_CRACKDOWN';
      }
    }

    if (type === 'BULL') {
      setBullRunLeft(20);
      setActiveEvent({
        id: makeId(),
        type: 'BULL',
        title: '🚀 INSTITUSI BESAR BORONG ETF!',
        desc: 'Sentimen pasar menghijau! Semua pendapatan meningkat 5x LIPAT selama 20 detik!',
        timer: 20
      });
    } else if (type === 'SEC_CRACKDOWN') {
      setBearMarketLeft(25);
      setActiveEvent({
        id: makeId(),
        type: 'SEC_CRACKDOWN',
        title: '⚖️ REGULATOR BEKUKAN LIKUIDITAS & NAIKKAN SUKU BUNGA!',
        desc: 'Crypto Winter tiba! Pendapatan pasif terpotong 55% selama 25 detik!',
        timer: 25
      });
    } else {
      setActiveEvent({
        id: makeId(),
        type: 'HACK',
        title: '🚨 DARURAT: WALLET & EXCHANGE DI-EXPLOIT HACKER!',
        desc: 'Klik "Withdraw ke Cold Wallet" dalam 4 detik atau 25% kas + 1 level infrastruktur rusak!',
        timer: 4
      });
    }
  }, []);

  useEffect(() => {
    const eventInterval = setInterval(() => {
      if (isLockedRef.current) return;
      if (!latest.current?.activeEvent && !latest.current?.liquidationAlert) {
        triggerRandomEvent();
      }
    }, 60000); // 1 menit (disesuaikan dari 45s)
    return () => clearInterval(eventInterval);
  }, [triggerRandomEvent]);

  useEffect(() => {
    const t = setInterval(() => {
      if (isLockedRef.current) return;
      const event = latest.current?.activeEvent;
      if (!event) return;
      if (event.timer > 1) {
        setActiveEvent(prev => prev ? { ...prev, timer: prev.timer - 1 } : null);
        return;
      }
      if (handledEventRef.current === event.id) return;
      handledEventRef.current = event.id;
      if (event.type === 'HACK') {
        const penalty = latest.current.cash * 0.25;
        setCash(c => Math.max(0, c * 0.75));
        setPassiveLevels(prev => {
          const copy = { ...prev };
          const highest = [...PASSIVE_UPGRADES].reverse().find(u => copy[u.id] > 0);
          if (highest) copy[highest.id] -= 1;
          return copy;
        });
        triggerToast(
          `Terlambat! Hacker menguras ${formatMoney(penalty)} & merusak servermu!`, 'danger');
        }
      setActiveEvent(null);
    }, 1000);
    return () => clearInterval(t);
  }, [triggerToast]);

  const handleSaveColdWallet = () => {
    if (activeEvent?.type !== 'HACK' || handledEventRef.current === activeEvent.id) return;
    handledEventRef.current = activeEvent.id;
    setActiveEvent(null);
    const bonus = Math.max(5, currentDps * 1.5);
    setCash((c) => c + bonus);
    triggerToast(`Aset Diselamatkan ke Cold Wallet! Bonus +${formatMoney(bonus)}`, 'success');
  };

  const handleClaimDailyAid = () => {
    const now = Date.now();
    const cooldownMs = 24 * 60 * 60 * 1000;
    if (now - lastDailyClaim < cooldownMs) {
      triggerToast('Bantuan dana harian sudah diklaim hari ini. Silakan coba lagi besok!', 'warning');
      return;
    }
    setCash((c) => c + 5.00);
    setLastDailyClaim(now);
    playProfitSound();
    triggerToast('Sukses klaim Bantuan Dana Harian +$5.00!', 'success');
  };

  const WHALE_FAUCET_COOLDOWN_MS = 180 * 1000; // 3 menit
  const whaleFaucetAmount = Math.max(10, (whaleTokens || 1) * 10);
  const isWhaleFaucetCoolingDown = Date.now() - lastWhaleFaucetClaim < WHALE_FAUCET_COOLDOWN_MS;
  const whaleFaucetRemainingSec = Math.max(0, Math.ceil((WHALE_FAUCET_COOLDOWN_MS - (Date.now() - lastWhaleFaucetClaim)) / 1000));

  const handleClaimWhaleFaucet = () => {
    if (whaleTokens < 1) return;
    const now = Date.now();
    if (now - lastWhaleFaucetClaim < WHALE_FAUCET_COOLDOWN_MS) {
      triggerToast(`Whale Faucet masih cooldown (${whaleFaucetRemainingSec}s).`, 'warning');
      return;
    }
    setCash((c) => c + whaleFaucetAmount);
    setLastWhaleFaucetClaim(now);
    playProfitSound();
    triggerToast(
      `🐋 Dana Talangan Whale Cair! +${formatMoney(whaleFaucetAmount)} berhasil ditambahkan ke saldo modal!`,
      'success'
    );
  };

  const getUpgradeCost = (baseCost, scale, lvl) => {
    const post25Surge = lvl >= 25 ? Math.pow(1.05, lvl - 24) : 1;
    return baseCost * Math.pow(scale, lvl) * post25Surge;
  };

  const buyPassiveUpgrade = (item) => {
    const lvl = passiveLevels[item.id] || 0;
    const cost = getUpgradeCost(item.baseCost, item.costScale, lvl);
    if (cash >= cost) {
      setCash((c) => c - cost);
      playUpgradeSound();
      setPassiveLevels((prev) => ({ ...prev, [item.id]: lvl + 1 }));
      setDailyQuestState((prev) => ({
        ...prev,
        upgradesBought: (prev.upgradesBought || 0) + 1
      }));
    }
  };

  const openPosition = (type) => {
    if (activePosition) {
      triggerToast('Tutup posisi aktif terlebih dahulu sebelum membuka posisi baru!', 'warning');
      return;
    }
    const rawMargin = cash * (betPercent / 100);
    if (rawMargin < 1) {
      triggerToast('Saldo kas tidak mencukupi untuk membuka posisi!', 'danger');
      return;
    }

    const parsedTp = tpInput.trim() ? Number(tpInput) : null;
    const parsedSl = slInput.trim() ? Number(slInput) : null;
    const validTarget = n => n === null || (Number.isFinite(n) && n > 0);
    if (!validTarget(parsedTp) || !validTarget(parsedSl)) {
      triggerToast('Target TP/SL harus berupa angka positif!', 'warning');
      return;
    }

    const liqRatio = 0.92 / leverage;
    const liqPrice =
      type === 'LONG' ? currentPrice * (1 - liqRatio) : currentPrice * (1 + liqRatio);

    if (parsedTp !== null && (type === 'LONG' ? parsedTp <= currentPrice : parsedTp >= currentPrice)) {
      triggerToast('TP/SL tidak valid. LONG: TP di atas entry, SL di bawah. SHORT: sebaliknya.', 'warning');
      return;
    }

    if (parsedSl !== null && (type === 'LONG' ? parsedSl >= currentPrice : parsedSl <= currentPrice)) {
      triggerToast('TP/SL tidak valid. LONG: TP di atas entry, SL di bawah. SHORT: sebaliknya.', 'warning');
      return;
    }

    if (parsedSl !== null) {
      const prec = getPairPrecision(MARKET_PAIRS[selectedPairIdx], currentPrice);
      if (type === 'LONG' && parsedSl <= liqPrice) {
        triggerToast(`SL untuk LONG (${formatPairPrice(parsedSl, prec)}) tidak boleh di bawah harga likuidasi (${formatPairPrice(liqPrice, prec)})!`, 'warning');
        return;
      }
      if (type === 'SHORT' && parsedSl >= liqPrice) {
        triggerToast(`SL untuk SHORT (${formatPairPrice(parsedSl, prec)}) tidak boleh di atas harga likuidasi (${formatPairPrice(liqPrice, prec)})!`, 'warning');
        return;
      }
    }

    // Zero-Fee VIP Pass effect check
    const isZeroFeeActive = Boolean(activeEffects?.zeroFeeUntil && activeEffects.zeroFeeUntil > Date.now());
    const exchangeFee = isZeroFeeActive ? 0 : rawMargin * 0.015;
    const effectiveMargin = rawMargin - exchangeFee;

    setCash((c) => c - rawMargin);
    playOrderSound(type.toLowerCase());

    setActivePosition({
      id: makeId(),
      type,
      margin: effectiveMargin,
      leverage,
      entryPrice: currentPrice,
      liqPrice,
      tpPrice: !isNaN(parsedTp) && parsedTp > 0 ? parsedTp : null,
      slPrice: !isNaN(parsedSl) && parsedSl > 0 ? parsedSl : null,
      pairSymbol: MARKET_PAIRS[selectedPairIdx].symbol,
      openedAt: Date.now()
    });

    // If 250x God Leverage was used, consume the ticket
    if (leverage === 250) {
      setActiveEffects((prev) => ({ ...prev, has250xTicket: false }));
      setLeverage(100);
    }

    setTpInput('');
    setSlInput('');

    const hasTpSl = (parsedTp !== null && parsedTp > 0) || (parsedSl !== null && parsedSl > 0);
    setQuestStats((prev) => ({
      ...prev,
      totalTradesOpened: (prev.totalTradesOpened || 0) + 1,
      usedTpSl: prev.usedTpSl || hasTpSl
    }));
    setDailyQuestState((prev) => ({
      ...prev,
      tradesCount: (prev.tradesCount || 0) + 1,
      usedTpSl: prev.usedTpSl || hasTpSl
    }));
  };

  // --- Black Market & Consumable Handlers ---
  const handleBuyBlackMarketItem = (item) => {
    if (cash < item.cost) {
      triggerToast(language === 'en' ? 'Insufficient cash to purchase item!' : 'Saldo kas tidak mencukupi untuk membeli item!', 'danger');
      return;
    }
    setCash((c) => c - item.cost);
    setInventory((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));
    playUpgradeSound();
    triggerToast(
      language === 'en'
        ? `Purchased ${item.defaultName} (+1)! Stored in inventory.`
        : `Berhasil beli ${t[item.nameKey] || item.defaultName} (+1)! Masuk ke inventaris.`,
      'success'
    );
  };

  const handleUseBlackMarketItem = (itemId) => {
    if ((inventory?.[itemId] || 0) <= 0) return;

    const currentPair = MARKET_PAIRS[selectedPairIdx] || MARKET_PAIRS[0];
    const isRealCrypto = currentPair.marketType === 'crypto_real';

    // 1. Guard against Real Crypto Market (Kebal Manipulasi)
    if ((itemId === 'pump_whistle' || itemId === 'dump_horn') && isRealCrypto) {
      triggerToast(
        language === 'en'
          ? `⚠️ ${currentPair.symbol} is a Real Crypto pair (immune to Whale manipulation). Switch to Degen Perps (DEGEN, GORENG, WHALE) to use!`
          : `⚠️ Pasar Real Crypto (${currentPair.symbol}) kebal manipulasi! Pindah ke pair Degen Perps (DEGEN, GORENG, WHALE) untuk menggunakan Whale Whistle/Horn!`,
        'warning'
      );
      return;
    }

    const todayIsoDate = new Date().toISOString().slice(0, 10);
    const isWhistleUsedToday = dailyWhaleUsage?.lastWhistleDate === todayIsoDate || dailyWhaleUsage?.pump_whistle === todayIsoDate;
    const isDumpHornUsedToday = dailyWhaleUsage?.lastDumpDate === todayIsoDate || dailyWhaleUsage?.dump_horn === todayIsoDate;

    // 4. Batas Harian: 1x item per hari untuk Whistle & Horn
    if (itemId === 'pump_whistle' && isWhistleUsedToday) {
      triggerToast(
        language === 'en'
          ? '⏳ Daily limit reached! Whale Whistle can only be used 1x per day for market stability.'
          : '⏳ Batas harian tercapai! Whale Whistle hanya boleh ditiup 1x per hari demi stabilitas pasar.',
        'warning'
      );
      return;
    }

    if (itemId === 'dump_horn' && isDumpHornUsedToday) {
      triggerToast(
        language === 'en'
          ? '⏳ Daily limit reached! Whale Dump Horn can only be used 1x per day for market stability.'
          : '⏳ Batas harian tercapai! Whale Dump Horn hanya boleh dibunyikan 1x per hari demi stabilitas pasar.',
        'warning'
      );
      return;
    }

    // Deduct 1 from inventory
    setInventory((prev) => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) - 1)
    }));

    if (itemId === 'pump_whistle' || itemId === 'dump_horn') {
      const isPump = itemId === 'pump_whistle';

      // Update daily limit record
      setDailyWhaleUsage((prev) => ({
        ...prev,
        [itemId]: todayIsoDate,
        [isPump ? 'lastWhistleDate' : 'lastDumpDate']: todayIsoDate
      }));

      const now = Date.now();
      whaleActionHistoryRef.current.push({ type: isPump ? 'pump' : 'dump', at: now });
      const recent = whaleActionHistoryRef.current.filter((a) => now - a.at <= 15000);
      whaleActionHistoryRef.current = recent;

      // 2. Whale Tug-of-War (Benturan sesama Whale)
      const hasOpposite = recent.some((a) => a.type !== (isPump ? 'pump' : 'dump'));
      if (hasOpposite) {
        setWhaleWarBanner(true);
        setTimeout(() => setWhaleWarBanner(false), 6000);
      }

      // 1. Diminishing Returns (Slippage likuiditas)
      const consecutiveCount = recent.filter((a) => a.type === (isPump ? 'pump' : 'dump')).length;
      let impactPct = consecutiveCount <= 1 ? 0.042 : (consecutiveCount === 2 ? 0.021 : 0.008);
      if (hasOpposite) {
        impactPct *= 0.5;
      }

      const curP = marketPricesRef.current[selectedPairIdx] || currentPrice;
      const nextP = isPump ? curP * (1 + impactPct) : Math.max(0.01, curP * (1 - impactPct));
      marketPricesRef.current[selectedPairIdx] = nextP;
      setCurrentPrice(nextP);

      // 3. Mean Reversion Gravitasi Pasar (rebound alami 45% delta selama 25 ticks)
      const delta = nextP - curP;
      meanReversionRef.current = {
        deltaPerStep: (delta * 0.45) / 25,
        stepsLeft: 25
      };

      if (isPump) {
        playProfitSound();
        triggerToast(t.toastPumpWhistle || '🟢 WHALE PUMP! Candle hijau raksasa disuntikkan ke chart!', 'success');
      } else {
        playLossSound();
        triggerToast(t.toastDumpHorn || '🔴 WHALE DUMP! Panic sell besar-besaran melanda chart!', 'danger');
      }
    } else if (itemId === 'liq_shield') {
      triggerToast(
        language === 'en'
          ? '🛡️ Liquidation Shield active in inventory! Will save 85% of margin on liquidation.'
          : '🛡️ Liquidation Shield siaga di inventory! Akan selamatkan 85% modal jika terkena likuidasi.',
        'info'
      );
    } else if (itemId === 'leverage_250x') {
      setActiveEffects((prev) => ({ ...prev, has250xTicket: true }));
      setLeverage(250);
      playUpgradeSound();
      triggerToast(t.toastLev250xActive || '⚡ 250x GOD LEVERAGE SIAP! Tombol 250x terbuka untuk trade berikutnya!', 'warning');
    } else if (itemId === 'zero_fee') {
      setActiveEffects((prev) => ({ ...prev, zeroFeeUntil: Date.now() + 10 * 60 * 1000 }));
      playUpgradeSound();
      triggerToast(t.toastZeroFeeActive || '💎 ZERO-FEE VIP PASS AKTIF! Bebas biaya bursa selama 10 menit!', 'success');
    } else if (itemId === 'insider_radar') {
      setActiveEffects((prev) => ({ ...prev, radarUntil: Date.now() + 45 * 1000 }));
      playUpgradeSound();
      triggerToast(t.toastInsiderRadarActive || '📡 INSIDER ALPHA RADAR AKTIF! Probabilitas tren bullish terkunci 45 detik!', 'success');
    }
  };

  // --- Meme Launchpad Handlers ---
  const handleMemePlaceBet = (amount) => {
    setCash((c) => Math.max(0, c - amount));
  };

  const handleMemeWinCash = (winAmount) => {
    setCash((c) => c + winAmount);
    setPeakNetWorth((prev) => Math.max(prev, cash + winAmount));
  };

  const closePosition = (isAuto = false, customReason = '') => {
    if (!activePosition || !livePositionStats) return;
    if (settledPositionRef.current === activePosition.id) return;
    settledPositionRef.current = activePosition.id;
    const pnlAmount = livePositionStats.pnlDollar;
    const roiPercent = livePositionStats.roiPercent;
    const closingTax = pnlAmount > 0 ? pnlAmount * 0.01 : 0;
    const returnedCash = Math.max(0, activePosition.margin + pnlAmount - closingTax);

    setCash((c) => c + returnedCash);
    if (pnlAmount >= 0) {
      playProfitSound();
    } else {
      playLossSound();
    }
    if (isAuto) {
      triggerToast(`${customReason} tercapai! PnL: ${formatMoney(pnlAmount)}`, pnlAmount >= 0 ? 'success' : 'danger');
    } else if (pnlAmount >= 0) {
      triggerToast(
        `TAKE PROFIT! Net Cuan ${formatMoney(pnlAmount - closingTax)} (${roiPercent.toFixed(1)}%)`,
        'success'
      );
    } else {
      triggerToast(`Cut Loss sebesar ${formatMoney(pnlAmount)}`, 'warning');
    }

    setTradeHistory((prev) => [
      {
        id: Date.now(),
        pair: activePosition.pairSymbol,
        type: activePosition.type,
        leverage: activePosition.leverage,
        pnl: pnlAmount - closingTax,
        roi: roiPercent,
        status: pnlAmount >= 0 ? 'PROFIT' : 'LOSS'
      },
      ...prev.slice(0, 19)
    ]);

    const netPnl = pnlAmount - closingTax;
    const isWin = netPnl > 0;
    const isHighLev = activePosition.leverage >= 50;

    setQuestStats((prev) => ({
      ...prev,
      totalTradesClosed: (prev.totalTradesClosed || 0) + 1,
      profitableTrades: isWin ? (prev.profitableTrades || 0) + 1 : (prev.profitableTrades || 0),
      highLevWin: prev.highLevWin || (isWin && isHighLev)
    }));

    if (isWin) {
      setDailyQuestState((prev) => ({
        ...prev,
        profitTotal: (prev.profitTotal || 0) + netPnl
      }));
    }

    setActivePosition(null);
  };

  const openAdjustModal = () => {
    if (!activePosition) return;
    setAdjustTpInput(activePosition.tpPrice ? String(activePosition.tpPrice) : '');
    setAdjustSlInput(activePosition.slPrice ? String(activePosition.slPrice) : '');
    setAdjustError('');
    setIsAdjustModalOpen(true);
  };

  const applyTpRoiPreset = (pct) => {
    if (!activePosition) return;
    const isLong = activePosition.type === 'LONG';
    const diffRatio = (pct / 100) / activePosition.leverage;
    const target = isLong
      ? activePosition.entryPrice * (1 + diffRatio)
      : activePosition.entryPrice * (1 - diffRatio);
    const posPrecision = getPairPrecision(activePosition.pairSymbol, activePosition.entryPrice);
    if (target > 0) {
      setAdjustTpInput(target.toFixed(posPrecision));
      setAdjustError('');
    }
  };

  const applySlRoiPreset = (pct) => {
    if (!activePosition) return;
    const isLong = activePosition.type === 'LONG';
    const diffRatio = (pct / 100) / activePosition.leverage;
    const target = isLong
      ? activePosition.entryPrice * (1 - diffRatio)
      : activePosition.entryPrice * (1 + diffRatio);
    const posPrecision = getPairPrecision(activePosition.pairSymbol, activePosition.entryPrice);
    if (target > 0) {
      if ((isLong && target <= activePosition.liqPrice) || (!isLong && target >= activePosition.liqPrice)) {
        setAdjustError(`Target SL -${pct}% melewati harga likuidasi (${formatPairPrice(activePosition.liqPrice, posPrecision)}).`);
      } else {
        setAdjustSlInput(target.toFixed(posPrecision));
        setAdjustError('');
      }
    }
  };

  const handleSaveAdjustTpSl = () => {
    if (!activePosition) return;

    const parsedTp = adjustTpInput.trim() ? Number(adjustTpInput) : null;
    const parsedSl = adjustSlInput.trim() ? Number(adjustSlInput) : null;

    if (parsedTp !== null && (isNaN(parsedTp) || parsedTp <= 0)) {
      setAdjustError('Nilai Take Profit harus berupa angka positif valid.');
      return;
    }
    if (parsedSl !== null && (isNaN(parsedSl) || parsedSl <= 0)) {
      setAdjustError('Nilai Stop Loss harus berupa angka positif valid.');
      return;
    }

    const isLong = activePosition.type === 'LONG';
    const entry = activePosition.entryPrice;
    const liq = activePosition.liqPrice;
    const posPrecision = getPairPrecision(activePosition.pairSymbol, entry);

    if (parsedTp !== null) {
      if (isLong && parsedTp <= entry) {
        setAdjustError(`TP untuk LONG harus di atas harga entry (${formatPairPrice(entry, posPrecision)}).`);
        return;
      }
      if (!isLong && parsedTp >= entry) {
        setAdjustError(`TP untuk SHORT harus di bawah harga entry (${formatPairPrice(entry, posPrecision)}).`);
        return;
      }
    }

    if (parsedSl !== null) {
      if (isLong) {
        if (parsedSl >= entry) {
          setAdjustError(`SL untuk LONG harus di bawah harga entry (${formatPairPrice(entry, posPrecision)}).`);
          return;
        }
        if (parsedSl <= liq) {
          setAdjustError(`SL untuk LONG (${formatPairPrice(parsedSl, posPrecision)}) tidak boleh di bawah/sama dengan harga likuidasi (${formatPairPrice(liq, posPrecision)}).`);
          return;
        }
      } else {
        if (parsedSl <= entry) {
          setAdjustError(`SL untuk SHORT harus di atas harga entry (${formatPairPrice(entry, posPrecision)}).`);
          return;
        }
        if (parsedSl >= liq) {
          setAdjustError(`SL untuk SHORT (${formatPairPrice(parsedSl, posPrecision)}) tidak boleh di atas/sama dengan harga likuidasi (${formatPairPrice(liq, posPrecision)}).`);
          return;
        }
      }
    }

    setActivePosition((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        tpPrice: parsedTp,
        slPrice: parsedSl
      };
    });

    setIsAdjustModalOpen(false);
    triggerToast('Target TP & SL posisi berhasil diperbarui!', 'success');

    const hasAnyTpSl = (parsedTp !== null && parsedTp > 0) || (parsedSl !== null && parsedSl > 0);
    if (hasAnyTpSl) {
      setQuestStats((prev) => ({ ...prev, usedTpSl: true }));
      setDailyQuestState((prev) => ({ ...prev, usedTpSl: true }));
    }
  };

  const handleBailoutAd = () => {
    if (!liquidationAlert) return;
    const recovery = Math.max(5, liquidationAlert.lostAmount * 0.2);
    const isAutomatedTest = typeof window !== 'undefined' && window.navigator && window.navigator.webdriver;
    if (isAutomatedTest) {
      setCash((c) => c + recovery);
      setLiquidationAlert(null);
      triggerToast(`Dana Talangan Cair 20%! +${formatMoney(recovery)} masuk ke kas.`, 'success');
    } else {
      setAdRewardType('liquidation_bailout');
      setShowRewardedAdModal(true);
    }
  };

  const handlePrestigeReset = () => {
    if (claimableWhaleTokens <= 0) return;
    const newTokens = whaleTokens + claimableWhaleTokens;
    setWhaleTokens(newTokens);
    setCash(10.0);
    setPeakNetWorth(10.0);
    setActivePosition(null);
    setBullRunLeft(0);
    setBearMarketLeft(0);
    setActiveEvent(null);
    setLiquidationAlert(null);
    setOfflineModal(null);
    setTpInput('');
    setSlInput('');
    settledPositionRef.current = null;
    handledEventRef.current = null;
    setPassiveLevels({
      indikator: 0,
      vip_grup: 0,
      monitor_4x: 0,
      sniper_bot: 0,
      quant_dev: 0,
      ai_cluster: 0,
      own_exchange: 0,
      lobby_reg: 0,
      quantum_arb: 0,
      central_bank: 0
    });
    setShowPrestigeModal(false);
    playPrestigeSound();
    triggerToast(
      `RUGPULL SUKSES! +${claimableWhaleTokens} Whale Token! Multiplier kini ${(1 + newTokens * 0.5).toFixed(2)}x!`,
      'success'
    );
  };

  const handleHardReset = () => {
    const cleanLevels = PASSIVE_UPGRADES.reduce((acc, u) => ({ ...acc, [u.id]: 0 }), {});
    const cleanPrices = MARKET_PAIRS.map(p => p.basePrice);
    const cleanState = {
      cash: 10.0,
      peakNetWorth: 10.0,
      whaleTokens: 0,
      passiveLevels: cleanLevels,
      activePosition: null,
      tradeHistory: [],
      lastDailyClaim: 0,
      selectedPairIdx: 0,
      selectedTfIdx: 0,
      bullRunLeft: 0,
      bearMarketLeft: 0,
      activeEvent: null,
      liquidationAlert: null,
      currentDps: 0,
      claimedMilestones: {},
      questStats: { ...initialQuestStats },
      dailyQuestState: { ...initialDailyQuestState }
    };

    // Immediately update refs to prevent race conditions during interval/pagehide autosave
    latest.current = cleanState;
    marketPricesRef.current = cleanPrices;
    settledPositionRef.current = null;
    handledEventRef.current = null;

    try {
      localStorage.removeItem(LEGACY_SAVE_KEY);
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        ...cleanState,
        version: 8,
        syncVersion: 2,
        marketPrices: cleanPrices,
        tradeHistory: [],
        lastTimestamp: Date.now()
      }));
      setSaveError(false);
      channelRef.current?.postMessage({ type: 'HARD_RESET', tabId });
    } catch {
      setSaveError(true);
    }

    setCash(10.0);
    setPeakNetWorth(10.0);
    setWhaleTokens(0);
    setActivePosition(null);
    setLastDailyClaim(0);
    setBullRunLeft(0);
    setBearMarketLeft(0);
    setActiveEvent(null);
    setLiquidationAlert(null);
    setOfflineModal(null);
    setTpInput('');
    setSlInput('');
    setBetPercent(25);
    setLeverage(10);
    setSelectedPairIdx(0);
    setSelectedTfIdx(0);
    setCurrentPrice(MARKET_PAIRS[0].basePrice);
    candlesticksByTfRef.current = {};
    setCandlesticksByTf({});
    setShowPnlModal(false);
    setShowPrestigeModal(false);
    setActiveTab('infra');
    setConfirmReset(false);
    setPassiveLevels(cleanLevels);
    setTradeHistory([]);
    setClaimedMilestones({});
    setQuestStats({ ...initialQuestStats });
    setDailyQuestState({ ...initialDailyQuestState });
    setShowSettingsModal(false);
    triggerToast('Seluruh data progres dan status sesi berhasil di-reset ke awal!', 'info');
  };

  const handleCopyFlexStats = async () => {
    const roiTotal = ((netWorth - 10) / 10) * 100;
    const text = `🐋 DEGEN & WHALE: TRADING FLOOR SIMULATOR\n🏆 Rank: ${currentLocation.badge} (${currentLocation.name})\n💰 Net Worth: ${formatMoney(netWorth)}\n📈 All-Time ROI: +${formatNumber(roiTotal)}%\n⚡ Passive Income: ${formatMoney(currentDps)}/sec\n🪙 Whale Tokens: ${whaleTokens}\n${currentLocation.quote}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStats(true);
      setTimeout(() => setCopiedStats(false), 2500);
    } catch {
      triggerToast('Clipboard tidak tersedia. Salin statistik dari kartu secara manual.', 'warning');
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      <header className="sticky top-0 z-30 bg-[#0B0E14]/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-lg shadow-[#00FF88]/20 border border-emerald-500/40 bg-slate-900 shrink-0">
              <img
                src="/logo.png"
                alt="Degen & Whale Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold tracking-tight text-sm sm:text-base text-white">
                  DEGEN <span className="text-[#00FF88]">&amp;</span> WHALE
                </h1>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-[#00FF88] border border-emerald-500/30">
                  v1.3.1 FIX
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPrestigeModal(true)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:from-amber-500/30 hover:to-yellow-500/20 text-amber-300 border border-amber-500/40 transition-all cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Whale:</span>
              <span className="font-mono">{whaleTokens}</span>
              {claimableWhaleTokens > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-amber-400 text-slate-950 rounded-full text-[10px] font-extrabold animate-bounce">
                  +{claimableWhaleTokens}
                </span>
              )}
            </button>

            {/* Free $5 Cash Rewarded Ad Button */}
            <button
              onClick={() => {
                setAdRewardType('cash_reward');
                setShowRewardedAdModal(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500/20 to-teal-500/15 hover:from-emerald-500/30 hover:to-teal-500/25 text-emerald-300 border border-emerald-500/40 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Tonton Iklan (+$5.00 Modal Kas Gratis)"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Gratis:</span>
              <span className="font-mono text-emerald-200 font-bold">+$5 Cash</span>
            </button>

            <button
              data-testid="btn-share-pnl"
              onClick={() => setShowPnlModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00FF88]/15 hover:bg-[#00FF88]/25 text-[#00FF88] border border-[#00FF88]/40 transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.sharePnl || 'Cetak PnL'}</span>
            </button>

            {/* Saweria Developer Support Button */}
            <a
              data-testid="btn-saweria-support"
              href={ADS_CONFIG.donation.saweriaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/40 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Traktir Developer via Saweria (QRIS, GoPay, Dana, OVO)"
            >
              <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
              <span className="hidden sm:inline">{language === 'en' ? 'Support Dev' : 'Traktir Dev'}</span>
            </a>

            <button
              aria-label={isMuted ? (language === 'en' ? 'Unmute Sound' : 'Aktifkan Suara Game') : (language === 'en' ? 'Mute Sound' : 'Matikan Suara Game')}
              title={isMuted ? (language === 'en' ? 'Sound: MUTED (Click to activate)' : 'Suara Game: MATI (Klik untuk aktifkan audio synth)') : (language === 'en' ? 'Sound: ON (Click to mute)' : 'Suara Game: NYALA (Klik untuk mute)')}
              onClick={handleToggleSound}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                isMuted
                  ? 'bg-slate-800/50 text-slate-500 border-slate-700/60 hover:text-slate-300'
                  : 'bg-emerald-500/15 text-[#00FF88] border-emerald-500/40 hover:bg-emerald-500/25 shadow-md shadow-[#00FF88]/10'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              aria-label={t.settings || 'Pengaturan'}
              onClick={() => { setConfirmReset(false); setShowSettingsModal(true); }}
              className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      {saveError && (
        <div role="alert" className="bg-amber-950/95 border-b border-amber-500/40 px-4 py-2 text-xs text-amber-200 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Penyimpanan browser gagal.</strong> Progres sesi ini belum aman untuk ditutup.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => saveGame()}
                className="px-2.5 py-1 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] cursor-pointer transition-colors shadow-sm"
              >
                Coba Simpan Lagi
              </button>
              <button
                type="button"
                onClick={exportSaveBackup}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-bold text-[11px] cursor-pointer transition-colors"
              >
                Unduh Cadangan
              </button>
            </div>
          </div>
        </div>
      )}

      {whaleTokens >= 1 && cash < 5.00 && (
        <div className="bg-gradient-to-r from-cyan-950 via-sky-950 to-slate-950 border-b border-cyan-500/50 px-4 py-2.5 shadow-xl">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Crown className="w-5 h-5 text-cyan-400 shrink-0 animate-bounce" />
              <div>
                <div className="text-xs font-black text-cyan-300 uppercase tracking-wide flex items-center gap-1.5">
                  <span>🚨 WHALE EMERGENCY FAUCET AKTIF</span>
                  <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] border border-cyan-500/30">
                    {whaleTokens} 🐋 Dimiliki
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Saldo Anda kritis ({formatMoney(cash)})! Sebagai pemegang Whale Token, Anda berhak mencairkan dana talangan darurat <strong className="text-white">${whaleFaucetAmount}.00</strong> sekarang!
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClaimWhaleFaucet}
              disabled={isWhaleFaucetCoolingDown}
              className={`px-4 py-2 rounded-xl font-black text-xs transition-all shrink-0 cursor-pointer ${
                isWhaleFaucetCoolingDown
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 shadow-lg shadow-cyan-400/25 active:scale-95'
              }`}
            >
              {isWhaleFaucetCoolingDown
                ? `Cooldown (${whaleFaucetRemainingSec}s)`
                : `Klaim Talangan +$${whaleFaucetAmount}.00 🐋`}
            </button>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 max-w-sm animate-bounce">
          <div
            className={`px-4 py-2.5 rounded-xl border shadow-2xl flex items-center gap-2.5 text-xs font-bold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/95 border-[#00FF88] text-[#00FF88]'
                : toastMessage.type === 'danger'
                ? 'bg-rose-950/95 border-[#FF3366] text-[#FF3366]'
                : 'bg-slate-900/95 border-amber-400 text-amber-300'
            }`}
          >
            <Zap className="w-4 h-4 shrink-0" />
            <span>{toastMessage.msg}</span>
          </div>
        </div>
      )}

      {activeEvent && (
        <div className="bg-gradient-to-r from-rose-950 via-amber-950 to-slate-950 border-b border-amber-500/50 px-4 py-2.5 relative z-[25] shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-red-500 text-white font-mono text-xs font-extrabold animate-ping">
                ACTIVE
              </span>
              <div>
                <div className="text-xs sm:text-sm font-extrabold text-amber-300 flex items-center gap-2">
                  <span>{activeEvent.title}</span>
                  <span className="px-2 py-0.5 rounded bg-black/40 text-white font-mono text-xs border border-white/20">
                    ⏱️ {activeEvent.timer}{t.leftSec || 's tersisa'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-200 mt-0.5">{activeEvent.desc}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {activeEvent.type === 'HACK' ? (
                <button
                  onClick={handleSaveColdWallet}
                  className="px-4 py-1.5 rounded-lg bg-[#FF3366] hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-500/30 animate-pulse cursor-pointer"
                >
                  🛡️ {t.withdrawColdWallet || 'WITHDRAW KE COLD WALLET'} ({activeEvent.timer}s)
                </button>
              ) : activeEvent.type === 'SEC_CRACKDOWN' ? (
                <span className="px-3 py-1 rounded-lg bg-rose-500/20 border border-[#FF3366] text-[#FF3366] font-mono text-xs font-bold">
                  ❄️ {t.bearMarketBanner || 'BEAR MARKET -55% DPS'} ({Math.ceil(bearMarketLeft)}s)
                </span>
              ) : (
                <span className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-[#00FF88] text-[#00FF88] font-mono text-xs font-bold">
                  🔥 {t.bullRunBanner || '5x PROFIT AKTIF'} ({Math.ceil(bullRunLeft)}s)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4 sm:gap-5">
        {/* 1. Main Mode Navigation Bar (Perps Futures, Meme Launchpad, Shop) */}
        <div className="flex items-center gap-1.5 p-1 bg-[#090D15] rounded-xl border border-slate-800/80 w-fit">
          <button
            type="button"
            data-testid="mode-perps"
            onClick={() => setTradingMode('perps')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              tradingMode === 'perps'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-slate-300" />
            <span>{t.modePerps || 'Perps Futures'}</span>
          </button>

          <button
            type="button"
            data-testid="mode-launchpad"
            onClick={() => setTradingMode('launchpad')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              tradingMode === 'launchpad'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Rocket className="w-4 h-4 text-slate-300" />
            <span>{t.modeLaunchpad || 'Meme Launchpad'}</span>
            {memeSchedule.isOpen ? (
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-[#00FF88] text-[9px] font-mono font-bold border border-emerald-500/30 animate-pulse">
                LIVE
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px] font-mono">
                {formatCountdownMmSs(memeSchedule.remainingCooldownMs)}
              </span>
            )}
          </button>

          <button
            type="button"
            data-testid="mode-shop"
            onClick={() => setTradingMode('shop')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              tradingMode === 'shop'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Store className="w-4 h-4 text-slate-300" />
            <span>{t.modeShop || 'Shop'}</span>
            {bmSchedule.isOpen ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="Pasar Gelap Buka" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" title="Pasar Gelap Tutup" />
            )}
          </button>
        </div>

        {/* 2. TAB: PERPS FUTURES (Workstation + Chart + Sidebar) */}
        <div className={tradingMode === 'perps' ? 'flex flex-col gap-4 sm:gap-5' : 'hidden'}>
          {/* Workstation Section */}
          <section
            className="relative rounded-2xl border border-slate-800 p-4 sm:p-5 bg-[#0B0E14] overflow-hidden shadow-xl flex flex-col gap-4 w-full"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {(() => {
              const curLocT = t.locations?.[currentLocation.level] || {};
              const nextLocT = nextLocation ? (t.locations?.[nextLocation.level] || {}) : null;
              return (
                <>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">
                        WORKSTATION LV.{currentLocation.level}
                      </span>
                      <span className={`text-xs font-bold ${currentLocation.accent}`}>
                        {curLocT.badge || currentLocation.badge}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-2xl font-extrabold text-white mt-0.5">
                      {curLocT.name || currentLocation.name}
                    </h2>
                    <p className="text-xs text-slate-300">{curLocT.sub || currentLocation.sub}</p>
                  </div>

                  {nextLocation ? (
                    <div className="bg-slate-950/60 border border-slate-800 px-4 py-2.5 rounded-xl text-right w-full sm:w-auto">
                      <div className="text-[10px] text-slate-400 uppercase">
                        {t.targetNext || 'Target Next:'} <span className="text-white font-bold">{nextLocT?.name || nextLocation.name}</span>
                      </div>
                      <div className="w-full sm:w-56 h-2 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-gradient-to-r from-[#00FF88] to-sky-400 transition-all duration-300"
                          style={{
                            width: `${Math.min(100, (peakNetWorth / nextLocation.reqNetWorth) * 100)}%`
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-slate-300 mt-1">
                        <span>{formatMoney(peakNetWorth)}</span>
                        <span>{formatMoney(nextLocation.reqNetWorth)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-500/20 border border-amber-400/40 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300">
                      👑 {curLocT.badge || 'GOD OF LIQUIDITY'}
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          <div className="relative bg-[#05070A]/90 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 sm:gap-6 overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
            
            {/* 3D Architectural Diorama Showcase (Turntable Physical Model, NOT Flat Card) */}
            {(() => {
              const currentArch = LOCATION_ARCHITECTURE_CONFIG[currentLocation.level] || LOCATION_ARCHITECTURE_CONFIG[1];
              return (
                <div 
                  className="relative w-full md:w-[380px] lg:w-[460px] h-72 sm:h-80 md:h-[340px] select-none rounded-2xl flex items-center justify-center p-3 sm:p-4 overflow-hidden bg-slate-950/80 border border-white/10 shrink-0 shadow-2xl"
                  style={{ perspective: 1100 }}
                >
                  {/* Subtle Background Ambience & Spotlight */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(255,255,255,0.06)_0%,_transparent_70%)] pointer-events-none" />
                  <div 
                    className="absolute -top-10 inset-x-12 h-32 blur-2xl rounded-full opacity-30 pointer-events-none"
                    style={{ backgroundColor: currentArch.accentColor }}
                  />

                  {/* 3D Turntable Platform & Architectural Model Wrapper */}
                  <div
                    className="relative w-full h-full max-w-[360px] max-h-[300px] flex items-center justify-center animate-diorama-turntable"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* 1. 3D Rotating Holographic Pedestal (Meja Putar Panggung 3D) */}
                    <div 
                      className="absolute -bottom-8 w-64 h-64 pointer-events-none flex items-center justify-center"
                      style={{ 
                        transform: 'translateZ(-50px)',
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      {/* Deep Base Floor Shadow */}
                      <div className="absolute inset-4 rounded-full bg-black/80 blur-xl" />

                      {/* Rotating Turntable Ring with Laser Grid */}
                      <div className={`absolute inset-0 rounded-full border-2 border-dashed ${currentArch.pedestalBorder} animate-pedestal-spin opacity-70`} />
                      <div className={`absolute inset-6 rounded-full border border-white/20 animate-pedestal-spin opacity-50`} style={{ animationDirection: 'reverse', animationDuration: '24s' }} />
                      <div className={`absolute inset-12 rounded-full bg-gradient-to-b ${currentArch.pedestalGlow} to-transparent blur-md opacity-60`} />

                      {/* Pedestal Top Surface Contact Plate */}
                      <div 
                        className="absolute inset-16 rounded-full border border-white/30 bg-slate-900/90 shadow-[0_0_20px_rgba(0,0,0,0.9)]"
                        style={{ transform: 'rotateX(72deg)' }}
                      />
                    </div>

                    {/* 2. Physical Architectural Silhouette (Not a flat card - shapes to the building itself!) */}
                    <div 
                      className="relative w-60 sm:w-68 h-56 sm:h-64 flex items-center justify-center transition-all duration-500"
                      style={{
                        transform: 'translateZ(10px)',
                        filter: `drop-shadow(0 20px 25px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 18px ${currentArch.glowColor})`
                      }}
                    >
                      {/* Architectural Extruded Depth Underlay (Gives solid 3D mass/thickness behind the facade) */}
                      <div 
                        className="absolute inset-0 bg-slate-950/95"
                        style={{
                          clipPath: currentArch.clipPath,
                          transform: 'translateZ(-8px) scale(1.02)'
                        }}
                      />

                      {/* Architectural Facade / Model with Specific Level Silhouette */}
                      <div 
                        className="relative w-full h-full overflow-hidden transition-all duration-300"
                        style={{
                          clipPath: currentArch.clipPath,
                        }}
                      >
                        <img 
                          src={currentLocation.image} 
                          alt={currentLocation.name}
                          className="w-full h-full object-cover pointer-events-none select-none scale-105"
                          draggable={false}
                        />

                        {/* Architectural lighting sheen and depth ambient shadow */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,_rgba(255,255,255,0.32)_0%,_transparent_65%)] pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25 pointer-events-none" />

                        {/* Holographic Scanline sweep over physical geometry */}
                        <div className="absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-white/20 to-transparent pointer-events-none animate-hologram-scan" />
                      </div>

                      {/* Glowing architectural silhouette bevel line */}
                      <div 
                        className="absolute inset-0 pointer-events-none opacity-60"
                        style={{
                          clipPath: currentArch.clipPath,
                          boxShadow: `inset 0 0 0 2px ${currentArch.accentColor}`
                        }}
                      />
                    </div>

                    {/* Floating Architectural Hologram Badge */}
                    <div 
                      className="absolute top-2 left-2 flex items-center gap-1.5 pointer-events-none z-20"
                      style={{ transform: 'translateZ(30px)' }}
                    >
                      <div className="px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-xl">
                        <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: currentArch.accentColor }} />
                        <span style={{ color: currentArch.accentColor }}>
                          {(t.locations?.[currentLocation.level]?.archBadge) || currentArch.badge}
                        </span>
                      </div>
                    </div>

                    {/* Floating Building Title & Physical Tier Info */}
                    <div 
                      className="absolute bottom-2 inset-x-3 pointer-events-none text-center z-20"
                      style={{ transform: 'translateZ(26px)' }}
                    >
                      <div className="inline-block px-3 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-white/15 shadow-xl">
                        <span className="text-xs sm:text-sm font-extrabold text-white drop-shadow-md">
                          {(t.locations?.[currentLocation.level]?.name) || currentLocation.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {(t.locations?.[currentLocation.level]?.name) || currentArch.name} &bull; {t.showcase3d || '3D Showcase'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Bot Cluster & Financial Stats & Passive Income Info */}
            <div className="flex-1 flex flex-col justify-between gap-3 w-full z-10 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-ping" />
                  <span className="text-xs font-mono text-[#00FF88] font-bold">{t.automatedCluster || 'AUTOMATED BOT CLUSTER ONLINE'}</span>
                </div>
                <button
                  onClick={() => setShowWorkstationGallery(true)}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-emerald-500/10"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {t.openGallery || 'Buka Galeri'}
                </button>
              </div>

              {/* Financial Stats Bar (Moved to Diorama Section) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0B0E14]/90 p-3 rounded-xl border border-white/10 shadow-inner">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    {t.availableCash || 'Available Cash'}
                  </div>
                  <div data-testid="cash" className="text-lg sm:text-2xl font-mono font-bold text-[#00FF88] tracking-tight">
                    {formatMoney(cash)}
                  </div>
                </div>

                <div className="border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                    {t.netDps || 'Net DPS'}
                    {activeBoostMultiplier !== 1 && (
                      <span
                        className={`text-[10px] px-1 rounded animate-pulse ${
                          activeBoostMultiplier > 1
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {activeBoostMultiplier.toFixed(2)}x
                      </span>
                    )}
                  </div>
                  <div data-testid="dps" className="text-sm sm:text-base font-mono font-semibold text-sky-400">
                    +{formatMoney(currentDps)}/s
                  </div>
                  {whaleDividend > 0 && (
                    <div className="text-[10px] font-mono text-cyan-300 font-bold">
                      +{formatMoney(whaleDividend)}/s Dividen Whale ({whaleTokens} 🐋)
                    </div>
                  )}
                  {upkeepDrain > 0 && (
                    <div className="text-[9px] font-mono text-rose-400">
                      {t.upkeepTax || 'Pajak/Beban:'} -{Math.round(currentLocation.upkeepRate * 100)}%
                    </div>
                  )}
                </div>

                <div className="border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    {t.netWorth || 'Net Worth'}
                  </div>
                  <div className="text-sm sm:text-base font-mono font-semibold text-amber-400">
                    {formatMoney(netWorth)}
                  </div>
                </div>
              </div>

              <div className="text-sm font-bold text-white">
                {t.generatesPassive || 'Menghasilkan'} <span className="text-[#00FF88] font-mono">{formatMoney(currentDps)}</span> {t.secPassively || '/ detik secara pasif'}
              </div>
              <div className="text-[11px] text-slate-300 italic">
                {(t.locations?.[currentLocation.level]?.quote) || currentLocation.quote}
              </div>
              <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400 pt-1 flex-wrap">
                <span>{t.upkeepFee || 'Upkeep Fee:'} <strong className="text-amber-400">{((currentLocation.upkeepRate || 0) * 100).toFixed(0)}%</strong></span>
                <span>{t.rankLabel || 'Rank:'} <strong className={currentLocation.accent}>{(t.locations?.[currentLocation.level]?.badge) || currentLocation.badge}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10">
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <Gift className={`w-4 h-4 shrink-0 ${isDailyClaimed ? 'text-slate-500' : 'text-amber-400'}`} />
              <span>
                {isDailyClaimed ? (
                  t.dailyAidClaimedMsg || 'Bantuan sosial sudah diklaim hari ini. Kembali lagi besok!'
                ) : (
                  <>{t.dailyAidUnclaimedMsg || 'Klaim Bantuan Dana Sosial Harian sebesar'} <strong>$5.00</strong></>
                )}
              </span>
            </div>
            <button
              disabled={isDailyClaimed}
              onClick={handleClaimDailyAid}
              className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all shrink-0 ${
                isDailyClaimed
                  ? 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed shadow-none'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20 cursor-pointer'
              }`}
            >
              {isDailyClaimed ? (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.dailyAidClaimedBtn || 'Sudah Diklaim Hari Ini'}</span>
                </span>
              ) : (
                t.dailyAidClaimBtn || 'Klaim Bantuan $5.00'
              )}
            </button>
          </div>

          {whaleTokens >= 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2.5 border-t border-cyan-500/20 bg-cyan-950/20 -mx-4 sm:-mx-5 px-4 sm:px-5 py-2">
              <div className="text-xs text-cyan-200 flex items-center gap-2">
                <Crown className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  <strong>Whale Emergency Faucet:</strong> {t.whaleFaucetDesc || 'Jaring pengaman talangan likuiditas khusus pemilik Whale Token saat saldo kritis.'} (<strong>{whaleTokens} Token</strong> = Talangan <strong>${whaleFaucetAmount}.00</strong>)
                </span>
              </div>
              <button
                type="button"
                disabled={isWhaleFaucetCoolingDown || cash >= 5.0}
                onClick={handleClaimWhaleFaucet}
                className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
                  isWhaleFaucetCoolingDown
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : cash >= 5.0
                    ? 'bg-slate-800/80 text-cyan-400/60 border border-cyan-500/30 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 shadow-lg shadow-cyan-400/25 active:scale-95'
                }`}
                title={cash >= 5.0 ? 'Hanya dapat diklaim saat kas kritis (< $5.00)' : 'Klaim dana talangan darurat'}
              >
                {isWhaleFaucetCoolingDown
                  ? `Cooldown (${whaleFaucetRemainingSec}s)`
                  : cash >= 5.0
                  ? `Siaga ($${whaleFaucetAmount}.00)`
                  : `Klaim Talangan $${whaleFaucetAmount}.00 🐋`}
              </button>
            </div>
          )}
        </section>

        {/* Responsive Grid: Chart Left (Col 7 or Col 12 when expanded) & Collapsible Sidebar Right (Col 5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 w-full">
          <div className={`${isSidebarOpen ? 'lg:col-span-7' : 'lg:col-span-12'} flex flex-col gap-3 transition-all duration-300`}>
            <section className="bg-[#0B0E14] border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl flex flex-col">
              {/* Whale War Banner */}
              {whaleWarBanner && (
                <div className="px-4 py-2 bg-gradient-to-r from-rose-950 via-purple-900 to-amber-950 border-b-2 border-amber-400 flex items-center justify-between text-xs animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">⚔️</span>
                    <span className="font-mono font-black text-amber-300 tracking-wider uppercase text-[11px] sm:text-xs">
                      WHALE WAR! TERJADI BENTURAN LIKUIDITAS BESAR DI PASAR
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-300 px-2 py-0.5 rounded bg-black/40 border border-amber-400/30 hidden sm:inline">
                    VOLATILITAS TINGGI
                  </span>
                </div>
              )}

              <div className="px-3.5 py-2.5 bg-[#111622] border-b border-slate-800 flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                {/* Binance-style Pair Dropdown Selector */}
                <div className="relative" ref={pairDropdownRef}>
                  <button
                    type="button"
                    data-testid="pair-select-trigger"
                    onClick={() => setIsPairDropdownOpen((prev) => !prev)}
                    className={`group flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 px-3 py-1.5 sm:py-2 rounded-xl border transition-all cursor-pointer select-none ${
                      isPairDropdownOpen
                        ? 'bg-[#151D2E] border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                        : 'bg-[#0B0E14] hover:bg-[#141B2A] border-slate-800 hover:border-slate-700'
                    }`}
                    title={language === 'en' ? 'Select Trading Pair' : 'Pilih Pair / Pasangan Trading'}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-mono font-black text-[11px] shrink-0 border ${
                        MARKET_PAIRS[selectedPairIdx]?.marketType === 'crypto_real'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-[#00FF88]'
                          : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                      }`}>
                        {(MARKET_PAIRS[selectedPairIdx]?.symbol || 'BTC').split('/')[0].slice(0, 3)}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1.5 leading-none">
                          <span className="font-mono font-bold text-xs sm:text-sm text-white tracking-wide group-hover:text-[#00FF88] transition-colors">
                            {MARKET_PAIRS[selectedPairIdx]?.symbol}
                          </span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 ${
                              isPairDropdownOpen ? 'rotate-180 text-[#00FF88]' : ''
                            }`}
                          />
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-slate-400 font-sans leading-none block mt-1">
                          {MARKET_PAIRS[selectedPairIdx]?.name}
                        </span>
                      </div>
                    </div>

                    {/* Market Type Badge */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      {MARKET_PAIRS[selectedPairIdx]?.marketType === 'crypto_real' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[#00FF88] font-mono text-[9px] font-bold flex items-center gap-1.5" title="Pasar Real Crypto - Kebal Manipulasi">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>LIVE CRYPTO</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono text-[9px] font-bold flex items-center gap-1.5" title="Pasar Degen Perps - Bisa Dimanipulasi">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                          <span>DEGEN PERPS</span>
                        </span>
                      )}

                      {activePosition?.pairSymbol === MARKET_PAIRS[selectedPairIdx]?.symbol && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-[9px] font-bold flex items-center gap-1 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>{t.badgePosition || 'POSISI'}</span>
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Binance-style Dropdown Menu */}
                  {isPairDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-[360px] sm:w-[420px] max-w-[95vw] bg-[#0C101A] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
                      {/* Search Bar */}
                      <div className="p-3 border-b border-slate-800 bg-[#111726] flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            autoFocus
                            placeholder={t.searchPairPlaceholder || 'Cari pair (BTC, ETH, DOGE, IDR)...'}
                            value={pairSearchQuery}
                            onChange={(e) => setPairSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-7 py-2 bg-[#080B12] border border-slate-700/70 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-all"
                          />
                          {pairSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setPairSearchQuery('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Category Tabs */}
                      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-800/80 bg-[#0E1321] overflow-x-auto text-[11px] font-semibold">
                        {[
                          { id: 'all', label: t.filterAllPairs || 'Semua (10)' },
                          { id: 'top', label: 'Live Crypto (7)' },
                          { id: 'meme', label: 'Degen Perps (3)' },
                          { id: 'hasPos', label: t.filterActivePos || 'Posisi Aktif' }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setPairCategoryFilter(tab.id)}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer shrink-0 text-xs ${
                              pairCategoryFilter === tab.id
                                ? 'bg-emerald-500/20 text-[#00FF88] font-bold border border-emerald-500/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Table Header */}
                      <div className="flex items-center justify-between px-3.5 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800/60 bg-[#080C14]">
                        <span className="flex-1">{t.tableHeaderPair || 'Pasangan'}</span>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="w-20 text-right">{t.tableHeaderPrice || 'Harga'}</span>
                          <span className="w-[66px] text-right">{t.tableHeaderTrend || '24j Trend'}</span>
                        </div>
                      </div>

                      {/* Filtered Pairs List */}
                      <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-800/40 p-1.5">
                        {filteredPairs.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-500 font-mono">
                            {t.noPairsFound || 'Pair tidak ditemukan'}
                          </div>
                        ) : (
                          filteredPairs.map(({ pair, originalIdx }) => {
                            const isSelected = selectedPairIdx === originalIdx;
                            const hasPos = activePosition?.pairSymbol === pair.symbol;
                            const livePrice = marketPricesRef.current?.[originalIdx] ?? pair.basePrice;
                            const { changePct, isUp: isGreen } = getPair24hStats(originalIdx, livePrice);

                            return (
                              <button
                                key={pair.symbol}
                                aria-label={pair.symbol}
                                type="button"
                                onClick={() => {
                                  setSelectedPairIdx(originalIdx);
                                  const liveP = marketPricesRef.current[originalIdx] ?? pair.basePrice;
                                  setCurrentPrice(liveP);
                                  const tfKey = `${originalIdx}-${selectedTfIdx}`;
                                  if (!candlesticksByTfRef.current[tfKey]?.length) {
                                    const syncMap = generateSynchronousCandlesForPair(originalIdx, liveP);
                                    candlesticksByTfRef.current = { ...candlesticksByTfRef.current, ...syncMap };
                                    setCandlesticksByTf(prev => ({ ...prev, ...syncMap }));
                                  }
                                  setQuestStats((prev) => ({ ...prev, switchedPairOrTf: true }));
                                  setIsPairDropdownOpen(false);
                                  setPairSearchQuery('');
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-left cursor-pointer ${
                                  isSelected
                                    ? 'bg-emerald-500/15 border border-emerald-500/35 text-white'
                                    : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                                }`}
                              >
                                {/* Left: Coin Icon + Ticker + Subtitle + Badge */}
                                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-[10px] shrink-0 border ${
                                    pair.marketType === 'crypto_real'
                                      ? 'bg-emerald-500/10 border-emerald-500/25 text-[#00FF88]'
                                      : 'bg-purple-500/10 border-purple-500/25 text-purple-300'
                                  }`}>
                                    {pair.symbol.split('/')[0].slice(0, 3)}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap leading-tight">
                                      <span className={`font-mono font-bold text-xs sm:text-sm tracking-wide ${isSelected ? 'text-[#00FF88]' : 'text-white'}`}>
                                        {pair.symbol.split('/')[0]}
                                        <span className="text-slate-400 font-normal text-[11px]">/{pair.symbol.split('/')[1]}</span>
                                      </span>
                                      {pair.marketType === 'crypto_real' ? (
                                        <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-emerald-500/20 text-[#00FF88] border border-emerald-500/30 shrink-0">
                                          LIVE
                                        </span>
                                      ) : (
                                        <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                                          DEGEN
                                        </span>
                                      )}
                                      {hasPos && (
                                        <span
                                          className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0"
                                          title={language === 'en' ? 'Active trading position in this pair' : 'Ada posisi trading aktif di pair ini'}
                                        />
                                      )}
                                    </div>
                                    <span className="text-[10px] sm:text-[11px] text-slate-400 truncate block mt-0.5 leading-none">
                                      {pair.name}
                                    </span>
                                  </div>
                                </div>

                                {/* Right: Price & 24h Trend Pill */}
                                <div className="flex items-center gap-2.5 shrink-0 text-right">
                                  <span className="w-20 font-mono font-semibold text-xs sm:text-sm text-slate-100 tabular-nums">
                                    {formatPairPrice(livePrice, getPairPrecision(pair, livePrice))}
                                  </span>
                                  <span
                                    className={`w-[66px] text-center px-1.5 py-1 rounded-md text-[10px] sm:text-[11px] font-mono font-bold tabular-nums shrink-0 ${
                                      isGreen
                                        ? 'bg-emerald-500/15 text-[#00FF88] border border-emerald-500/25'
                                        : 'bg-rose-500/15 text-[#FF3366] border border-rose-500/25'
                                    }`}
                                  >
                                    {isGreen ? '+' : ''}{changePct.toFixed(2)}%
                                  </span>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>

                      {/* Simulation Disclaimer Footer */}
                      <div className="p-2.5 bg-[#090D15] border-t border-slate-800/80 flex items-center gap-2 text-[10px] text-slate-400">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="leading-tight">
                          <strong className="text-amber-300 font-semibold">{t.simDisclaimerTitle || 'Catatan Simulasi:'}</strong> {t.simDisclaimerDesc || 'Seluruh pasangan aset & fluktuasi harga ini hanyalah simulasi fraktal dunia nyata untuk hiburan/game, bukan transaksi finansial riil.'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Live Price, 24h Trend Pill & Sidebar Toggle */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-right">
                    <span data-testid="price" className="text-sm sm:text-base font-mono font-extrabold text-[#00FF88]">
                      {formatPairPrice(currentPrice, getPairPrecision(MARKET_PAIRS[selectedPairIdx] || MARKET_PAIRS[0], currentPrice))}
                    </span>
                    {(() => {
                      const { changePct, isUp } = getPair24hStats(selectedPairIdx, currentPrice);
                      return (
                        <div className={`text-[10px] font-mono font-bold ${isUp ? 'text-[#00FF88]' : 'text-[#FF3366]'}`}>
                          {isUp ? '▲ +' : '▼ '}{changePct.toFixed(2)}%
                        </div>
                      );
                    })()}
                  </div>

                  {/* Collapsible Sidebar Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen((prev) => !prev)}
                    className={`relative p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                      isSidebarOpen
                        ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                        : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-500/10'
                    }`}
                    title={isSidebarOpen ? (t.closeSidebarTitle || 'Perbesar Grafik (Tutup Sidebar Panel)') : (t.openSidebarTitle || 'Buka Sidebar Infrastruktur & Misi')}
                  >
                    {isSidebarOpen ? (
                      <PanelRightClose className="w-4 h-4" />
                    ) : (
                      <PanelRightOpen className="w-4 h-4" />
                    )}

                    {/* Notification dot with claimable count */}
                    {unclaimedQuestCount > 0 && (
                      <span
                        className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-400 text-slate-950 font-black text-[9px] flex items-center justify-center border-2 border-[#111622] shadow-md animate-pulse"
                        title={language === 'en' ? `${unclaimedQuestCount} missions/quests ready to claim!` : `${unclaimedQuestCount} misi/tugas siap diklaim!`}
                      >
                        {unclaimedQuestCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-1 bg-[#0B0E14] p-1 rounded-lg border border-slate-800 overflow-x-auto">
                <div className="flex items-center gap-1 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-slate-400 ml-1 mr-1 shrink-0" />
                  {TIMEFRAMES.map((tf, idx) => (
                    <button
                      key={tf.label}
                      onClick={() => {
                        setSelectedTfIdx(idx);
                        const tfKey = `${selectedPairIdx}-${idx}`;
                        if (!candlesticksByTfRef.current[tfKey]?.length) {
                          const pair = MARKET_PAIRS[selectedPairIdx] || MARKET_PAIRS[0];
                          const liveP = marketPricesRef.current[selectedPairIdx] ?? pair.basePrice;
                          const syncMap = generateSynchronousCandlesForPair(selectedPairIdx, liveP);
                          candlesticksByTfRef.current = { ...candlesticksByTfRef.current, ...syncMap };
                          setCandlesticksByTf(prev => ({ ...prev, ...syncMap }));
                        }
                        setQuestStats((prev) => ({ ...prev, switchedPairOrTf: true }));
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-bold transition-all cursor-pointer shrink-0 ${
                        selectedTfIdx === idx
                          ? 'bg-sky-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>

                {currentMarketPair?.marketType === 'crypto_real' ? (
                  <div
                    className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/50 text-[10px] text-emerald-300 font-mono shrink-0 select-none shadow-sm"
                    title={language === 'en' ? 'Direct real-time price feed from Binance Global' : 'Data harga live real-time tersambung ke Binance Global'}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse" />
                    <span className="font-bold">LIVE BINANCE FEED</span>
                  </div>
                ) : (
                  <div
                    className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-[10px] text-purple-300 font-mono shrink-0 select-none"
                    title={language === 'en' ? 'Degen Perps market with Whale manipulation enabled' : 'Simulasi Degen Perps dengan fitur manipulasi Whale'}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                    <span>Simulasi Degen Perps</span>
                  </div>
                )}
              </div>

              {/* Technical Indicators Interactive Sub-bar (Tanpa Display Angka Harga) */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 px-3 py-1.5 bg-[#090D15] border-t border-slate-800/80 text-[10px] font-mono select-none">
                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="flex items-center gap-1 text-slate-400 font-semibold mr-1">
                    <Activity className="w-3 h-3 text-sky-400" />
                    <span>{t.indicators || 'Indikator'}:</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleIndicator('ema20')}
                    className={`px-2 py-0.5 rounded border transition-all flex items-center gap-1.5 cursor-pointer ${
                      indicators.ema20
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold shadow-sm'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-500 hover:text-slate-300'
                    }`}
                    title="Exponential Moving Average (20) - Momentum Tren Pendek"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>EMA 20</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleIndicator('ema50')}
                    className={`px-2 py-0.5 rounded border transition-all flex items-center gap-1.5 cursor-pointer ${
                      indicators.ema50
                        ? 'bg-sky-500/15 border-sky-500/50 text-sky-300 font-bold shadow-sm'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-500 hover:text-slate-300'
                    }`}
                    title="Exponential Moving Average (50) - Tren Menengah"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                    <span>EMA 50</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleIndicator('ema200')}
                    className={`px-2 py-0.5 rounded border transition-all flex items-center gap-1.5 cursor-pointer ${
                      indicators.ema200
                        ? 'bg-purple-500/15 border-purple-500/50 text-purple-300 font-bold shadow-sm'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-500 hover:text-slate-300'
                    }`}
                    title="Exponential Moving Average (200) - Tren Jangka Panjang (Golden/Death Cross)"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                    <span>EMA 200</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleIndicator('bollinger')}
                    className={`px-2 py-0.5 rounded border transition-all flex items-center gap-1.5 cursor-pointer ${
                      indicators.bollinger
                        ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300 font-bold shadow-sm'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-500 hover:text-slate-300'
                    }`}
                    title="Bollinger Bands (20, 2) - Band Volatilitas Pasar"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    <span>BB (20, 2)</span>
                  </button>
                </div>

                {activeDrawingTool && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-sky-500/15 border border-sky-500/40 text-sky-300 text-[9px] animate-pulse">
                    <PenTool className="w-2.5 h-2.5" />
                    <span>
                      Mode: {
                        activeDrawingTool === 'trendline' ? (language === 'en' ? 'Trendline' : 'Garis Tren') :
                        activeDrawingTool === 'horizontal' ? (language === 'en' ? 'S/R Line' : 'Garis S/R') :
                        activeDrawingTool === 'box' ? (language === 'en' ? 'Zone Box' : 'Kotak Zone') : (language === 'en' ? 'Freehand Pen' : 'Pena Bebas')
                      }
                    </span>
                    <button
                      type="button"
                      onClick={() => { setActiveDrawingTool(null); setPendingDrawing(null); }}
                      className="ml-1 hover:text-white cursor-pointer"
                      title={language === 'en' ? 'Cancel Drawing Mode (Esc)' : 'Batal Mode Gambar (Esc)'}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div 
              className={`relative ${
                isSidebarOpen ? 'h-[280px] sm:h-[340px] lg:h-[380px]' : 'h-[360px] sm:h-[440px] lg:h-[520px]'
              } w-full bg-[#0B0E14] ${
                isPanningChart
                  ? 'cursor-grabbing'
                  : (hoveredAdjustable || draggingTpSlType)
                    ? 'cursor-ns-resize'
                    : 'cursor-crosshair'
              } overflow-hidden select-none transition-all duration-300`}
              onClick={handleCanvasClick}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onTouchStart={handleCanvasTouchStart}
              onTouchMove={handleCanvasTouchMove}
              onTouchEnd={handleCanvasTouchEnd}
              onDoubleClick={() => {
                setChartXZoom(1);
                setChartYZoom(1);
                setChartPanX(0);
                setChartPanY(0);
              }}
              onMouseLeave={() => {
                setMousePos({ x: null, y: null });
                if (isFreehandRef.current) handleCanvasMouseUp();
              }}
            >
              <canvas ref={canvasRef} className="w-full h-full block" />

              {/* Contextual Toolbar when a drawing is selected */}
              {selectedDrawing && (
                <div 
                  className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 bg-slate-950/95 backdrop-blur-md border border-sky-500/60 rounded-xl shadow-2xl select-none animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5 text-sky-300 text-xs font-semibold pr-1 border-r border-slate-800">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedDrawing.color || '#38BDF8' }} />
                    <span className="text-[11px] font-mono">
                      {selectedDrawing.type === 'trendline' && (language === 'en' ? 'Trendline' : 'Garis Tren')}
                      {selectedDrawing.type === 'horizontal' && (language === 'en' ? 'S/R Line' : 'Garis S/R')}
                      {selectedDrawing.type === 'box' && (language === 'en' ? 'Zone Box' : 'Kotak Zona')}
                      {selectedDrawing.type === 'freehand' && (language === 'en' ? 'Freehand' : 'Coretan')}
                    </span>
                  </div>

                  {/* Quick Color Pickers for Selected Drawing */}
                  <div className="flex items-center gap-1">
                    {DRAWING_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleUpdateSelectedDrawingColor(c)}
                        className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer ${
                          selectedDrawing.color === c ? 'ring-2 ring-white scale-125' : 'opacity-70 hover:opacity-100 hover:scale-110'
                        }`}
                        style={{ backgroundColor: c }}
                        title={language === 'en' ? `Change color to ${c}` : `Ganti warna ke ${c}`}
                      />
                    ))}
                  </div>

                  <div className="w-px h-4 bg-slate-800" />

                  {/* Delete Selected Drawing Button */}
                  <button
                    type="button"
                    onClick={handleDeleteSelectedDrawing}
                    className="p-1 rounded-lg text-rose-400 hover:text-white hover:bg-rose-500/80 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                    title={t.toolDelete || 'Hapus gambar terpilih ini (Del / Backspace)'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.deleteBtn || 'Hapus'}</span>
                  </button>

                  {/* Deselect Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedDrawingId(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title={t.toolDeselect || 'Batal Pilih (Esc)'}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Floating TradingView-Style Left Drawing Toolbar */}
              <div 
                className="absolute top-11 left-2 z-20 flex flex-col gap-1 p-1 bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-xl shadow-2xl select-none"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => { setActiveDrawingTool(null); setPendingDrawing(null); }}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    !activeDrawingTool
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`}
                  title={t.toolCursor || 'Kursor Standar / Crosshair (Esc)'}
                >
                  <MousePointer className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveDrawingTool((prev) => (prev === 'trendline' ? null : 'trendline'));
                    setPendingDrawing(null);
                  }}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    activeDrawingTool === 'trendline'
                      ? 'bg-sky-500 text-slate-950 shadow-sm ring-1 ring-sky-300'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`}
                  title={t.toolTrendline || 'Trendline / Garis Tren (Klik 2 titik di chart)'}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveDrawingTool((prev) => (prev === 'horizontal' ? null : 'horizontal'));
                    setPendingDrawing(null);
                  }}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    activeDrawingTool === 'horizontal'
                      ? 'bg-sky-500 text-slate-950 shadow-sm ring-1 ring-sky-300'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`}
                  title={t.toolHorizontal || 'Garis Horizontal / Support & Resistance (1 klik di level harga)'}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveDrawingTool((prev) => (prev === 'box' ? null : 'box'));
                    setPendingDrawing(null);
                  }}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    activeDrawingTool === 'box'
                      ? 'bg-sky-500 text-slate-950 shadow-sm ring-1 ring-sky-300'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`}
                  title={t.toolBox || 'Kotak Area / Supply & Demand Zone (Klik 2 sudut di chart)'}
                >
                  <Square className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveDrawingTool((prev) => (prev === 'freehand' ? null : 'freehand'));
                    setPendingDrawing(null);
                  }}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    activeDrawingTool === 'freehand'
                      ? 'bg-sky-500 text-slate-950 shadow-sm ring-1 ring-sky-300'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`}
                  title={t.toolFreehand || 'Pena Analisis / Freehand Pen (Drag mouse untuk mencoret)'}
                >
                  <PenTool className="w-3.5 h-3.5" />
                </button>

                <div className="w-full h-px bg-slate-800/80 my-0.5" />

                {/* Color Palette Selector */}
                <div className="flex flex-col items-center gap-1 py-0.5">
                  {DRAWING_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setDrawingColor(c)}
                      className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer ${
                        drawingColor === c ? 'ring-2 ring-white scale-110 shadow-sm' : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                      title={language === 'en' ? `Select Color ${c}` : `Pilih Warna ${c}`}
                    />
                  ))}
                </div>

                <div className="w-full h-px bg-slate-800/80 my-0.5" />

                {/* Undo Button */}
                <button
                  type="button"
                  onClick={handleUndoDrawing}
                  disabled={currentPairDrawings.length === 0}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer"
                  title={t.toolUndo || 'Undo Gambar Terakhir (Ctrl+Z)'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Clear All Drawings Button */}
                <button
                  type="button"
                  onClick={handleClearDrawings}
                  disabled={currentPairDrawings.length === 0}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer"
                  title={t.toolClearAll || 'Hapus Semua Gambar di Pair Ini'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Live drawing instructions badge at bottom center */}
              {activeDrawingTool && (
                <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-slate-950/90 border border-sky-500/50 text-[10px] font-mono text-sky-300 shadow-xl pointer-events-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                  <span>
                    {activeDrawingTool === 'trendline' && (pendingDrawing ? (t.liveHintTrendline2 || 'Klik titik ke-2 untuk mengunci garis tren') : (t.liveHintTrendline1 || 'Klik titik pertama untuk memulai garis tren'))}
                    {activeDrawingTool === 'horizontal' && (t.liveHintHorizontal || 'Klik pada chart untuk meletakkan level harga Support/Resistance')}
                    {activeDrawingTool === 'box' && (pendingDrawing ? (t.liveHintBox2 || 'Klik titik ke-2 untuk mengunci kotak zona') : (t.liveHintBox1 || 'Klik sudut awal untuk membuat kotak zona'))}
                    {activeDrawingTool === 'freehand' && (t.liveHintFreehand || 'Klik dan tahan mouse untuk mencoret bebas di chart')}
                  </span>
                  <span className="text-slate-500 ml-1">| {t.liveHintEsc || 'Tekan Esc untuk batal'}</span>
                </div>
              )}

              {/* X-Axis (Time) Drag-to-Zoom Zone */}
              <div
                className="absolute bottom-0 left-0 right-[80px] h-[24px] cursor-ew-resize z-10 flex items-center justify-center group"
                title={t.zoomTimeHint || 'Drag ke kanan: Zoom In | Drag ke kiri: Zoom Out | Double-click: Reset'}
                onMouseDown={handleXAxisMouseDown}
                onTouchStart={handleXAxisTouchStart}
                onDoubleClick={() => { setChartXZoom(1); setChartPanX(0); }}
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-mono text-sky-400 bg-slate-900/90 px-1.5 py-0.5 rounded border border-sky-500/30 pointer-events-none select-none">
                  ↔ {t.zoomTime || 'Zoom Waktu'} ({chartXZoom.toFixed(1)}x)
                </div>
              </div>

              {/* Y-Axis (Price) Drag-to-Zoom Zone */}
              <div
                className="absolute top-0 right-0 w-[80px] bottom-[24px] cursor-ns-resize z-10 flex flex-col items-center justify-center group"
                title={t.zoomPriceHint || 'Drag ke atas: Zoom In | Drag ke bawah: Zoom Out | Double-click: Reset'}
                onMouseDown={handleYAxisMouseDown}
                onTouchStart={handleYAxisTouchStart}
                onDoubleClick={() => { setChartYZoom(1); setChartPanY(0); }}
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-mono text-sky-400 bg-slate-900/90 px-1.5 py-0.5 rounded border border-sky-500/30 pointer-events-none select-none">
                  ↕ {t.zoomPrice || 'Zoom Harga'} ({chartYZoom.toFixed(1)}x)
                </div>
              </div>

              {/* TradingView-Style Corner AUTO / Reset Zoom Button */}
              {(chartXZoom !== 1 || chartYZoom !== 1 || chartPanX !== 0 || chartPanY !== 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setChartXZoom(1);
                    setChartYZoom(1);
                    setChartPanX(0);
                    setChartPanY(0);
                  }}
                  className="absolute bottom-1 right-1 z-20 px-1.5 py-0.5 rounded bg-sky-500/90 hover:bg-sky-400 text-slate-950 font-mono text-[9px] font-bold shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1 border border-sky-400"
                  title={t.resetZoom || 'Reset Zoom & Pan (Kembali ke Auto-Fit)'}
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  AUTO
                </button>
              )}
              <div className="absolute top-2.5 left-12 sm:left-14 flex flex-wrap items-center gap-2 pointer-events-none">
                <span className="px-2 py-0.5 rounded bg-slate-900/85 border border-slate-700 text-[10px] font-mono text-sky-400 font-bold">
                  TF: {TIMEFRAMES[selectedTfIdx].label}
                </span>
                {displayCandle && (
                  <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-slate-950/90 border border-slate-700/80 text-[10px] font-mono shadow-md">
                    {(() => {
                      const curPairPrec = getPairPrecision(MARKET_PAIRS[selectedPairIdx] || MARKET_PAIRS[0], currentPrice);
                      return (
                        <>
                          <span className="text-slate-400">O: <span className="text-white font-bold">{formatPairPrice(displayCandle.open, curPairPrec)}</span></span>
                          <span className="text-slate-400">H: <span className="text-white font-bold">{formatPairPrice(displayCandle.high, curPairPrec)}</span></span>
                          <span className="text-slate-400">L: <span className="text-white font-bold">{formatPairPrice(displayCandle.low, curPairPrec)}</span></span>
                          <span className="text-slate-400">C: <span className={`font-bold ${displayCandle.close >= displayCandle.open ? 'text-[#00FF88]' : 'text-[#FF3366]'}`}>{formatPairPrice(displayCandle.close, curPairPrec)}</span></span>
                        </>
                      );
                    })()}
                  </div>
                )}
                {activePosition && activePosition.pairSymbol === MARKET_PAIRS[selectedPairIdx]?.symbol && (
                  <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-slate-950/90 border border-slate-700/80 backdrop-blur-sm text-[10px] font-mono shadow-md">
                    <span className="flex items-center gap-1 font-bold">
                      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${activePosition.type === 'LONG' ? 'bg-[#00FF88]' : 'bg-[#FF3366]'}`} />
                      <span className={activePosition.type === 'LONG' ? 'text-[#00FF88]' : 'text-[#FF3366]'}>
                        {activePosition.type} {Number(activePosition.leverage.toFixed(1))}x
                      </span>
                    </span>
                    {(() => {
                      const posPrec = getPairPrecision(activePosition.pairSymbol, activePosition.entryPrice);
                      return (
                        <>
                          <span className="text-slate-400">Entry: <span className="text-white">{formatPairPrice(activePosition.entryPrice, posPrec)}</span></span>
                          <span className="text-rose-400">Liq: {formatPairPrice(activePosition.liqPrice, posPrec)}</span>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-[#111622]/90 border-t border-slate-800/80 flex flex-col gap-3">
              {/* Feature 1: Inventory Quick Bar Toolbar */}
              <InventoryQuickBar
                inventory={inventory}
                activeEffects={activeEffects}
                dailyWhaleUsage={dailyWhaleUsage}
                currentPair={currentMarketPair}
                onUseItem={handleUseBlackMarketItem}
                t={t}
                language={language}
              />

              {!activePosition ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#0B0E14] p-2.5 rounded-xl border border-slate-800/80">
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                        <span>{t.marginCapital || 'MODAL MARGIN'} ({betPercent}%)</span>
                        <span className="font-mono text-white font-bold">
                          {formatMoney(cash * (betPercent / 100))}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[10, 25, 50, 100].map((pct) => (
                          <button
                            key={pct}
                            onClick={() => setBetPercent(pct)}
                            className={`py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                              betPercent === pct
                                ? 'bg-sky-500 text-slate-950'
                                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#0B0E14] p-2.5 rounded-xl border border-slate-800/80">
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                        <span>{t.leverage || 'LEVERAGE'}</span>
                        <span
                          className={`font-mono font-bold ${
                            leverage >= 250
                              ? 'text-amber-400 animate-pulse'
                              : leverage >= 50
                              ? 'text-[#FF3366]'
                              : 'text-amber-400'
                          }`}
                        >
                          {leverage}x {leverage === 250 ? '⚡ GOD' : leverage === 100 ? '🔥 DEGEN' : ''}
                        </span>
                      </div>
                      <div className={`grid ${activeEffects.has250xTicket || leverage === 250 ? 'grid-cols-5' : 'grid-cols-4'} gap-1.5`}>
                        {[2, 10, 50, 100, ...(activeEffects.has250xTicket || leverage === 250 ? [250] : [])].map((lev) => (
                          <button
                            key={lev}
                            onClick={() => setLeverage(lev)}
                            className={`py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                              leverage === lev
                                ? lev >= 250
                                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 animate-pulse'
                                  : lev >= 50
                                  ? 'bg-[#FF3366] text-white'
                                  : 'bg-amber-400 text-slate-950'
                                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {lev}x {lev === 250 ? '⚡' : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#0B0E14] p-2.5 rounded-xl border border-slate-800/80 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">{t.takeProfit || 'Take Profit (Opsional):'}</span>
                        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">{t.tpSubHint || 'L > Entry | S < Entry'}</span>
                      </div>
                      <input
                        aria-label="Take Profit"
                        type="number"
                        placeholder={`${t.tpPlaceholder || 'Misal:'} ${(currentPrice * 1.1).toFixed(getPairPrecision(MARKET_PAIRS[selectedPairIdx], currentPrice))}`}
                        value={tpInput}
                        onChange={(e) => setTpInput(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-[#00FF88] outline-none focus:border-[#00FF88]"
                      />
                      <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
                        <span className="text-slate-500">
                          {orderTpEst ? `${t.estProfit || 'Est. Cuan'} (${orderTpEst.plannedType}):` : `${t.estProfit || 'Est. Cuan'}:`}
                        </span>
                        {orderTpEst ? (
                          <span className="font-bold text-[#00FF88]">
                            +{formatMoney(orderTpEst.pnlDollar)} (+{orderTpEst.roiPercent.toFixed(1)}%)
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#0B0E14] p-2.5 rounded-xl border border-slate-800/80 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">{t.stopLoss || 'Stop Loss (Opsional):'}</span>
                        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">{t.slSubHint || 'L < Entry | S > Entry'}</span>
                      </div>
                      <input
                        aria-label="Stop Loss"
                        type="number"
                        placeholder={`${t.slPlaceholder || 'Misal:'} ${(currentPrice * 0.9).toFixed(getPairPrecision(MARKET_PAIRS[selectedPairIdx], currentPrice))}`}
                        value={slInput}
                        onChange={(e) => setSlInput(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-[#FF3366] outline-none focus:border-[#FF3366]"
                      />
                      <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
                        <span className="text-slate-500">
                          {orderSlEst ? `${t.estLoss || 'Est. Rugi'} (${orderSlEst.plannedType}):` : `${t.estLoss || 'Est. Rugi'}:`}
                        </span>
                        {orderSlEst ? (
                          <span className="font-bold text-[#FF3366]">
                            {formatMoney(orderSlEst.pnlDollar)} ({orderSlEst.roiPercent.toFixed(1)}%)
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => openPosition('LONG')}
                      className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#00FF88] to-emerald-500 hover:from-emerald-400 hover:to-[#00FF88] text-slate-950 font-extrabold text-xs sm:text-sm flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-[#00FF88]/15 active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                        <span>{t.buyLong || 'BUY / LONG'} {leverage}x</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold opacity-90">
                        {t.orderSize || 'Size:'} {formatMoney(cash * (betPercent / 100) * leverage)}
                      </span>
                    </button>

                    <button
                      onClick={() => openPosition('SHORT')}
                      className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF3366] to-rose-600 hover:from-rose-500 hover:to-[#FF3366] text-white font-extrabold text-xs sm:text-sm flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-[#FF3366]/20 active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                        <span>{t.sellShort || 'SELL / SHORT'} {leverage}x</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold opacity-90">
                        {t.orderSize || 'Size:'} {formatMoney(cash * (betPercent / 100) * leverage)}
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-[#0B0E14] rounded-2xl border border-slate-800/90 shadow-xl overflow-hidden flex flex-col">
                  {/* BARIS 1: Header Ringkasan Posisi & Jarak Likuidasi */}
                  <div className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[#111622]/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-black tracking-wide flex items-center gap-1.5 ${
                          activePosition.type === 'LONG'
                            ? 'bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/40'
                            : 'bg-[#FF3366]/15 text-[#FF3366] border border-[#FF3366]/40'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${activePosition.type === 'LONG' ? 'bg-[#00FF88]' : 'bg-[#FF3366]'} animate-pulse`} />
                        {activePosition.type} {Number(activePosition.leverage.toFixed(1))}x
                      </span>
                      <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                        {activePosition.pairSymbol}
                        {activePosition.pairSymbol !== MARKET_PAIRS[selectedPairIdx]?.symbol && (
                          <button
                            onClick={() => {
                              const pIdx = MARKET_PAIRS.findIndex(p => p.symbol === activePosition.pairSymbol);
                              if (pIdx >= 0) {
                                setSelectedPairIdx(pIdx);
                                const liveP = marketPricesRef.current[pIdx] ?? MARKET_PAIRS[pIdx].basePrice;
                                setCurrentPrice(liveP);
                                const tfKey = `${pIdx}-${selectedTfIdx}`;
                                if (!candlesticksByTfRef.current[tfKey]?.length) {
                                  const syncMap = generateSynchronousCandlesForPair(pIdx, liveP);
                                  candlesticksByTfRef.current = { ...candlesticksByTfRef.current, ...syncMap };
                                  setCandlesticksByTf(prev => ({ ...prev, ...syncMap }));
                                }
                              }
                            }}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 cursor-pointer"
                          >
                            {t.openChart || 'Buka Chart'}
                          </button>
                        )}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {t.posMargin || 'Margin:'} <strong className="text-slate-200 font-semibold">{formatMoney(activePosition.margin)}</strong>
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                        ({t.posSize || 'Size:'} {formatMoney(activePosition.margin * activePosition.leverage)})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-slate-400 text-[11px]">{t.posLiq || 'Liq:'}</span>
                      <span className="text-[#FF3366] font-bold">
                        {formatPairPrice(activePosition.liqPrice, getPairPrecision(activePosition.pairSymbol, activePosition.liqPrice))}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/25 font-bold">
                        {Math.abs((((livePositionStats?.posPrice || currentPrice) - activePosition.liqPrice) / (livePositionStats?.posPrice || currentPrice)) * 100).toFixed(1)}% {t.posAway || 'away'}
                      </span>
                    </div>
                  </div>

                  {/* BARIS 2: Area Detail (Target di Kiri, PnL di Tengah, Tombol Aksi di Kanan) */}
                  <div className="p-3.5 sm:p-4 grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
                    {/* Target & Entry Price */}
                    <div className="sm:col-span-5 flex flex-col gap-1.5">
                      {(() => {
                        const posPrec = getPairPrecision(activePosition.pairSymbol, activePosition.entryPrice);
                        return (
                          <>
                            <div className="flex items-center justify-between sm:justify-start gap-3 text-xs font-mono">
                              <span className="text-slate-400 text-[11px]">{t.posEntry || 'Harga Entry:'}</span>
                              <span className="text-sky-300 font-bold">{formatPairPrice(activePosition.entryPrice, posPrec)}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60 text-[11px] font-mono">
                              <button
                                type="button"
                                onClick={() => openAdjustModal()}
                                className="flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer text-left"
                                title={t.posTpTitle || 'Klik untuk ubah Target Take Profit'}
                              >
                                <span className="text-slate-400 text-[10px] font-bold">TP:</span>
                                {activePosition.tpPrice ? (
                                  <span className="text-[#00FF88] font-bold flex items-center gap-1">
                                    {formatPairPrice(activePosition.tpPrice, posPrec)}
                                    {activePosTpEst && (
                                      <span className="text-[10px] text-emerald-400 font-semibold opacity-90">
                                        (+{formatMoney(activePosTpEst.pnlDollar)})
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  <span className="text-slate-500 font-normal">{t.posNotSet || 'Tidak diatur'}</span>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => openAdjustModal()}
                                className="flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer text-left"
                                title={t.posSlTitle || 'Klik untuk ubah Stop Loss'}
                              >
                                <span className="text-slate-400 text-[10px] font-bold">SL:</span>
                                {activePosition.slPrice ? (
                                  <span className="text-amber-400 font-bold flex items-center gap-1">
                                    {formatPairPrice(activePosition.slPrice, posPrec)}
                                    {activePosSlEst && (
                                      <span className="text-[10px] text-rose-400 font-semibold opacity-90">
                                        ({formatMoney(activePosSlEst.pnlDollar)})
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  <span className="text-slate-500 font-normal">{t.posNotSet || 'Tidak diatur'}</span>
                                )}
                              </button>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Unrealized PnL Lega di Tengah */}
                    <div className="sm:col-span-4 flex flex-col items-start sm:items-center justify-center py-1 sm:py-0 sm:border-x sm:border-slate-800/70 sm:px-2">
                      <div className="text-[10px] uppercase text-slate-400 font-mono tracking-wider font-semibold">
                        {t.unrealizedPnl || 'Unrealized PnL'}
                      </div>
                      <div
                        className={`text-lg sm:text-xl font-mono font-black tracking-tight ${
                          livePositionStats.pnlDollar >= 0 ? 'text-[#00FF88]' : 'text-[#FF3366]'
                        }`}
                      >
                        {livePositionStats.pnlDollar >= 0 ? '+' : ''}
                        {formatMoney(livePositionStats.pnlDollar)}{' '}
                        <span className="text-xs font-bold opacity-90">
                          ({livePositionStats.pnlDollar >= 0 ? '+' : ''}{livePositionStats.roiPercent.toFixed(1)}%)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-mono mt-1 text-slate-400">
                        <span
                          className={`px-2 py-0.5 rounded font-semibold ${
                            livePositionStats.roiPercent >= 0
                              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                              : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                          }`}
                          title={t.purePriceRoiTooltip || 'Keuntungan / kerugian murni dari selisih harga pasar (100% Price Action)'}
                        >
                          {t.priceRoi || 'Price ROI:'} {livePositionStats.roiPercent >= 0 ? '+' : ''}
                          {livePositionStats.roiPercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    {/* Tombol Aksi di Kanan */}
                    <div className="sm:col-span-3 flex items-center justify-end w-full pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/70">
                      <button
                        onClick={() => closePosition(false)}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 cursor-pointer shrink-0 transition-all active:scale-95 whitespace-nowrap"
                      >
                        {t.closePosition || 'Close / TP'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
          </div>

        {isSidebarOpen && (
          <div className="lg:col-span-5 flex flex-col bg-[#0B0E14] border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl max-h-[560px] sm:max-h-[620px] lg:h-[640px] lg:max-h-[640px] animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="bg-[#111622] p-2 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('quests')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 relative ${
                    activeTab === 'quests'
                      ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-slate-300" />
                  <span>{t.tabQuests || 'Misi & Tugas'}</span>
                  {unclaimedQuestCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-500 text-slate-950 shadow-sm">
                      {unclaimedQuestCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                    activeTab === 'history'
                      ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-slate-300" />
                  <span>{t.tabHistory || 'Log Trade'}</span>
                </button>
              </div>

              {/* Close Sidebar Button to maximize chart space */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="px-2 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                title={t.closeSidebarTitle || 'Tutup Sidebar (Maksimalkan Tampilan Grafik)'}
              >
                <PanelRightClose className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">{t.closeSidebarText || 'Tutup'}</span>
              </button>
            </div>

          <div className="p-3 sm:p-4 flex-1 min-h-0 overflow-y-auto space-y-2.5 pb-4">

            {activeTab === 'quests' && (
              <div className="space-y-3">
                {/* Header Banner */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/30">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4 text-[#00FF88]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          {t.missionsBannerTitle || 'Misi & Hadiah Likuiditas'}
                          {unclaimedQuestCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#00FF88] text-slate-950">
                              {unclaimedQuestCount} {t.readyToClaim || 'Siap Klaim'}
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {t.missionsBannerSub || 'Selesaikan misi untuk modal awal & percepat ekspansi rig trading!'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Category Filter Chips */}
                  <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-0.5">
                    {[
                      { id: 'all', label: t.chipAll || 'Semua' },
                      { id: 'daily', label: t.chipDaily || 'Harian (24J)' },
                      { id: 'phase1', label: t.chipPhase1 || 'Misi 1' },
                      { id: 'phase2', label: t.chipPhase2 || 'Misi 2', locked: !isPhase2Unlocked },
                      { id: 'phase3', label: t.chipPhase3 || 'Misi 3', locked: !isPhase3Unlocked }
                    ].map((chip) => (
                      <button
                        key={chip.id}
                        onClick={() => setQuestCategoryTab(chip.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                          questCategoryTab === chip.id
                            ? 'bg-[#00FF88] text-slate-950 shadow-sm'
                            : chip.locked
                            ? 'bg-slate-900/60 text-slate-500 hover:text-slate-400 border border-slate-800/60'
                            : 'bg-slate-800/70 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{chip.label}</span>
                        {chip.locked && <Lock className="w-3 h-3 text-slate-500" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Daily Quests Group */}
                {(questCategoryTab === 'all' || questCategoryTab === 'daily') && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {t.dailyGroupTitle || 'Tugas Harian (Reset 24 Jam)'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {DAILY_QUESTS.filter((q) => dailyQuestState.claimed?.[q.id]).length}/4 {t.completed || 'Selesai'}
                      </span>
                    </div>

                    {DAILY_QUESTS.map((q) => {
                      const isClaimed = Boolean(dailyQuestState.claimed?.[q.id]);
                      const currentVal = q.getProgress(dailyQuestState);
                      const isReady = !isClaimed && currentVal >= q.target;
                      const pct = q.progressPct(dailyQuestState);

                      return (
                        <div
                          key={q.id}
                          className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                            isClaimed
                              ? 'bg-slate-950/40 border-slate-800/50 opacity-70'
                              : isReady
                              ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                              : 'bg-[#111622] border-slate-800'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white truncate">
                                {(t.dailyQuests?.[q.id]?.title) || q.title}
                              </h4>
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-[#00FF88] text-[10px] font-mono font-bold">
                                +{formatMoney(q.reward)}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {(t.dailyQuests?.[q.id]?.desc) || q.desc}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${
                                    isClaimed
                                      ? 'bg-slate-600'
                                      : isReady
                                      ? 'bg-[#00FF88]'
                                      : 'bg-emerald-500/70'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                {q.progressText(dailyQuestState)}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center justify-end">
                            {isClaimed ? (
                              <span className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70" />
                                {t.statusClaimed || 'Diklaim'}
                              </span>
                            ) : isReady ? (
                              <button
                                onClick={() => handleClaimDaily(q.id)}
                                className="px-3 py-1.5 rounded-lg bg-[#00FF88] hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                {t.btnClaim || 'KLAIM'} {formatMoney(q.reward)}
                              </button>
                            ) : (
                              <span className="px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] font-mono text-slate-400">
                                {t.statusInProcess || 'Proses'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Milestone Quests Groups */}
                {[1, 2, 3].map((phaseNum) => {
                  const phaseKey = `phase${phaseNum}`;
                  if (questCategoryTab !== 'all' && questCategoryTab !== phaseKey) return null;

                  const isUnlocked = phaseNum === 1 ? true : (phaseNum === 2 ? isPhase2Unlocked : isPhase3Unlocked);

                  const phaseTitles = {
                    1: { title: t.phaseTitles?.[1]?.title || 'Misi 1: Kamar Kos (Onboarding Pemula)', sub: t.phaseTitles?.[1]?.sub || 'Dasar trading & risk management ($1.50 - $2.50)' },
                    2: { title: t.phaseTitles?.[2]?.title || 'Misi 2: Cashflow Pasif', sub: t.phaseTitles?.[2]?.sub || 'Membangun mesin pendapatan rig ($3.00 - $15.00)' },
                    3: { title: t.phaseTitles?.[3]?.title || 'Misi 3: Sultan Warnet', sub: t.phaseTitles?.[3]?.sub || 'Skala modal & leverage whale ($20.00 - $150.00)' }
                  };

                  const phaseQuests = MILESTONE_QUESTS.filter((q) => q.phase === phaseNum);
                  const phaseClaimedCount = phaseQuests.filter((q) => claimedMilestones[q.id]).length;

                  if (!isUnlocked) {
                    const claimedPhase1 = MILESTONE_QUESTS.filter((q) => q.phase === 1 && claimedMilestones[q.id]).length;
                    const claimedPhase2 = MILESTONE_QUESTS.filter((q) => q.phase === 2 && claimedMilestones[q.id]).length;

                    return (
                      <div key={phaseNum} className="space-y-2">
                        <div className="flex items-center justify-between px-1 pt-1">
                          <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-amber-400" />
                              {phaseTitles[phaseNum].title}
                            </span>
                            <p className="text-[10px] text-slate-500">{phaseTitles[phaseNum].sub}</p>
                          </div>
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold">
                            {t.statusLocked || 'Terkunci'}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">
                              <Lock className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-200">
                                {phaseNum === 2 ? (t.reqUnlockPhase2 || 'Syarat Membuka Misi 2:') : (t.reqUnlockPhase3 || 'Syarat Membuka Misi 3:')}
                              </h4>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {phaseNum === 2 ? (
                                  <>{t.reqPhase2Desc1 || 'Selesaikan seluruh 4 tugas di'} <strong>{t.chipPhase1 || 'Misi 1'}</strong> {t.reqPhase2Desc2 || 'dan beli infrastruktur'} <strong>{(t.upgrades?.indikator?.name) || 'Indikator Garis Keramat'}</strong>.</>
                                ) : (
                                  <>{t.reqPhase3Desc1 || 'Selesaikan seluruh 4 tugas di'} <strong>{t.chipPhase2 || 'Misi 2'}</strong> {t.reqPhase3Desc2 || 'dan beli infrastruktur'} <strong>{(t.upgrades?.vip_grup?.name) || 'Grup VIP Sinyal'}</strong>.</>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-1.5">
                            {phaseNum === 2 ? (
                              <>
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                  isPhase1Completed ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-500/30' : 'text-slate-400 bg-slate-800/60'
                                }`}>
                                  {t.chipPhase1 || 'Misi 1'}: {isPhase1Completed ? (t.statusCompleted || '✓ Selesai') : `${claimedPhase1}/4`}
                                </span>
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                  hasBoughtIndikator ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-500/30' : 'text-slate-400 bg-slate-800/60'
                                }`}>
                                  Indikator: {hasBoughtIndikator ? (t.statusPurchased || '✓ Terbeli') : (t.statusPending || 'Belum')}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                  isPhase2Completed ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-500/30' : 'text-slate-400 bg-slate-800/60'
                                }`}>
                                  {t.chipPhase2 || 'Misi 2'}: {isPhase2Completed ? (t.statusCompleted || '✓ Selesai') : `${claimedPhase2}/4`}
                                </span>
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                  hasBoughtVip ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-500/30' : 'text-slate-400 bg-slate-800/60'
                                }`}>
                                  Grup VIP: {hasBoughtVip ? (t.statusPurchased || '✓ Terbeli') : (t.statusPending || 'Belum')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={phaseNum} className="space-y-2">
                      <div className="flex items-center justify-between px-1 pt-1">
                        <div>
                          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-amber-400" />
                            {phaseTitles[phaseNum].title}
                          </span>
                          <p className="text-[10px] text-slate-500">{phaseTitles[phaseNum].sub}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {phaseClaimedCount}/{phaseQuests.length}
                        </span>
                      </div>

                      {phaseQuests.map((q) => {
                        const isClaimed = Boolean(claimedMilestones[q.id]);
                        const gameSnapshot = {
                          activePosition,
                          tradeHistory,
                          peakNetWorth,
                          currentDps,
                          passiveLevels,
                          lastDailyClaim
                        };
                        const isReady = !isClaimed && q.check(questStats, gameSnapshot);
                        const pct = q.progressPct(questStats, gameSnapshot);

                        return (
                          <div
                            key={q.id}
                            className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                              isClaimed
                                ? 'bg-slate-950/40 border-slate-800/50 opacity-70'
                                : isReady
                                ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                                : 'bg-[#111622] border-slate-800'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-white truncate">
                                  {(t.milestoneQuests?.[q.id]?.title) || q.title}
                                </h4>
                                <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-[#00FF88] text-[10px] font-mono font-bold">
                                  +{formatMoney(q.reward)}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {(t.milestoneQuests?.[q.id]?.desc) || q.desc}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-300 ${
                                      isClaimed
                                        ? 'bg-slate-600'
                                        : isReady
                                        ? 'bg-[#00FF88]'
                                        : 'bg-emerald-500/70'
                                    }`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                  {q.progressText(questStats, gameSnapshot)}
                                </span>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center justify-end">
                              {isClaimed ? (
                                <span className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70" />
                                  {t.statusClaimed || 'Diklaim'}
                                </span>
                              ) : isReady ? (
                                <button
                                  onClick={() => handleClaimMilestone(q.id)}
                                  className="px-3 py-1.5 rounded-lg bg-[#00FF88] hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  {t.btnClaim || 'KLAIM'} {formatMoney(q.reward)}
                                </button>
                              ) : (
                                <span className="px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] font-mono text-slate-400">
                                  {t.statusInProcess || 'Proses'}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-2">
                {tradeHistory.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    {t.noTradeHistory || 'Belum ada riwayat posisi Leverage Trading.'}
                  </div>
                ) : (
                  tradeHistory.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-xl bg-[#111622] border border-slate-800 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            t.type === 'LONG'
                              ? 'bg-[#00FF88]/20 text-[#00FF88]'
                              : 'bg-[#FF3366]/20 text-[#FF3366]'
                          }`}
                        >
                          {t.type} {t.leverage}x
                        </span>
                        <span className="text-white font-bold">{t.pair}</span>
                        {t.status === 'LIQUIDATED' && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px]">
                            💀 LIQUIDATED
                          </span>
                        )}
                      </div>
                      <div
                        className={`font-bold ${
                          t.pnl >= 0 ? 'text-[#00FF88]' : 'text-[#FF3366]'
                        }`}
                      >
                        {t.pnl >= 0 ? '+' : ''}
                        {formatMoney(t.pnl)} ({t.roi.toFixed(1)}%)
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        )}
        </div>
        </div>

        {/* 3. TAB: MEME LAUNCHPAD */}
        {tradingMode === 'launchpad' && (
          <MemeLaunchpad
            cash={cash}
            onPlaceBet={handleMemePlaceBet}
            onWinCash={handleMemeWinCash}
            formatMoney={formatMoney}
            t={t}
            language={language}
            inventory={inventory}
            onUseBlackMarketItem={handleUseBlackMarketItem}
            playSound={(type) => {
              if (type === 'tp') playProfitSound();
              else if (type === 'sl') playLossSound();
              else if (type === 'open') playOrderSound('buy');
              else playUiClick();
            }}
          />
        )}

        {/* 4. TAB: SHOP (Infrastruktur & Black Market) */}
        {tradingMode === 'shop' && (
          <DegenShop
            cash={cash}
            whaleTokens={whaleTokens}
            passiveLevels={passiveLevels}
            buyPassiveUpgrade={buyPassiveUpgrade}
            getUpgradeCost={getUpgradeCost}
            PASSIVE_UPGRADES={PASSIVE_UPGRADES}
            totalMultiplier={totalMultiplier}
            currentLocation={currentLocation}
            inventory={inventory}
            activeEffects={activeEffects}
            onBuyBlackMarketItem={handleBuyBlackMarketItem}
            onOpenRewardedAd={() => {
              setAdRewardType('cash_reward');
              setShowRewardedAdModal(true);
            }}
            t={t}
            language={language}
            formatMoney={formatMoney}
            playSound={(type) => {
              if (type === 'tp') playProfitSound();
              else if (type === 'open') playOrderSound('buy');
              else playUiClick();
            }}
          />
        )}

        {/* Floating Quick Reopen Sidebar Button when collapsed */}
        {!isSidebarOpen && tradingMode === 'perps' && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#111622]/95 hover:bg-[#182032] border border-slate-700 text-white shadow-2xl backdrop-blur-md transition-all active:scale-95 cursor-pointer group hover:border-slate-500"
            title={t.openSidebarTitle || 'Buka Panel Misi & Riwayat Trade'}
          >
            <PanelRightOpen className="w-4 h-4 text-slate-300 group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-bold text-slate-200">{t.tabQuests || 'Misi & Tugas'} &amp; {t.tabHistory || 'Log Trade'}</span>
            {unclaimedQuestCount > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] shadow-sm">
                {unclaimedQuestCount}
              </span>
            )}
          </button>
        )}
      </main>

      <footer className="bg-[#0B0E14] border-t border-slate-800/90 py-2 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-hidden">
          <span className="px-2 py-0.5 rounded bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/30 font-mono text-[10px] font-bold shrink-0">
            {t.terminalFeed || 'TERMINAL FEED'}
          </span>
          <div className="text-xs text-slate-300 font-mono truncate">
            {(t.news && t.news[tickerIdx % t.news.length]) || NEWS_TICKER_ITEMS[tickerIdx]}
          </div>
        </div>
      </footer>

      {liquidationAlert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border-2 border-[#FF3366] rounded-2xl max-w-md w-full p-6 text-center shadow-[0_0_50px_rgba(255,51,102,0.3)]">
            <div className="w-16 h-16 rounded-full bg-[#FF3366]/20 border border-[#FF3366] flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-9 h-9 text-[#FF3366] animate-bounce" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#FF3366] tracking-tight">
              {t.liqModalTitle || 'MARGIN CALL / LIQUIDATED!'}
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {t.liqModalDesc1 || 'Posisi'}{' '}
              <span className="font-mono font-bold text-white">
                {liquidationAlert.type} {liquidationAlert.leverage}x ({liquidationAlert.pair})
              </span>{' '}
              {t.liqModalDesc2 || 'kamu tersapu pergerakan bandar.'}
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={handleBailoutAd}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                {t.liqModalBailoutBtn || 'Klaim Dana Talangan 20%'}
              </button>
              <button
                onClick={() => setLiquidationAlert(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                {t.liqModalAcceptBtn || 'Terima Nasib & Lanjut Idle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPnlModal && (
        <PnlShareModal
          isOpen={showPnlModal}
          onClose={() => setShowPnlModal(false)}
          netWorth={netWorth}
          cash={cash}
          currentDps={currentDps}
          activePosition={activePosition ? { ...activePosition, ...(livePositionStats || {}) } : null}
          recentTrades={tradeHistory}
          currentLocation={currentLocation}
          formatMoney={formatMoney}
          formatNumber={formatNumber}
          t={t}
          language={language}
        />
      )}

      {showPrestigeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-amber-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white">
                  {t.prestigeTitle || 'Launch Token Baru & Rugpull'}
                </h2>
                <p className="text-xs text-amber-300">{t.prestigeSub || 'Prestige System'}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {t.prestigeDesc || 'Reset kas dan infrastruktur kamu untuk meluncurkan koin baru dan mendapatkan Whale Token (+50% bonus profit permanen).'}
            </p>

            <div className="my-4 p-3.5 rounded-xl bg-[#0B0E14] border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">{t.prestigeCurrentTokens || 'Whale Token Saat Ini:'}</span>
                <span className="text-white font-bold">{whaleTokens} {t.prestigeTokensUnit || 'Token'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.prestigeClaimTokens || 'Klaim Token:'}</span>
                <span className="text-amber-400 font-extrabold">+{claimableWhaleTokens} {t.prestigeTokensUnit || 'Token'}</span>
              </div>
            </div>

            {/* Peringatan Konsekuensi Eksekusi Rugpull */}
            <div className="mb-4 p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs space-y-2.5">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-[11px] tracking-wide uppercase">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{t.prestigeWarningTitle || 'Konsekuensi Eksekusi Rugpull'}</span>
              </div>

              <div className="space-y-1 pl-1">
                <p className="text-[11px] font-semibold text-rose-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  {t.prestigeResetNoticeTitle || 'Yang Akan Direset (Hilang):'}
                </p>
                <ul className="text-[11px] text-slate-300 space-y-0.5 pl-3.5 list-disc marker:text-rose-400/70">
                  <li>{t.prestigeResetCash || 'Kas saldo trading kembali ke modal awal $10.00.'}</li>
                  <li>{t.prestigeResetInfra || 'Semua level rig & hardware mining pasif direset ke level 0.'}</li>
                  <li>{t.prestigeResetPositions || 'Posisi trading aktif & order TP/SL langsung ditutup otomatis.'}</li>
                </ul>
              </div>

              <div className="space-y-1 pl-1 pt-2 border-t border-slate-800/80">
                <p className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  {t.prestigeKeepNoticeTitle || 'Yang Kamu Dapatkan & Permanen:'}
                </p>
                <ul className="text-[11px] text-slate-300 space-y-0.5 pl-3.5 list-disc marker:text-emerald-400/70">
                  <li>{t.prestigeKeepTokens || 'Whale Token masuk ke profil akun secara permanen.'}</li>
                  <li>{t.prestigeKeepBonus || 'Setiap token memberi +50% multiplier profit permanen selamanya.'}</li>
                  <li>{t.prestigeKeepDividend || 'Setiap token memberi dividen pasif otomatis +$5.00/s selamanya (akun tidak pernah bangkrut).'}</li>
                  <li>{t.prestigeKeepFaucet || 'Hak akses jaring pengaman Whale Emergency Faucet saat saldo modal kritis.'}</li>
                  <li>{t.prestigeKeepHistory || 'Rekor tier lokasi, milestone, dan item Black Market tetap aman.'}</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handlePrestigeReset}
                disabled={claimableWhaleTokens <= 0}
                className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider cursor-pointer ${
                  claimableWhaleTokens > 0
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {t.prestigeExecuteBtn || 'Eksekusi Rugpull'} (+{claimableWhaleTokens} 🐋)
              </button>
              <button
                onClick={() => setShowPrestigeModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                {t.prestigeCancelBtn || 'Batal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#00FF88]" />
                {t.settingsTitle || 'Pengaturan'}
              </h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-slate-300 mb-1">{t.settingsAutoSaveTitle || 'Progres tersimpan otomatis'}</div>
              <p>{t.settingsAutoSaveDesc || 'Save setiap 3 detik, setelah transaksi, dan saat meninggalkan halaman. Simpanan versi lama dimigrasikan otomatis di browser dan alamat yang sama.'}</p>
              <p>{t.settingsOfflineDesc || 'Penghasilan saat game ditutup: maksimal 8 jam, tanpa bonus event. Harga posisi dijeda selama game ditutup.'}</p>
            </div>

            {/* Language Selection */}
            <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#00FF88]" />
                  {t.settingsLanguageTitle || (language === 'en' ? 'Display Language' : 'Pilih Bahasa Tampilan')}
                </div>
                <div className="text-[11px] text-slate-400">
                  {t.settingsLanguageDesc || (language === 'en' ? 'Switch between English and Indonesian' : 'Ganti antara Bahasa Indonesia & English')}
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-700">
                <button
                  data-testid="settings-lang-id"
                  onClick={() => switchLanguage('id')}
                  className={`px-2.5 py-1 rounded-md font-bold text-xs cursor-pointer transition-all flex items-center gap-1 ${
                    language === 'id'
                      ? 'bg-emerald-500/20 text-[#00FF88] border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🇮🇩</span> ID
                </button>
                <button
                  data-testid="settings-lang-en"
                  onClick={() => switchLanguage('en')}
                  className={`px-2.5 py-1 rounded-md font-bold text-xs cursor-pointer transition-all flex items-center gap-1 ${
                    language === 'en'
                      ? 'bg-emerald-500/20 text-[#00FF88] border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🇬🇧</span> EN
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#00FF88]" />}
                  {t.settingsAudioTitle || 'Efek Suara Synth Cyberpunk'}
                </div>
                <div className="text-[11px] text-slate-400">{t.settingsAudioDesc || 'Audio sintetis Web Audio API (order, cuan, liquid, upgrade).'}</div>
              </div>
              <button
                onClick={handleToggleSound}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                  isMuted
                    ? 'bg-slate-800 text-slate-400 hover:text-white'
                    : 'bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/40'
                }`}
              >
                {isMuted ? (t.settingsAudioMuted || 'Muted') : (t.settingsAudioActive || 'Aktif')}
              </button>
            </div>

            {/* Game Credits & Developer Card */}
            <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#00FF88]" />
                  {language === 'en' ? 'Game Credits & Creator' : 'Kredit Game & Pengembang'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {language === 'en' ? 'Created by Reza Bagus (@rezabaguss)' : 'Dibuat oleh Reza Bagus (@rezabaguss)'}
                </div>
              </div>
              <button
                data-testid="btn-open-credits"
                onClick={() => setShowCreditsModal(true)}
                className="px-3 py-1.5 rounded-lg font-bold text-xs bg-emerald-500/15 hover:bg-emerald-500/25 text-[#00FF88] border border-emerald-500/40 cursor-pointer transition-all active:scale-95 shadow-sm"
              >
                {language === 'en' ? 'View Credits' : 'Buka Kredit'}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white">{t.settingsResetTitle || 'Reset Data Permainan'}</div>
                <div className="text-[11px] text-slate-400">{t.settingsResetDesc || 'Hapus progres & mulai dari awal.'}</div>
              </div>
              <button
                onClick={() => confirmReset ? handleHardReset() : setConfirmReset(true)}
                className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer shrink-0"
              >
                {confirmReset ? (t.settingsResetConfirmBtn || 'Ya, hapus progres') : (t.settingsResetBtn || 'Hard Reset')}
              </button>
            </div>
            {confirmReset && (
              <div className="text-sm text-rose-300">
                {t.settingsResetWarning || 'Semua progres dan Whale Token akan dihapus.'}
                <button className="ml-3 underline" onClick={() => setConfirmReset(false)}>{t.settingsResetCancel || 'Batal reset'}</button>
              </div>
            )}
          </div>
        </div>
      )}

      {offlineModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-[#00FF88]/50 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
            <Bot className="w-12 h-12 text-[#00FF88] mx-auto mb-2" />
            <h2 className="text-lg font-extrabold text-white">{t.offlineTitle || 'Bot & Kru Tetap Bekerja!'}</h2>
            <p className="text-xs text-slate-400 mt-1">
              {(t.offlineDesc ? t.offlineDesc.replace('{seconds}', offlineModal.seconds) : `Selama kamu pergi (${offlineModal.seconds} detik, maksimal 8 jam), sistem menghasilkan:`)}
            </p>
            <div className="text-2xl font-mono font-extrabold text-[#00FF88] my-4">
              +{formatMoney(offlineModal.earned)}
            </div>
            <button
              onClick={() => setOfflineModal(null)}
              className="w-full py-2.5 rounded-xl bg-[#00FF88] text-slate-950 font-extrabold text-xs cursor-pointer"
            >
              {t.offlineClaimBtn || 'Sudah masuk kas, lanjut'}
            </button>
          </div>
        </div>
      )}

      {isLockedByOtherTab && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-amber-500/50 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">{t.multiTabTitle || 'Sesi Aktif di Tab Lain'}</h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {t.multiTabDesc || 'Permainan sedang berjalan di tab browser lain. Untuk mencegah data kekayaan, upgrade, dan posisi trading tertimpa, terminal di tab ini dijeda sementara.'}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-slate-800 text-[11px] text-slate-300 font-mono text-left space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{t.multiTabShieldTitle || 'Perlindungan Sinkronisasi Multi-Tab'}</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {t.multiTabShieldDesc || 'Autosave dan mesin pasar dijeda di tab ini agar progres tidak saling menimpa. Klik tombol di bawah untuk memindahkan kontrol trading ke tab ini.'}
              </p>
            </div>
            <button
              onClick={handleTakeOverSession}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{t.multiTabTakeOverBtn || 'Gunakan di Tab Ini (Ambil Alih)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL ATUR TP & SL POSISI AKTIF */}
      {isAdjustModalOpen && activePosition && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-slate-700/80 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">{t.adjustModalTitle || 'Atur TP & SL Posisi'}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    <span className={activePosition.type === 'LONG' ? 'text-[#00FF88] font-bold' : 'text-[#FF3366] font-bold'}>
                      {activePosition.type} {Number(activePosition.leverage.toFixed(1))}x
                    </span>{' '}
                    • {activePosition.pairSymbol}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Ringkas */}
            {(() => {
              const modalPrec = getPairPrecision(activePosition.pairSymbol, activePosition.entryPrice);
              return (
                <div className="grid grid-cols-3 gap-2 bg-[#0B0E14] p-2.5 rounded-xl border border-slate-800/80 text-center font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 text-[10px] block">{t.adjustModalEntry || 'Entry'}</span>
                    <span className="text-sky-300 font-bold">{formatPairPrice(activePosition.entryPrice, modalPrec)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">{t.adjustModalMargin || 'Margin'}</span>
                    <span className="text-slate-200 font-semibold">{formatMoney(activePosition.margin)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">{t.adjustModalLiq || 'Likuidasi'}</span>
                    <span className="text-[#FF3366] font-bold">{formatPairPrice(activePosition.liqPrice, modalPrec)}</span>
                  </div>
                </div>
              );
            })()}

            {adjustError && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{adjustError}</span>
              </div>
            )}

            {/* Input Take Profit */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00FF88]" />
                  Take Profit (TP)
                </label>
                {adjustTpInput && (
                  <button
                    type="button"
                    onClick={() => { setAdjustTpInput(''); setAdjustError(''); }}
                    className="text-[10px] font-mono text-slate-400 hover:text-rose-400 cursor-pointer"
                  >
                    {t.adjustModalRemoveTp || 'Hapus TP'}
                  </button>
                )}
              </div>
              <div className="relative">
                {(() => {
                  const modalPrec = getPairPrecision(activePosition.pairSymbol, activePosition.entryPrice);
                  return (
                    <input
                      type="number"
                      step="any"
                      placeholder={activePosition.type === 'LONG' ? `> ${activePosition.entryPrice.toFixed(modalPrec)}` : `< ${activePosition.entryPrice.toFixed(modalPrec)}`}
                      value={adjustTpInput}
                      onChange={(e) => { setAdjustTpInput(e.target.value); setAdjustError(''); }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-[#00FF88] outline-none focus:border-[#00FF88]"
                    />
                  );
                })()}
              </div>

              {/* Preset ROI TP */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-[10px] text-slate-500 font-mono">{t.adjustModalPreset || 'Preset:'}</span>
                {[25, 50, 100, 200].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applyTpRoiPreset(pct)}
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800/80 hover:bg-emerald-500/20 hover:text-[#00FF88] text-slate-300 border border-slate-700/60 cursor-pointer transition-colors"
                  >
                    +{pct}%
                  </button>
                ))}
              </div>

              {/* Live Calculation TP */}
              {modalTpEst && (
                modalTpEst.isValid ? (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-300 flex flex-wrap items-center justify-between gap-1">
                    <span>{t.adjustModalEstProfit || 'Est. Keuntungan:'}</span>
                    <span className="font-bold text-[#00FF88]">
                      +{formatMoney(modalTpEst.pnlDollar)} (+{modalTpEst.roiPercent.toFixed(1)}% ROI)
                    </span>
                    <span className="w-full text-[10px] text-slate-400 border-t border-emerald-500/20 pt-1 mt-0.5">
                      {t.adjustModalTotalReturnCash || 'Total diterima ke kas:'} <strong className="text-white font-semibold">{formatMoney(modalTpEst.returnCash)}</strong>
                    </span>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] font-mono text-rose-400">
                    {language === 'en'
                      ? `TP for ${activePosition.type} must be ${activePosition.type === 'LONG' ? 'above' : 'below'} entry (${formatPairPrice(activePosition.entryPrice, getPairPrecision(activePosition.pairSymbol, activePosition.entryPrice))})`
                      : `TP untuk ${activePosition.type} harus ${activePosition.type === 'LONG' ? 'di atas' : 'di bawah'} entry (${formatPairPrice(activePosition.entryPrice, getPairPrecision(activePosition.pairSymbol, activePosition.entryPrice))})`}
                  </div>
                )
              )}
            </div>

            {/* Input Stop Loss */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF3366]" />
                  Stop Loss (SL)
                </label>
                {adjustSlInput && (
                  <button
                    type="button"
                    onClick={() => { setAdjustSlInput(''); setAdjustError(''); }}
                    className="text-[10px] font-mono text-slate-400 hover:text-rose-400 cursor-pointer"
                  >
                    {t.adjustModalRemoveSl || 'Hapus SL'}
                  </button>
                )}
              </div>
              <div className="relative">
                {(() => {
                  const modalPrec = getPairPrecision(activePosition.pairSymbol, activePosition.entryPrice);
                  return (
                    <input
                      type="number"
                      step="any"
                      placeholder={activePosition.type === 'LONG' ? `< ${activePosition.entryPrice.toFixed(modalPrec)}` : `> ${activePosition.entryPrice.toFixed(modalPrec)}`}
                      value={adjustSlInput}
                      onChange={(e) => { setAdjustSlInput(e.target.value); setAdjustError(''); }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-[#FF3366] outline-none focus:border-[#FF3366]"
                    />
                  );
                })()}
              </div>

              {/* Preset ROI SL */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-[10px] text-slate-500 font-mono">{t.adjustModalPreset || 'Preset:'}</span>
                {[10, 25, 50, 75].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applySlRoiPreset(pct)}
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800/80 hover:bg-rose-500/20 hover:text-[#FF3366] text-slate-300 border border-slate-700/60 cursor-pointer transition-colors"
                  >
                    -{pct}%
                  </button>
                ))}
              </div>

              {/* Live Calculation SL */}
              {modalSlEst && (
                modalSlEst.isValid ? (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] font-mono text-rose-300 flex flex-wrap items-center justify-between gap-1">
                    <span>{t.adjustModalEstLoss || 'Est. Kerugian:'}</span>
                    <span className="font-bold text-[#FF3366]">
                      {formatMoney(modalSlEst.pnlDollar)} ({modalSlEst.roiPercent.toFixed(1)}% ROI)
                    </span>
                    <span className="w-full text-[10px] text-slate-400 border-t border-rose-500/20 pt-1 mt-0.5">
                      {t.adjustModalRemainingCash || 'Sisa modal ke kas:'} <strong className="text-white font-semibold">{formatMoney(modalSlEst.returnCash)}</strong>
                    </span>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] font-mono text-rose-400">
                    {(() => {
                      const modalPrec = getPairPrecision(activePosition.pairSymbol, activePosition.entryPrice);
                      return modalSlEst.isLiqBreached
                        ? (language === 'en' ? `SL cannot breach liquidation price (${formatPairPrice(activePosition.liqPrice, modalPrec)})` : `SL tidak boleh melewati harga likuidasi (${formatPairPrice(activePosition.liqPrice, modalPrec)})`)
                        : (language === 'en' ? `SL for ${activePosition.type} must be ${activePosition.type === 'LONG' ? 'below' : 'above'} entry (${formatPairPrice(activePosition.entryPrice, modalPrec)})` : `SL untuk ${activePosition.type} harus ${activePosition.type === 'LONG' ? 'di bawah' : 'di atas'} entry (${formatPairPrice(activePosition.entryPrice, modalPrec)})`);
                    })()}
                  </div>
                )
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
              >
                {t.adjustModalCancelBtn || 'Batal'}
              </button>
              <button
                type="button"
                onClick={handleSaveAdjustTpSl}
                className="flex-1 py-2.5 rounded-xl bg-[#00FF88] hover:bg-emerald-400 text-slate-950 font-extrabold text-xs cursor-pointer shadow-lg shadow-[#00FF88]/20 transition-all active:scale-95"
              >
                {t.adjustModalSaveBtn || 'Simpan TP/SL'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GALERI 3D WORKSTATION & RANK */}
      {showWorkstationGallery && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#0e131f] border border-emerald-500/30 rounded-2xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl flex flex-col my-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                    {t.galleryTitle || 'Evolusi Workstation & Rank 3D'}
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#00FF88] border border-emerald-500/30">
                      {t.galleryLevelsBadge || '7 LEVELS'}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    {t.gallerySub || 'Visualisasi 3D markas trading dari Kamar Kos Sempit hingga The Architect of Singularity'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWorkstationGallery(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title={t.pnlModalCloseBtn || 'Tutup'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body - 7 Levels Grid */}
            <div className="overflow-y-auto py-4 space-y-4 pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {LOCATION_TIERS.map((tier) => {
                  const isCurrent = tier.level === currentLocation.level;
                  const isUnlocked = peakNetWorth >= tier.reqNetWorth && whaleTokens >= tier.reqWhaleTokens;

                  return (
                    <div
                      key={tier.level}
                      className={`relative rounded-xl border overflow-hidden flex flex-col transition-all duration-300 ${
                        isCurrent
                          ? 'border-[#00FF88] bg-slate-900/90 shadow-[0_0_25px_rgba(0,255,136,0.18)] ring-1 ring-[#00FF88]/50'
                          : isUnlocked
                          ? 'border-slate-700/80 bg-slate-900/60 hover:border-slate-500'
                          : 'border-slate-800/80 bg-slate-950/60 opacity-80 hover:opacity-100'
                      }`}
                    >
                      {/* 3D Image Banner */}
                      <div className="relative h-44 w-full overflow-hidden bg-black/40">
                        <img
                          src={tier.image}
                          alt={(t.locations?.[tier.level]?.name) || tier.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                        
                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-mono font-extrabold text-white">
                            LV.{tier.level}
                          </span>
                          <span className={`px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-bold ${tier.accent}`}>
                            {(t.locations?.[tier.level]?.badge) || tier.badge}
                          </span>
                        </div>

                        {/* Status Tag */}
                        <div className="absolute top-2 right-2">
                          {isCurrent ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#00FF88] text-slate-950 text-[10px] font-extrabold tracking-wide shadow-md flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                              {t.galleryStatusActive || 'AKTIF'}
                            </span>
                          ) : isUnlocked ? (
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/80 backdrop-blur-md text-white text-[10px] font-bold">
                              {t.galleryStatusUnlocked || '✓ TERBUKA'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-800/90 backdrop-blur-md text-slate-400 text-[10px] font-bold flex items-center gap-1 border border-slate-700">
                              <Lock className="w-2.5 h-2.5" />
                              {t.galleryStatusLocked || 'LOCKED'}
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-2 left-3 right-3">
                          <h3 className="text-sm font-extrabold text-white drop-shadow-md">
                            {(t.locations?.[tier.level]?.name) || tier.name}
                          </h3>
                          <p className="text-[11px] text-slate-300 drop-shadow line-clamp-1">
                            {(t.locations?.[tier.level]?.sub) || tier.sub}
                          </p>
                        </div>
                      </div>

                      {/* Content details */}
                      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3 text-xs">
                        <p className="text-[11px] text-slate-300 italic bg-black/30 p-2 rounded-lg border border-white/5">
                          {(t.locations?.[tier.level]?.quote) || tier.quote}
                        </p>

                        <div className="space-y-1.5 text-[11px] font-mono border-t border-white/10 pt-2.5">
                          <div className="flex items-center justify-between text-slate-400">
                            <span>{t.galleryPeakNetWorth || 'Peak Net Worth:'}</span>
                            <span className="font-bold text-white">
                              {tier.reqNetWorth === 0 ? '$0' : formatMoney(tier.reqNetWorth)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>{t.galleryWhaleTokens || 'Whale Token:'}</span>
                            <span className="font-bold text-amber-400">
                              {tier.reqWhaleTokens} {t.galleryTokensUnit || 'Token'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>{t.galleryUpkeepFee || 'Upkeep Fee:'}</span>
                            <span className="font-bold text-rose-400">
                              {(tier.upkeepRate * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
              <div className="text-[11px] text-slate-400">
                {t.galleryCurrentFooter || 'Workstation saat ini:'} <strong className="text-white">{(t.locations?.[currentLocation.level]?.name) || currentLocation.name}</strong> (Lv.{currentLocation.level} &bull; {(t.locations?.[currentLocation.level]?.badge) || currentLocation.badge})
              </div>
              <button
                onClick={() => setShowWorkstationGallery(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                {t.galleryCloseBtn || 'Tutup Galeri'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rewarded Ad Modal (Simulator & Live Ad Integration) */}
      <RewardedAdModal
        isOpen={showRewardedAdModal}
        onClose={() => setShowRewardedAdModal(false)}
        rewardTitle={adRewardType === 'cash_reward' ? 'Modal Kas Gratis $5' : 'Dana Talangan 20%'}
        rewardAmountFormatted={adRewardType === 'cash_reward' ? '$5.00 Cash' : formatMoney(Math.max(5, (liquidationAlert?.lostAmount || 0) * 0.2))}
        onRewardComplete={() => {
          if (adRewardType === 'cash_reward') {
            setCash((prev) => prev + 5);
            playProfitSound();
            triggerToast('🎉 +$5.00 Cash berhasil ditambahkan ke saldo modal trading Anda!', 'success');
            return;
          }
          if (!liquidationAlert) return;
          const recovery = Math.max(5, liquidationAlert.lostAmount * 0.2);
          setCash((c) => c + recovery);
          setLiquidationAlert(null);
          triggerToast(`Dana Talangan Cair 20%! +${formatMoney(recovery)} masuk ke kas.`, 'success');
        }}
      />

      {/* Game Credits & Developer Modal */}
      <CreditsModal
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
        language={language}
      />
    </div>
  );
}