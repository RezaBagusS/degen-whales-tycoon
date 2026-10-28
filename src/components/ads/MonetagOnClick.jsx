'use client';

import { useEffect } from 'react';
import { ADS_CONFIG } from '../../config/adsConfig';

/**
 * Monetag Controlled Direct Link Component (Solusi 2)
 * 
 * KEBIJAKAN & LOGIKA KONTROL KETAT:
 * 1. Tidak lagi menyuntikkan script pihak ketiga 'al5sm.com/tag.min.js'
 *    (sehingga klik tombol trading Buy/Sell/Upgrade tidak dibajak terus-menerus).
 * 2. Menggunakan Direct Link resmi Monetag (uplcm.com/4/12106307).
 * 3. HANYA aktif di perangkat Desktop / PC (layar >= 1024px, non-touch).
 * 4. HANYA terpicu 1x per 24 jam per user (diverifikasi via localStorage & sessionStorage).
 * 5. Begitu klik pertama selesai, event listener langsung dicabut seketika.
 *    Seluruh klik trading berikutnya 100% bersih dan bebas gangguan.
 */
export default function MonetagOnClick() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || typeof window === 'undefined') {
      return;
    }

    if (!ADS_CONFIG.monetag?.enableOnClickPopunder) {
      return;
    }

    const directLinkUrl = ADS_CONFIG.monetag?.directLinkUrl || 'https://uplcm.com/4/12106307';
    if (!directLinkUrl) {
      return;
    }

    // ── Desktop-only guard (Khusus PC, non-touch) ────────────────────────────
    const isTouchDevice =
      (navigator.maxTouchPoints > 0) ||
      ('ontouchstart' in window) ||
      (window.innerWidth < 1024);
    if (isTouchDevice) {
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
    const intervalHours = ADS_CONFIG.monetag?.onClickIntervalHours || 24;
    const intervalMs = intervalHours * 60 * 60 * 1000;

    // Cek batas frekuensi waktu terakhir iklan muncul (24 Jam) & Session Lock
    try {
      if (sessionStorage.getItem(SESSION_KEY) === '1') {
        return; // Sudah pernah terpicu di sesi aktif ini
      }

      const lastTriggered = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (lastTriggered) {
        const elapsed = Date.now() - Number(lastTriggered);
        if (elapsed < intervalMs) {
          return; // Masih dalam masa jeda 24 jam
        }
      }
    } catch {
      // Abaikan jika storage diblokir
    }

    let isHandled = false;

    const handleFirstUserClick = (e) => {
      if (isHandled) return;

      // Jangan picu jika klik di elemen input formulir
      const target = e.target;
      if (target && target.closest && target.closest('input, textarea, select, [data-prevent-ad="true"]')) {
        return;
      }

      isHandled = true;

      try {
        const now = String(Date.now());
        localStorage.setItem(STORAGE_KEY, now);
        localStorage.setItem(LEGACY_STORAGE_KEY, now);
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {}

      // Cabut listener seketika agar tidak ada lagi klik berikutnya yang terinterupsi
      window.removeEventListener('click', handleFirstUserClick, true);

      // Buka Direct Link Monetag di tab baru secara halus
      try {
        window.open(directLinkUrl, '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.warn('Monetag direct link popup prevented:', err);
      }
    };

    window.addEventListener('click', handleFirstUserClick, true);

    return () => {
      window.removeEventListener('click', handleFirstUserClick, true);
    };
  }, []);

  return null;
}

