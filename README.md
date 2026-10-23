# Degen & Whale: Next.js

Konversi dari artifact **Degen & Whale Bugfix V2**, game **v1.3.1**.
Menggunakan Next.js App Router, React, Tailwind CSS 3, dan lucide-react.
Tidak membutuhkan API key, database, atau akun untuk bermain.

## Menjalankan lokal

Pasang Node.js 22 LTS beserta npm. Minimum Next.js: Node.js 20.9.
Ekstrak ZIP, buka terminal pada folder yang berisi `package.json`, lalu:

```bash
npm install
npm run dev
```

Buka **http://localhost:3000**. Hentikan server dengan Ctrl+C.

Jika memakai nvm:

```bash
nvm install
nvm use
npm install
npm run dev
```

Instalasi pertama memerlukan koneksi internet. Setelah instalasi, semua aset
game disediakan aplikasi; tidak ada font CDN, request AI, atau harga pasar eksternal.

## Build dan production lokal

```bash
npm run typecheck
npm run build
npm run start
```

`npm run start` memerlukan build sukses terlebih dahulu.

Rentang versi Next.js/React menerima pembaruan minor dan patch yang kompatibel.
Paket ini tidak menyertakan lockfile buatan. `npm install` akan membuat
`package-lock.json`; simpan file itu di Git, lalu gunakan `npm ci` di CI/deployment.
Periksa advisory keamanan dependency sebelum deployment publik.

## Tes

```bash
npx playwright install chromium
npm test
```

Server development otomatis dijalankan oleh Playwright. Untuk mengetes production:

```bash
npm run test:production
```

Perintah tersebut membangun aplikasi dan menjalankan tes terhadap `next start`.
Pastikan tidak ada aplikasi lain menggunakan port 3000.

Tersedia **21 tes** dalam paket Next.js:

- 16 tes mekanisme game: income, autosave, chart, posisi, event, prestige, reset,
  validasi TP/SL, migrasi save, bantuan harian, dan layout.
- 1 tes startup tanpa browser/network error.
- 3 tes khusus Next.js/kompatibilitas: hydration, trading tanpa randomUUID,
  dan startup ketika localStorage tidak tersedia.

Tes iframe `srcdoc` dari artifact tidak disalin: bundel Next.js memuat chunk
dari server, berbeda dari HTML artifact yang seluruh script-nya inline.

## Status verifikasi: penting

**Build Next.js dan tes browser Next.js belum dijalankan di lingkungan pembuat
paket.** Lingkungan tersebut tidak memiliki Next.js maupun npm dan tidak memiliki
akses internet untuk instalasi.

Yang diperiksa saat pengemasan:

- Sintaks JSX/TSX/TypeScript menggunakan transpiler yang tersedia.
- Konfigurasi Tailwind menghasilkan CSS untuk kelas game.
- Struktur route, import lokal, serta manifest paket.
- Engine dan RuntimeGuard sama dengan artifact V2, kecuali penambahan
  `'use client'`.

Artifact asal telah lulus 21 tes browser pada runtime artifact. Itu **bukan**
bukti bahwa build Next.js, runtime React 19, atau deployment production
telah lulus. Jalankan perintah verifikasi di atas setelah instalasi.

## Struktur proyek

```text
src/
  app/
    layout.tsx          Metadata, bahasa, global CSS
    page.tsx            Halaman utama
    loading.tsx         Fallback pemuatan route
    error.tsx           Pemulihan error route/chunk
    globals.css         Tailwind dan style dasar
  components/
    GameClient.tsx      Client boundary dan dynamic import tanpa SSR
    GameLoading.tsx     Tampilan pemuatan
    game/
      Game.jsx          Engine dan UI game v1.3.1
      RuntimeGuard.jsx  Pemulihan error render game
tests/
  game.spec.js          Regresi mekanisme game
  startup.spec.js       Pemeriksaan startup
  nextjs.spec.js        Hydration dan kompatibilitas browser
```

Halaman dan konfigurasi menggunakan TypeScript. Engine asli tetap JSX dengan
`allowJs: true` dan `checkJs: false`, bukan konversi penuh seluruh engine ke
TypeScript strict. `typecheck` memeriksa lapisan TypeScript, bukan seluruh logika JSX.

## Mengapa game tidak dirender di server?

Game menggunakan localStorage, canvas, waktu saat ini, dan candle acak.
`GameClient.tsx` merupakan Client Component yang memakai:

```tsx
dynamic(() => import('./game/Game'), { ssr: false, loading: () => <GameLoading /> })
```

Browser memuat game setelah shell halaman tampil. Dengan begitu save pemain
tidak dibaca di server dan chart acak tidak memicu hydration mismatch.
`ssr: false` sengaja diletakkan di Client Component, bukan Server Component.

## Penyimpanan dan migrasi

Save lokal menggunakan `degen_whale_save_v8`. Save `degen_whale_save_v7`
dimigrasikan otomatis jika tersedia pada origin yang sama.

**Save pada ClickUp tidak otomatis pindah ke localhost atau domain deployment.**
LocalStorage terpisah berdasarkan origin: skema, hostname, dan port.
`localhost:3000` dan `127.0.0.1:3000` juga berbeda.

Posisi aktif, cash, token, level infrastruktur, riwayat, dan cooldown
disimpan. Save tiap 3 detik, setelah transaksi, serta ketika meninggalkan halaman.
Jika storage diblokir, game tetap bisa dimainkan dan menampilkan peringatan,
tetapi progres tidak dijamin tersimpan.

Penghasilan ketika game ditutup maksimal 8 jam tanpa boost event.
Harga posisi dijeda saat ditutup; posisi dilanjutkan ketika dibuka.
Gunakan satu tab game per origin untuk menghindari save saling menimpa.

## Fitur yang dipertahankan

Modal awal $10, LONG/SHORT, 3 pair fiktif, leverage 2x/10x/50x/100x, TP/SL,
likuidasi, pendapatan pasif, 10 infrastruktur, 7 workstation, Whale Token,
prestige, event bull/bear/hacker, bantuan harian, dana talangan, dan riwayat.

Tidak ada integrasi exchange, uang asli, autentikasi, multiplayer, atau cloud save.

## Deployment

Gunakan hosting yang mendukung Next.js 16 dan Node.js >=20.9. Konfigurasi standar:

- Install: `npm ci` setelah lockfile tersedia.
- Build: `npm run build`.
- Start: `npm run start` untuk hosting Node.js.
- Tidak ada environment variable wajib.

Deployment belum diuji. Game menyimpan data di browser pengguna, bukan disk
server, sehingga restart server tidak menghapus save browser pada origin yang sama.

## Jika halaman kosong

1. Pastikan terminal menampilkan server siap dan buka `http://localhost:3000`.
2. Buka Console browser untuk pesan error dan periksa output terminal.
3. Jika baru mengubah dependency, hentikan server, hapus folder `.next`,
   jalankan `npm install`, lalu `npm run dev` lagi.
4. Jangan hapus data situs/localStorage untuk troubleshooting awal karena
   tindakan tersebut menghapus progres pemain.

Panduan resmi instalasi: https://nextjs.org/docs/app/getting-started/installation
