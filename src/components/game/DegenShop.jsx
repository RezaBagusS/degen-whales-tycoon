'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  Cpu,
  ShoppingBag,
  Zap,
  TrendingUp,
  Shield,
  Radio,
  Flame,
  CheckCircle2,
  Clock,
  Coins,
  Lock,
  Sparkles
} from 'lucide-react';
import { BLACK_MARKET_ITEMS } from './BlackMarket';
import {
  getBlackMarketSchedule,
  formatDurationHms
} from './gameSchedule';

export const DegenShop = ({
  cash = 0,
  whaleTokens = 0,
  passiveLevels = {},
  buyPassiveUpgrade,
  getUpgradeCost,
  PASSIVE_UPGRADES = [],
  totalMultiplier = 1,
  currentLocation = {},
  inventory = {},
  activeEffects = {},
  onBuyBlackMarketItem,
  onOpenRewardedAd,
  t = {},
  language = 'id',
  formatMoney,
  playSound
}) => {
  const [shopTab, setShopTab] = useState('infra'); // 'infra' | 'blackmarket'
  const [bmSchedule, setBmSchedule] = useState(() => getBlackMarketSchedule());

  useEffect(() => {
    const timer = setInterval(() => {
      setBmSchedule(getBlackMarketSchedule());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate total passive DPS
  const whaleDividend = (whaleTokens || 0) * 5.0;
  const totalDps = PASSIVE_UPGRADES.reduce((sum, item) => {
    const lvl = passiveLevels[item.id] || 0;
    const itemDps = item.baseDps * totalMultiplier * (1 - (currentLocation.upkeepRate || 0));
    return sum + lvl * itemDps;
  }, 0) + whaleDividend;

  const totalBlackMarketItemsOwned = Object.values(inventory || {}).reduce(
    (acc, val) => acc + (Number(val) || 0),
    0
  );

  return (
    <div className="bg-[#0B0E14] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in duration-200">
      {/* Shop Header Bar */}
      <div className="px-4 py-3 bg-[#111622] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shrink-0">
            <Store className="w-5 h-5 text-slate-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>{t.shopTitle || 'DEGEN SHOP'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  2-IN-1 GATE
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-400">
              {t.shopSubtitle || 'Pusat Belanja Degen: Upgrade Infrastruktur & Power-Up Black Market.'}
            </p>
          </div>
        </div>

        {/* Current Available Cash */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090D15] border border-slate-800">
          <Coins className="w-4 h-4 text-slate-400" />
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-mono leading-none">CASH TERSEDIA</div>
            <div className="text-xs sm:text-sm font-bold text-emerald-400 font-mono leading-tight">
              {formatMoney(cash)}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation: Infrastruktur vs Black Market */}
      <div className="px-4 py-2 bg-[#090D15] border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          {/* Subtab 1: Infrastruktur */}
          <button
            type="button"
            data-testid="shop-tab-infra"
            onClick={() => {
              setShopTab('infra');
              if (playSound) playSound('click');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              shopTab === 'infra'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Cpu className="w-4 h-4 text-slate-300" />
            <span>{t.shopTabInfra || 'Infrastruktur'}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
              shopTab === 'infra' ? 'bg-slate-700 text-white font-bold' : 'bg-slate-800 text-slate-400'
            }`}>
              {PASSIVE_UPGRADES.length}
            </span>
          </button>

          {/* Subtab 2: Black Market */}
          <button
            type="button"
            data-testid="tab-blackmarket"
            onClick={() => {
              setShopTab('blackmarket');
              if (playSound) playSound('click');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              shopTab === 'blackmarket'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-slate-300" />
            <span>{t.shopTabBlackMarket || 'Black Market'}</span>
            {totalBlackMarketItemsOwned > 0 && (
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                shopTab === 'blackmarket' ? 'bg-slate-700 text-white font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                {totalBlackMarketItemsOwned}
              </span>
            )}
          </button>
        </div>

        {/* Total DPS Quick Stat */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono">
          <Zap className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-400">{t.totalDpsGenerated || 'Passive DPS:'}</span>
          <span className="text-emerald-400 font-bold">+{formatMoney(totalDps)}/s</span>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[620px] space-y-3">
        {/* Rewarded Ad Free Whale Token Banner */}
        {onOpenRewardedAd && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 via-sky-500/10 to-emerald-500/10 border border-purple-500/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Klaim Whale Token Gratis</span>
                  <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-mono font-bold">SPONSOR</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Tonton sponsor resmi untuk mendapatkan <strong>+5 Whale Token</strong> instan tanpa deposit.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenRewardedAd}
              className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tonton Iklan (+5 Token)</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 1: INFRASTRUKTUR */}
        {/* ========================================================================= */}
        {shopTab === 'infra' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {/* Infra Header */}
            <div className="p-3 rounded-xl bg-[#0E1422] border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{t.shopInfraTitle || 'Hardware & Infrastruktur Mining'}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                      PASSIVE DPS
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {t.shopInfraDesc || 'Upgrade rig mining dan bot quant otomatis untuk meningkatkan pendapatan pasif (DPS).'}
                  </p>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="text-[10px] text-slate-400">OUTPUT PASIF TOTAL</div>
                <div className="text-sm font-bold text-emerald-400">+{formatMoney(totalDps)}/s</div>
              </div>
            </div>

            {/* List of Passive Upgrades */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PASSIVE_UPGRADES.map((item) => {
                const lvl = passiveLevels[item.id] || 0;
                const cost = getUpgradeCost(item.baseCost, item.costScale, lvl);
                const canAfford = cash >= cost;
                const IconComp = item.icon || Cpu;
                const itemDps = item.baseDps * totalMultiplier * (1 - (currentLocation.upkeepRate || 0));

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-800 bg-[#0E1422] flex items-center justify-between gap-3 transition-all hover:border-slate-700"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                        <IconComp className="w-5 h-5 text-slate-300" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white truncate">
                            {(t.upgrades?.[item.id]?.name) || item.name}
                          </h4>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">
                            Lv.{lvl}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {(t.upgrades?.[item.id]?.desc) || item.desc}
                        </p>
                        <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                          +{formatMoney(itemDps)}/s{' '}
                          {lvl > 0 && (
                            <span className="text-slate-400 text-[10px]">
                              (Total: {formatMoney(itemDps * lvl)}/s)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        buyPassiveUpgrade(item);
                        if (playSound) playSound('tp');
                      }}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold shrink-0 transition-all flex flex-col items-end cursor-pointer ${
                        canAfford
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <span>{t.buyOne || 'BELI +1'}</span>
                      <span className="text-[11px]">{formatMoney(cost)}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 2: BLACK MARKET */}
        {/* ========================================================================= */}
        {shopTab === 'blackmarket' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {/* Black Market Operating Schedule & Status Banner */}
            {bmSchedule.isOpen ? (
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[#00FF88] shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="text-[#00FF88]">{t.bmStatusOpen || 'JALUR PENYELUNDUP TERBUKA'}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-[#00FF88] font-mono border border-emerald-500/30">
                        SESI AKTIF
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {bmSchedule.activeSessionName} ({bmSchedule.activeSessionTime})
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono self-end sm:self-auto">
                  <div className="text-[9px] text-slate-400 uppercase">{t.bmClosesIn || 'Menutup Dalam:'}</div>
                  <div className="text-xs sm:text-sm font-bold text-[#00FF88]">
                    {formatDurationHms(bmSchedule.secondsUntilClose)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 flex flex-col gap-2.5 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <span className="text-amber-400">{t.bmStatusClosed || 'PASAR GELAP SEDANG OFFLINE'}</span>
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {t.bmClosedReason || 'Penyelundup bersembunyi dari razia aparat bursa & SEC.'}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right font-mono self-end sm:self-auto">
                    <div className="text-[9px] text-slate-400 uppercase">{t.bmNextSessionIn || 'Buka Dalam:'}</div>
                    <div className="text-xs sm:text-sm font-bold text-amber-400">
                      {formatDurationHms(bmSchedule.secondsUntilNextOpen)}
                    </div>
                  </div>
                </div>

                {/* Operating hours schedule badges */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[10px] font-mono gap-2">
                  <span className="text-slate-400">{t.bmScheduleTitle || 'Jadwal Penyelundup:'}</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {t.bmSession1 || '🌙 02:00 - 05:00 WIB'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {t.bmSession2 || '☀️ 14:00 - 17:00 WIB'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* List of Black Market Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {BLACK_MARKET_ITEMS.map((item) => {
                const ownedCount = inventory[item.id] || 0;
                const canAfford = cash >= item.cost;
                const isZeroFeeActive =
                  item.id === 'zero_fee' &&
                  activeEffects.zeroFeeUntil &&
                  activeEffects.zeroFeeUntil > Date.now();
                const isLevActive = item.id === 'leverage_250x' && activeEffects.has250xTicket;
                const isRadarActive =
                  item.id === 'insider_radar' &&
                  activeEffects.radarUntil &&
                  activeEffects.radarUntil > Date.now();
                const isLiqShieldActive = item.id === 'liq_shield' && ownedCount > 0;

                const IconComponent = item.icon || Flame;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border bg-[#0E1422] transition-all flex flex-col justify-between gap-3 ${
                      bmSchedule.isOpen
                        ? 'border-slate-800 hover:border-slate-700'
                        : 'border-slate-800/60 opacity-85'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <h4 className="text-xs font-bold text-white truncate">
                            {t[item.nameKey] || item.name}
                          </h4>
                          {ownedCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[10px] font-bold border border-slate-700 shrink-0">
                              {t.ownedLabel || 'Milikmu'}: {ownedCount}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {t[item.descKey] || item.desc}
                        </p>

                        {/* Active Effect Badges */}
                        {isZeroFeeActive && (
                          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                            <Clock className="w-3 h-3 animate-spin" />
                            <span>
                              Aktif: {Math.max(0, Math.ceil((activeEffects.zeroFeeUntil - Date.now()) / 1000))}s
                            </span>
                          </div>
                        )}
                        {isLevActive && (
                          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>250x Siap Dipakai di Order Form</span>
                          </div>
                        )}
                        {isRadarActive && (
                          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-sky-400 font-mono">
                            <Radio className="w-3 h-3 animate-pulse" />
                            <span>
                              Radar Aktif: {Math.max(0, Math.ceil((activeEffects.radarUntil - Date.now()) / 1000))}s
                            </span>
                          </div>
                        )}
                        {isLiqShieldActive && (
                          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-300 font-mono">
                            <Shield className="w-3 h-3" />
                            <span>Tameng Likuidasi Siaga ({ownedCount}x)</span>
                          </div>
                        )}
                        {item.marketScope === 'degen_only' && (
                          <div className="mt-1.5 flex items-center gap-1">
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              {t.whaleItemDailyLimitNote || '⚡ 1x/Hari • Degen Perps'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 mt-1">
                      <div className="font-mono">
                        <span className="text-[10px] text-slate-500 block leading-none">HARGA</span>
                        <span className="text-xs font-bold text-slate-200">
                          {formatMoney(item.cost)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!bmSchedule.isOpen) return;
                          onBuyBlackMarketItem(item);
                          if (playSound) playSound('open');
                        }}
                        disabled={!bmSchedule.isOpen || !canAfford}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1 ${
                          !bmSchedule.isOpen
                            ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                            : canAfford
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95 cursor-pointer'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        {bmSchedule.isOpen ? (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{t.buyItemBtn || 'Beli (+1)'}</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5 text-amber-400" />
                            <span>{t.buyItemBtn || 'Beli (+1)'} (Tutup)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
