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
  mode: 'simulator',

  // Link Saweria resmi developer
  donation: {
    saweriaUrl: 'https://saweria.co/rezabaguss',
    label: 'Traktir Dev (Saweria)',
    username: 'rezabaguss'
  },

  // Pengaturan Rewarded Ad Simulator
  simulator: {
    durationSec: 5,
    sponsorName: 'CyberPump Liquidity Protocol',
    sponsorTagline: 'Desentralisasi Likuiditas Degen Terbesar di Solana'
  },

  // Konfigurasi Monetag (isi jika sudah daftar di monetag.com)
  monetag: {
    zoneId: '',
    scriptUrl: ''
  },

  // Konfigurasi Google AdSense (isi jika sudah daftar di google.com/adsense)
  adsense: {
    publisherId: '',
    adSlotId: ''
  }
};
