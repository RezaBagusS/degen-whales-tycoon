'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Copy, 
  CheckCircle2, 
  X, 
  Share2, 
  TrendingUp, 
  TrendingDown, 
  Sparkles,
  QrCode
} from 'lucide-react';

// Rational tier badge based on Workstation Level (never crown for level 1 exit liquidity!)
export const getPortfolioRankBadge = (level = 1, t = {}) => {
  const configs = {
    1: {
      icon: '🦐',
      label: (t.locations?.[1]?.badge || 'Exit Liquidity').toUpperCase(),
      textColor: '#94A3B8',
      borderColor: '#475569',
      bgColor: 'rgba(71, 85, 105, 0.25)'
    },
    2: {
      icon: '⚡',
      label: (t.locations?.[2]?.badge || 'Scalper Receh').toUpperCase(),
      textColor: '#60A5FA',
      borderColor: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.2)'
    },
    3: {
      icon: '🦈',
      label: (t.locations?.[3]?.badge || 'Bandar Lokal').toUpperCase(),
      textColor: '#34D399',
      borderColor: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.2)'
    },
    4: {
      icon: '💎',
      label: (t.locations?.[4]?.badge || 'Market Mover').toUpperCase(),
      textColor: '#C084FC',
      borderColor: '#A855F7',
      bgColor: 'rgba(168, 85, 247, 0.2)'
    },
    5: {
      icon: '🐋',
      label: (t.locations?.[5]?.badge || 'Sovereign Whale').toUpperCase(),
      textColor: '#FBBF24',
      borderColor: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.2)'
    },
    6: {
      icon: '🌌',
      label: (t.locations?.[6]?.badge || 'Interplanetary Syndicate').toUpperCase(),
      textColor: '#22D3EE',
      borderColor: '#06B6D4',
      bgColor: 'rgba(6, 182, 212, 0.2)'
    },
    7: {
      icon: '👑',
      label: (t.locations?.[7]?.badge || 'God of Liquidity').toUpperCase(),
      textColor: '#FDA4AF',
      borderColor: '#F43F5E',
      bgColor: 'rgba(244, 63, 94, 0.25)'
    }
  };
  return configs[level] || configs[1];
};

// Rational trade execution rating badge based on ROI
export const getTradePerformanceBadge = (roi = 0, lang = 'id') => {
  const isId = lang !== 'en';
  if (roi >= 500) {
    return {
      icon: '👑',
      label: isId ? 'DEGEN DEWA' : 'GOD TIER GAINS',
      textColor: '#FBBF24',
      borderColor: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.25)'
    };
  }
  if (roi >= 200) {
    return {
      icon: '🚀',
      label: 'TO THE MOON',
      textColor: '#00FF88',
      borderColor: '#10B981',
      bgColor: 'rgba(0, 255, 136, 0.2)'
    };
  }
  if (roi >= 100) {
    return {
      icon: '🐋',
      label: isId ? 'CUAN PAUS' : 'WHALE GAINS',
      textColor: '#34D399',
      borderColor: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.2)'
    };
  }
  if (roi >= 30) {
    return {
      icon: '🎯',
      label: isId ? 'SNIPER ENTRY' : 'SNIPER PROFIT',
      textColor: '#38BDF8',
      borderColor: '#0284C7',
      bgColor: 'rgba(56, 189, 248, 0.2)'
    };
  }
  if (roi >= 0) {
    return {
      icon: '📈',
      label: isId ? 'HIJAU SEGAR' : 'PROFITABLE',
      textColor: '#2DD4BF',
      borderColor: '#14B8A6',
      bgColor: 'rgba(45, 212, 191, 0.2)'
    };
  }
  if (roi >= -25) {
    return {
      icon: '🩹',
      label: isId ? 'TERGORES DIKIT' : 'SCRATCH DIP',
      textColor: '#FBBF24',
      borderColor: '#D97706',
      bgColor: 'rgba(245, 158, 11, 0.2)'
    };
  }
  if (roi >= -60) {
    return {
      icon: '📉',
      label: isId ? 'TANGAN LEMBEK' : 'PAPER HANDS',
      textColor: '#FB7185',
      borderColor: '#E11D48',
      bgColor: 'rgba(244, 63, 94, 0.2)'
    };
  }
  return {
    icon: '💀',
    label: isId ? 'KENA REKT' : 'REKT DEGEN',
    textColor: '#FDA4AF',
    borderColor: '#BE123C',
    bgColor: 'rgba(190, 18, 60, 0.25)'
  };
};

