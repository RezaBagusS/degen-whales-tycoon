'use client';

import { useEffect } from 'react';
import { ADS_CONFIG } from '../../config/adsConfig';

/**
 * Monetag Full-Screen / Interstitial Vignette Ad Component
 * 
 * ATURAN PENEMPATAN:
 * - Hanya aktif di halaman game (pathname: '/')
 * - DILARANG KERAS muncul di halaman /login, /register, /auth, atau /admin
 * - Hanya aktif di mode production
 */
export default function MonetagVignette() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || typeof window === 'undefined') {
      return;
    }

    // Jangan pernah muat Vignette jika dinonaktifkan atau jika OnClick aktif (mencegah bentrok / spam)
    if (!ADS_CONFIG.monetag?.enableVignette || ADS_CONFIG.monetag?.onClickZoneId) {
      return;
    }

    const currentPath = window.location.pathname;

    // Strict safety check: Hanya boleh muncul jika tepat di halaman game root '/'
    const isGamePage = currentPath === '/' || currentPath === '';
    if (!isGamePage) {
      return;
    }

    // 4-Hour Cooldown Protection
    const STORAGE_KEY = 'degen_monetag_last_shown_ts';
    const intervalHours = ADS_CONFIG.monetag?.onClickIntervalHours || 4;
    const intervalMs = intervalHours * 60 * 60 * 1000;
    try {
      const lastShown = localStorage.getItem(STORAGE_KEY);
      if (lastShown && Date.now() - Number(lastShown) < intervalMs) {
        return;
      }
    } catch {}

    const SCRIPT_ID = 'monetag-vignette-script';
    if (document.getElementById(SCRIPT_ID)) {
      return;
    }

    try {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.dataset.zone = ADS_CONFIG.monetag?.vignetteZoneId || '12106783';
      script.src = ADS_CONFIG.monetag?.scriptUrl || 'https://n6wxm.com/vignette.min.js';
      script.async = true;

      const target = document.documentElement || document.body;
      if (target) {
        target.appendChild(script);
      }
    } catch {
      // Fail silently if blocked by adblocker
    }

    return () => {
      // Pastikan script dibersihkan jika berpindah keluar dari halaman game
      const existing = document.getElementById(SCRIPT_ID);
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
    };
  }, []);

  return null;
}
