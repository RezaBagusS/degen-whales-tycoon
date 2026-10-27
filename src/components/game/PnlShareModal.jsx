'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Copy, 
  CheckCircle2, 
  X, 
  Share2, 
  TrendingUp, 
  Sparkles,
  Award,
  ExternalLink,
  Flame,
  AlertTriangle
} from 'lucide-react';

// Rational tier badge based on Workstation Level
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
  customTrade = null,
  currentLocation = { level: 1, name: 'Kamar Kos Sempit', badge: 'DEGEN TIKUS KANTOR' },
  formatMoney = (val) => `$${val.toFixed(2)}`,
  formatNumber = (val) => val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  t = {},
  language = 'id',
  currentUser = null,
  shillerBadgeUnlocked = false,
  onClaimShillerReward = () => {}
}) {
  const [activeTab, setActiveTab] = useState(customTrade || activePosition ? 'position' : 'portfolio');
  const [cardFormat, setCardFormat] = useState('square'); // 'square' (1:1) or 'landscape' (16:9)
  const [copied, setCopied] = useState(false);
  const [canShareNative, setCanShareNative] = useState(false);
  const canvasRef = useRef(null);

  // Determine active trade target
  const tradeData = customTrade || activePosition || (recentTrades.length > 0 ? recentTrades[0] : null);

  // Check if native Web Share API is available
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      setCanShareNative(true);
    }
  }, []);

  // Sync activeTab when customTrade changes
  useEffect(() => {
    if (customTrade) {
      setActiveTab('position');
    }
  }, [customTrade]);

  // Calculate stats
  const portfolioRoi = ((netWorth - 10) / 10) * 100;
  const isPortfolioProfitable = portfolioRoi >= 0;

  const tradeRoi = tradeData ? (tradeData.roiPercent ?? tradeData.roi ?? tradeData.unrealizedRoi ?? 0) : 0;
  const tradePnlDollar = tradeData ? (tradeData.pnlDollar ?? tradeData.pnl ?? tradeData.unrealizedPnl ?? 0) : 0;
  const isTradeProfitable = tradeRoi >= 0;

  const isProfitable = activeTab === 'portfolio' ? isPortfolioProfitable : isTradeProfitable;
  const displayRoi = activeTab === 'portfolio' ? portfolioRoi : tradeRoi;

  // Redraw Canvas
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isSquare = cardFormat === 'square';
    const width = isSquare ? 1080 : 1200;
    const height = isSquare ? 1080 : 675;

    canvas.width = width;
    canvas.height = height;

    // 1. Cyberpunk Dark Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    if (isProfitable) {
      bgGrad.addColorStop(0, '#040711');
      bgGrad.addColorStop(0.5, '#0B1520');
      bgGrad.addColorStop(1, '#020914');
    } else {
      bgGrad.addColorStop(0, '#110408');
      bgGrad.addColorStop(0.5, '#1A080E');
      bgGrad.addColorStop(1, '#0D0205');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Ambient Radial Glow behind ROI
    const glowX = width / 2;
    const glowY = isSquare ? 380 : 340;
    const glowGrad = ctx.createRadialGradient(glowX, glowY, 30, glowX, glowY, isSquare ? 480 : 400);
    if (isProfitable) {
      glowGrad.addColorStop(0, 'rgba(0, 255, 136, 0.22)');
      glowGrad.addColorStop(0.6, 'rgba(0, 255, 136, 0.05)');
      glowGrad.addColorStop(1, 'rgba(0, 255, 136, 0)');
    } else {
      glowGrad.addColorStop(0, 'rgba(255, 51, 102, 0.25)');
      glowGrad.addColorStop(0.6, 'rgba(255, 51, 102, 0.05)');
      glowGrad.addColorStop(1, 'rgba(255, 51, 102, 0)');
    }
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, width, height);

    // 3. Cyberpunk Matrix Grid Pattern Lines
    ctx.strokeStyle = isProfitable ? 'rgba(0, 255, 136, 0.04)' : 'rgba(255, 51, 102, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Outer neon border
    ctx.strokeStyle = isProfitable ? 'rgba(0, 255, 136, 0.45)' : 'rgba(255, 51, 102, 0.45)';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    // Decorative corner brackets
    const bracketSize = 36;
    ctx.strokeStyle = isProfitable ? '#00FF88' : '#FF3366';
    ctx.lineWidth = 5;
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

    // 4. Header: Logo & Sub-brand badge
    const headerY = 90;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 34px "Inter", sans-serif';
    ctx.fillText('DEGEN', 60, headerY);
    ctx.fillStyle = isProfitable ? '#00FF88' : '#FF3366';
    ctx.fillText('& WHALE', 190, headerY);

    // Badge pill top-right
    const badgeData = activeTab === 'portfolio'
      ? getPortfolioRankBadge(currentLocation?.level || 1, t)
      : getTradePerformanceBadge(tradeRoi, language);

    const badgeText = `${badgeData.icon}  ${badgeData.label}`;
    ctx.font = '800 16px "JetBrains Mono", monospace';
    const textWidth = ctx.measureText(badgeText).width;
    const badgeWidth = textWidth + 36;
    const badgeHeight = 44;
    const badgeX = width - 60 - badgeWidth;
    const badgeY = 56;

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
    ctx.fillText(badgeText, badgeX + 18, badgeY + 28);

    // Helper for Stat Box
    const drawStatBox = (x, y, w, h, label, val, valColor = '#FFFFFF') => {
      ctx.fillStyle = '#080E1A';
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
      ctx.font = '700 14px "JetBrains Mono", monospace';
      ctx.fillText(label, x + 24, y + 36);
      ctx.fillStyle = valColor;
      ctx.font = '900 28px "JetBrains Mono", monospace';
      ctx.fillText(val, x + 24, y + 80);
    };

    // 5. Content Rendering
    if (isSquare) {
      // ===== FORMAT 1:1 SQUARE (1080 x 1080) =====
      if (activeTab === 'portfolio') {
        ctx.fillStyle = '#64748B';
        ctx.font = '700 18px "JetBrains Mono", monospace';
        ctx.fillText('ALL-TIME PORTFOLIO NET ROI', 60, 200);

        // Huge ROI
        const roiColor = isPortfolioProfitable ? '#00FF88' : '#FF3366';
        ctx.fillStyle = roiColor;
        ctx.font = '900 110px "JetBrains Mono", monospace';
        const roiSign = isPortfolioProfitable ? '+' : '';
        ctx.fillText(`${roiSign}${portfolioRoi.toFixed(2)}%`, 60, 315);

        // Subtitle status
        ctx.fillStyle = isPortfolioProfitable ? '#34D399' : '#FB7185';
        ctx.font = '800 22px "JetBrains Mono", monospace';
        ctx.fillText(isPortfolioProfitable ? '🔥 WHALE PORTFOLIO ACCUMULATION' : '💀 DOWNTREND DRAWDOWN', 60, 360);

        // Grid of 4 Stats
        const boxW = 460;
        const boxH = 120;
        drawStatBox(60, 420, boxW, boxH, 'TOTAL NET WORTH', formatMoney(netWorth), '#FFFFFF');
        drawStatBox(560, 420, boxW, boxH, 'AVAILABLE CASH', formatMoney(cash), '#38BDF8');
        drawStatBox(60, 570, boxW, boxH, 'PASSIVE INCOME (DPS)', `+${formatMoney(currentDps)}/s`, '#00FF88');
        drawStatBox(560, 570, boxW, boxH, 'CURRENT WORKSTATION', currentLocation.name || 'Level 1', '#F59E0B');

        // Trader Card
        ctx.fillStyle = '#0B1220';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(60, 720, 960, 90, 14);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(60, 720, 960, 90);
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '800 20px "JetBrains Mono", monospace';
        ctx.fillText(`TRADER: ${currentUser?.username ? `@${currentUser.username}` : 'ANON DEGEN'}`, 90, 765);
        ctx.fillStyle = '#F59E0B';
        ctx.font = '800 16px "JetBrains Mono", monospace';
        ctx.fillText(shillerBadgeUnlocked ? '📢 CERTIFIED SHILLER' : '👑 DISCIPLINED DEGEN', 680, 765);

      } else {
        // Trade Mode (Square)
        const pairText = tradeData?.pairSymbol || tradeData?.pair || 'BTC/USDT';
        const sideText = tradeData?.type || 'LONG';
        const levText = `${Number(tradeData?.leverage || 50).toFixed(0)}x`;

        // Pair & Leverage Pill
        ctx.fillStyle = sideText === 'LONG' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 51, 102, 0.2)';
        ctx.strokeStyle = sideText === 'LONG' ? '#00FF88' : '#FF3366';
        ctx.lineWidth = 2;
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(60, 150, 320, 52, 12);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(60, 150, 320, 52);
        }
        ctx.fillStyle = sideText === 'LONG' ? '#00FF88' : '#FF3366';
        ctx.font = '900 22px "JetBrains Mono", monospace';
        ctx.fillText(`${pairText} • ${sideText} ${levText}`, 85, 184);

        // Huge ROI
        const roiColor = isTradeProfitable ? '#00FF88' : '#FF3366';
        ctx.fillStyle = roiColor;
        ctx.font = '900 110px "JetBrains Mono", monospace';
        const roiSign = isTradeProfitable ? '+' : '';
        ctx.fillText(`${roiSign}${tradeRoi.toFixed(2)}%`, 60, 310);

        // Subtitle status
        ctx.fillStyle = isTradeProfitable ? '#34D399' : '#FB7185';
        ctx.font = '800 22px "JetBrains Mono", monospace';
        ctx.fillText(isTradeProfitable ? '🚀 TOTAL PROFIT REALIZED' : '💀 LIQUIDATED / REKT', 60, 355);

        // Grid of 4 Stats
        const boxW = 460;
        const boxH = 120;
        drawStatBox(60, 420, boxW, boxH, 'ESTIMATED / NET PnL', `${isTradeProfitable ? '+' : ''}${formatMoney(tradePnlDollar)}`, roiColor);
        drawStatBox(560, 420, boxW, boxH, 'MARGIN COLLATERAL', formatMoney(tradeData?.margin || 10), '#F59E0B');

        const entryVal = tradeData?.entryPrice ? `$${Number(tradeData.entryPrice).toLocaleString('en-US')}` : '$0.00';
        const exitVal = tradeData?.exitPrice ? `$${Number(tradeData.exitPrice).toLocaleString('en-US')}` : (tradeData?.posPrice ? `$${Number(tradeData.posPrice).toLocaleString('en-US')}` : '-');
        drawStatBox(60, 570, boxW, boxH, 'ENTRY PRICE', entryVal, '#38BDF8');
        drawStatBox(560, 570, boxW, boxH, 'EXIT / MARK PRICE', exitVal, '#A855F7');

        // Trader Card
        ctx.fillStyle = '#0B1220';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(60, 720, 960, 90, 14);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(60, 720, 960, 90);
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '800 20px "JetBrains Mono", monospace';
        ctx.fillText(`TRADER: ${currentUser?.username ? `@${currentUser.username}` : 'ANON DEGEN'}`, 90, 765);
        ctx.fillStyle = '#F59E0B';
        ctx.font = '800 16px "JetBrains Mono", monospace';
        ctx.fillText(shillerBadgeUnlocked ? '📢 CERTIFIED SHILLER' : '👑 DISCIPLINED DEGEN', 680, 765);
      }

      // Footer (Square)
      const footerY = 960;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(60, footerY);
      ctx.lineTo(width - 60, footerY);
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = '600 16px "JetBrains Mono", monospace';
      ctx.fillText('⚡ PROVABLY FAIR SIMULATOR  |  CAN YOU OUTTRADE THE WHALES?', 60, footerY + 50);

      ctx.fillStyle = '#00FF88';
      ctx.font = '800 18px "JetBrains Mono", monospace';
      const wmText = '🌐 degen-whales-tycoon.vercel.app';
      const wmW = ctx.measureText(wmText).width;
      ctx.fillText(wmText, width - 60 - wmW, footerY + 50);

    } else {
      // ===== FORMAT 16:9 LANDSCAPE (1200 x 675) =====
      if (activeTab === 'portfolio') {
        ctx.fillStyle = '#64748B';
        ctx.font = '700 16px "JetBrains Mono", monospace';
        ctx.fillText('ALL-TIME PORTFOLIO ROI', 60, 175);

        const roiColor = isPortfolioProfitable ? '#00FF88' : '#FF3366';
        ctx.fillStyle = roiColor;
        ctx.font = '900 96px "JetBrains Mono", monospace';
        const roiSign = isPortfolioProfitable ? '+' : '';
        ctx.fillText(`${roiSign}${portfolioRoi.toFixed(2)}%`, 60, 275);

        const boxY = 340;
        const boxW = 340;
        const boxH = 110;
        drawStatBox(60, boxY, boxW, boxH, 'TOTAL NET WORTH', formatMoney(netWorth), '#FFFFFF');
        drawStatBox(430, boxY, boxW, boxH, 'PASSIVE INCOME (DPS)', `+${formatMoney(currentDps)}/s`, '#00FF88');
        drawStatBox(800, boxY, boxW, boxH, 'AVAILABLE CASH', formatMoney(cash), '#38BDF8');
      } else {
        const pairText = tradeData?.pairSymbol || tradeData?.pair || 'BTC/USDT';
        const sideText = tradeData?.type || 'LONG';
        const levText = `${Number(tradeData?.leverage || 50).toFixed(0)}x`;

        ctx.fillStyle = sideText === 'LONG' ? 'rgba(0, 255, 136, 0.18)' : 'rgba(255, 51, 102, 0.18)';
        ctx.strokeStyle = sideText === 'LONG' ? '#00FF88' : '#FF3366';
        ctx.lineWidth = 1.5;
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(60, 130, 240, 44, 10);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(60, 130, 240, 44);
        }
        ctx.fillStyle = sideText === 'LONG' ? '#00FF88' : '#FF3366';
        ctx.font = '900 18px "JetBrains Mono", monospace';
        ctx.fillText(`${pairText} ${sideText} ${levText}`, 80, 158);

        const roiColor = isTradeProfitable ? '#00FF88' : '#FF3366';
        ctx.fillStyle = roiColor;
        ctx.font = '900 96px "JetBrains Mono", monospace';
        const roiSign = isTradeProfitable ? '+' : '';
        ctx.fillText(`${roiSign}${tradeRoi.toFixed(2)}%`, 60, 275);

        const boxY = 340;
        const boxW = 340;
        const boxH = 110;
        drawStatBox(60, boxY, boxW, boxH, 'ESTIMATED PnL', `${isTradeProfitable ? '+' : ''}${formatMoney(tradePnlDollar)}`, roiColor);

        const entryVal = tradeData?.entryPrice ? `$${Number(tradeData.entryPrice).toLocaleString('en-US')}` : '$0.00';
        drawStatBox(430, boxY, boxW, boxH, 'ENTRY PRICE', entryVal, '#38BDF8');
        drawStatBox(800, boxY, boxW, boxH, 'MARGIN COLLATERAL', formatMoney(tradeData?.margin || 10), '#F59E0B');
      }

      // Footer (Landscape)
      const footerY = 580;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, footerY);
      ctx.lineTo(width - 60, footerY);
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = '600 14px "JetBrains Mono", monospace';
      ctx.fillText('⚡ PROVABLY FAIR SIMULATOR  |  CAN YOU OUTTRADE THE WHALES?', 60, footerY + 42);

      ctx.fillStyle = '#00FF88';
      ctx.font = '800 15px "JetBrains Mono", monospace';
      const watermarkText = '🌐 degen-whales-tycoon.vercel.app';
      const watermarkWidth = ctx.measureText(watermarkText).width;
      ctx.fillText(watermarkText, width - 60 - watermarkWidth, footerY + 42);
    }

  }, [isOpen, activeTab, cardFormat, netWorth, cash, currentDps, tradeData, currentLocation, isProfitable, portfolioRoi, tradeRoi, tradePnlDollar, language, t, currentUser, shillerBadgeUnlocked]);

  if (!isOpen) return null;

  // Generate share text for social media
  const getShareText = () => {
    const pair = tradeData?.pairSymbol || tradeData?.pair || 'BTC/USDT';
    const lev = Number(tradeData?.leverage || 50).toFixed(0);
    const roiStr = `${tradeRoi >= 0 ? '+' : ''}${tradeRoi.toFixed(1)}%`;
    const pnlStr = formatMoney(tradePnlDollar);

    if (activeTab === 'portfolio') {
      return `🐋 [DEGEN & WHALE TYCOON] All-time Net Worth: ${formatMoney(netWorth)} (${portfolioRoi >= 0 ? '+' : ''}${portfolioRoi.toFixed(1)}% ROI)! 📈\n\nSiapa yang berani adu skill trading? Main gratis di sini:\nhttps://degen-whales-tycoon.vercel.app #DegenWhales #CryptoTrading`;
    }

    if (isTradeProfitable) {
      return `🚀 CUAN ${roiStr} (${pnlStr}) di ${pair} ${lev}x Leverage! 🐋🔥\n\nBuktikan kamu bisa outtrade the whales di game crypto simulator ini:\nhttps://degen-whales-tycoon.vercel.app #DegenWhales #CryptoTrading #Bitcoin`;
    }

    return `💀 Kena REKT ${roiStr} (${pnlStr}) di ${pair} ${lev}x Leverage! 😭 Tapi kita tetap grinding!\n\nCoba trading tanpa risiko modal asli di:\nhttps://degen-whales-tycoon.vercel.app #DegenWhales #Rekt #CryptoTrading`;
  };

  // Helper trigger reward on any share action
  const triggerShareAchievement = () => {
    if (!shillerBadgeUnlocked) {
      onClaimShillerReward();
    }
  };

  // Handle Share to Threads
  const handleShareThreads = () => {
    triggerShareAchievement();
    const text = getShareText();
    const url = `https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Handle Share to X (Twitter)
  const handleShareX = () => {
    triggerShareAchievement();
    const text = getShareText();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Handle Native Mobile Web Share API
  const handleNativeShare = async () => {
    triggerShareAchievement();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const shareText = getShareText();

    try {
      canvas.toBlob(async (blob) => {
        if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'pnl.png', { type: 'image/png' })] })) {
          const file = new File([blob], 'degen-whale-pnl.png', { type: 'image/png' });
          await navigator.share({
            title: 'Degen Whales Tycoon PnL',
            text: shareText,
            files: [file]
          });
        } else {
          await navigator.share({
            title: 'Degen Whales Tycoon PnL',
            text: shareText,
            url: 'https://degen-whales-tycoon.vercel.app'
          });
        }
      });
    } catch {
      handleDownload();
    }
  };

  // Handle Download Image (.png)
  const handleDownload = () => {
    triggerShareAchievement();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    const pair = (tradeData?.pairSymbol || 'whale').replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `pnl_${pair}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Handle Copy to Clipboard
  const handleCopy = async () => {
    triggerShareAchievement();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const shareText = getShareText();

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
            await navigator.clipboard.writeText(shareText);
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0B0E14] border border-slate-700/80 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col my-auto max-h-[94vh]">
        
        {/* Modal Top Bar */}
        <div className="p-3.5 sm:p-4 bg-[#111622] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[#00FF88] shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <span data-testid="pnl-modal-title">{t.pnlCardTitle || '📸 Generator Kartu PnL Viral'}</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Pamer PnL cuan atau likuidasi ke Threads &amp; X untuk viralitas organik!
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

        {/* Achievement Bonus Banner */}
        <div className={`px-4 py-2 border-b text-xs flex items-center justify-between gap-2 shrink-0 ${
          shillerBadgeUnlocked
            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/40 border-amber-500/40 text-amber-300 animate-pulse'
        }`}>
          <div className="flex items-center gap-2">
            <Award className={`w-4 h-4 shrink-0 ${shillerBadgeUnlocked ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>
              {shillerBadgeUnlocked ? (
                <span>Gelar <strong className="text-white">📢 Certified Shiller</strong> aktif! Bonus +$100.00 telah masuk kas.</span>
              ) : (
                <span>🎁 <strong>HADIAH PERDANA:</strong> Share kartu PnL pertamamu untuk unlock Gelar <strong className="text-white">📢 Certified Shiller</strong> &amp; klaim <strong className="text-emerald-400 font-mono">+$100.00 Cash</strong>!</span>
              )}
            </span>
          </div>
          {!shillerBadgeUnlocked && (
            <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-amber-400 text-slate-950 shrink-0">
              +$100.00
            </span>
          )}
        </div>

        {/* Sub Header: Tabs (Portfolio vs Trade) & Format (1:1 vs 16:9) */}
        <div className="px-4 py-2 bg-[#0E1422] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-testid="pnl-tab-position"
              onClick={() => setActiveTab('position')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'position'
                  ? 'bg-[#00FF88] text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trade Terpilih</span>
            </button>

            <button
              type="button"
              data-testid="pnl-tab-portfolio"
              onClick={() => setActiveTab('portfolio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'portfolio'
                  ? 'bg-[#00FF88] text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>All-Time Portfolio</span>
            </button>
          </div>

          {/* Aspect Ratio Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px] font-mono">
            <button
              type="button"
              data-testid="pnl-format-square"
              onClick={() => setCardFormat('square')}
              className={`px-2 py-1 rounded transition-all cursor-pointer font-bold ${
                cardFormat === 'square'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1:1 Square (Threads/X)
            </button>
            <button
              type="button"
              data-testid="pnl-format-landscape"
              onClick={() => setCardFormat('landscape')}
              className={`px-2 py-1 rounded transition-all cursor-pointer font-bold ${
                cardFormat === 'landscape'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              16:9 Banner
            </button>
          </div>
        </div>

        {/* Live Canvas Preview */}
        <div className="p-3 sm:p-4 bg-slate-950 flex flex-col items-center justify-center flex-1 overflow-y-auto min-h-0">
          <div className={`rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative bg-[#040711] ${
            cardFormat === 'square' ? 'max-w-[420px] w-full' : 'max-w-[560px] w-full'
          }`}>
            <canvas
              ref={canvasRef}
              data-testid="pnl-canvas"
              className={`w-full h-auto block ${cardFormat === 'square' ? 'aspect-square' : 'aspect-[1200/675]'}`}
            />
          </div>
        </div>

        {/* Action Buttons: Viral Social Shares */}
        <div className="p-3 sm:p-4 bg-[#111622] border-t border-slate-800 flex flex-col gap-2.5 shrink-0">
          {/* Main Social Channels: Threads & X */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              data-testid="pnl-btn-threads"
              onClick={handleShareThreads}
              className="px-3 py-2.5 rounded-xl bg-black hover:bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-700 shadow-md"
            >
              {/* Threads SVG Icon */}
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 192 192">
                <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.381 72.0304C80.8242 63.7663 88.8984 60.7816 97.2407 60.7816C97.3195 60.7816 97.3989 60.7816 97.4777 60.7823C110.879 60.8677 120.732 69.4539 122.868 83.2505C114.956 82.2039 106.634 82.1648 98.0538 83.1345C66.1965 86.7324 47.9304 104.385 48.7997 127.391C49.6385 149.592 68.6189 163.708 90.963 163.708C108.977 163.708 122.957 154.218 128.795 137.64C134.195 147.013 143.193 151.815 156.402 151.815C170.835 151.815 180.207 141.446 180.207 125.433C180.207 101.441 161.854 89.2891 141.537 88.9883ZM90.2796 147.747C77.4069 147.747 64.9197 139.756 64.3807 125.467C63.8569 111.597 75.3341 99.8804 96.2575 97.5173C104.148 96.6262 111.967 96.9691 119.387 98.4907C116.533 133.226 103.882 147.747 90.2796 147.747Z" />
              </svg>
              <span>Threads</span>
            </button>

            <button
              type="button"
              data-testid="pnl-btn-x"
              onClick={handleShareX}
              className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-700 shadow-md"
            >
              {/* X / Twitter SVG Icon */}
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Share to X</span>
            </button>

            <button
              type="button"
              data-testid="pnl-btn-download"
              onClick={handleDownload}
              className="px-3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Download PNG</span>
            </button>

            <button
              type="button"
              data-testid="pnl-btn-copy"
              onClick={handleCopy}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-700"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#00FF88]" />
                  <span className="text-[#00FF88]">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 shrink-0" />
                  <span>Copy Image</span>
                </>
              )}
            </button>
          </div>

          {/* Web Share API on mobile devices */}
          {canShareNative && (
            <button
              type="button"
              data-testid="pnl-btn-webshare"
              onClick={handleNativeShare}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Share2 className="w-4 h-4" />
              <span>Kirim Langsung (WhatsApp, IG Story, Telegram)</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