export default function PnlShareModal({
  isOpen,
  onClose,
  netWorth = 10,
  cash = 10,
  currentDps = 0,
  activePosition = null,
  recentTrades = [],
  currentLocation = { level: 1, name: 'Kamar Kos Sempit', badge: 'DEGEN TIKUS KANTOR' },
  formatMoney = (val) => `$${val.toFixed(2)}`,
  formatNumber = (val) => val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  t = {},
  language = 'id'
}) {
  const [activeTab, setActiveTab] = useState(activePosition ? 'position' : 'portfolio');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  // If activePosition exists use it, otherwise fallback to last trade or mock
  const tradeData = activePosition || (recentTrades.length > 0 ? recentTrades[0] : null);

  // Calculate stats for render
  const portfolioRoi = ((netWorth - 10) / 10) * 100;
  const isPortfolioProfitable = portfolioRoi >= 0;

  const tradeRoi = tradeData ? (tradeData.roiPercent || tradeData.unrealizedRoi || 0) : 0;
  const tradePnlDollar = tradeData ? (tradeData.pnlDollar || tradeData.unrealizedPnl || 0) : 0;
  const isTradeProfitable = tradeRoi >= 0;

  const isProfitable = activeTab === 'portfolio' ? isPortfolioProfitable : isTradeProfitable;
  const displayRoi = activeTab === 'portfolio' ? portfolioRoi : tradeRoi;

  // Redraw Canvas whenever parameters change
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1200;
    const height = 675;
    canvas.width = width;
    canvas.height = height;

    // 1. Deep Cyberpunk Dark Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#040711');
    bgGrad.addColorStop(0.5, '#0B1120');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle Radial Glow behind ROI
    const glowX = 400;
    const glowY = 340;
    const glowGrad = ctx.createRadialGradient(glowX, glowY, 20, glowX, glowY, 400);
    if (isProfitable) {
      glowGrad.addColorStop(0, 'rgba(0, 255, 136, 0.18)');
      glowGrad.addColorStop(1, 'rgba(0, 255, 136, 0)');
    } else {
      glowGrad.addColorStop(0, 'rgba(255, 51, 102, 0.18)');
      glowGrad.addColorStop(1, 'rgba(255, 51, 102, 0)');
    }
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, width, height);

    // 3. Cyberpunk Matrix Grid Pattern Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Outer border with neon accent
    ctx.strokeStyle = isProfitable ? 'rgba(0, 255, 136, 0.4)' : 'rgba(255, 51, 102, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    // Corner decorative brackets
    const bracketSize = 30;
    ctx.strokeStyle = isProfitable ? '#00FF88' : '#FF3366';
    ctx.lineWidth = 4;
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(16, 16 + bracketSize);
    ctx.lineTo(16, 16);
    ctx.lineTo(16 + bracketSize, 16);
    ctx.stroke();
    // Top-Right
    ctx.beginPath();
    ctx.moveTo(width - 16 - bracketSize, 16);
    ctx.lineTo(width - 16, 16);
    ctx.lineTo(width - 16, 16 + bracketSize);
    ctx.stroke();
    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(16, height - 16 - bracketSize);
    ctx.lineTo(16, height - 16);
    ctx.lineTo(16 + bracketSize, height - 16);
    ctx.stroke();
    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(width - 16 - bracketSize, height - 16);
    ctx.lineTo(width - 16, height - 16);
    ctx.lineTo(width - 16, height - 16 - bracketSize);
    ctx.stroke();

    // 4. Header: Brand Logo & Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 32px "Inter", sans-serif';
    ctx.fillText('DEGEN', 60, 85);
    ctx.fillStyle = '#00FF88';
    ctx.fillText('& WHALE', 185, 85);

    // Sub-brand badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(355, 56, 180, 36, 8);
    } else {
      ctx.rect(355, 56, 180, 36);
    }
    ctx.fill();
    ctx.fillStyle = '#94A3B8';
    ctx.font = '700 14px "JetBrains Mono", monospace';
    ctx.fillText('OFFICIAL PnL FLEX', 375, 80);

    // Dynamic Rational Badge (Top Right)
    const badgeData = activeTab === 'portfolio'
      ? getPortfolioRankBadge(currentLocation?.level || 1, t)
      : getTradePerformanceBadge(tradeRoi, language);

    const badgeText = `${badgeData.icon}  ${badgeData.label}`;
    ctx.font = '800 15px "JetBrains Mono", monospace';
    const textWidth = ctx.measureText(badgeText).width;
    const badgeWidth = textWidth + 32;
    const badgeHeight = 40;
    const badgeX = width - 60 - badgeWidth;
    const badgeY = 54;

    ctx.fillStyle = badgeData.bgColor;
    ctx.strokeStyle = badgeData.borderColor;
    ctx.lineWidth = 1.5;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 10);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
      ctx.strokeRect(badgeX, badgeY, badgeWidth, badgeHeight);
    }
    ctx.fillStyle = badgeData.textColor;
    ctx.fillText(badgeText, badgeX + 16, badgeY + 25);

    // 5. Card Body: Portfolio vs Trade View
    if (activeTab === 'portfolio') {
      // Subtitle
      ctx.fillStyle = '#64748B';
      ctx.font = '700 16px "JetBrains Mono", monospace';
      ctx.fillText('ALL-TIME PORTFOLIO ROI', 60, 175);

      // Huge Glowing ROI
      const roiColor = isPortfolioProfitable ? '#00FF88' : '#FF3366';
      ctx.fillStyle = roiColor;
      ctx.font = '900 96px "JetBrains Mono", monospace';
      const roiSign = isPortfolioProfitable ? '+' : '';
      ctx.fillText(`${roiSign}${portfolioRoi.toFixed(2)}%`, 60, 275);

      // Helper to draw clean cyber stats boxes with dark navy background
      const drawStatBox = (x, y, w, h, label, val, valColor = '#FFFFFF') => {
        ctx.fillStyle = '#0B1120';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.5;
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(x, y, w, h, 14);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(x, y, w, h);
          ctx.strokeRect(x, y, w, h);
        }
        ctx.fillStyle = '#94A3B8';
        ctx.font = '700 13px "JetBrains Mono", monospace';
        ctx.fillText(label, x + 25, y + 36);
        ctx.fillStyle = valColor;
        ctx.font = '900 28px "JetBrains Mono", monospace';
        ctx.fillText(val, x + 25, y + 80);
      };

      // Stats Pill Grid
      const boxY = 340;
      const boxW = 340;
      const boxH = 110;

      // Box 1: Net Worth
      drawStatBox(60, boxY, boxW, boxH, 'TOTAL NET WORTH', formatMoney(netWorth), '#FFFFFF');

      // Box 2: Passive DPS
      drawStatBox(430, boxY, boxW, boxH, 'PASSIVE INCOME (DPS)', `+${formatMoney(currentDps)}/s`, '#00FF88');

      // Box 3: Liquid Cash
      drawStatBox(800, boxY, boxW, boxH, 'AVAILABLE CASH', formatMoney(cash), '#38BDF8');

    } else {
      // Trade Card View
      const pairText = tradeData?.pairSymbol || 'BTC/USD';
      const sideText = tradeData?.type || 'LONG';
      const levText = `${tradeData?.leverage || 50}x`;

      // Pair Badge & Side
      ctx.fillStyle = sideText === 'LONG' ? 'rgba(0, 255, 136, 0.18)' : 'rgba(255, 51, 102, 0.18)';
      ctx.strokeStyle = sideText === 'LONG' ? '#00FF88' : '#FF3366';
      ctx.lineWidth = 1.5;
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(60, 130, 220, 44, 10);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(60, 130, 220, 44);
        ctx.strokeRect(60, 130, 220, 44);
      }
      ctx.fillStyle = sideText === 'LONG' ? '#00FF88' : '#FF3366';
      ctx.font = '900 18px "JetBrains Mono", monospace';
      ctx.fillText(`${pairText} ${sideText} ${levText}`, 80, 158);

      // Huge Trade ROI
      const roiColor = isTradeProfitable ? '#00FF88' : '#FF3366';
      ctx.fillStyle = roiColor;
      ctx.font = '900 96px "JetBrains Mono", monospace';
      const roiSign = isTradeProfitable ? '+' : '';
      ctx.fillText(`${roiSign}${tradeRoi.toFixed(2)}%`, 60, 275);

      // Trade Stats Boxes Helper
      const drawTradeStatBox = (x, y, w, h, label, val, valColor) => {
        ctx.fillStyle = '#0B1120';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.5;
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(x, y, w, h, 14);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(x, y, w, h);
          ctx.strokeRect(x, y, w, h);
        }
        ctx.fillStyle = '#94A3B8';
        ctx.font = '700 13px "JetBrains Mono", monospace';
        ctx.fillText(label, x + 25, y + 36);
        ctx.fillStyle = valColor;
        ctx.font = '900 28px "JetBrains Mono", monospace';
        ctx.fillText(val, x + 25, y + 80);
      };

      const boxY = 340;
      const boxW = 340;
      const boxH = 110;

      // Box 1: Dollar Profit
      drawTradeStatBox(60, boxY, boxW, boxH, 'ESTIMATED PnL', `${isTradeProfitable ? '+' : ''}${formatMoney(tradePnlDollar)}`, roiColor);

      // Box 2: Entry Price
      const entryPriceVal = tradeData?.entryPrice != null 
        ? (tradeData.entryPrice < 1 
            ? `$${Number(tradeData.entryPrice).toFixed(4)}`
            : `$${Number(tradeData.entryPrice).toFixed(2)}`)
        : '$0.00';
      drawTradeStatBox(430, boxY, boxW, boxH, 'ENTRY PRICE', entryPriceVal, '#38BDF8');

      // Box 3: Margin / Size
      drawTradeStatBox(800, boxY, boxW, boxH, 'MARGIN COLLATERAL', formatMoney(tradeData?.margin || 10), '#F59E0B');
    }

    // 6. Footer: Watermark, Timestamp & Verification Seal
    const footerY = 580;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, footerY);
    ctx.lineTo(width - 60, footerY);
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.font = '600 14px "JetBrains Mono", monospace';
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    ctx.fillText(`⚡ PROVABLY FAIR SIMULATOR  |  ${dateStr}`, 60, footerY + 42);

    // Official Web URL Watermark for Viral Traffic
    ctx.fillStyle = '#00FF88';
    ctx.font = '800 15px "JetBrains Mono", monospace';
    const watermarkText = '🌐 degen-whales-tycoon.vercel.app';
    const watermarkWidth = ctx.measureText(watermarkText).width;
    ctx.fillText(watermarkText, width - 60 - watermarkWidth, footerY + 42);

  }, [isOpen, activeTab, netWorth, cash, currentDps, tradeData, currentLocation, isProfitable, portfolioRoi, tradeRoi, tradePnlDollar, language, t]);

  if (!isOpen) return null;

  // Handle Download Image (.png)
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `degen_whale_pnl_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Handle Copy to Clipboard (Image or Text fallback)
  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const badgeData = activeTab === 'portfolio'
      ? getPortfolioRankBadge(currentLocation?.level || 1, t)
      : getTradePerformanceBadge(tradeRoi, language);

    const shareText = activeTab === 'portfolio'
      ? `🐋 [DEGEN & WHALE] All-Time Portfolio ROI: ${portfolioRoi >= 0 ? '+' : ''}${portfolioRoi.toFixed(2)}% | Net Worth: ${formatMoney(netWorth)} | Rank: ${badgeData.icon} ${badgeData.label}!\n🎮 Mainkan gratis di: https://degen-whales-tycoon.vercel.app`
      : `⚡ [DEGEN & WHALE] Trade PnL: ${tradeRoi >= 0 ? '+' : ''}${tradeRoi.toFixed(2)}% (${formatMoney(tradePnlDollar)}) on ${tradeData?.pairSymbol || 'BTC/USD'} | Rank: ${badgeData.icon} ${badgeData.label}!\n🎮 Mainkan gratis di: https://degen-whales-tycoon.vercel.app`;

    try {
      if (navigator.clipboard && typeof window !== 'undefined' && window.ClipboardItem) {
        canvas.toBlob(async (blob) => {
          try {
            if (blob) {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
              ]);
            }
          } catch {
            try {
              await navigator.clipboard.writeText(shareText);
            } catch {}
          }
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0B0E14] border border-slate-700/80 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="p-4 bg-[#111622] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[#00FF88] shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>{t.pnlCardTitle || 'Generator Kartu PnL Viral'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-[#00FF88] border border-emerald-500/30 font-mono">
                  HD 1200x675
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {t.pnlCardSub || 'Cetak kartu PnL bergaya Bybit / Binance Cyberpunk untuk pamer di media sosial.'}
              </p>
            </div>
          </div>

          <button
            data-testid="pnl-modal-close-x"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Portfolio vs Trade */}
        <div className="px-4 pt-3 pb-2 bg-[#0E1422] border-b border-slate-800 flex items-center gap-2">
          <button
            type="button"
            data-testid="pnl-tab-portfolio"
            onClick={() => setActiveTab('portfolio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'portfolio'
                ? 'bg-[#00FF88] text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.pnlCardTabPortfolio || 'All-Time Portfolio'}</span>
          </button>

          <button
            type="button"
            data-testid="pnl-tab-position"
            onClick={() => setActiveTab('position')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'position'
                ? 'bg-[#00FF88] text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t.pnlCardTabPosition || 'Posisi Terbuka / Trade'}</span>
          </button>
        </div>

        {/* Live Canvas Preview */}
        <div className="p-4 bg-slate-950 flex flex-col items-center justify-center">
          <div className="w-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative bg-[#040711]">
            <canvas
              ref={canvasRef}
              data-testid="pnl-canvas"
              className="w-full h-auto aspect-[1200/675] block"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-[#111622] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              data-testid="pnl-btn-download"
              onClick={handleDownload}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#00FF88] hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Download className="w-4 h-4" />
              <span>{t.pnlCardDownloadBtn || 'Download Gambar (PNG)'}</span>
            </button>

            <button
              type="button"
              data-testid="pnl-btn-copy"
              onClick={handleCopy}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border border-slate-700"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#00FF88]" />
                  <span className="text-[#00FF88]">{t.pnlCardCopiedImg || '✓ Tersalin!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{t.pnlCardCopyImgBtn || 'Copy Gambar'}</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            data-testid="pnl-modal-close-btn"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
          >
            {t.pnlCardCloseBtn || 'Tutup'}
          </button>
        </div>

      </div>
    </div>
  );
}
