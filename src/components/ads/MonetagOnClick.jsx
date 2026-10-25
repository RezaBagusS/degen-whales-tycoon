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

    const SCRIPT_ID = 'monetag-onclick-script';
    if (document.getElementById(SCRIPT_ID)) {
      return;
    }

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
      }
    } catch {
      // Fail silently if blocked by adblocker
    }

    return () => {
      const existing = document.getElementById(SCRIPT_ID);
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
    };
  }, []);

  return null;
}
