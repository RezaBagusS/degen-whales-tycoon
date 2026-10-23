'use client';

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Zap, 
  Percent, 
  Compass, 
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const BLACK_MARKET_ITEMS = [
  {
    id: 'pump_whistle',
    iconName: 'TrendingUp',
    nameKey: 'itemPumpWhistle',
    descKey: 'itemPumpWhistleDesc',
    defaultName: 'Whale Pump Whistle',
    defaultDesc: 'Tiup peluit paus untuk suntikan beli instan (+3% s/d +5%). [Batas: 1x/hari • Khusus Degen Perps • Dilindungi Slippage & Rebound].',
    cost: 250,
    badge: 'PUMP',
    color: '#10B981',
    marketScope: 'degen_only',
    dailyLimit: 1,
  },
  {
    id: 'dump_horn',
    iconName: 'TrendingDown',
    nameKey: 'itemDumpHorn',
    descKey: 'itemDumpHornDesc',
    defaultName: 'Whale Dump Horn',
    defaultDesc: 'Bunyikan terompet dump untuk panic sell instan (-3% s/d -5%). [Batas: 1x/hari • Khusus Degen Perps • Dilindungi Slippage & Rebound].',
    cost: 250,
    badge: 'DUMP',
    color: '#F43F5E',
    marketScope: 'degen_only',
    dailyLimit: 1,
  },
  {
    id: 'liq_shield',
    iconName: 'ShieldAlert',
    nameKey: 'itemLiqShield',
    descKey: 'itemLiqShieldDesc',
    defaultName: 'Liquidation Shield',
    defaultDesc: 'Tameng asuransi 1x pakai. Menyelamatkan 85% modal margin jika harga menyentuh garis likuidasi.',
    cost: 500,
    badge: 'DEFENSE',
    color: '#38BDF8',
  },
  {
    id: 'leverage_250x',
    iconName: 'Zap',
    nameKey: 'itemLev250x',
    descKey: 'itemLev250xDesc',
    defaultName: 'God Leverage 250x Ticket',
    defaultDesc: 'Membuka tombol leverage ekstrim 250x untuk eksekusi 1 posisi berikutnya. Risiko degen maksimal!',
    cost: 750,
    badge: 'DEGEN',
    color: '#F59E0B',
  },
  {
    id: 'zero_fee',
    iconName: 'Percent',
    nameKey: 'itemZeroFee',
    descKey: 'itemZeroFeeDesc',
    defaultName: 'Zero-Fee VIP Pass',
    defaultDesc: 'Bebas 100% potongan biaya bursa selama 10 menit ke depan.',
    cost: 400,
    badge: 'VIP',
    color: '#A855F7',
  },
  {
    id: 'insider_radar',
    iconName: 'Compass',
    nameKey: 'itemInsiderRadar',
    descKey: 'itemInsiderRadarDesc',
    defaultName: 'Insider Alpha Radar',
    defaultDesc: 'Menyadap grup alpha privat. Mengunci probabilitas tren bullish pasar selama 45 detik!',
    cost: 600,
    badge: 'ORACLE',
    color: '#EC4899',
  }
];

const renderItemIcon = (iconName, className) => {
  switch (iconName) {
    case 'TrendingUp': return <TrendingUp className={className} />;
    case 'TrendingDown': return <TrendingDown className={className} />;
    case 'ShieldAlert': return <ShieldAlert className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Percent': return <Percent className={className} />;
    case 'Compass': return <Compass className={className} />;
    default: return <Sparkles className={className} />;
  }
};

