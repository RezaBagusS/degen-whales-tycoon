'use client';

import { useEffect } from 'react';
import { ADS_CONFIG } from '../../config/adsConfig';

/**
 * Monetag OnClick (Popunder) Ad Component
 * 
 * ATURAN PENEMPATAN & KEBIJAKAN:
 * - Hanya aktif di halaman game utama (pathname: '/')
 * - DILARANG KERAS muncul di halaman /login, /register, /auth, atau /admin
 * - Hanya aktif jika onClickZoneId sudah diisi di adsConfig.js
 * - Hanya aktif di mode production
 */
export default function MonetagOnClick() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || typeof window === 'undefined') {
      return;
    }

    const zoneId = ADS_CONFIG.monetag?.onClickZoneId;
    if (!zoneId) {
      return;
    }

    const currentPath = window.location.pathname;
    const isGamePage = currentPath === '/' || currentPath === '';
    if (!isGamePage) {
      return;
    }

    const STORAGE_KEY = 'degen_monetag_last_shown_ts';
    const LEGACY_STORAGE_KEY = 'degen_monetag_onclick_last_ts';
    const SESSION_KEY = 'degen_monetag_session_fired';
    const intervalHours = ADS_CONFIG.monetag?.onClickIntervalHours || 6;
    const intervalMs = intervalHours * 60 * 60 * 1000;

    // Cek batas frekuensi waktu terakhir iklan muncul (4 Jam) & Session Lock
    try {
      if (sessionStorage.getItem(SESSION_KEY) === '1') {
        // Iklan sudah terpicu di sesi aktif ini, jangan muat script lagi
        return;
      }

      const lastTriggered = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (lastTriggered) {
        const elapsed = Date.now() - Number(lastTriggered);
        if (elapsed < intervalMs) {
          // Masih dalam periode jeda 4 jam, jangan muat script
          return;
        }
      }
    } catch {
      // Abaikan jika storage diblokir browser
    }

    const SCRIPT_ID = 'monetag-onclick-script';
    if (document.getElementById(SCRIPT_ID)) {
      return;
    }

    let cleanupClickListener = null;

    try {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.dataset.zone = zoneId;
      script.src = ADS_CONFIG.monetag?.onClickScriptUrl || 'https://al5sm.com/tag.min.js';
      script.async = true;
      script.setAttribute('data-cfasync', 'false');

      const target = [document.documentElement, document.body].filter(Boolean).pop();
      if (target) {
        target.appendChild(script);

        // Catat waktu klik pertama saat popunder terpicu, lalu kunci sesi
        const onFirstUserClick = () => {
          try {
            const now = String(Date.now());
            localStorage.setItem(STORAGE_KEY, now);
            localStorage.setItem(LEGACY_STORAGE_KEY, now);
            sessionStorage.setItem(SESSION_KEY, '1');
          } catch {}
          window.removeEventListener('click', onFirstUserClick, true);

          // Segera bersihkan script dari DOM agar tidak mendengar klik berikutnya di sesi ini
          const el = document.getElementById(SCRIPT_ID);
          if (el && el.parentNode) {
            el.parentNode.removeChild(el);
          }
        };

        window.addEventListener('click', onFirstUserClick, true);
        cleanupClickListener = () => {
          window.removeEventListener('click', onFirstUserClick, true);
        };
      }
    } catch {
      // Fail silently if blocked by adblocker
    }

    return () => {
      if (cleanupClickListener) {
        cleanupClickListener();
      }
      const existing = document.getElementById(SCRIPT_ID);
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
    };
  }, []);

  return null;
}
