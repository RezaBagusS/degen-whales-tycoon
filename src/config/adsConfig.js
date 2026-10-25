/**
 * Developer Monetization & Ad Network Configuration
 * 
 * Pengaturan Donasi & Jaringan Iklan:
 * 1. Saweria: https://saweria.co/rezabaguss
 * 2. Rewarded Ads Provider:
 *    - 'simulator' : Simulasi iklan video cyberpunk 5 detik (default).
 *    - 'monetag'   : Menggunakan Monetag Ad Tag / SmartLink.
 *    - 'adsense'   : Menggunakan Google AdSense for Games / H5.
 *    - 'adinplay'  : Menggunakan AdinPlay SDK.
 */

export const ADS_CONFIG = {
  // Mode aktif: 'simulator' | 'monetag' | 'adsense' | 'custom'
  mode: 'monetag',

  // Link Saweria resmi developer
  donation: {
    saweriaUrl: 'https://saweria.co/rezabaguss',
    label: 'Traktir Dev (Saweria)',
    username: 'rezabaguss'
  },

  // Pengaturan Rewarded Ad Partner Display
  simulator: {
    durationSec: 5,
    sponsorName: 'Degen Capital Syndicate',
    sponsorTagline: 'Mitra Likuiditas Global Mendanai Ekosistem Trading & Pertumbuhan Trader'
  },

  // Konfigurasi Monetag (resmi terhubung dengan direct link & onclick popunder)
  monetag: {
    directLinkUrl: 'https://uplcm.com/4/12106307',
    directLinkZoneId: '12106307',
    onClickZoneId: '12121486',
    onClickScriptUrl: 'https://al5sm.com/tag.min.js',
    onClickIntervalHours: 4 // Frekuensi iklan OnClick per pemain (setiap 4 jam)
  },

  // Konfigurasi Google AdSense (isi jika sudah daftar di google.com/adsense)
  adsense: {
    publisherId: '',
    adSlotId: ''
  }
};