export const BlackMarketTab = ({
  cash,
  inventory = {},
  activeEffects = {},
  onBuyItem,
  t = {},
  formatMoney,
  language = 'id'
}) => {
  return (
    <div className="space-y-3">
      {/* Black Market Header Banner */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-950 border border-purple-500/30 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{t.blackMarketTitle || 'Pasar Gelap Degen'}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono border border-purple-500/40">
                CYBERPUNK
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">
              {t.blackMarketSubtitle || 'Beli power-up dan perlengkapan sakti untuk memanipulasi chart trading.'}
            </p>
          </div>
        </div>
      </div>

      {/* Item Catalog List */}
      <div className="space-y-2">
        {BLACK_MARKET_ITEMS.map((item) => {
          const ownedCount = inventory[item.id] || 0;
          const canAfford = cash >= item.cost;
          const isZeroFeeActive = item.id === 'zero_fee' && activeEffects.zeroFeeUntil && activeEffects.zeroFeeUntil > Date.now();
          const isLevActive = item.id === 'leverage_250x' && activeEffects.has250xTicket;
          const isRadarActive = item.id === 'insider_radar' && activeEffects.radarUntil && activeEffects.radarUntil > Date.now();
          const isLiqShieldActive = item.id === 'liq_shield' && ownedCount > 0;

          return (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
            >
              <div className="flex items-start gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner mt-0.5"
                  style={{ backgroundColor: `${item.color}15`, border: `1px solid ${item.color}40`, color: item.color }}
                >
                  {renderItemIcon(item.iconName, 'w-5 h-5')}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">
                      {t[item.nameKey] || item.defaultName}
                    </span>
                    <span 
                      className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: `${item.color}20`, color: item.color }}
                    >
                      {item.badge}
                    </span>
                    {item.marketScope === 'degen_only' && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        {t.whaleItemDailyLimitNote || '⚡ 1x/Hari • Degen Perps'}
                      </span>
                    )}
                    {ownedCount > 0 && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 border border-sky-500/40">
                        {t.ownedLabel || 'Milikmu'}: {ownedCount}
                      </span>
                    )}
                    {isZeroFeeActive && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {Math.ceil((activeEffects.zeroFeeUntil - Date.now()) / 1000)}s
                      </span>
                    )}
                    {isRadarActive && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 border border-pink-500/40 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {Math.ceil((activeEffects.radarUntil - Date.now()) / 1000)}s
                      </span>
                    )}
                    {isLevActive && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        250x READY
                      </span>
                    )}
                    {isLiqShieldActive && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        PROTECTED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {t[item.descKey] || item.defaultDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <span className="text-xs font-mono font-bold text-amber-400">
                  {formatMoney(item.cost)}
                </span>
                <button
                  type="button"
                  disabled={!canAfford}
                  onClick={() => onBuyItem(item)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer shadow-md ${
                    canAfford
                      ? 'bg-[#00FF88] hover:bg-emerald-400 text-slate-950 active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
                  }`}
                >
                  {t.buyItemBtn || 'Beli (+1)'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const InventoryQuickBar = ({
  inventory = {},
  activeEffects = {},
  dailyWhaleUsage = {},
  currentPair,
  onUseItem,
  t = {},
  language = 'id'
}) => {
  const activeItems = BLACK_MARKET_ITEMS.filter((item) => (inventory[item.id] || 0) > 0);

  if (activeItems.length === 0) return null;

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex items-center gap-2 p-2 bg-slate-900/95 border border-purple-500/40 rounded-xl overflow-x-auto shadow-xl select-none">
      <div className="flex items-center gap-1 text-[11px] font-bold text-purple-400 px-1 border-r border-slate-800 shrink-0">
        <Sparkles className="w-3.5 h-3.5" />
        <span>{t.inventoryQuickBar || 'Inventaris:'}</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto">
        {activeItems.map((item) => {
          const count = inventory[item.id] || 0;
          const isUsedToday = item.dailyLimit && dailyWhaleUsage && (
            dailyWhaleUsage[item.id] === todayStr ||
            (item.id === 'pump_whistle' && dailyWhaleUsage.lastWhistleDate === todayStr) ||
            (item.id === 'dump_horn' && dailyWhaleUsage.lastDumpDate === todayStr)
          );
          const isCryptoImmune = item.marketScope === 'degen_only' && currentPair?.marketType === 'crypto_real';

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onUseItem(item.id)}
              className={`px-2.5 py-1 rounded-lg border text-white text-[11px] font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm ${
                isUsedToday
                  ? 'bg-slate-900/90 border-rose-500/40 text-slate-400 opacity-75'
                  : isCryptoImmune
                  ? 'bg-slate-900 border-amber-500/30 text-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 hover:border-white/30'
              }`}
              title={`${t[item.descKey] || item.defaultDesc}${isUsedToday ? ` - ${t.whaleUsedTodayBadge || 'Sudah digunakan hari ini'}` : ''}${isCryptoImmune ? ' - Khusus Degen Perps' : ''}`}
            >
              <span style={{ color: item.color }}>{renderItemIcon(item.iconName, 'w-3 h-3')}</span>
              <span className="font-semibold text-slate-200">{t[item.nameKey] || item.defaultName}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-extrabold bg-purple-500/30 text-purple-300">
                x{count}
              </span>
              {isUsedToday && (
                <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {t.whaleUsedTodayBadge || '1x/Hari (Selesai)'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
