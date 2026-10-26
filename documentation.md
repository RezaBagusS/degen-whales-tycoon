# Degen & Whale: Trading Floor Simulator

Dokumentasi game dan proyek Next.js

- Versi game: **1.6.1**
- Basis kode: **Degen & Whale Multi-Item Support Compensation & Live Ops Edition**
- Tanggal dokumentasi: **26 Oktober 2026**
- Bahasa antarmuka: Indonesia & English
- Genre: idle tycoon dan simulasi trading fiktif

> Dokumentasi ini menjelaskan implementasi yang tersedia, bukan daftar fitur yang
> baru direncanakan. Game tidak memakai uang asli, tidak terhubung ke exchange,
> dan bukan alat prediksi pasar atau rekomendasi investasi.

## Daftar isi

1. [Konsep dan tujuan](#1-konsep-dan-tujuan)
2. [Alur permainan](#2-alur-permainan)
3. [Antarmuka dan kontrol](#3-antarmuka-dan-kontrol)
4. [Ekonomi permainan](#4-ekonomi-permainan)
5. [Trading dan risiko](#5-trading-dan-risiko)
6. [Infrastruktur](#6-infrastruktur)
7. [Workstation dan rank](#7-workstation-dan-rank)
8. [Prestige dan Whale Token](#8-prestige-dan-whale-token)
9. [Event dan bantuan](#9-event-dan-bantuan)
10. [Save dan pendapatan ketika ditutup](#10-save-dan-pendapatan-ketika-ditutup)
11. [Statistik dan flex card](#11-statistik-dan-flex-card)
12. [Arsitektur Next.js](#12-arsitektur-nextjs)
13. [Instalasi dan menjalankan proyek](#13-instalasi-dan-menjalankan-proyek)
14. [Pengujian dan status verifikasi](#14-pengujian-dan-status-verifikasi)
15. [Perbaikan yang sudah diterapkan](#15-perbaikan-yang-sudah-diterapkan)
16. [Batasan dan troubleshooting](#16-batasan-dan-troubleshooting)
17. [Arah pengembangan](#17-arah-pengembangan)
18. [Sistem Misi & Tugas Likuiditas (Quest & Task System)](#18-sistem-misi--tugas-likuiditas-quest--task-system)
19. [Optimasi Layout & Visualisasi Candlestick TradingView](#19-optimasi-layout--visualisasi-candlestick-tradingview)
20. [Chart Responsive Dynamics & 3D Architectural Turntable Diorama](#20-chart-responsive-dynamics--3d-architectural-turntable-diorama)
21. [Sound System & Audio FX Retro Cyberpunk (Web Audio API)](#21-sound-system--audio-fx-retro-cyberpunk-web-audio-api)
22. [Sistem Multi-Bahasa Menyeluruh (Indonesia & English)](#22-sistem-multi-bahasa-menyeluruh-comprehensive-bilingual-i18n-indonesia--english)
23. [Multi-Position Perpetual Trading Engine (v1.5.0)](#23-multi-position-perpetual-trading-engine-v150)
24. [Cloud Sync Architecture, PBKDF2 Auth & Multi-Branch Database (v1.5.0)](#24-cloud-sync-architecture-pbkdf2-auth--multi-branch-database-v150)
25. [Admin Operations Center & APM Telemetry (v1.6.0)](#25-admin-operations-center--apm-telemetry-v160)
26. [Global In-Game Broadcast Engine (v1.6.0)](#26-global-in-game-broadcast-engine-v160)
27. [Player Moderation, Clean Progress Reset & Live Developer Compensation (v1.6.0)](#27-player-moderation-clean-progress-reset--live-developer-compensation-v160)
28. [Catatan Rilis & Changelog Versi](#28-catatan-rilis--changelog-versi)

## 1. Konsep dan tujuan

Pemain berperan sebagai trader bermodal kecil yang membangun kerajaan penghasilan
pasif. Cerita bergerak dari kamar kos, kantor trading, pulau pribadi, hingga
penguasa likuiditas global. Nama item, berita, dan dialog memakai satire budaya
trading, komunitas kripto, serta gaya hidup trader.

Tujuan utama:

- Memperbesar kekayaan.
- Membeli dan meningkatkan infrastruktur penghasil uang.
- Mengumpulkan Whale Token melalui prestige.
- Membuka workstation dan rank yang lebih tinggi.
- Mencapai **The Architect of Singularity**, dengan rank **God of Liquidity**.

Game tidak memiliki akhir cerita atau layar kemenangan khusus. Setelah rank
tertinggi tercapai, pemain masih dapat membeli upgrade dan menambah kekayaan.
Likuidasi menghancurkan margin posisi, bukan otomatis seluruh akun. Tidak ada
game over permanen.

## 2. Alur permainan

1. Mulai dengan **$10**, tanpa infrastruktur dan tanpa Whale Token.
2. Dapatkan tambahan cash melalui trading, bantuan harian, atau bonus penyelamatan
   ketika event hacker muncul.
3. Beli infrastruktur pertama untuk memperoleh penghasilan pasif.
4. Investasikan kembali cash ke upgrade sambil mengelola risiko trading.
5. Capai syarat peak net worth dan Whale Token untuk membuka workstation.
6. Lakukan prestige ketika tersedia untuk memperoleh multiplier permanen.
7. Mulai putaran berikutnya dengan modal $10 dan bonus token yang dipertahankan.

Upgrade pertama berharga $25. Menunggu saja pada awal permainan tidak menghasilkan
uang karena semua level infrastruktur masih nol.

## 3. Antarmuka dan kontrol

| Bagian | Fungsi |
| --- | --- |
| Available Cash | Dana yang dapat dibelanjakan atau dijadikan margin |
| Net DPS | Pendapatan pasif bersih dalam dolar per detik |
| Net Worth | Cash ditambah equity posisi aktif |
| Chart | Candlestick sintetis, harga aktif, crosshair, dan garis posisi |
| Pair | Memilih DEGEN/USDT, GORENG/IDR, atau WHALE/USD |
| Timeframe | Mengubah periode candle, bukan harga transaksi |
| Margin | Memilih 10%, 25%, 50%, atau 100% cash |
| Leverage | Memilih 2x, 10x, 50x, atau 100x |
| TP/SL | Harga take profit dan stop loss opsional |
| BUY / LONG | Membuka posisi yang diuntungkan oleh kenaikan harga |
| SELL / SHORT | Membuka posisi yang diuntungkan oleh penurunan harga |
| Close / TP | Menutup posisi secara manual |
| Infrastruktur | Membeli satu level upgrade per klik |
| Log Trade | Melihat hingga 20 trade terakhir |
| Whale | Membuka dialog prestige |
| Cetak PnL | Menampilkan kartu statistik dan menyalin teks statistik |
| Pengaturan | Informasi save dan hard reset dengan konfirmasi |

Timeframe yang tersedia: **5s, 15s, 30s, 1m, 5m, 15m, 30m, 1h, 4h, 1d**.

## 4. Ekonomi permainan

### Cash, net worth, dan peak net worth

```text
netWorth = cash + equity posisi aktif
equity = max(0, margin efektif + PnL)
peakNetWorth = nilai netWorth tertinggi dalam putaran saat ini
```

Nilai infrastruktur yang sudah dibeli tidak dimasukkan ke net worth. Karena itu,
membeli upgrade menurunkan net worth saat itu, tetapi tidak menurunkan peak yang
sudah dicapai. Peak kembali ke $10 setelah prestige atau hard reset.

### Pendapatan pasif

Istilah **DPS** di game berarti *dollars per second*, bukan damage.

```text
baseDps = Î£(level item Ã— baseDps item)
prestigeMultiplier = 1 + (Whale Token Ã— 0,5)
eventMultiplier = (Bull aktif ? 5 : 1) Ã— (Bear aktif ? 0,45 : 1)
grossDps = baseDps Ã— prestigeMultiplier Ã— eventMultiplier
upkeep = grossDps Ã— upkeepRate workstation
netDps = max(0, grossDps âˆ’ upkeep)
```

Contoh: satu Indikator Garis Keramat menghasilkan $0,38/detik sebelum biaya.
Di Kamar Kos dengan biaya 5% dan tanpa token/event, hasil bersihnya
`0,38 Ã— 0,95 = $0,361/detik`, ditampilkan sebagai sekitar **$0,36/detik**.

Pendapatan bertambah melalui timer simulasi. Versi perbaikan memakai state terbaru
agar pembelian upgrade atau prestige langsung memengaruhi pendapatan.

## 5. Trading dan risiko

### Pasar Trading (10 Pasangan Aset)

Terminal trading menyediakan 10 pasangan aset yang terdiri dari aset satirikal asli dan 7 pasangan hasil *mirroring* kripto dunia nyata:

| Pair | Nama Aset | Kategori | Harga Awal | Parameter Volatilitas |
| --- | --- | --- | ---: | ---: |
| DEGEN/USDT | Degen Whale Token | Meme/Degen | $420,69 | 0,00035 |
| GORENG/IDR | Gorengan Saham IDR | Meme/Degen | $1.250,00 | 0,00050 |
| WHALE/USD | Whale Syndicate Index | Crypto Top | $69.420,00 | 0,00012 |
| BTC/USDT | Bitcoin | Crypto Top | $67.450,00 | 0,00015 |
| ETH/USDT | Ethereum | Crypto Top | $3.480,00 | 0,00022 |
| SOL/USDT | Solana | Crypto Top | $168,50 | 0,00032 |
| BNB/USDT | Binance Coin | Crypto Top | $585,00 | 0,00020 |
| DOGE/USDT | Dogecoin | Meme/Degen | $0,15 | 0,00045 |
| AVAX/USDT | Avalanche | Crypto Top | $28,50 | 0,00035 |
| LINK/USDT | Chainlink | Crypto Top | $11,80 | 0,00030 |

### Binance-Style Pair Dropdown Selector
Pemilihan pasangan aset menggunakan sistem dropdown interaktif bergaya Binance Web:
- **Trigger Button**: Menampilkan logo koin, simbol ticker aktif, nama aset, chevron dropdown animatif, dan indikator status posisi terbuka.
- **Search Bar Instan**: Input pencarian cepat untuk memfilter koin berdasarkan ticker atau nama (misal ketik: `SOL`, `BTC`, `ETH`).
- **Tab Kategori**: Filter cepat antar kelompok aset (`Semua (10)`, `Crypto Top`, `Meme/Degen`, `Posisi Aktif`).
- **Metrik Pasar Real-time**: Menampilkan live price dan persentase perubahan 24 jam (+% hijau / -% merah) untuk tiap pasangan.
- **Deteksi Posisi Aktif**: Ditandai dengan dot oranye berkedip (*pulsing amber dot*) sehingga pemain selalu mengetahui pair mana yang memiliki transaksi berjalan.
- **Pemberitahuan Simulasi Dunia Nyata**: Terdapat footer disclaimer dan badge "Simulasi Pasar Nyata" yang menegaskan bahwa seluruh ticker, grafik candlestick, dan pergerakan harga merupakan simulasi fraktal fiktif matematis untuk hiburan game, bukan transaksi bursa finansial sesungguhnya.

Semua timeframe yang telah diinisialisasi pada pair aktif menerima tick yang sama.
Mengganti timeframe tidak boleh mengubah entry, harga pasar, atau PnL.

### Membuka posisi

Hanya satu posisi dapat aktif dalam satu waktu. Pemain dapat bebas berpindah melihat chart pair lain ketika posisi sedang terbuka; posisi tetap aktif berjalan dan memantau pergerakan harga pair asalnya (indikator dot oranye muncul pada tombol pair yang memiliki posisi terbuka, dan tombol pintasan "Buka Chart" disediakan pada kartu posisi).
Pilihan awal adalah margin 25% cash dan leverage 10x.

```text
rawMargin = cash Ã— persentase margin
exchangeFee = rawMargin Ã— 1,5%
effectiveMargin = rawMargin âˆ’ exchangeFee
```

Raw margin minimum adalah **$1**. Cash dipotong sebesar raw margin, sedangkan
margin posisi adalah nilai setelah biaya pembukaan.

TP/SL harus berupa angka positif jika diisi:

- LONG: TP lebih tinggi dari entry. SL dapat dipasang di bawah entry (Stop Loss standar), setara entry (Break-Even Point / BEP), atau di atas entry (SL+ / Kunci Cuan) asalkan tidak melewati harga likuidasi dan tidak melampaui harga pasar saat ini.
- SHORT: TP lebih rendah dari entry. SL dapat dipasang di atas entry (Stop Loss standar), setara entry (Break-Even Point / BEP), atau di bawah entry (SL+ / Kunci Cuan) asalkan tidak melewati harga likuidasi dan tidak melampaui harga pasar saat ini.

Validasi dilakukan sebelum cash dipotong. Target tidak valid membatalkan pembukaan.

### Estimasi PnL ($) dan Penyesuaian TP/SL pada Posisi Terbuka (Termasuk BEP & SL+)

1. **Proyeksi Dolar Real-Time pada Form Order**:
   - Saat memasukkan nilai Take Profit (TP), sistem secara otomatis menghitung dan menampilkan estimasi keuntungan dalam nominal dolar dan persentase ROI (misal: `Est. Cuan (LONG): +$17.16 (+69.7%)`).
   - Saat memasukkan nilai Stop Loss (SL), sistem menampilkan estimasi risiko atau profit terproteksi dalam nominal dolar dan persentase ROI (misal: `Est. Rugi (LONG): -$17.96 (-72.9%)` atau saat SL+: `Est. Cuan Terkunci: +$12.50 (+50.0%)`).

2. **Penyesuaian (Adjust) & Drag-and-Drop TP/SL (BEP & SL+)**:
   - Kartu posisi aktif menampilkan nominal target TP dan SL lengkap dengan proyeksi keuntungan/kerugian dolar yang akan diterima jika target tersentuh (contoh: `TP: $450.00 (+$17.16)` dan `SL: $400.00 (-$12.08)`).
   - Pemain dapat menggeser garis SL langsung pada canvas atau mengeklik tombol/badge TP/SL untuk membuka modal penyesuaian:
     - **Break-Even Point (BEP)**: Pemain dapat menempatkan SL tepat di harga entry, menjaga modal terproteksi 100% tanpa risiko kerugian. Garis dan pill sumbu otomatis berubah menjadi **Biru Langit (Sky Blue)**.
     - **SL+ (Kunci Profit / Trailing Lock)**: Pemain dapat menempatkan SL di atas entry untuk posisi LONG (atau di bawah entry untuk posisi SHORT) ketika posisi sudah dalam keadaan profit, sehingga jika pasar berbalik arah profit tetap terkunci aman. Garis dan pill sumbu otomatis berubah menjadi **Hijau Emerald**.
     - **SL Standar**: Garis dan pill sumbu berwarna **Amber/Orange**.
     - Notifikasi toast adaptif memberikan konfirmasi visual instan saat SL digeser ke status BEP atau SL+.
     - Memvalidasi batas harga likuidasi secara ketat sehingga SL tidak dapat dipasang melewati zona likuidasi.
     - Pilihan tombol **"Hapus TP"** dan **"Hapus SL"** jika pemain ingin membatalkan target otomatis.
     - Perubahan target langsung mengupdate garis chart secara instan dan tersimpan ke autosave `localStorage`.

### Tampilan Chart & Skala Rasional Saat Buka Posisi

Pada versi awal, harga likuidasi (`liqPrice`) yang jauh (misalnya jarak 10%–50% pada leverage rendah/menengah) secara paksa dimasukkan ke dalam rentang sumbu Y (`minPrice` dan `maxPrice`). Akibatnya, seluruh candlestick tertekan (*squashed*) menjadi garis horizontal tipis/bintik gepeng yang tidak terbaca, dan blok teks label menutupi sumbu harga kanan.

Sistem chart telah disempurnakan dengan standar platform profesional:
1. **Skala Y Berpusat pada Candlestick & Harga Aktif**: Skala grafik memprioritaskan rentang lilin aktif (`high`/`low`) dan `currentPrice`, dengan batas ketinggian visual minimum (minimal 0,8% dari harga aset) dan padding vertikal 16%. Candlestick tetap proporsional dan dinamis.
2. **TradingView-Style Right Margin (Breathing Room)**: Canvas menyediakan ruang bernapas 6 bar lilin di sisi kanan secara default, meniru konvensi TradingView agar candlestick harga aktif tidak menempel rapat di tepi sumbu dan memberikan ruang proyeksi pergerakan harga ke depan.
3. **Minimum 400 Candlestick per Timeframe**: Mesin candlestick menjamin ketersediaan minimal 400 candle historis untuk setiap timeframe sejak awal sesi login. Hal ini memastikan indikator teknikal periode panjang (khususnya EMA 200, EMA 50, dan EMA 20) langsung terhitung dan muncul sempurna tanpa harus menunggu akumulasi 200 candle baru.
4. **Presisi Harga Pasar & Anti-Overlap UI**:
   - **Degen Perps** (`DEGEN/USDT`, `GORENG/IDR`, `WHALE/USD`): Terstandarisasi tepat 2 angka di belakang koma ($420.69, $1250.00, $69420.00).
   - **Crypto Live**: Mengikuti presisi live bursa riil (DOGE/USDT memakai 4 desimal, koin lainnya 2 desimal).
   - **Stabilisasi Metrik 24 Jam**: Menggunakan baseline harga referensi 24 jam stabil (`degen24hBaselineRef`), melenyapkan glitch lonjakan persentase liar.
   - **Tata Letak Anti-Overlap**: Kolom harga dropdown, wrapper header, serta badge atas (TF, OHLC, Posisi) ditata responsif sehingga tidak bertabrakan atau menutupi sumbu kanan pada layar mobile maupun desktop.
5. **Ekspansi Skala Selektif**: Level posisi (`entryPrice`, TP, SL) hanya memperluas rentang sumbu Y jika berada dalam jangkauan dekat lilin aktif (maksimal ~1,8x span candle). Harga likuidasi hanya masuk ke layar ketika pergerakan pasar sudah mendekati zona kritis likuidasi.
6. **Indikator Off-Screen Navigator**: Jika level likuidasi atau TP/SL berada di luar layar, sistem merender *pill navigator* elegan di sudut canvas (contoh: `▲ LIQ: $458.34 (+9.2%)` atau `▼ LIQ: $380.00 (-9.5%)`) lengkap dengan persentase jarak relatif terhadap harga aktif.
7. **Garis Posisi Halus & Pill Sumbu Bersih**: Garis posisi digambar putus-putus halus (1,2px) dengan pill tag kecil di sisi kiri dan pill harga kontras tinggi di sumbu kanan, tanpa menutupi angka sumbu harga.
8. **Status Header & Card Posisi Responsif**: Di bagian atas canvas terdapat badge ringkas status posisi aktif, serta card posisi bawah yang dilengkapi indikator jarak aman ke harga likuidasi (*safety distance*).
9. **TradingView-Style Interactive X & Y Axis Drag-to-Zoom**: Pengguna dapat melakukan zoom in dan zoom out fleksibel seperti di TradingView dengan menggeser sumbu X (waktu/jam di bawah: drag kanan untuk zoom in memperlebar lilin, drag kiri untuk zoom out) dan sumbu Y (harga di kanan: drag atas untuk zoom in memperluas bentang harga, drag bawah untuk zoom out). Double-click pada sumbu atau klik tombol `AUTO` di pojok kanan bawah mereset zoom kembali ke auto-fit seketika.

### Indikator Teknikal Interaktif pada Chart

Chart terminal kini dilengkapi mesin perhitungan indikator teknikal matematis interaktif yang dapat diaktifkan/dinonaktifkan secara dinamis:
- **EMA 20 (Exponential Moving Average 20)**: Garis kuning keemasan (`#F59E0B`) yang mengukur momentum tren jangka pendek.
- **EMA 50 (Exponential Moving Average 50)**: Garis biru langit (`#38BDF8`) yang mengidentifikasi arah tren menengah dan area dinamis pullback.
- **EMA 200 (Exponential Moving Average 200)**: Garis ungu (`#C084FC`) yang memetakan tren jangka panjang dan mendeteksi persilangan keramat (*Golden Cross* & *Death Cross*).
- **Bollinger Bands (20, 2)**: Garis batas atas (Upper Band) dan batas bawah (Lower Band) bernuansa nila (`#818CF8`) dengan area *cloud fill* semi-transparan dan garis tengah SMA 20 putus-putus. Berguna membaca tingkat volatilitas pasar dan batas jenuh beli/jenuh jual (*overbought/oversold*).
- **Interactive Control Bar Minimalis**: Di atas canvas chart tersedia deretan toggle pill interaktif (`EMA 20`, `EMA 50`, `EMA 200`, `BB (20, 2)`). Tampilan tombol kini dirancang ringkas dan bersih tanpa display numerik harga yang mengganggu, memberikan visual status aktif yang elegan. Pengaturan aktif indikator tersimpan di `localStorage` (`degen_whale_indicators`).

### Alat Gambar Interaktif (TradingView-Style Drawing Tools)

Untuk membantu pemain menganalisa pergerakan harga selayaknya trader profesional di TradingView, tersedia toolbar gambar melayang (*floating toolbar*) di sisi kiri chart canvas:
- **Garis Tren (Trendline)**: Klik titik pertama (harga dan waktu awal), preview garis dashed live mengikuti kursor, klik titik kedua untuk mengunci garis tren lengkap dengan pin jangkar di kedua ujungnya.
- **Garis Horizontal (Support & Resistance Level)**: 1 klik langsung pada layar untuk menempatkan garis horizontal panjang di level harga tersebut, lengkap dengan label harga badge di sumbu harga kanan.
- **Kotak Area (Supply & Demand Zone / Consolidation Box)**: Klik sudut pertama dan sudut kedua untuk membentuk zona persegi panjang berwarna dengan arsiran transparan, berguna menandai area *Order Block* atau konsolidasi harga.
- **Pena Analisis (Freehand Pen)**: Klik dan drag mouse bebas untuk membuat coretan kurva atau anotasi visual pada grafik.
- **Pilih, Reposisi & Ubah Bentuk Gambar (Selection, Reposition & Reshape)**:
  - Setiap gambar yang telah dibuat dapat diklik untuk dipilih (ditandai dengan efek *glow cyan* dan *anchor handles* bulat di titik-titik kontrolnya).
  - **Reposisi Lokasi**: Klik dan seret (drag) badan garis, kotak, atau pill handle garis horizontal untuk memindahkan posisi gambar ke area candlestick lain secara bebas.
  - **Ubah Bentuk (Reshape)**: Seret titik pin jangkar di ujung garis tren atau sudut kotak zona untuk menyesuaikan sudut kemiringan, panjang garis, atau lebar area kotak.
  - **Contextual Floating Toolbar**: Saat gambar terpilih, muncul toolbar melayang di atas canvas yang menampilkan nama tipe gambar, palet perubahan warna instan, tombol **Hapus** (`Trash2`), dan tombol **Batal Pilih** (`Esc`).
  - **Hapus Gambar Individual**: Pemain dapat menghapus gambar yang sedang terpilih dengan menekan tombol **Delete** atau **Backspace** pada keyboard, atau mengklik tombol Hapus pada toolbar kontekstual.
- **Price & Time Coordinate Anchoring**: Seluruh gambar dipetakan ke koordinat harga (USD) dan waktu (timestamp candle). Sehingga saat pengguna melakukan zoom in/out sumbu X atau Y, seluruh garis, kotak, dan coretan tetap melekat kokoh pada posisi candlestick yang semestinya.
- **Palette Warna**: Pemain dapat memilih dari 5 warna kontras trading (`#38BDF8` Sky, `#00FF88` Emerald, `#FF3366` Rose, `#F59E0B` Gold, `#C084FC` Purple).
- **Auto-Exit Pointer & Anti-Duplikasi Drag**:
  - Setelah 1 objek selesai digambar (1 klik horizontal, klik ke-2 garis tren/kotak, atau pelepasan coretan pena), sistem secara otomatis mereset tool kembali ke **Mode Kursor Standar (Selection Mode)** dan langsung menandai objek tersebut sebagai *selected*.
  - Pemain dapat langsung mengklik dan menggeser (*drag*) garis atau titik jangkar ke lokasi baru tanpa resiko membuat garis duplikat baru yang tidak diinginkan.
  - Event `click` yang terpicu setelah operasi geser (*drag-and-drop*) secara otomatis disupresi (`wasDraggingRef`) agar tidak menembakkan perintah pembuatan objek baru saat mouse dilepas.
  - Jika pemain mengklik di atas garis/kotak yang sudah ada saat mode gambar aktif, sistem memprioritaskan pemilihan (*selection*) objek yang disentuh daripada menumpuk gambar baru di titik yang sama.
- **Persistensi per Pasangan Aset**: Gambar disimpan secara terpisah untuk masing-masing koin di `localStorage` (`degen_whale_drawings`).
- **Canvas Clipping & Boundary Protection**: Seluruh area plotting grafik (candlestick, indikator, posisi, dan user drawings) dilindungi dengan *clipping mask* presisi `[0, 0, chartWidth, chartHeight]`. Hal ini menjamin secara mutlak bahwa tidak ada garis tren, kotak zona, garis horizontal, glow seleksi, maupun coretan bebas yang dapat menembus atau menutupi Sumbu Waktu (Time X Axis) di bagian bawah maupun Sumbu Harga (Price Y Axis) di sisi kanan. Sumbu waktu dan sumbu harga dirender pada layer atas dengan proteksi pill harga agar tidak menutupi tombol kontrol `AUTO`.

### Tampilan Grafik Ekstra Lebar (Collapsible Sidebar & Notifikasi Misi)

Untuk memberikan ruang analisa teknikal yang jauh lebih luas dan imersif:
- **Sidebar Infrastruktur & Misi Collapsible**: Panel kanan (Infrastruktur, Misi & Tugas, dan Log Trade) kini dapat ditutup atau dibuka kapan saja melalui tombol toggle di header grafik (`PanelRightClose` / `PanelRightOpen`) atau tombol Tutup di dalam panel sidebar.
- **Ekspansi Layout Otomatis**: Saat sidebar ditutup, area grafik otomatis meluas dari 7 kolom menjadi 12 kolom penuh (*full-width span*), dan ketinggian canvas membesar dari 380px menjadi hingga 520px pada layar desktop.
- **Dot Notifikasi Misi & Tugas Siap Klaim**: Jika sidebar sedang ditutup dan ada hadiah misi atau tugas yang memenuhi syarat klaim, muncul *badge dot* berdenyut (*pulse*) dengan angka jumlah poin misi yang siap diklaim pada tombol toggle header serta pada tombol aksi cepat melayang di pojok kanan bawah.

### PnL dan Perhitungan Keuntungan Posisi

Fitur *funding rate* holding telah dinonaktifkan sepenuhnya. Perhitungan keuntungan dan kerugian (*Unrealized PnL*) kini **100% murni mengikuti pergerakan harga pasar dan leverage**:

```text
LONG priceReturn = (currentPrice − entryPrice) / entryPrice
SHORT priceReturn = (entryPrice − currentPrice) / entryPrice

ROI (%) = priceReturn × leverage × 100
PnL ($) = effectiveMargin × (ROI / 100)
```

- **SHORT**: Ketika harga pasar berada di bawah harga entry, posisi **selalu profit positif (hijau)**.
- **LONG**: Ketika harga pasar berada di atas harga entry, posisi **selalu profit positif (hijau)**.
- **Bebas Biaya Holding**: Tidak ada lagi potongan penalti holding per detik atau pengurangan ROI seiring berjalannya waktu. Trader dapat menahan posisi dengan tenang sesuai analisa teknikal tanpa khawatir profit harga tergerus funding rate.

### Menutup posisi

Posisi bisa ditutup manual atau otomatis ketika TP/SL tersentuh.

```text
closingTax = PnL positif ? PnL Ã— 1% : 0
cash kembali = max(0, effectiveMargin + PnL âˆ’ closingTax)
```

Contoh saat harga tidak bergerak:
raw margin $10 dipotong opening tax 1,5% menjadi effective margin $9,85.
Jika posisi ditutup tanpa pergerakan harga pasar, cash yang dikembalikan adalah $9,85.

### Likuidasi

```text
LONG liquidationPrice = entryPrice × (1 − 0,92 / leverage)
SHORT liquidationPrice = entryPrice × (1 + 0,92 / leverage)
```

Likuidasi terjadi jika harga pasar menyentuh liquidationPrice atau ROI mencapai **−95% atau lebih rendah**.
Saat likuidasi, margin efektif dianggap hilang seluruhnya dan trade dicatat
dengan ROI âˆ’100%. Pemeriksaan likuidasi didahulukan daripada TP/SL.

Penyelesaian posisi dijaga agar tidak menggandakan pengembalian cash atau riwayat.

## 6. Infrastruktur

Penghasilan berikut adalah nilai dasar per level, sebelum multiplier dan upkeep.

| Infrastruktur | Harga awal | Penghasilan/detik | Faktor harga |
| --- | ---: | ---: | ---: |
| Indikator Garis Keramat | $25 | $0,38 | 1,22 |
| Grup VIP Sinyal â€œPasti Cuanâ€ | $280 | $2,20 | 1,25 |
| Layar Monitor Vertical (4x) | $4.200 | $15 | 1,28 |
| Sniper Bot (Solana/DEX) | $75.000 | $110 | 1,30 |
| Sewa Quant Developer | $1,5 juta | $900 | 1,32 |
| Agentic AI Trading Cluster | $45 juta | $7.800 | 1,34 |
| Bikin Exchange & Koin Sendiri | $2 miliar | $75.000 | 1,35 |
| Tim Lobi Regulator & Pajak | $95 miliar | $880.000 | 1,36 |
| Satelit Arbitrase Kuantum | $6 triliun | $13 juta | 1,37 |
| Akuisisi Mesin Cetak Bank Sentral | $350 triliun | $260 juta | 1,38 |

Harga pembelian berikutnya:

```text
surge = level saat ini >= 25 ? 1,05^(level âˆ’ 24) : 1
harga = baseCost Ã— costScale^level Ã— surge
```

Level awal nol. Setiap pembelian menambah satu level dan penghasilan dasar item.
Tidak ada batas level eksplisit, tetapi harga naik eksponensial.

## 7. Workstation dan rank

Lokasi ditentukan otomatis berdasarkan **peak net worth dan Whale Token**.
Kedua syarat harus terpenuhi.

| Level | Workstation | Rank | Peak net worth | Token | Upkeep | Aset Visual 3D |
| --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | Kamar Kos Sempit | Exit Liquidity | $0 | 0 | 5% | `/levels/level-1.jpg` (Diorama Kos & Laptop) |
| 2 | Warnet VIP 24 Jam | Scalper Receh | $25.000 | 0 | 10% | `/levels/level-2.jpg` (Diorama Warnet RGB) |
| 3 | Ruko 2 Lantai | Bandar Lokal | $5 juta | 1 | 15% | `/levels/level-3.jpg` (Diorama Trading Shophouse) |
| 4 | Penthouse SCBD | Market Mover | $1,5 miliar | 5 | 20% | `/levels/level-4.jpg` (Diorama Penthouse Glass) |
| 5 | Sovereign Whale Private Island | Sovereign Whale | $500 miliar | 20 | 25% | `/levels/level-5.jpg` (Diorama Luxury Crypto Island) |
| 6 | Shadow Citadel di Bulan | Interplanetary Syndicate | $250 triliun | 75 | 30% | `/levels/level-6.jpg` (Diorama Lunar Dome Base) |
| 7 | The Architect of Singularity | God of Liquidity | $50 kuadriliun | 250 | 40% | `/levels/level-7.jpg` (Diorama Cybernetic Singularity) |

Naik lokasi mengubah identitas visual secara drastis dengan ilustrasi 3D Diorama Isometric premium yang berputar otomatis secara mulus, rank, dan biaya operasional. Section Workstation & Rank 3D diposisikan di paling atas halaman (full-width) serta mengintegrasikan metrik kas/DPS/net worth langsung di kartu. Pemain dapat meninjau seluruh 7 tier visual beserta status terbuka/terkunci melalui tombol **"Buka Galeri"**. Tidak ada bonus
pendapatan langsung dari naik lokasi; upkeep justru bertambah seiring bertambahnya kemewahan workstation.

Karena syarat menggunakan peak, kerugian biasa tidak menurunkan lokasi dalam
putaran yang sama. Prestige mengembalikan peak ke $10, sehingga lokasi turun lagi.

## 8. Prestige dan Whale Token

Prestige ditampilkan sebagai **Launch Token Baru & Rugpull**, dalam konteks
satire game. Prestige pertama tersedia pada peak net worth $50.000.

```text
jika peakNetWorth < 50.000: token baru = 0
totalPotential = floor((peakNetWorth / 50.000)^0,28)
token baru = max(0, totalPotential âˆ’ token yang sudah dimiliki)
```

Setiap token menambah **0,5x multiplier pendapatan pasif**:

| Token | Multiplier |
| ---: | ---: |
| 0 | 1x |
| 1 | 1,5x |
| 2 | 2x |
| 10 | 6x |

Bonus tidak langsung mengalikan profit trading. Karena token lama dikurangkan
dari total potensi, mengulang peak yang sama tidak memberi token tambahan.

Saat prestige:

- Token baru ditambahkan dan token lama dipertahankan.
- Cash dan peak dikembalikan menjadi $10.
- Semua level infrastruktur dikosongkan.
- Posisi aktif dihapus, bukan ditutup dengan pengembalian equity.
- Event, boost, alert, dan input TP/SL dibersihkan.
- Riwayat trade dan cooldown bantuan harian tetap dipertahankan.

Tutup posisi lebih dahulu jika ingin menyelesaikan trade sebelum prestige.

## 9. Event dan bantuan

Timer memeriksa peluang memulai event setiap 60 detik (1 menit). Event baru tidak dimulai
ketika event lain atau alert likuidasi masih aktif.

Event **Hacker Attack** baru mulai dapat muncul ketika pemain telah mencapai rank **Bandar Lokal (Level 3)** ke atas. Untuk rank di bawahnya (Level 1 Exit Liquidity dan Level 2 Scalper Receh), hanya event Bull Run dan SEC Crackdown yang dapat terjadi (peluang ~50% : 50%).

Untuk rank **Bandar Lokal ke atas**:

| Event | Peluang pemilihan | Syarat Rank | Efek |
| --- | ---: | --- | --- |
| Bull Run | 25% | Semua Rank | Pendapatan pasif 5x selama 20 detik; drift harga sedikit naik |
| Hacker Attack | 40% | Bandar Lokal (Lv. 3) ke atas | Waktu 4 detik untuk menyelamatkan aset |
| SEC Crackdown | 35% | Semua Rank | Pendapatan pasif turun 55% selama 25 detik; drift sedikit turun |

### Hacker Attack

Jika tombol **Withdraw ke Cold Wallet** ditekan tepat waktu:

```text
bonus = max($5, netDps Ã— 1,5)
```

Ancaman dibatalkan dan bonus masuk ke cash. Ini bukan sistem cold wallet
persisten atau wallet terpisah.

Jika terlambat:

- Cash dipotong 25%.
- Satu level dihapus dari jenis infrastruktur tertinggi yang sedang dimiliki.
- Penalti tidak diproses dua kali untuk event yang sama.

### Bantuan harian

Memberikan **$5 setiap 24 jam sejak klaim terakhir**, bukan reset pada tengah malam.
Cooldown disimpan dan tetap berlaku setelah refresh. Tombol klaim otomatis dinonaktifkan (`disabled`) dengan status "Sudah Diklaim Hari Ini" selama periode cooldown berlangsung.

### Dana talangan

Setelah likuidasi:

```text
dana talangan = max($5, margin hilang Ã— 20%)
```

Tidak ada iklan sungguhan, pembayaran, atau integrasi monetisasi.

## 10. Save, Akun Cloud, dan Pendapatan ketika Ditutup

### Sistem Penyimpanan Hibrida (LocalStorage + Cloud PostgreSQL)

Game menggunakan arsitektur hibrida untuk menjamin pengalaman bermain yang instan, tahan offline, sekaligus tersinkronisasi lintas perangkat:

1. **LocalStorage Browser (Lokal & Offline)**:
   - Kunci aktif: `degen_whale_save_v8`.
   - Kunci migrasi: `degen_whale_save_v7`.
   - Mengamankan status game secara instan tanpa jeda jaringan setiap 3 detik, saat transaksi selesai, dan saat event `pagehide`/`visibilitychange`.

2. **Akun Pemain & Cloud Database (Neon Serverless PostgreSQL)**:
   - Pemain dapat bermain anonim sebagai Tamu (Guest) atau mendaftarkan akun di `/auth`.
   - Password dienkripsi dengan standar industri PBKDF2 (100.000 iterasi, salt acak per pengguna, SHA-512) tanpa ketergantungan library eksternal.
   - Sesi login dikelola lewat cookie `degen_session` yang ditandatangani HMAC-SHA256 (`HttpOnly`, `SameSite=Lax`).
   - Seluruh payload state game (cash, peak, whale tokens, level pasif, kupon black market, posisi aktif, hingga coretan drawing chart) disimpan utuh di kolom `savePayload Json` pada tabel `GameSave`.
   - **Auto-Hydration**: Saat pemain login di browser lain atau perangkat baru dalam kondisi localstorage kosong/default, sistem secara otomatis menarik data save terbaru dari cloud dan memulihkan sesi permainan tanpa perlu ekspor/impor file manual.
   - **Pemisahan Database**: Menggunakan fitur database branching Neon, di mana branch `dev` (Preview) terisolasi penuh dari branch `production` (`main`).

Data yang disimpan mencakup cash, peak, token, level infrastruktur, posisi aktif,
TP/SL, hingga 20 riwayat trade, 50 riwayat mutasi kas, cooldown bantuan, pair/timeframe,
harga pair, boost, event, alert likuidasi, inventaris black market, dan timestamp.

Save dilakukan:
1. Saat game selesai diinisialisasi.
2. Setiap tiga detik melalui interval tetap (dan otomatis di-debounce ke cloud server).
3. Setelah perubahan transaksi penting (order trading, upgrade, klaim reward, prestige).
4. Ketika halaman disembunyikan atau menerima `pagehide`.

### Migrasi

Save v7 dibaca jika v8 belum tersedia. Migrasi hanya dapat dilakukan jika save
lama berada pada origin browser yang sama.

**Save ClickUp tidak otomatis tersedia pada localhost atau domain deployment.**
Skema, hostname, dan port membentuk origin berbeda. `localhost:3000` juga berbeda
dengan `127.0.0.1:3000`.

Posisi aktif yang sudah hilang pada versi v7 tidak dapat direkonstruksi karena
versi lama memang tidak menyimpannya.

### Penghasilan ketika game ditutup

- Berlaku untuk jeda minimal 5 detik saat load ulang.
- Dibatasi maksimal **8 jam**.
- Menggunakan pendapatan pasif tanpa multiplier event.
- Menggunakan level, token, dan upkeep dari kondisi simpanan.
- Dana langsung masuk cash; modal hanya memberitahukan hasil.
- Harga posisi dijeda selama game ditutup.
- Boost berkurang sesuai durasi yang dihitung saat load.
- Alert yang belum selesai dipulihkan agar refresh tidak menghapus ancaman.

Tab latar belakang yang ditahan browser tidak dijamin menyimulasikan waktu penuh.
Timer membatasi langkah waktu satu tick maksimal satu detik; perhitungan
pendapatan ketika ditutup dilakukan saat game dimuat ulang.

### Hard reset

Hard reset meminta konfirmasi dan menghapus progres permainan, termasuk token,
cash, peak, infrastruktur, posisi, riwayat, cooldown, boost, event, dan chart.
Kunci save lama dan baru dihapus, kemudian kondisi awal disimpan kembali.

Hard reset berbeda dengan prestige: prestige mempertahankan Whale Token.

## 11. Statistik dan flex card

Kartu **Cetak PnL** menampilkan rank, kekayaan, pendapatan pasif, dan ROI.
Tombol salin menghasilkan teks statistik, bukan file gambar.

Label â€œAll-Time ROIâ€ dihitung dengan:

```text
(netWorth saat ini âˆ’ 10) / 10 Ã— 100%
```

Angka tersebut bukan metrik kinerja investasi profesional, bukan jumlah seluruh
profit trade, dan bukan total lintas-prestige. Bantuan, bonus event, serta
pendapatan pasif juga memengaruhinya.

Berita **Terminal Feed** adalah teks satire yang bergilir sekitar setiap delapan
detik, bukan berita finansial real-time.

## 12. Arsitektur Next.js

### Stack

| Komponen | Konfigurasi paket |
| --- | --- |
| Next.js | `^16.2.1`, App Router |
| React / React DOM | `^19.2.0` |
| Tailwind CSS | `3.4.18` |
| Ikon | `lucide-react` `0.577.0` |
| TypeScript | `^5.6.3` |
| Browser tests | Playwright `^1.58.2` |
| Node.js | Minimum 20.9; `.nvmrc` memakai 22 |

Versi dengan `^` adalah rentang dependency, bukan bukti versi yang sudah
terpasang. Instalasi pertama akan menghasilkan lockfile.

### Struktur

```text
src/
  app/
    layout.tsx
    page.tsx
    loading.tsx
    error.tsx
    globals.css
  components/
    GameClient.tsx
    GameLoading.tsx
    game/
      Game.jsx
      RuntimeGuard.jsx
tests/
  game.spec.js
  startup.spec.js
  nextjs.spec.js
next.config.ts
tailwind.config.ts
postcss.config.mjs
playwright.config.ts
playwright.production.config.ts
tsconfig.json
package.json
README.md
VERIFICATION.json
```

### Alur rendering

```text
App Router page
  â†’ GameClient
  â†’ dynamic import, ssr: false
  â†’ RuntimeGuard
  â†’ TradingGame
```

`GameClient.tsx` adalah Client Component. Dynamic import tanpa SSR mencegah
inisialisasi localStorage dan candle acak di server. Loading screen tampil
selama modul game dimuat.

`RuntimeGuard` menampilkan layar pemulihan jika terjadi error render/effect yang
dapat ditangkap React. `app/error.tsx` menyediakan pemulihan pada tingkat route.
Keduanya tidak menjamin menangkap seluruh error event handler, timer, atau
kegagalan browser sebelum JavaScript aplikasi berjalan.

Halaman dan konfigurasi memakai TypeScript, tetapi engine asli dipertahankan
sebagai JSX. `allowJs: true` dan `checkJs: false` berarti proyek ini **belum
merupakan konversi TypeScript strict untuk seluruh engine**.

## 13. Instalasi dan menjalankan proyek

Ekstrak `degen-whale-nextjs.zip`, lalu buka terminal pada folder yang berisi
`package.json`. Siapkan Node.js 22 beserta npm.

```bash
npm install
npm run dev
```

Buka **http://localhost:3000**.

Jika menggunakan nvm:

```bash
nvm install
nvm use
```

### Build production

```bash
npm run typecheck
npm run build
npm run start
```

`npm run start` memerlukan build yang berhasil.

### Menjalankan tes

```bash
npx playwright install chromium
npm test
```

Untuk production:

```bash
npm run test:production
```

Perintah production membangun aplikasi lalu mengetes `next start`. Pastikan port
3000 tidak digunakan proses lain.

### Deployment

Gunakan hosting yang mendukung Next.js 16 dan Node.js minimal 20.9.
Tidak ada environment variable wajib.

Setelah `package-lock.json` dibuat dan disimpan di repository:

```text
Install: npm ci
Build:   npm run build
Start:   npm run start
```

Tidak ada Dockerfile atau pipeline deployment yang disertakan pada paket saat
ini. Deployment belum diverifikasi.

## 14. Pengujian dan status verifikasi

### Artifact asal

Artifact V2 telah lulus **21 tes browser** pada runtime artifact, termasuk
mekanisme game, iframe tanpa storage, kompatibilitas tanpa `randomUUID`,
serta layar pemulihan error.

### Paket Next.js

Paket menyertakan **21 tes**, dengan komposisi berbeda:

- 17 tes mekanisme dan UI game.
- 1 tes startup.
- 3 tes Next.js/kompatibilitas: hydration, API UUID tidak tersedia,
  dan localStorage diblokir.

Pemeriksaan statis saat paket dibuat:

| Pemeriksaan | Hasil |
| --- | --- |
| Sintaks JSX/TSX/JS/TS | 16 file lolos transpiler |
| Resolusi import lokal yang diperiksa | 6 lolos |
| Tailwind | CSS berhasil dihasilkan |
| Kesamaan engine dengan artifact V2 | Cocok, selain penambahan `use client` |
| Build Next.js | **Belum dijalankan** |
| Typecheck proyek Next.js lengkap | **Belum dijalankan** |
| Tes browser pada Next.js | **Belum dijalankan** |
| Deployment production | **Belum diuji** |

Percobaan `npm run build` terhenti sebelum build dimulai karena npm tidak
tersedia dan Next.js belum terpasang. Lingkungan pembuat paket tidak memiliki
akses internet untuk menginstal dependency.

**Lolos tes artifact tidak berarti build Next.js atau React 19 sudah lolos.**
Jalankan instalasi, typecheck, build, dan tes di lokal sebelum deployment.

## 15. Perbaikan yang sudah diterapkan

1. Timer pendapatan membaca nilai DPS terbaru tanpa bergantung pada pergantian pair.
2. Autosave tidak diulang dari nol setiap cash berubah.
3. Harga transaksi dipisahkan dari pilihan timeframe.
4. Posisi, margin, dan TP/SL dipulihkan setelah refresh.
5. Penghasilan ketika game ditutup dihitung dengan batas delapan jam.
6. Target TP/SL divalidasi sebelum transaksi.
7. Settlement posisi dan event dijaga dari pemrosesan ganda.
8. Hard reset membersihkan state terkait dan meminta konfirmasi.
9. Tombol pemicu event debug dihapus untuk menutup eksploit bonus.
10. Kegagalan clipboard dan storage ditangani dengan notifikasi.
11. Fitur mentor lokal dan funding rate holding ditiadakan untuk menjaga gameplay murni dan performa bersih.
12. Pembuatan ID tidak lagi membutuhkan `crypto.randomUUID`.
13. Error boundary ditambahkan agar error render dapat menampilkan pemulihan.
14. Sinkronisasi multi-tab dan tab-locking via `BroadcastChannel` diterapkan sehingga tab sekunder dijeda otomatis untuk mencegah data tertimpa, dengan opsi ambil alih sesi aktif.

Biaya trading, rumus prestige, dan ekonomi inti tidak diseimbangkan
ulang dalam patch ini.

## 16. Batasan dan troubleshooting

### Batasan

- Single-player dan local-first; tidak ada autentikasi atau cloud save.
- Data browser dapat dihapus atau dimodifikasi pemain; tidak ada anti-cheat.
- Beberapa tab pada origin yang sama dilindungi oleh BroadcastChannel lock, di mana hanya satu tab aktif yang menjalankan game loop dan autosave.
- Browser yang ditutup paksa dapat kehilangan perubahan sejak checkpoint terakhir.
- Tidak ada pemulihan posisi lama yang tidak pernah tersimpan.
- Harga/candle sintetis, bukan representasi pasar nyata.
- Tidak ada export/import save dalam UI.
- Belum ada pengujian endgame jangka panjang atau seluruh browser.
- Harga upgrade eksponensial dan angka sangat besar masih bergantung pada
  batas presisi `Number` JavaScript.
- Progress bar workstation menonjolkan syarat kekayaan; jumlah token tetap
  diperiksa oleh logika walaupun belum ditampilkan lengkap di progress bar.

### Halaman kosong

1. Pastikan server lokal sudah berjalan dan URL memakai port yang benar.
2. Periksa Console browser dan output terminal.
3. Jika ada layar pemulihan, coba tombol muat ulang dan catat pesannya.
4. Setelah perubahan dependency, hentikan server, hapus folder `.next`,
   jalankan `npm install`, lalu `npm run dev` kembali.
5. Jangan langsung menghapus localStorage karena progres ikut terhapus.

Layar artifact yang kosong pada browser pengguna belum berhasil direproduksi
secara pasti. Tidak ada klaim bahwa penyebab tersebut sudah ditemukan.

### `npm: command not found`

Pasang Node.js beserta npm, buka terminal baru, lalu periksa:

```bash
node --version
npm --version
```

### Progres tidak muncul setelah pindah alamat

Pastikan menggunakan browser, profil, hostname, port, dan skema yang sama.
Origin berbeda berarti storage berbeda.

### Kas tidak bertambah

Periksa apakah sudah memiliki infrastruktur. Cash awal $10 saja tidak menghasilkan
pendapatan. Saat Net DPS nol, menunggu tidak menambah kas.

### Biaya pembukaan posisi

Periksa biaya pembukaan (1,5%). Ini sengaja dipertahankan sebagai
bagian ekonomi game, bukan otomatis bug chart.

## 17. Arah pengembangan

Bagian ini adalah **usulan**, belum diimplementasikan:

- Ekspor/impor save untuk perpindahan browser atau domain.
- Validasi save lebih ketat, backup berlapis, dan koordinasi antar-tab (Tab Locking via BroadcastChannel telah aktif).
- Persistensi Candlestick & Anchor Posisi: 45 candle historis per pair/timeframe disimpan ke localStorage (`SAVE_KEY`), dan `openedAt` di-anchor pada posisi aktif sehingga riwayat chart tidak berubah acak saat reload browser.
- Sinkronisasi Multi-Timeframe Fraktal: 10 timeframe (`5s` hingga `1d`) kini tersinkronisasi 100% secara hirarkis sesuai simulasi dunia nyata. Candle di timeframe lebih tinggi merupakan agregasi eksak (Open, High, Low, Close) dari rentang waktu timeframe yang lebih rendah, dengan penutupan bar saat ini yang serentak mengunci harga pasar terkini dan sumbu waktu bawah (`time axis`) yang akurat.
- Konversi engine penuh ke TypeScript dengan model state yang jelas.
- Pemisahan engine ekonomi, pasar, persistence, dan UI ke modul teruji.
- Balancing awal permainan, biaya leverage, prestige, dan endgame.
- Indikator syarat token yang lebih jelas pada progress workstation.
- Tes Next.js production, tes lintas-browser, dan soak test durasi panjang.
- Backend serta cloud save jika permainan membutuhkan akun lintas-perangkat.
- Integrasi AI melalui backend yang aman, hanya jika benar-benar dibutuhkan.

## 18. Sistem Misi & Tugas Likuiditas (Quest & Task System)

### Filosofi Desain & Kalibrasi Ekonomi
Sistem misi dirancang sebagai panduan awal (*onboarding catalyst*) bagi pemain baru untuk memahami fitur trading terminal (Leverage, Take Profit, Stop Loss, Multi-Timeframe, dan Upgrade Infrastruktur) sekaligus sumber pendapatan tambahan.

Sesuai instruksi balancing ekonomi: **Hadiah misi dikalibrasi secara ketat terhadap biaya infrastruktur pasif** agar permainan tetap menantang dan tidak menjadi terlalu mudah (*anti-inflationary balance*):
- **Indikator Garis Keramat (Lv 1)** berharga `$25.00`. Total hadiah seluruh Misi 1 adalah `$7.50` (30% modal awal; pemain tetap wajib trading aktif untuk mengumpulkan sisa $17.50).
- **Grup VIP Sinyal (Lv 1)** berharga `$280.00`. Total hadiah seluruh Misi 2 adalah `$25.50` (9% modal).
- **Layar Monitor Vertical 4x (Lv 1)** berharga `$4,200.00`. Total hadiah Misi 3 adalah `$250.00` (6% modal).
- **Tugas Harian (Daily Quests)** dibatasi maksimal `~$10.00 / hari` (hanya cukup sebagai jaring pengaman likuiditas jika saldo menipis).

### Struktur Misi & Sistem Progresi Bertingkat (Progressive Unlock)

Misi disusun secara bertingkat dan terkunci secara sekuensial untuk menciptakan alur permainan yang terarah:

#### 1. Milestone Onboarding (12 Misi Bertingkat)
- **Misi 1: Kamar Kos (Onboarding Pemula)** *(Aktif di awal permainan)*
  1. `Buka Posisi Pertama` ($1.50): Membuka 1 posisi leverage trading (LONG atau SHORT).
  2. `Analisis Multi-Aset` ($1.50): Mengganti pair koin atau timeframe chart.
  3. `Cuan Pertama` ($2.00): Menutup posisi trading dalam kondisi profit bersih > $0.
  4. `Trader Disiplin` ($2.50): Memasang target Take Profit atau Stop Loss pada posisi aktif.
- **Misi 2: Cashflow Pasif** *(Syarat: Selesaikan seluruh 4 tugas di Misi 1 + Beli "Indikator Garis Keramat")*
  5. `Pasang Indikator Bot` ($3.00): Membeli upgrade Indikator Teknikal Lv 1.
  6. `Klaim Bansos Harian` ($2.50): Mengklaim bantuan dana harian di workstation.
  7. `Scalper Rajin` ($5.00): Menyelesaikan total 5 kali transaksi trading leverage.
  8. `Grup VIP Sinyal` ($15.00): Membeli upgrade Komunitas Grup VIP Sinyal Lv 1.
- **Misi 3: Sultan Warnet** *(Syarat: Selesaikan seluruh 4 tugas di Misi 2 + Beli "Grup VIP Sinyal")*
  9. `Trader Konsisten` ($20.00): Mencapai Peak Net Worth sebesar $100.00.
  10. `Degen Berani` ($30.00): Menang trade dengan leverage tinggi 50x atau 100x.
  11. `Whale Komersial` ($50.00): Mencapai Peak Net Worth sebesar $1,000.00.
  12. `Mesin Passive Income` ($150.00): Mencapai pendapatan pasif (Net DPS) minimal $10.00/detik.

#### 2. Tugas Harian (Daily Quests - Reset 24 Jam)
Tiap pergantian hari kalender (`YYYY-MM-DD`), progres dan klaim tugas harian di-reset otomatis:
1. `Scalping Harian` ($2.50): Melakukan 3 transaksi trading hari ini.
2. `Cuan Harian` ($2.50): Mengumpulkan akumulasi profit trading $5.00 hari ini.
3. `Disiplin Risk Management` ($2.00): Memasang TP atau SL 1x hari ini.
4. `Perawatan Rig` ($3.00): Membeli/upgrade minimal 1 infrastruktur pasif hari ini.

### Antarmuka Pengguna (UI & UX)
- **Tab Panel Kanan**: Tombol tab `[Misi & Tugas]` berdampingan dengan `[Infrastruktur]` dan `[Log Trade]`.
- **Badge Notifikasi Real-time**: Menampilkan counter menyala hijau (*pulsing neon badge*) saat ada misi atau tugas harian yang siap diklaim (misi yang masih terkunci tidak dihitung dalam notifikasi).
- **Filter Kategori**: Filter cepat (`Semua`, `Harian (24J)`, `Misi 1`, `Misi 2`, `Misi 3`) dengan ikon gembok pada kategori yang belum terbuka.
- **Banner Persyaratan Terkunci**: Menampilkan kartu informatif yang memandu pemain mengenai syarat membuka misi berikutnya beserta status pencapaiannya secara real-time.
- **Progress Bar Interaktif**: Menampilkan persentase pencapaian serta indikator numerik (misal: `3/5` atau `$45.00/$100.00`).
- **Feedback Klaim**: Tombol klaim interaktif memicu toast konfirmasi sukses dan penambahan kas secara instan.
- **Persistensi Data**: Status klaim dan statistik pelacakan disimpan ke `localStorage` (`SAVE_KEY`), aman dari reload halaman maupun sinkronisasi multi-tab.

## 19. Optimasi Layout & Visualisasi Candlestick TradingView

### Batasan Tinggi Section Panel Kanan (Infrastruktur, Misi, Log Trade)
Untuk mencegah kontainer kanan merentang tanpa batas (*excessive vertical height*) saat kartu tugas atau infrastruktur bertambah banyak, kontainer panel kanan (`lg:col-span-5`) dibatasi dengan:
- **Tinggi Maksimum**: `max-h-[560px]` (mobile), `sm:max-h-[620px]`, dan `lg:h-[640px] lg:max-h-[640px]` (desktop).
- **Sejajar Kolom Kiri**: Tinggi ini presisi mengimbangi total tinggi kolom kiri (Chart Terminal + Panel Kontrol Trading).
- **Internal Overflow Scrolling**: Kontainer kartu di dalamnya dilengkapi `flex-1 min-h-0 overflow-y-auto`, sehingga bilah tab navigasi di bagian atas tetap diam (*pinned header*) sementara daftar item dapat di-scroll lancar tanpa menghabiskan ruang halaman web.

### Candlestick Countdown Timer pada Mark Price
Sesuai standar TradingView, tepat di bawah (atau di atas) badge **Mark Price** pada sumbu harga kanan, kini ditampilkan **countdown timer real-time** penutupan bar candlestick:
- **Format Timer**:
  - Timeframe detik/menit (`5s`, `15s`, `30s`, `1m`, `5m`, `15m`, `30m`): format `mm:ss` (misal: `00:04`, `03:25`).
  - Timeframe jam/hari (`1h`, `4h`, `1d`): format `hh:mm:ss` (misal: `03:45:12`).
- **Sinkronisasi Presisi**: Timer dihitung langsung dari batas bucket waktu UTC/epoch candlestick terkini dan diperbarui setiap detik, sehingga tepat saat hitungan mencapai `00:00`, candlestick baru langsung terbentuk serentak.

### Arsitektur Candlestick & Behaviour Zoom Mirip TradingView
Sebelumnya, riwayat candlestick dibatasi hanya `45` bar di memori dan persistensi, sehingga ketika pengguna melakukan Zoom Out (geser sumbu X/waktu ke kiri), candlestick yang muncul tidak pernah melebihi 45 batang dan kurang memadai untuk analisa teknikal.

Pembaruan arsitektur candlestick:
1. **Buffer Riwayat Diperbesar (300 Bar)**:
   - Generator fraktal (`generateSynchronousCandlesForPair`) kini mempertahankan **300 bar historis** di setiap timeframe (`5s` hingga `4h`) dan ~52 bar harian untuk `1d`.
   - Penyimpanan `localStorage` (`SAVE_KEY`) dan update tick real-time dipatok pada 300 bar.
2. **Kerapatan & Skala Zoom (TradingView Dynamic Density)**:
   - **Default (1.0x)**: Menampilkan **65 candlestick** secara default (standar kerapatan TradingView pada viewport desktop).
   - **Zoom In Maksimal (3.5x)**: Menampilkan **~19 candlestick** lebar dengan detail sumbu wick dan formasi body yang sangat jelas untuk analisa micro entry.
   - **Zoom Out (0.5x)**: Menampilkan **130 candlestick**.
   - **Zoom Out Maksimal (0.25x)**: Menampilkan hingga **260 candlestick** sekaligus untuk analisa struktur tren makro, swing high/low, dan level support/resistance multi-siklus.
### Proportional Slot-Width Rendering:
- Posisi horizontal tiap candlestick dihitung via slot tengah `(idx + 0.5) * slotWidth` dengan lebar batang `candleWidth = Math.max(1, Math.min(22, slotWidth * 0.72))`.
- Menghilangkan pergeseran visual (*visual offset/drift*) dan mencegah candle saling bertumpukan ketika 200+ candle dirender bersamaan.
- Ketebalan garis wick dan pelacakan kursor hover otomatis beradaptasi dengan kerapatan slot saat zoom in/out.

## 20. Chart Responsive Dynamics & 3D Architectural Turntable Diorama

### Perbaikan Koordinat Kursor & Rasionalisasi Chart Melebar (Sidebar Toggle)
1. **Penyebab Bug Awal**:
   - Ketika sidebar infrastruktur ditutup (`isSidebarOpen: false`), kontainer chart CSS melebar dari `col-span-7` menjadi `col-span-12` dan tinggi canvas bertambah dari 380px ke 520px (transisi CSS 300ms).
   - Namun, atribut bitmap canvas DOM (`canvas.width` dan `canvas.height`) tidak diperbarui karena event resize lama hanya mengandalkan `window.onresize`. Akibatnya browser meregangkan bitmap lama, menyebabkan koordinat kursor dan titik hover melompat/tidak akurat.
2. **Solusi Implementasi**:
   - **`ResizeObserver` Aktif**: Terhubung langsung ke elemen canvas dengan dependency `[isSidebarOpen]` dan timer sinkronisasi berjenjang (50ms, 150ms, 320ms) untuk menyinkronkan setiap frame transisi CSS.
   - **Bitmap Scaling Safety Guard**: Seluruh event handler mouse (`handleCanvasMouseDown`, `handleCanvasMouseMove`, `handleCanvasClick`) mengalikan koordinat dengan `scaleX = canvas.width / rect.width` dan `scaleY = canvas.height / rect.height`.
   - **Rasionalisasi Kerapatan Lilin**:
     `baseCandles = Math.max(45, Math.min(140, Math.round(chartWidth / 11)))`
     Jumlah lilin bertambah proporsional secara dinamis saat chart melebar dari ~65 lilin (mode sidebar terbuka) menjadi ~114+ lilin (mode full-width), menjaga visual candlestick tetap rapi, proporsional, dan tidak melar/renggang aneh.
   - **Crosshair Hover Bersih Tanpa Dot (Clean Crosshair UX)**:
     Kursor hover menampilkan garis crosshair halus dan label harga/waktu di sumbu tanpa bulatan/dot pada lilin, menjaga visibilitas candlestick tetap jernih dan bebas distorsi visual.
   - **Penempatan Tag Posisi di Tengah Chart & Estetika Garis Minimalis (Clean TradingView Aesthetics)**:
     - **Garis Posisi Rapi**: Garis horizontal posisi (`ENTRY`, `LIQ`, `TP`, `SL`) menggunakan garis putus-putus ramping (`1.0px`, dash `[5, 4]`) tanpa glow tebal yang menutupi candlestick. Saat di-hover atau di-drag, garis bertransisi halus menjadi solid `1.5px`.
     - **Tag Tengah Simetris & Border 1px Presisi**: Tag posisi (`tagX = (chartWidth - tagWidth) / 2`) membelah garis horizontal secara simetris dengan ukuran pill ramping (`h: 16px`, corner radius `3.5px`, border `1px`). Background pill menggunakan dark navy (`#0B0F19`) dengan border sewarna garis posisi, menghilangkan masalah border tebal 6px terdahulu.
     - **Harmonisasi Palet Warna Modern**:
       - Entry: Sky Cyan `#38BDF8`
       - Take Profit (TP): Emerald Green `#10B981`
       - Stop Loss (SL): Amber Orange `#F59E0B`
       - Liquidation (LIQ): Soft Rose `#F43F5E`
     - **Fitur Interaktif Drag & Adjust TP & SL Langsung di Chart (TradingView Interactive Line Drag)**:
       - **Hover & Kursor Responsif**: Saat kursor mouse melayang di atas garis TP atau SL, kursor canvas otomatis berubah menjadi `cursor: ns-resize` dengan highlight terang.
       - **Tag Grip Handle**: Tag TP & SL dilengkapi indikator interaktif `⇅`.
       - **Live Dragging & Unified Estimate**: Saat garis TP/SL digeser, estimasi keuntungan/kerugian dollar (`+$12.50` / `-$5.20`) disematkan langsung di dalam pill yang sama tanpa membuat kotak kedua yang menabrak chart.
       - **Sumbu Harga Kanan Terpadu**: Pill harga pada sumbu kanan diatur proporsional (`h: 16px`, font `9.5px monospace`) dengan warna senada, menjaga kontras tajam dan tidak saling menumpuk.
       - **Konfirmasi & Suara**: Saat mouse dilepas, target baru langsung terkunci, notifikasi audio klik diputar, dan toast konfirmasi ditampilkan.

### 3D Diorama Arsitektur Fisik (Turntable Holographic Showcase)
1. **Transformasi dari Kartu 2D Tipis ke Model Bangunan Fisik**:
   - Menghilangkan bingkai kartu persegi panjang datar (`rounded-2xl border-2`) yang sebelumnya berputar 360° hingga terlihat gepeng seperti kertas kosong di sudut 90°/270°.
   - Menerapkan **siluet arsitektural spesifik per level** (`LOCATION_ARCHITECTURE_CONFIG`) menggunakan CSS `clip-path` poligon arsitektur nyata:
     - **Level 1 (Kamar Kos Sempit)**: Siluet kubus isometrik ruangan kamar terbuka (*Isometric Room Cube*).
     - **Level 2 (Warnet VIP 24 Jam)**: Siluet heksagonal stasiun arcade (*Cyber Gaming Hexagon Pod*).
     - **Level 3 (Ruko 2 Lantai / Rumah)**: Siluet fisik **Rumah & Ruko bertingkat dengan atap pelana segitiga runcing (gable roof)** dan dinding vertikal 2 lantai.
     - **Level 4 (Penthouse SCBD)**: Siluet menara gedung pencakar langit bertingkat (*Stepped Skyscraper Tower*).
     - **Level 5 (Whale Private Island)**: Siluet pulau tropis melayang (*Floating Archipelago Biome*).
     - **Level 6 (Shadow Citadel Bulan)**: Siluet kubah observatorium luar angkasa (*Lunar Geodesic Dome*).
     - **Level 7 (The Architect of Singularity)**: Siluet kristal oktahedron energi kosmik (*Quantum Octahedron*).
2. **Panggung Meja Putar 3D (3D Holographic Turntable Pedestal)**:
   - Di bawah model bangunan, dirender panggung meja putar 3D dengan cincin laser ganda berputar (`animate-pedestal-spin`), lingkaran konsentris glow, dan bayangan kontak tebal.
   - Bangunan berdiri kokoh di atas meja putar dengan lapisan ketebalan depth volumetrik 3D (*extruded underlay*) dan efek pemindaian sinar laser hologram (*holographic scanline sweep*).
   - Gerakan animasi showcase menggunakan **3D Turntable Showcase Orbit Oscillation** (`animate-diorama-turntable`) dari -22° ke +22° pada sudut perspektif 1100px dan kemiringan isometrik 14°, memamerkan kemegahan fasad bangunan dari berbagai sudut tanpa pernah gepeng atau membalik ke belakang.

## 21. Sound System & Audio FX Retro Cyberpunk (Web Audio API)

### Arsitektur Sintetis Klien Murni (Zero Dependency)
Sistem audio game dirancang sepenuhnya menggunakan **Web Audio API** native browser tanpa memuat file audio eksternal (`.mp3` / `.wav`):
- **Performa 0ms Latency**: Gelombang suara disintesis langsung secara matematis di memori via osilator (sine, triangle, sawtooth) dan amplop gain envelope.
- **Ukuran Aset 0 Byte**: Tidak membebani bundle size aplikasi dan kebal dari kegagalan jaringan atau broken asset.
- **Haptic Feedback**: Dilengkapi getaran halus (`navigator.vibrate`) pada perangkat mobile yang mendukung saat order dieksekusi atau hadiah diklaim.

### Koleksi Efek Suara (Sound Effects)
1. **Order Laser Whoosh (`playOrderSound`)**:
   - Long/Buy: Sapuan laser naik dari 320Hz ke 880Hz (triangle wave, 120ms).
   - Short/Sell: Pukulan synth tegas menurun dari 650Hz ke 260Hz (sawtooth wave, 120ms).
2. **Profit & Reward Cha-Ching (`playProfitSound`)**:
   - Melodi 4-nada arpeggio arcade riang (C5 `523Hz` - E5 `659Hz` - G5 `784Hz` - C6 `1046Hz`) saat take profit, klaim misi harian/milestone, dan bantuan dana harian.
3. **Loss Thud (`playLossSound`)**:
   - Dentuman frekuensi rendah lembut (320Hz ke 140Hz) saat cut loss manual atau stop loss tersentuh.
4. **Liquidation Siren Alarm (`playLiquidationSound`)**:
   - Sirine darurat dua nada (880Hz dan 520Hz) saat posisi terlikuidasi.
5. **Upgrade Power-Up (`playUpgradeSound`)**:
   - Tangga nada chiptune futuristik (C4 - G5) saat membeli upgrade infrastruktur robotik.
6. **Prestige Cosmic Wave (`playPrestigeSound`)**:
   - Sub-bass sweep 55Hz megah diikuti pad synth kosmik berkilau saat eksekusi Rugpull berhasil.
7. **UI Tactile Click (`playUiClick`)**:
   - Klik mikro frekuensi 1200Hz halus untuk tombol-tombol antarmuka.

### Kontrol Pengguna & Persistensi
- **Header Audio Toggle**: Ikon speaker audio (`Volume2` / `VolumeX`) di bilah navigasi atas dengan indikator visual neon hijau saat aktif dan abu-abu saat mute.
- **Pengaturan Dialog**: Tersedia tombol switch audio di dalam modal Pengaturan.
- **Persistensi Preferensi**: Status mute disimpan otomatis ke `localStorage` (`degen_sound_muted`), sehingga pilihan mute pengguna tetap diingat saat halaman dimuat ulang.

## 22. Sistem Multi-Bahasa Menyeluruh (Comprehensive Bilingual i18n: Indonesia & English)

Game ini kini mendukung sistem multi-bahasa terpadu 100% dinamis untuk Bahasa Indonesia (`id`) dan Bahasa Inggris (`en`). Seluruh teks antarmuka, tooltip, instruksi interaktif, kartu trading, hingga dialog modal diterjemahkan secara otomatis sesuai pilihan pengguna.

### Cakupan Komponen yang Diterjemahkan
1. **Header & Bar Status Global**:
   - Judul, subjudul, status Net Worth, Available Cash, Gross/Net DPS, Whale Tokens, dan tombol aksi (Misi, Audio, Pengaturan, Rugpull).
2. **Diorama 3D & Stats Bar Keuangan**:
   - Label bot cluster online, tombol "Buka Galeri" / "Open Gallery", Available Cash, Net DPS, Pajak/Beban Workstation, penghasilan pasif per detik, kutipan sarkas per level workstation, badge rank, hingga status klaim bantuan dana harian.
3. **Grafik & Bilah Alat Gambar (TradingView Drawing Toolbar)**:
   - Tooltip kursor, trendline, garis horizontal support/resistance, kotak zona demand/supply, pena bebas (*freehand pen*), pemilih warna, tombol undo, hapus satu, hapus semua, hingga teks instruksi interaktif di bawah chart dan label drag-to-zoom sumbu X & Y.
4. **Form Eksekusi Order**:
   - Modal margin, level leverage, tombol persentase, input Take Profit (Opsional) & Stop Loss (Opsional), estimasi cuan/rugi, tombol BUY/LONG & SELL/SHORT beserta kalkulasi ukuran posisi.
5. **Kartu Posisi Aktif**:
   - Tipe posisi, tombol "Buka Chart" / "Open Chart", margin efektif, ukuran leverage, harga entry, harga likuidasi & jarak persentase likuidasi, target TP & SL (beserta status "Tidak diatur" / "Not set"), Unrealized PnL, Price ROI, dan tombol "Close / TP".
6. **Sidebar Tab & Infrastruktur Robotik**:
   - Tab "Infrastruktur", "Misi & Tugas", "Log Trade", tombol "Tutup" / "Close", nama & deskripsi 8 tier bot/server/satelit, tombol "BELI +1" / "BUY +1", dan pesan riwayat kosong.
7. **Drawer Misi & Milestone**:
   - Banner hadiah likuiditas, badge siap klaim, filter chips (Semua, Harian 24J, Misi 1, Misi 2, Misi 3), tugas harian dan progresnya, status "Diklaim", "KLAIM", "Proses", serta syarat buka Misi 2 & Misi 3.
8. **Seluruh Dialog Modal**:
   - **Modal Likuidasi**: Pesan tersapu pasar, tombol klaim dana talangan 20%, dan tombol terima nasib.
   - **Modal PnL Portfolio (Flex Modal)**: ROI sepanjang masa, Net Worth, Passive Income, dan tombol salin statistik.
   - **Modal Rugpull (Prestige)**: Deskripsi exit scam, perolehan Whale Token, dan tombol eksekusi.
   - **Modal Pengaturan (Settings)**: Deskripsi autosave, penghasilan offline, pemilih bahasa, audio synth, dan tombol konfirmasi reset data.
   - **Modal Penghasilan Offline**: Perhitungan pendapatan bot selama pemain offline (maksimal 8 jam).
   - **Modal Kunci Multi-Tab**: Perlindungan sinkronisasi data antar-tab dan tombol pengambilalihan kontrol.
   - **Modal Atur TP & SL**: Input target harga, preset ROI (+25% s/d +200%, -10% s/d -75%), estimasi keuntungan/kerugian bersih, dan validasi arah entry/likuidasi dwibahasa.
   - **Modal Galeri Workstation 3D**: Pratinjau 7 level markas arsitektur, badge level, syarat Net Worth & Token paus, serta upkeep fee.
9. **Terminal Feed Ticker Berita**:
   - Berita satire pasar kripto bergulir diterjemahkan lengkap antara versi Indonesia dan Inggris.

### Arsitektur Kamus & Penyimpanan
1. **Kamus Terjemahan (`src/i18n/translations.js`)**:
   - Struktur JSON terstandarisasi untuk bahasa `id` dan `en` yang scalable dan mudah diperluas jika ingin menambah bahasa lain di masa depan.
2. **Persistensi Preferensi (`localStorage`)**:
   - Pilihan bahasa disimpan secara permanen di browser dengan kunci `degen_lang` (`'id'` atau `'en'`).
   - Default awal menggunakan Bahasa Indonesia (`'id'`), menjaga kompatibilitas mundur 100% terhadap seluruh test suite regression eksisting (33/33 Playwright tests passing).

### Kontrol Pengguna (Language Switcher UI)
- **Header Quick Switcher**: Tombol pill cepat di navigasi atas (`🇮🇩 ID` dan `🇬🇧 EN`) dengan indikator neon aktif dan umpan balik suara klik.
- **Pengaturan Modal**: Pilihan bahasa tersedia di dalam dialog Pengaturan Simulator (`Settings Modal`) lengkap dengan keterangan dwibahasa.

## 23. Multi-Position Perpetual Trading Engine (v1.5.0)

### Arsitektur Multi-Posisi
Mendukung hingga 5 posisi aktif secara simultan (`activePositions: []`, slot maksimal 5) pada berbagai pasangan trading fiktif tanpa memblokir antarmuka trading.

- **Form Eksekusi Tanpa Kunci**: Pemain dapat membuka posisi baru kapan saja menggunakan saldo cash yang tersedia tanpa menunggu posisi yang sedang berjalan ditutup.
- **Dedicated Open Positions Dashboard**:
  - Live card metrics: Direction (LONG/SHORT), Leverage, Pair symbol, Margin, Ukuran posisi, Harga likuidasi, Jarak persentase likuidasi, dan real-time PnL ($ dan %).
  - **Binance Leverage Tier Brackets (`BINANCE_LEVERAGE_BRACKETS`)**: Batas ukuran posisi notional maksimum (250x: $100K, 100x: $250K, 50x: $1.00M, 10x: $10.0M, 2x: $50.0M) dengan badge tier aktif dan validasi form order.
  - **Binance Margin Ratio Health Meter**: Rasio risiko margin pemeliharaan real-time ($\text{Margin Ratio} = \frac{\text{Maintenance Margin}}{\text{Position Equity}} \times 100\%$) dengan indikator visual dinamis (`Aman` <40%, `Waspada` 40-74%, `Bahaya Liq` ≥75%).
  - **Pure Price ROI Badge**: Pemisahan jelas antara persentase pergerakan harga murni aset dan leveraged collateral ROI.
  - **One-Click Chart Switch (`Buka Chart`)**: Lompat langsung ke canvas chart pasangan aset posisi terkait.
  - **Quick TP/SL Modal Trigger**: Menyesuaikan target Take-Profit dan Stop-Loss kapan saja secara live.
  - **One-Click Emergency Close All (`Tutup Semua Posisi`)**: Menutup seluruh posisi sekaligus saat 2 atau lebih posisi aktif berjalan.
- **Multi-Position Canvas Overlay**: Menampilkan garis ENTRY, LIQ, TP, dan SL untuk seluruh posisi aktif pada pair yang sedang dilihat dengan navigator pills di sumbu harga.
- **Independent Tick Evaluation**: Setiap posisi memantau harga pair-nya secara independen untuk eksekusi otomatis Take Profit, Stop Loss, dan Likuidasi.

## 24. Cloud Sync Architecture, PBKDF2 Auth & Multi-Branch Database (v1.5.0)

### Model Autentikasi Zero-Dependency
- **Alur Akun**: Pemain dapat bermain anonim sebagai guest atau mendaftar akun cloud (`/auth`, `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`).
- **PBKDF2 Native Security**: Hashing password menggunakan modul bawaan Node.js `crypto.pbkdf2Sync` (100,000 iterasi, SHA-512, salt unik 16-byte) tanpa dependensi eksternal berat seperti `bcrypt`.
- **HMAC Session Cookies**: Cookie sesi terenkripsi dengan HMAC signature (`SESSION_SECRET`) dan proteksi `HttpOnly`, `SameSite=Lax`, serta flag `Secure` pada mode production.

### Cloud Synchronization & State Fidelity
- **Autosave Berkala (`/api/user/save`)**: Menyimpan snapshot progres lengkap (cash, peak net worth, upgrades, workstation, active positions, buku kas mutasi, inventory black market) ke database PostgreSQL.
- **Auto-Restore (`/api/user/load`)**: Memulihkan progress secara otomatis saat berpindah perangkat, browser, atau tab penyamaran.
- **Physical Multi-Branch Isolation**: Pemisahan tegas antara database cabang pengembangan (`dev`) dan cabang rilis (`main`) menggunakan Neon Serverless Postgres.

## 25. Admin Operations Center & APM Telemetry (v1.6.0)

### Visual Operations Dashboard (`/admin`)
Portal terpusat untuk memantau kesehatan sistem game, aktivitas pemain, dan metrik ekonomi tanpa perlu query database manual. Dilindungi otentikasi `ADMIN_SECRET_KEY` melalui header `x-admin-key`.

### Metrik Real-Time & APM
1. **Active Players Now (5 Menit)**:
   - Menghitung jumlah pemain unik yang melakukan sinkronisasi save atau heartbeat dalam jendela geser 5 menit terakhir via endpoint `/api/admin/metrics`.
2. **Interactive 24-Hour Activity Trend (SVG Area Chart)**:
   - Visualisasi tren per jam interaktif yang menampilkan distribusi pemain aktif dan registrasi akun baru dalam 24 jam terakhir.
3. **In-Memory Ring Buffer APM**:
   - Memantau latensi API internal (P50 dan P95), ping database PostgreSQL, dan log error runtime secara real-time.
   - Dilengkapi forwarder opsional ke Sentry cloud (`SENTRY_DSN`).
4. **Pencarian Pemain Ter-debounce & Paginasi Anti-Glitch**:
   - Direktori pemain dilengkapi input pencarian dengan debounce 300ms, filter workstation, serta sistem paginasi 10 pemain per halaman yang stabil tanpa glitch pergeseran layout.
5. **Ekspor Data Pemain (CSV Export)**:
   - Tombol satu klik untuk mengunduh seluruh data pemain terdaftar dalam format file `.csv`.

## 26. Global In-Game Broadcast Engine (v1.6.0)

Sistem pengumuman siaran langsung server-wide yang memungkinkan administrator mengirim pesan real-time ke seluruh pemain yang sedang aktif.

### Arsitektur Endpoint API
- **`GET /api/broadcast`**: Mengambil pengumuman aktif terkini yang belum kedaluwarsa untuk dikonsumsi oleh in-game client (`Game.jsx`).
- **`GET /api/admin/broadcast`**: Mengambil daftar seluruh riwayat pengumuman broadcast yang pernah dibuat untuk audit admin.
- **`POST /api/admin/broadcast`**: Membuat pengumuman baru atau memperbarui status pengumuman broadcast.

### Spesifikasi Fitur Broadcast
- **Level Prioritas**:
  - `INFO`: Informasi umum pembaruan atau tips trading (warna biru cerah / cyan).
  - `WARNING`: Peringatan maintenance atau potensi volatilitas ekstrem (warna kuning / amber).
  - `EVENT`: Pengumuman event komunitas, turnamen trading, atau airdrop (warna hijau / emerald).
  - `WHALE`: Peringatan pergerakan pasar paus kripto skala besar (warna ungu / violet).
- **Durasi & Auto-Expiration**: Pengumuman dapat diatur dengan masa berlaku (misal: 1 jam, 6 jam, 24 jam, atau permanen).
- **Banner In-Game Dismissible**: Muncul di bagian atas terminal trading secara elegan dan dapat ditutup (*dismissed*) oleh pemain kapan saja tanpa mengganggu interaksi grafik.

## 27. Player Moderation, Clean Progress Reset & Live Developer Compensation (v1.6.0)

Endpoint aksi terpadu `/api/admin/player-action` menyediakan kontrol moderasi dan operasional langsung terhadap akun pemain.

### 1. Akun Suspend & Unban
- Admin dapat menonaktifkan akun yang melanggar aturan dengan menyertakan alasan ban kustom.
- Saat akun di-ban, token sesi langsung dicabut dan panggilan API berikutnya mengarahkan klien ke `/auth?mode=login&banned=1`.
- Admin dapat membuka kembali status suspend (*Unban*) dengan satu klik.

### 2. Clean Progress Reset (Saldo Awal $10.00)
- Menangani akun yang mengalami korupsi data penyimpanan lokal atau permintaan reset progres pemain.
- **Mereset ke Modal Awal**: Saldo cash dan peak net worth di-reset persis ke nilai default permainan yaitu **$10.00**, workstation kembali ke *Kamar Kos Sempit*, upgrade di-reset ke level 0, dan seluruh posisi trading aktif ditutup.
- **Pembersihan Flag & Anti-Infinite Reload Loop**:
  - Flag `resetRequested: true` di database langsung dihapus seketika pada siklus deteksi pertama di `/api/user/save`, `/api/user/load`, dan `/api/auth/me`.
  - Cookie autentikasi dihapus di response header (`Max-Age=0`).
  - Klien membersihkan storage lokal kembali ke anonim, lalu dialihkan secara bersih ke `/auth?mode=login&reset=1`.
  - Mengeliminasi bug reload berulang (layar kelap-kelip) yang sebelumnya terjadi jika flag reset tidak segera di-clear.

### 3. Live Developer Compensation Engine
- Memungkinkan admin memberikan paket ganti rugi atau apresiasi langsung ke pemain tanpa mengganggu progres bermain yang sedang berjalan.
- **Dukungan Aset Kompensasi**:
  - Mata uang game: Saldo cash tambahan dan Whale Token.
  - Item Black Market: Whale Pump Whistle, Whale Dump Horn, Liquidation Shield, Insider Trading Radar, dan Zero-Fee Scalp Pass.
- **Non-Overwriting Autosave Merge**:
  - Kompensasi disimpan dalam antrean `pendingCompensation` di database.
  - Saat autosave berikutnya berjalan, server menggabungkan item dan saldo secara aditif ke dalam save payload pemain tanpa menimpa data permainan yang baru.
- **In-Game Dismissible Compensation Banner**:
  - Pemain yang menerima kompensasi mendapatkan banner notifikasi khusus di dalam game (`data-testid="developer-compensation-banner"`).
  - Banner menampilkan rincian cash, token, dan item yang diterima serta tombol tutup/klaim manual yang responsif.

## 28. Catatan Rilis & Changelog Versi

### Versi 1.6.1 (26 Oktober 2026) — Multi-Item Support Compensation & Live Ops
- **Fitur Baru & Penyempurnaan**:
  - **Multi-Item Admin Compensation Builder**: Admin dapat memilih dan menyuntikkan lebih dari 1 jenis item Black Market sekaligus dalam satu paket kompensasi (misalnya God Leverage 250x Ticket + Insider Alpha Radar + Zero-Fee VIP Pass).
  - **Dynamic Item Row Management**: Tombol `+ Tambah Item Lain` dinamis dengan seleksi item bebas duplikasi (`(Sudah dipilih)`), pengaturan jumlah per item, serta tombol hapus baris.
  - **Robust Backend Consolidation**: Endpoint `/api/admin/player-action` mengonsolidasikan `itemsDelta` tanpa redundansi atau duplicate counting dan menyusun log transparan ke `tradeHistory`.
  - **Safe Client & Cloud Save Merge**: Penambahan proteksi sinkronisasi inventaris multi-item di `/api/user/save` dan `src/components/game/Game.jsx` agar banner in-game merender seluruh item yang disuntikkan secara akurat.
- **Pengujian & Verifikasi**:
  - Penambahan automated test suite Playwright `admin can inject multiple in-game items simultaneously (e.g. God Leverage and Insider Alpha Radar)`. Seluruh 12 admin tests dan 19 game tests lolos 100%.

### Versi 1.6.0 (26 Oktober 2026) — Ops, Broadcast & Live Management
- **Fitur Baru**:
  - Portal Admin Ops Center v2 (`/admin`) dengan visualisasi telemetri lengkap.
  - Global In-Game Broadcast announcement banner (`/api/broadcast`, `/api/admin/broadcast`).
  - Player Moderation & Ops CRM (`/api/admin/player-action`) dengan fitur Ban/Unban.
  - Clean Progress Reset ke modal awal $10.00 dengan eliminasi total infinite reload loop bug.
  - Live Developer Compensation Engine dengan non-overwriting autosave merge dan in-game dismissible notification banner (`data-testid="developer-compensation-banner"`).
  - Real-time Active Players Now metric (5-minute sliding window) dan interactive 24-hour hourly trend SVG chart.
  - Debounced player directory search, pagination anti-glitch, dan ekspor CSV.
- **Infrastruktur & Lingkungan**:
  - Standardisasi skrip database di `package.json` (`npm run db:push` dan `npm run db:generate`).
  - Validasi keselarasan skema Neon Serverless PostgreSQL production.
  - Dokumentasi variabel lingkungan produksi di `.env.example` dan `README.md`.

### Versi 1.5.0 (25 Oktober 2026) — Multi-Position Trading & Cloud Sync
- Multi-Position Perpetual Trading Engine hingga 5 posisi simultan.
- Autentikasi akun PBKDF2 native dan sinkronisasi cloud save PostgreSQL.
- Sentry APM integration dan in-memory ring buffer telemetry.

### Versi 1.4.1 (25 Oktober 2026) — Quests & Layout Optimization
- Sistem Misi & Tugas Likuiditas bertingkat (Milestone Onboarding & Daily Quests).
- Optimasi layout TradingView, pembatasan tinggi panel samping, dan candlestick timer.
- 3D diorama turntable arsitektur markas.
- Web Audio API synthesizer murni dan lokalisasi dwibahasa (ID/EN).

## Referensi

- Source utama: `src/components/game/Game.jsx`.
- Pemulihan error: `src/components/game/RuntimeGuard.jsx`.
- Panduan proyek: `README.md`.
- Catatan verifikasi: `VERIFICATION.json`.
- [Artifact Degen & Whale Bugfix](https://aktiv.clickup.com/90181331789/artifact/2kzkkuud-1310838).
- [Dokumentasi instalasi Next.js](https://nextjs.org/docs/app/getting-started/installation).