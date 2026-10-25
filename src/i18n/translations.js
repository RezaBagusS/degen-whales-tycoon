export const TRANSLATIONS = {
  id: {
    // Header & Global Stats
    appTitle: 'DEGEN & WHALE',
    appSubtitle: 'TRADING FLOOR SIMULATOR',
    netWorth: 'Net Worth',
    cash: 'Cash',
    passiveIncome: 'Passive Income',
    whaleTokens: 'Whale Tokens',
    dailyAid: 'Bantuan Harian',
    dailyAidClaimed: 'Terklaim',
    dailyAidDesc: 'Klaim $5.00 modal gratis darurat (reset 24 jam)',
    missions: 'Misi & Tugas',
    audioOn: 'Suara Aktif',
    audioOff: 'Suara Bisu',
    settings: 'Pengaturan',
    rugpull: 'Eksekusi Rugpull',
    rugpullBadge: 'PRESTIGE',
    toggleSidebarOpen: 'Tutup Infrastruktur',
    toggleSidebarClose: 'Buka Infrastruktur',
    language: 'Bahasa',

    // News Ticker
    news: [
      '🚨 BREAKING: Developer koin $CUAN mengaku lupa password wallet likuiditas, investor menangis di grup Telegram.',
      '📈 ANALISIS: Pakar menyebutkan grafik akan bergerak ke kanan hari ini dengan probabilitas 100%.',
      '☕ LIFESTYLE: Tren pekerja SCBD beli kopi susu pakai Paylater demi sisa gaji bisa di-all-in ke koin anjing.',
      '⚠️ REGULASI: Pemerintah mempertimbangkan pajak khusus untuk trader yang suka pamer PnL hijau tapi modal $5.',
      '🔥 VIRAL: Mahasiswa semester 3 tidak sengaja beli saham tambang karena salah ketik kode ticker, malah untung 400%.',
      '🤖 TECH: AI Trading Bot terbaru mogok kerja dan memilih curhat tentang tekanan mental menghadapi market sideways.',
      '🐋 WHALE ALERT: Dompet misterius baru saja memindahkan $500 Juta dari dompet kanan ke dompet kiri.'
    ],

    // Chart & Drawing Tools
    pair: 'Pasangan',
    timeframe: 'Timeframe',
    indicators: 'Indikator',
    drawingTools: 'Alat Gambar',
    toolCursor: 'Kursor Standar / Crosshair (Esc)',
    toolTrendline: 'Trendline / Garis Tren (Klik 2 titik di chart)',
    toolHorizontal: 'Garis Horizontal / Support & Resistance (1 klik di level harga)',
    toolBox: 'Kotak Area / Supply & Demand Zone (Klik 2 sudut di chart)',
    toolFreehand: 'Pena Analisis / Freehand Pen (Drag mouse untuk mencoret)',
    toolUndo: 'Undo Gambar Terakhir (Ctrl+Z)',
    toolClearAll: 'Hapus Semua Gambar di Pair Ini',
    toolDelete: 'Hapus gambar terpilih ini (Del / Backspace)',
    toolDeselect: 'Batal Pilih (Esc)',
    deleteBtn: 'Hapus',
    zoomTime: 'Zoom Waktu',
    zoomPrice: 'Zoom Harga',
    zoomTimeHint: 'Drag ke kanan: Zoom In | Drag ke kiri: Zoom Out | Double-click: Reset',
    zoomPriceHint: 'Drag ke atas: Zoom In | Drag ke bawah: Zoom Out | Double-click: Reset',
    resetZoom: 'Reset Zoom & Pan (Kembali ke Auto-Fit)',
    liveHintTrendline1: 'Klik titik pertama untuk memulai garis tren',
    liveHintTrendline2: 'Klik titik ke-2 untuk mengunci garis tren',
    liveHintHorizontal: 'Klik pada chart untuk meletakkan level harga Support/Resistance',
    liveHintBox1: 'Klik sudut awal untuk membuat kotak zona',
    liveHintBox2: 'Klik titik ke-2 untuk mengunci kotak zona',
    liveHintFreehand: 'Klik dan tahan mouse untuk mencoret bebas di chart',
    liveHintEsc: 'Tekan Esc untuk batal',

    // Order Form
    orderForm: 'Form Eksekusi Order',
    marginCapital: 'MODAL MARGIN',
    leverage: 'LEVERAGE',
    takeProfit: 'Take Profit (Opsional):',
    stopLoss: 'Stop Loss (Opsional):',
    tpSubHint: 'L > Entry | S < Entry',
    slSubHint: 'L < Entry | S > Entry',
    tpPlaceholder: 'Misal:',
    slPlaceholder: 'Misal:',
    estProfit: 'Est. Cuan',
    estLoss: 'Est. Rugi',
    buyLong: 'BUY / LONG',
    sellShort: 'SELL / SHORT',
    orderSize: 'Size:',
    estLiquidation: 'Est. Likuidasi',
    openingTax: 'Pajak Buka Posisi (1.5%)',
    orderFeeNote: 'Pajak 1.5% dari margin saat buka posisi. Likuidasi terjadi jika ROI mencapai -92%.',

    // Active Position Card & Multi-Position
    activePosition: 'POSISI TERBUKA',
    openPositionsTitle: 'POSISI TERBUKA',
    closeAllPositions: 'Tutup Semua Posisi',
    maxPositionsAlert: 'Maksimal 5 posisi terbuka secara bersamaan!',
    slotsLeft: 'Slot Posisi',
    totalUnrealizedPnl: 'Total PnL Terbuka',
    marginRatio: 'Margin Ratio',
    marginSafe: 'Aman',
    marginWarning: 'Waspada',
    marginDanger: 'Bahaya Liq',
    bracketLimit: 'Tier Bracket',
    maxBracketExceeded: 'Ukuran posisi melebihi batas Tier Bracket Binance untuk leverage ini!',
    posTypeLong: 'LONG',
    posTypeShort: 'SHORT',
    openChart: 'Buka Chart',
    posMargin: 'Margin:',
    posSize: 'Size:',
    posEntry: 'Harga Entry:',
    posMarket: 'Market Price',
    posLiq: 'Liq:',
    posAway: 'away',
    posNotSet: 'Tidak diatur',
    posTpTitle: 'Klik untuk ubah Target Take Profit',
    posSlTitle: 'Klik untuk ubah Stop Loss',
    unrealizedPnl: 'Unrealized PnL',
    priceRoi: 'Price ROI:',
    purePriceRoiTooltip: 'Keuntungan / kerugian murni dari selisih harga pasar (100% Price Action)',
    closePosition: 'Close / TP',

    // Workstation & Diorama
    workstationLv: 'WORKSTATION LV.',
    upkeepFee: 'Upkeep Fee:',
    upkeepTax: 'Pajak/Beban:',
    rankLabel: 'Rank:',
    automatedCluster: 'AUTOMATED BOT CLUSTER ONLINE',
    openGallery: 'Buka Galeri',
    availableCash: 'Available Cash',
    grossDps: 'Gross DPS',
    netDps: 'Net DPS',
    generatesPassive: 'Menghasilkan',
    secPassively: '/ detik secara pasif',
    dailyAidClaimedMsg: 'Bantuan sosial sudah diklaim hari ini. Kembali lagi besok!',
    dailyAidUnclaimedMsg: 'Klaim Bantuan Dana Sosial Harian sebesar',
    dailyAidClaimedBtn: 'Sudah Diklaim Hari Ini',
    dailyAidClaimBtn: 'Klaim Bantuan $5.00',

    // 7 Workstations
    locations: {
      1: {
        name: 'Kamar Kos Sempit',
        sub: 'Laptop Kentang & Kipas Angin Berdebu',
        badge: 'Exit Liquidity',
        quote: '"Modal uang makan semester ini, yakin besok beli Lambo."',
        archBadge: '3D MAKET KOS'
      },
      2: {
        name: 'Warnet VIP 24 Jam',
        sub: 'Paket Malam + Es Teh Jumbo',
        badge: 'Scalper Receh',
        quote: '"Chart 1 menit adalah jalan ninjaku."',
        archBadge: '3D POD WARNET'
      },
      3: {
        name: 'Ruko 2 Lantai',
        sub: 'Kantor Trading & Markas Komunitas',
        badge: 'Bandar Lokal',
        quote: '"Jangan lupa masuk grup VIP saya, slot terbatas!"',
        archBadge: '3D FISIK RUMAH & RUKO'
      },
      4: {
        name: 'Penthouse SCBD',
        sub: 'Pemandangan Gedung Pencakar Langit',
        badge: 'Market Mover',
        quote: '"Ritel panik jual, kita serok bawah sambil ngopi."',
        archBadge: '3D MENARA TOWER'
      },
      5: {
        name: 'Sovereign Whale Private Island',
        sub: 'Satelit Pribadi & Bunker Server Bawah Tanah',
        badge: 'Sovereign Whale',
        quote: '"Saya tidak membaca chart. Sayalah yang menggambar chart."',
        archBadge: '3D FLOATING ISLAND'
      },
      6: {
        name: 'Shadow Citadel di Bulan',
        sub: 'Server Kuantum Nol-Gravitasi & Bebas Yurisdiksi Bumi',
        badge: 'Interplanetary Syndicate',
        quote: '"Pajak bumi tidak berlaku di kawah Mare Tranquillitatis."',
        archBadge: '3D KUBAH BULAN'
      },
      7: {
        name: 'The Architect of Singularity',
        sub: 'Pengendali Tunggal Algoritma Ekonomi Global',
        badge: 'God of Liquidity',
        quote: '"Uang hanyalah angka di dalam simulasi yang saya ciptakan."',
        archBadge: '3D OKTAHEDRON KOSMIK'
      }
    },

    // Robotic Infrastructure Upgrades
    tabInfra: 'Infrastruktur',
    tabQuests: 'Misi & Tugas',
    tabHistory: 'Log Trade',
    closeSidebarText: 'Tutup',
    closeSidebarTitle: 'Tutup Sidebar (Maksimalkan Tampilan Grafik)',
    openSidebarTitle: 'Buka Panel Infrastruktur & Misi',
    buyOne: 'BELI +1',
    upgrades: {
      indikator: {
        name: 'Indikator Garis Keramat',
        desc: 'Menggambar garis support/resistance sesuka hati.'
      },
      vip_grup: {
        name: "Grup VIP Sinyal 'Pasti Cuan'",
        desc: 'Ikut arahan suhu, kadang TP, sering nyangkut.'
      },
      monitor_4x: {
        name: 'Layar Monitor Vertical (4x)',
        desc: 'Makin banyak layar, makin terlihat pro di depan teman.'
      },
      sniper_bot: {
        name: 'Sniper Bot (Solana/DEX)',
        desc: 'Beli token meme di detik ke-0 sebelum dev-nya kabur.'
      },
      quant_dev: {
        name: 'Sewa Quant Developer',
        desc: 'Lulusan olimpiade matematika yang gak pernah tidur.'
      },
      ai_cluster: {
        name: 'Agentic AI Trading Cluster',
        desc: 'Server GPU yang memprediksi cuitan tokoh dunia.'
      },
      own_exchange: {
        name: 'Bikin Exchange & Koin Sendiri',
        desc: 'Kenapa harus trading kalau bisa makan fee dari trader lain?'
      },
      lobby_reg: {
        name: 'Tim Lobi Regulator & Pajak',
        desc: 'Mengatur undang-undang bursa agar selalu menguntungkan bandar.'
      },
      quantum_arb: {
        name: 'Satelit Arbitrase Kuantum',
        desc: 'Front-running transaksi seluruh dunia dari orbit rendah bumi.'
      },
      central_bank: {
        name: 'Akuisisi Mesin Cetak Bank Sentral',
        desc: 'Brrr! Cetak likuiditas tak terbatas kapan pun portofolio merah.'
      },
      bot1: {
        name: 'Bot Scalper Telegram',
        desc: 'Skrip Python eksekusi arbitrase mikro 24/7 di grup sinyal degen.'
      },
      bot2: {
        name: 'AI Arbitrage High Frequency',
        desc: 'Model deep learning pemburu spread harga lintas decentralized exchange.'
      },
      server1: {
        name: 'Server Rack Mini di Warnet',
        desc: 'Colocation rak server berpendingin AC kamar gaming untuk memangkas latensi 12ms.'
      },
      server2: {
        name: 'Dedicated Data Center SCBD',
        desc: 'Infrastruktur tier-4 terkoneksi langsung ke fiber optic bursa efek.'
      },
      whale1: {
        name: 'Akses Insider Sinyal Bandar',
        desc: 'Bocoran grup WhatsApp private investor paus sebelum pompa likuiditas dimulai.'
      },
      whale2: {
        name: 'Algoritma Market Making Institusi',
        desc: 'Menjadi penyedia likuiditas pasar dan memungut spread spread dari semua ritel.'
      },
      satellite: {
        name: 'Koneksi Satelit Low-Earth Orbit',
        desc: 'Transmisi gelombang mikro ultra cepat langsung antar benua tanpa melewati kabel bawah laut.'
      }
    },

    // Daily Quests
    dailyQuests: {
      daily_trade_3: {
        title: 'Scalping Harian',
        desc: 'Lakukan 3 kali trading hari ini.'
      },
      daily_profit_5: {
        title: 'Cuan Harian',
        desc: 'Kumpulkan total cuan trading $5.00 hari ini.'
      },
      daily_tpsl: {
        title: 'Disiplin Risk Management',
        desc: 'Pasang TP atau SL pada posisi aktif hari ini.'
      },
      daily_check_infra: {
        title: 'Perawatan Rig',
        desc: 'Beli atau upgrade minimal 1 infrastruktur pasif hari ini.'
      }
    },

    // Milestone Quests
    milestoneQuests: {
      first_trade: {
        title: 'Buka Posisi Pertama',
        desc: 'Buka 1 posisi leverage trading (LONG atau SHORT).'
      },
      switch_pair: {
        title: 'Analisis Multi-Aset',
        desc: 'Ganti koin pasangan trading atau ganti timeframe chart.'
      },
      close_profit: {
        title: 'Cuan Pertama',
        desc: 'Tutup posisi trading dalam kondisi profit bersih > $0.'
      },
      use_tpsl: {
        title: 'Trader Disiplin',
        desc: 'Pasang Take Profit atau Stop Loss pada posisi trading aktif.'
      },
      first_upgrade: {
        title: 'Pasang Indikator Bot',
        desc: 'Beli upgrade Indikator Teknikal Lv 1 untuk passive income.'
      },
      daily_login: {
        title: 'Klaim Bansos Harian',
        desc: 'Klaim bantuan dana harian di panel kasir workstation.'
      },
      trade_streak_5: {
        title: 'Scalper Rajin',
        desc: 'Selesaikan total 5 kali transaksi trading leverage.'
      },
      buy_vip: {
        title: 'Grup VIP Sinyal',
        desc: 'Beli upgrade Komunitas Grup VIP Sinyal Lv 1.'
      },
      networth_100: {
        title: 'Trader Konsisten',
        desc: 'Capai Peak Net Worth sebesar $100.00.'
      },
      high_leverage_win: {
        title: 'Degen Berani',
        desc: 'Menangkan trade dengan leverage tinggi 50x atau 100x.'
      },
      networth_1k: {
        title: 'Whale Komersial',
        desc: 'Capai Peak Net Worth sebesar $1,000.00.'
      },
      dps_10: {
        title: 'Mesin Passive Income',
        desc: 'Capai pendapatan pasif (Net DPS) minimal $10.00/detik.'
      }
    },

    // Extra UI Elements
    sharePnl: 'Cetak PnL',
    realMarketSim: 'Simulasi Pasar Nyata',
    simDisclaimerTitle: 'Catatan Simulasi:',
    simDisclaimerDesc: 'Seluruh pasangan aset & fluktuasi harga ini hanyalah simulasi fraktal dunia nyata untuk hiburan/game, bukan transaksi finansial riil.',
    searchPairPlaceholder: 'Cari pair (BTC, ETH, SOL, IDR)...',
    filterAllPairs: 'Semua (10)',
    filterTopCrypto: 'Crypto Top',
    filterMeme: 'Meme/Degen',
    filterActivePos: 'Posisi Aktif',
    tableHeaderPair: 'Pasangan',
    tableHeaderPrice: 'Harga',
    tableHeaderTrend: '24j Trend',
    noPairsFound: 'Pair tidak ditemukan',
    badgePosition: 'POSISI',
    targetNext: 'Target Berikutnya:',
    showcase3d: 'Showcase 3D',
    leftSec: 's tersisa',
    withdrawColdWallet: 'WITHDRAW KE COLD WALLET',
    bearMarketBanner: 'BEAR MARKET -55% DPS',
    bullRunBanner: '5x PROFIT AKTIF',

    // Missions & Quests Drawer
    missionsBannerTitle: 'Misi & Hadiah Likuiditas',
    missionsBannerSub: 'Selesaikan misi untuk modal awal & percepat ekspansi rig trading!',
    readyToClaim: 'Siap Klaim',
    chipAll: 'Semua',
    chipDaily: 'Harian (24J)',
    chipPhase1: 'Misi 1',
    chipPhase2: 'Misi 2',
    chipPhase3: 'Misi 3',
    dailyGroupTitle: 'Tugas Harian (Reset 24 Jam)',
    completed: 'Selesai',
    statusClaimed: 'Diklaim',
    btnClaim: 'KLAIM',
    statusInProcess: 'Proses',
    statusLocked: 'Terkunci',
    phaseTitles: {
      1: { title: 'Misi 1: Kamar Kos (Onboarding Pemula)', sub: 'Dasar trading & risk management ($1.50 - $2.50)' },
      2: { title: 'Misi 2: Cashflow Pasif', sub: 'Membangun mesin pendapatan rig ($3.00 - $15.00)' },
      3: { title: 'Misi 3: Sultan Warnet', sub: 'Skala modal & leverage whale ($20.00 - $150.00)' }
    },
    reqUnlockPhase2: 'Syarat Membuka Misi 2:',
    reqUnlockPhase3: 'Syarat Membuka Misi 3:',
    reqPhase2Desc1: 'Selesaikan seluruh 4 tugas di',
    reqPhase2Desc2: 'dan beli infrastruktur',
    reqPhase3Desc1: 'Selesaikan seluruh 4 tugas di',
    reqPhase3Desc2: 'dan beli infrastruktur',
    statusCompleted: '✓ Selesai',
    statusPurchased: '✓ Terbeli',
    statusPending: 'Belum',
    noTradeHistory: 'Belum ada riwayat posisi Leverage Trading.',
    terminalFeed: 'TERMINAL FEED',

    // Modals
    // 1. Liquidation Modal
    liqModalTitle: 'MARGIN CALL / LIQUIDATED!',
    liqModalDesc1: 'Posisi',
    liqModalDesc2: 'kamu tersapu pergerakan bandar.',
    liqModalBailoutBtn: 'Klaim Dana Talangan 20%',
    liqModalAcceptBtn: 'Terima Nasib & Lanjut Idle',

    // 2. PnL Flex Modal
    pnlModalTitle: 'DEGEN & WHALE',
    pnlModalRoiHeader: 'ALL-TIME PORTFOLIO ROI',
    pnlModalNetWorth: 'NET WORTH',
    pnlModalPassive: 'PASSIVE INCOME',
    pnlModalCopied: 'Tersalin!',
    pnlModalCopyBtn: 'Copy Statistik',
    pnlModalCloseBtn: 'Tutup',

    // 3. Prestige / Rugpull Modal
    prestigeTitle: 'Launch Token Baru & Rugpull',
    prestigeSub: 'Prestige System',
    prestigeDesc: 'Reset kas dan infrastruktur kamu untuk meluncurkan koin baru dan mendapatkan Whale Token (+50% bonus profit permanen).',
    prestigeCurrentTokens: 'Whale Token Saat Ini:',
    prestigeClaimTokens: 'Klaim Token:',
    prestigeTokensUnit: 'Token',
    prestigeExecuteBtn: 'Eksekusi Rugpull',
    prestigeCancelBtn: 'Batal',
    prestigeWarningTitle: 'KONSEKUENSI EKSEKUSI RUGPULL',
    prestigeResetNoticeTitle: 'Yang Akan Direset (Hilang):',
    prestigeResetCash: 'Kas saldo trading kembali ke modal awal $10.00.',
    prestigeResetInfra: 'Semua level rig & hardware mining pasif direset ke level 0.',
    prestigeResetPositions: 'Posisi trading aktif & order TP/SL langsung ditutup otomatis.',
    prestigeKeepNoticeTitle: 'Yang Kamu Dapatkan & Permanen:',
    prestigeKeepTokens: 'Whale Token masuk ke profil akun secara permanen.',
    prestigeKeepBonus: 'Setiap token memberi +50% multiplier profit permanen selamanya.',
    prestigeKeepDividend: 'Setiap token memberi dividen pasif otomatis +$5.00/s selamanya (akun tidak pernah bangkrut).',
    prestigeKeepFaucet: 'Hak akses jaring pengaman Whale Emergency Faucet saat saldo modal kritis.',
    prestigeKeepHistory: 'Rekor tier lokasi, milestone, dan item Black Market tetap aman.',

    // Whale Emergency Faucet
    whaleFaucetTitle: 'WHALE EMERGENCY FAUCET',
    whaleFaucetDesc: 'Jaring pengaman likuiditas darurat khusus pemilik Whale Token saat saldo kritis.',
    whaleFaucetClaimBtn: 'Klaim Talangan',
    whaleFaucetCooldown: 'Cooldown',
    whaleFaucetReady: 'Siaga',

    // 4. Settings Modal
    settingsTitle: 'Pengaturan',
    settingsAutoSaveTitle: 'Progres tersimpan otomatis',
    settingsAutoSaveDesc: 'Save setiap 3 detik, setelah transaksi, dan saat meninggalkan halaman. Simpanan versi lama dimigrasikan otomatis di browser dan alamat yang sama.',
    settingsOfflineDesc: 'Penghasilan saat game ditutup: maksimal 8 jam, tanpa bonus event. Harga posisi dijeda selama game ditutup.',
    settingsLanguageTitle: 'Pilih Bahasa Tampilan',
    settingsLanguageDesc: 'Ganti antara Bahasa Indonesia & English',
    settingsAudioTitle: 'Efek Suara Synth Cyberpunk',
    settingsAudioDesc: 'Audio sintetis Web Audio API (order, cuan, liquid, upgrade).',
    settingsAudioMuted: 'Muted',
    settingsAudioActive: 'Aktif',
    settingsResetTitle: 'Reset Data Permainan',
    settingsResetDesc: 'Hapus progres & mulai dari awal.',
    settingsResetConfirmBtn: 'Ya, hapus progres',
    settingsResetBtn: 'Hard Reset',
    settingsResetWarning: 'Semua progres dan Whale Token akan dihapus.',
    settingsResetCancel: 'Batal reset',

    // 5. Offline Modal
    offlineTitle: 'Bot & Kru Tetap Bekerja!',
    offlineDesc: 'Selama kamu pergi ({seconds} detik, maksimal 8 jam), sistem menghasilkan:',
    offlineClaimBtn: 'Sudah masuk kas, lanjut',

    // 6. Multi-tab Lock Modal
    multiTabTitle: 'Sesi Aktif di Tab Lain',
    multiTabDesc: 'Permainan sedang berjalan di tab browser lain. Untuk mencegah data kekayaan, upgrade, dan posisi trading tertimpa, terminal di tab ini dijeda sementara.',
    multiTabShieldTitle: 'Perlindungan Sinkronisasi Multi-Tab',
    multiTabShieldDesc: 'Autosave dan mesin pasar dijeda di tab ini agar progres tidak saling menimpa. Klik tombol di bawah untuk memindahkan kontrol trading ke tab ini.',
    multiTabTakeOverBtn: 'Gunakan di Tab Ini (Ambil Alih)',

    // 7. Adjust TP/SL Modal
    adjustModalTitle: 'Atur TP & SL Posisi',
    adjustModalEntry: 'Entry',
    adjustModalMargin: 'Margin',
    adjustModalLiq: 'Likuidasi',
    adjustModalRemoveTp: 'Hapus TP',
    adjustModalRemoveSl: 'Hapus SL',
    adjustModalPreset: 'Preset:',
    adjustModalEstProfit: 'Est. Keuntungan:',
    adjustModalTotalReturnCash: 'Total diterima ke kas:',
    adjustModalTpAbove: 'TP untuk {type} harus {direction} entry (${entry})',
    adjustModalEstLoss: 'Est. Kerugian:',
    adjustModalRemainingCash: 'Sisa modal ke kas:',
    adjustModalSlLiqBreached: 'SL tidak boleh melewati harga likuidasi (${liq})',
    adjustModalSlBelow: 'SL untuk {type} harus {direction} entry (${entry})',
    adjustModalCancelBtn: 'Batal',
    adjustModalSaveBtn: 'Simpan TP/SL',

    // 8. Workstation Gallery Modal
    galleryTitle: 'Evolusi Workstation & Rank 3D',
    gallerySub: 'Visualisasi 3D markas trading dari Kamar Kos Sempit hingga The Architect of Singularity',
    galleryLevelsBadge: '7 LEVELS',
    galleryStatusActive: 'AKTIF',
    galleryStatusUnlocked: '✓ TERBUKA',
    galleryStatusLocked: 'LOCKED',
    galleryPeakNetWorth: 'Peak Net Worth:',
    galleryWhaleTokens: 'Whale Token:',
    galleryTokensUnit: 'Token',
    galleryUpkeepFee: 'Upkeep Fee:',
    galleryCurrentFooter: 'Workstation saat ini:',
    galleryCloseBtn: 'Tutup Galeri',

    // 9. Black Market
    tabBlackMarket: 'Black Market',
    blackMarketTitle: 'Pasar Gelap Degen',
    blackMarketSubtitle: 'Beli power-up dan perlengkapan rahasia untuk memanipulasi pasar & melindungi modal.',
    ownedLabel: 'Milikmu',
    buyItemBtn: 'Beli (+1)',
    inventoryQuickBar: 'Inventaris Cepat:',
    itemPumpWhistle: 'Whale Pump Whistle',
    itemPumpWhistleDesc: 'Tiup peluit paus untuk suntikan beli instan (+3% s/d +5%). [Batas: 1x/hari • Khusus Degen Perps • Dilindungi Slippage & Rebound].',
    itemDumpHorn: 'Whale Dump Horn',
    itemDumpHornDesc: 'Bunyikan terompet dump untuk panic sell instan (-3% s/d -5%). [Batas: 1x/hari • Khusus Degen Perps • Dilindungi Slippage & Rebound].',
    whaleItemDailyLimitNote: '⚡ 1x/Hari • Degen Perps Only',
    whaleUsedTodayBadge: 'Dipakai Hari Ini (Reset 00:00)',
    itemLiqShield: 'Liquidation Shield',
    itemLiqShieldDesc: 'Tameng asuransi 1x pakai. Menyelamatkan 85% modal margin jika harga menyentuh garis likuidasi.',
    itemLev250x: 'God Leverage 250x Ticket',
    itemLev250xDesc: 'Membuka tombol leverage ekstrim 250x untuk eksekusi 1 posisi berikutnya. Risiko degen maksimal!',
    itemZeroFee: 'Zero-Fee VIP Pass',
    itemZeroFeeDesc: 'Bebas 100% potongan biaya bursa selama 10 menit ke depan.',
    itemInsiderRadar: 'Insider Alpha Radar',
    itemInsiderRadarDesc: 'Menyadap grup alpha privat. Mengunci probabilitas tren bullish pasar selama 45 detik!',
    toastPumpWhistle: '🟢 WHALE PUMP! Candle hijau raksasa disuntikkan ke chart!',
    toastDumpHorn: '🔴 WHALE DUMP! Panic sell besar-besaran melanda chart!',
    toastLiqShieldSaved: '🛡️ LIQUIDATION SHIELD PECAH! 85% modal margin berhasil diselamatkan!',
    toastLev250xActive: '⚡ 250x GOD LEVERAGE SIAP! Tombol 250x terbuka untuk trade berikutnya!',
    toastZeroFeeActive: '💎 ZERO-FEE VIP PASS AKTIF! Bebas biaya bursa selama 10 menit!',
    toastInsiderRadarActive: '📡 INSIDER ALPHA RADAR AKTIF! Probabilitas tren bullish terkunci 45 detik!',

    // 10. PnL Share Card Modal
    pnlCardTitle: 'Generator Kartu PnL Viral',
    pnlCardSub: 'Cetak kartu PnL bergaya Bybit / Binance Cyberpunk beresolusi tinggi untuk pamer di media sosial.',
    pnlCardTabPortfolio: 'All-Time Portfolio',
    pnlCardTabPosition: 'Posisi Terbuka / Trade',
    pnlCardDownloadBtn: 'Download Gambar (PNG)',
    pnlCardCopyImgBtn: 'Copy Gambar ke Clipboard',
    pnlCardCopiedImg: '✓ Gambar Tersalin ke Clipboard!',
    pnlCardCopiedFallback: '✓ Teks Statistik Tersalin!',
    pnlCardCloseBtn: 'Tutup',

    // 11. Meme Launchpad (pump.fun / Crash)
    modePerps: 'Perps Futures',
    modeLaunchpad: 'Meme Launchpad',
    modeShop: 'Shop',
    shopTitle: 'DEGEN SHOP',
    shopSubtitle: 'Pusat Belanja Degen: Upgrade Infrastruktur & Power-Up Black Market.',
    shopTabInfra: 'Infrastruktur',
    shopTabBlackMarket: 'Black Market',
    shopInfraTitle: 'Hardware & Infrastruktur Mining',
    shopInfraDesc: 'Upgrade rig mining dan bot quant otomatis untuk meningkatkan pendapatan pasif (DPS).',
    shopBlackMarketDesc: 'Beli item rahasia dan power-up sekali pakai untuk memanipulasi chart bursa.',
    totalDpsGenerated: 'Total Passive DPS:',
    memeTitle: 'MEMECOIN PUMP.FUN ROCKET',
    memeSubtitle: 'Pasang taruhan, saksikan roket melesat ke bulan, dan Cash Out sebelum dev melakukan RUGPULL!',
    memeApeInBtn: 'APE-IN TARUHAN',
    memeCashOutBtn: 'CASH OUT SEKARANG',
    memeWaitingRocket: 'Mempersiapkan Peluncuran Koin Baru...',
    memeFlying: 'ROKET MELUNCUR KE BULAN!',
    memeRugged: '💥 DEV RUGPULL! SEMUA LIKUIDITAS DIKOSONGKAN!',
    memeCashedOutSuccess: '🎉 BERHASIL CASH OUT!',
    memeLastCrashes: 'Riwayat Peluncuran Terakhir:',
    memeCurrentApe: 'Taruhan Aktif:',
    memePotentialPayout: 'Potensi Cuan:',
    memeWindowActive: 'JENDELA FAIR LAUNCH AKTIF',
    memeWindowClosesIn: 'Sisa Waktu Jendela:',
    memeRadarScanningTitle: 'SOLANA & BASE MEME RADAR',
    memeRadarScanningDesc: 'Memindai mempool on-chain untuk mendeteksi dev yang men-deploy koin meme baru...',
    memeNextDropEstimate: 'Estimasi Fair Launch Berikutnya:',
    memeRadarStandby: 'RADAR STANDBY / MEMPOOL SCANNING',
    memeRadarCooldownNotice: 'Peluncuran koin dibatasi setiap ~15 menit acak.',
    memeActivateRadarBtn: '⚡ Aktifkan Insider Radar (Skip Cooldown)',
    memeWindowOpenedToast: '🚀 [RADAR MEME] Token baru terdeteksi di Pump.fun! Jendela Fair Launch dibuka 3 menit!',
    bmStatusOpen: 'JALUR PENYELUNDUP TERBUKA',
    bmStatusClosed: 'PASAR GELAP SEDANG OFFLINE',
    bmClosedReason: 'Penyelundup bersembunyi dari razia aparat bursa & SEC.',
    bmScheduleTitle: 'Jadwal Operasional Penyelundup:',
    bmSession1: '🌙 Sesi Malam: 02:00 - 03:00 WIB',
    bmSession2: '☀️ Sesi Sore: 14:00 - 15:00 WIB',
    bmNextSessionIn: 'Sesi berikutnya dibuka dalam:',
    bmClosesIn: 'Sesi ditutup dalam:',
    bmClosedBuyBtn: '🔒 TUTUP (Buka Jam Tertentu)',
    bmOpenedToast: '🕶️ [PASAR GELAP] Penyelundup telah tiba! Jalur pasar gelap dibuka untuk beberapa jam ke depan!'
  },

  en: {
    // Header & Global Stats
    appTitle: 'DEGEN & WHALE',
    appSubtitle: 'TRADING FLOOR SIMULATOR',
    netWorth: 'Net Worth',
    cash: 'Cash',
    passiveIncome: 'Passive Income',
    whaleTokens: 'Whale Tokens',
    dailyAid: 'Daily Aid',
    dailyAidClaimed: 'Claimed',
    dailyAidDesc: 'Claim $5.00 emergency free cash (24h cooldown)',
    missions: 'Quests',
    audioOn: 'Sound ON',
    audioOff: 'Sound MUTED',
    settings: 'Settings',
    rugpull: 'Execute Rugpull',
    rugpullBadge: 'PRESTIGE',
    toggleSidebarOpen: 'Collapse Sidebar',
    toggleSidebarClose: 'Expand Sidebar',
    language: 'Language',

    // News Ticker
    news: [
      '🚨 BREAKING: Dev of $CUAN token admits to forgetting liquidity wallet password, holders crying in Telegram.',
      '📈 ANALYSIS: Experts predict the chart will move to the right today with 100% probability.',
      '☕ LIFESTYLE: Financial district workers buying iced lattes on credit so their paycheck can go all-in on dog coins.',
      '⚠️ REGULATION: Government considering a luxury tax on traders flexing green PnL with a $5 capital.',
      '🔥 VIRAL: College student accidentally buys mining stock due to ticker typo, ends up 400% in profit.',
      '🤖 TECH: Trading AI bot goes on strike, demanding mental health days over relentless sideways market.',
      '🐋 WHALE ALERT: Mysterious wallet just moved $500M from its right pocket to its left pocket.'
    ],

    // Chart & Drawing Tools
    pair: 'Pair',
    timeframe: 'Timeframe',
    indicators: 'Indicators',
    drawingTools: 'Drawing Tools',
    toolCursor: 'Standard Cursor / Crosshair (Esc)',
    toolTrendline: 'Trendline (Click 2 points on chart)',
    toolHorizontal: 'Horizontal Line / Support & Resistance (1 click at price level)',
    toolBox: 'Zone Box / Supply & Demand (Click 2 corners on chart)',
    toolFreehand: 'Analysis Pen / Freehand Drawing (Drag mouse to draw)',
    toolUndo: 'Undo Last Drawing (Ctrl+Z)',
    toolClearAll: 'Clear All Drawings on This Pair',
    toolDelete: 'Delete selected drawing (Del / Backspace)',
    toolDeselect: 'Deselect (Esc)',
    deleteBtn: 'Delete',
    zoomTime: 'Time Zoom',
    zoomPrice: 'Price Zoom',
    zoomTimeHint: 'Drag right: Zoom In | Drag left: Zoom Out | Double-click: Reset',
    zoomPriceHint: 'Drag up: Zoom In | Drag down: Zoom Out | Double-click: Reset',
    resetZoom: 'Reset Zoom & Pan (Return to Auto-Fit)',
    liveHintTrendline1: 'Click first point to start trendline',
    liveHintTrendline2: 'Click 2nd point to lock trendline',
    liveHintHorizontal: 'Click on chart to place Support/Resistance price level',
    liveHintBox1: 'Click starting corner to create zone box',
    liveHintBox2: 'Click 2nd point to lock zone box',
    liveHintFreehand: 'Click and drag mouse to draw freely on chart',
    liveHintEsc: 'Press Esc to cancel',

    // Order Form
    orderForm: 'Order Execution Form',
    marginCapital: 'MARGIN CAPITAL',
    leverage: 'LEVERAGE',
    takeProfit: 'Take Profit (Optional):',
    stopLoss: 'Stop Loss (Optional):',
    tpSubHint: 'L > Entry | S < Entry',
    slSubHint: 'L < Entry | S > Entry',
    tpPlaceholder: 'e.g.',
    slPlaceholder: 'e.g.',
    estProfit: 'Est. Profit',
    estLoss: 'Est. Loss',
    buyLong: 'BUY / LONG',
    sellShort: 'SELL / SHORT',
    orderSize: 'Size:',
    estLiquidation: 'Est. Liquidation',
    openingTax: 'Opening Fee (1.5%)',
    orderFeeNote: '1.5% fee deducted from margin on entry. Liquidation triggers if ROI hits -92%.',

    // Active Position Card & Multi-Position
    activePosition: 'OPEN POSITION',
    openPositionsTitle: 'OPEN POSITIONS',
    closeAllPositions: 'Close All Positions',
    maxPositionsAlert: 'Maximum 5 active positions reached!',
    slotsLeft: 'Position Slots',
    totalUnrealizedPnl: 'Total Open PnL',
    marginRatio: 'Margin Ratio',
    marginSafe: 'Safe',
    marginWarning: 'Warning',
    marginDanger: 'Call Danger',
    bracketLimit: 'Tier Bracket',
    maxBracketExceeded: 'Position size exceeds Binance Tier Bracket limit for this leverage!',
    posTypeLong: 'LONG',
    posTypeShort: 'SHORT',
    openChart: 'Open Chart',
    posMargin: 'Margin:',
    posSize: 'Size:',
    posEntry: 'Entry Price:',
    posMarket: 'Market Price',
    posLiq: 'Liq:',
    posAway: 'away',
    posNotSet: 'Not set',
    posTpTitle: 'Click to adjust Take Profit Target',
    posSlTitle: 'Click to adjust Stop Loss',
    unrealizedPnl: 'Unrealized PnL',
    priceRoi: 'Price ROI:',
    purePriceRoiTooltip: 'Pure profit / loss from market price difference (100% Price Action)',
    closePosition: 'Close / TP',

    // Workstation & Diorama
    workstationLv: 'WORKSTATION LV.',
    upkeepFee: 'Upkeep Fee:',
    upkeepTax: 'Upkeep Tax:',
    rankLabel: 'Rank:',
    automatedCluster: 'AUTOMATED BOT CLUSTER ONLINE',
    openGallery: 'Open Gallery',
    availableCash: 'Available Cash',
    grossDps: 'Gross DPS',
    netDps: 'Net DPS',
    generatesPassive: 'Generates',
    secPassively: '/ sec passively',
    dailyAidClaimedMsg: 'Social relief aid has been claimed today. Check back tomorrow!',
    dailyAidUnclaimedMsg: 'Claim Daily Social Relief Aid of',
    dailyAidClaimedBtn: 'Claimed Today',
    dailyAidClaimBtn: 'Claim $5.00 Aid',

    // 7 Workstations
    locations: {
      1: {
        name: 'Cramped Dorm Room',
        sub: 'Potato Laptop & Dusty Electric Fan',
        badge: 'Exit Liquidity',
        quote: '"Semester meal budget on the line, surely buying a Lambo tomorrow."',
        archBadge: '3D DORM MODEL'
      },
      2: {
        name: '24h VIP Cyber Cafe',
        sub: 'All-Night Gaming Pass + Jumbo Iced Tea',
        badge: 'Penny Scalper',
        quote: '"The 1-minute chart is my ninja way."',
        archBadge: '3D CYBER POD'
      },
      3: {
        name: '2-Story Shophouse',
        sub: 'Trading Office & Community HQ',
        badge: 'Local Market Maker',
        quote: '"Don\'t forget to join my VIP channel, limited seats!"',
        archBadge: '3D PHYSICAL SHOPHOUSE'
      },
      4: {
        name: 'SCBD Penthouse',
        sub: 'Panoramic Skyline & Glass Walls',
        badge: 'Market Mover',
        quote: '"Retail panics and dumps, we scoop the bottom while sipping espresso."',
        archBadge: '3D SKYSCRAPER TOWER'
      },
      5: {
        name: 'Sovereign Whale Private Island',
        sub: 'Private Satellite & Underground Server Vault',
        badge: 'Sovereign Whale',
        quote: '"I don\'t read charts. I am the one who paints the charts."',
        archBadge: '3D FLOATING ISLAND'
      },
      6: {
        name: 'Lunar Shadow Citadel',
        sub: 'Zero-Gravity Quantum Servers, Off-Earth Jurisdiction',
        badge: 'Interplanetary Syndicate',
        quote: '"Earth taxes have no authority in the Mare Tranquillitatis crater."',
        archBadge: '3D LUNAR DOME'
      },
      7: {
        name: 'The Architect of Singularity',
        sub: 'Sole Controller of Global Liquidity Algorithm',
        badge: 'God of Liquidity',
        quote: '"Money is merely variables inside the universe I programmed."',
        archBadge: '3D QUANTUM OCTAHEDRON'
      }
    },

    // Robotic Infrastructure Upgrades
    tabInfra: 'Infrastructure',
    tabQuests: 'Quests',
    tabHistory: 'Trade Log',
    closeSidebarText: 'Close',
    closeSidebarTitle: 'Close Sidebar (Maximize Chart View)',
    openSidebarTitle: 'Open Infrastructure & Quests Panel',
    buyOne: 'BUY +1',
    upgrades: {
      indikator: {
        name: 'Sacred Line Indicator',
        desc: 'Draw support and resistance lines wherever intuition guides.'
      },
      vip_grup: {
        name: "'Sure Win' VIP Signals Group",
        desc: "Follow the master's calls—sometimes TP, usually bag-holding."
      },
      monitor_4x: {
        name: '4x Vertical Trading Monitors',
        desc: 'The more monitors you have, the more elite you appear to peers.'
      },
      sniper_bot: {
        name: 'Sniper Bot (Solana/DEX)',
        desc: 'Snipes meme coins at second zero before the dev can rug.'
      },
      quant_dev: {
        name: 'Hire Quant Developer',
        desc: 'Math olympiad gold medalist who sustains solely on espresso.'
      },
      ai_cluster: {
        name: 'Agentic AI Trading Cluster',
        desc: 'GPU cluster predicting global breaking news & influencer tweets.'
      },
      own_exchange: {
        name: 'Launch Own Exchange & Coin',
        desc: 'Why trade the market when you can harvest retail exchange fees?'
      },
      lobby_reg: {
        name: 'Regulatory & Tax Lobbying Team',
        desc: 'Shape financial market laws to always favor syndicate whales.'
      },
      quantum_arb: {
        name: 'Quantum Arbitrage Satellite',
        desc: 'Front-running global transactions directly from low-Earth orbit.'
      },
      central_bank: {
        name: 'Central Bank Printing Press',
        desc: 'Brrr! Print infinite liquidity whenever your portfolio bleeds red.'
      },
      bot1: {
        name: 'Telegram Scalper Bot',
        desc: 'Python scripts executing 24/7 micro-arbitrage across degen call groups.'
      },
      bot2: {
        name: 'High-Frequency AI Arbitrage',
        desc: 'Deep learning models capturing cross-exchange price discrepancies in milliseconds.'
      },
      server1: {
        name: 'Mini Cyber Cafe Server Rack',
        desc: 'Co-located AC-cooled server rack shaving latency down by 12ms.'
      },
      server2: {
        name: 'SCBD Dedicated Data Center',
        desc: 'Tier-4 high-security facility wired directly into exchange dark fiber optic links.'
      },
      whale1: {
        name: 'Insider Whale Signal Access',
        desc: 'Direct intelligence from private syndicate WhatsApp groups before liquidity injection.'
      },
      whale2: {
        name: 'Institutional Market Making Algo',
        desc: 'Provide bid-ask liquidity and harvest spread profits from retail order flow.'
      },
      satellite: {
        name: 'Low-Earth Orbit Satellite Link',
        desc: 'Ultra-low-latency microwave laser transceivers bypassing undersea fiber cables.'
      }
    },

    // Daily Quests
    dailyQuests: {
      daily_trade_3: {
        title: 'Daily Scalping',
        desc: 'Execute 3 leverage trades today.'
      },
      daily_profit_5: {
        title: 'Daily Profit',
        desc: 'Accumulate $5.00 total trading profit today.'
      },
      daily_tpsl: {
        title: 'Risk Management Discipline',
        desc: 'Set a TP or SL on an active position today.'
      },
      daily_check_infra: {
        title: 'Rig Maintenance',
        desc: 'Buy or upgrade at least 1 passive infrastructure item today.'
      }
    },

    // Milestone Quests
    milestoneQuests: {
      first_trade: {
        title: 'First Trade Opened',
        desc: 'Open 1 leverage trading position (LONG or SHORT).'
      },
      switch_pair: {
        title: 'Multi-Asset Analysis',
        desc: 'Switch trading pair coin or change chart timeframe.'
      },
      close_profit: {
        title: 'First Profitable Close',
        desc: 'Close an open trade with net positive profit > $0.'
      },
      use_tpsl: {
        title: 'Disciplined Trader',
        desc: 'Set Take Profit or Stop Loss on an active position.'
      },
      first_upgrade: {
        title: 'Install Indicator Rig',
        desc: 'Buy Technical Indicator upgrade Lv 1 for passive income.'
      },
      daily_login: {
        title: 'Claim Daily Relief Aid',
        desc: 'Claim daily relief funds from the workstation cashier.'
      },
      trade_streak_5: {
        title: 'Diligent Scalper',
        desc: 'Complete a total of 5 leverage trading transactions.'
      },
      buy_vip: {
        title: 'VIP Signal Syndicate',
        desc: 'Buy VIP Signal Group upgrade Lv 1.'
      },
      networth_100: {
        title: 'Consistent Trader',
        desc: 'Reach a Peak Net Worth of $100.00.'
      },
      high_leverage_win: {
        title: 'Bold Degen',
        desc: 'Win a trade with high 50x or 100x leverage.'
      },
      networth_1k: {
        title: 'Commercial Whale',
        desc: 'Reach a Peak Net Worth of $1,000.00.'
      },
      dps_10: {
        title: 'Passive Income Machine',
        desc: 'Reach passive income (Net DPS) of at least $10.00/sec.'
      }
    },

    // Extra UI Elements
    sharePnl: 'Share PnL',
    realMarketSim: 'Real Market Simulation',
    simDisclaimerTitle: 'Simulation Note:',
    simDisclaimerDesc: 'All asset pairs and price fluctuations are fractal simulations for entertainment/gaming, not real financial transactions.',
    searchPairPlaceholder: 'Search pair (BTC, ETH, SOL, USD)...',
    filterAllPairs: 'All (10)',
    filterTopCrypto: 'Top Crypto',
    filterMeme: 'Meme/Degen',
    filterActivePos: 'Active Positions',
    tableHeaderPair: 'Pair',
    tableHeaderPrice: 'Price',
    tableHeaderTrend: '24h Trend',
    noPairsFound: 'No pairs found',
    badgePosition: 'POSITION',
    targetNext: 'Next Target:',
    showcase3d: '3D Showcase',
    leftSec: 's left',
    withdrawColdWallet: 'WITHDRAW TO COLD WALLET',
    bearMarketBanner: 'BEAR MARKET -55% DPS',
    bullRunBanner: '5x PROFIT ACTIVE',

    // Missions & Quests Drawer
    missionsBannerTitle: 'Missions & Liquidity Rewards',
    missionsBannerSub: 'Complete missions for starter capital & accelerate your trading rig expansion!',
    readyToClaim: 'Ready to Claim',
    chipAll: 'All',
    chipDaily: 'Daily (24H)',
    chipPhase1: 'Mission 1',
    chipPhase2: 'Mission 2',
    chipPhase3: 'Mission 3',
    dailyGroupTitle: 'Daily Quests (24-Hour Reset)',
    completed: 'Done',
    statusClaimed: 'Claimed',
    btnClaim: 'CLAIM',
    statusInProcess: 'In Progress',
    statusLocked: 'Locked',
    phaseTitles: {
      1: { title: 'Mission 1: Cramped Dorm (Starter Onboarding)', sub: 'Trading basics & risk management ($1.50 - $2.50)' },
      2: { title: 'Mission 2: Passive Cashflow', sub: 'Building automated rig revenue stream ($3.00 - $15.00)' },
      3: { title: 'Mission 3: Cyber Cafe Sultan', sub: 'Whale scaling & leverage expansion ($20.00 - $150.00)' }
    },
    reqUnlockPhase2: 'Requirements to Unlock Mission 2:',
    reqUnlockPhase3: 'Requirements to Unlock Mission 3:',
    reqPhase2Desc1: 'Complete all 4 tasks in',
    reqPhase2Desc2: 'and purchase infrastructure item',
    reqPhase3Desc1: 'Complete all 4 tasks in',
    reqPhase3Desc2: 'and purchase infrastructure item',
    statusCompleted: '✓ Completed',
    statusPurchased: '✓ Purchased',
    statusPending: 'Pending',
    noTradeHistory: 'No Leverage Trading history yet.',
    terminalFeed: 'TERMINAL FEED',

    // Modals
    // 1. Liquidation Modal
    liqModalTitle: 'MARGIN CALL / LIQUIDATED!',
    liqModalDesc1: 'Your',
    liqModalDesc2: 'position was wiped out by market volatility.',
    liqModalBailoutBtn: 'Claim 20% Bailout Funds',
    liqModalAcceptBtn: 'Accept Fate & Continue Idle',

    // 2. PnL Flex Modal
    pnlModalTitle: 'DEGEN & WHALE',
    pnlModalRoiHeader: 'ALL-TIME PORTFOLIO ROI',
    pnlModalNetWorth: 'NET WORTH',
    pnlModalPassive: 'PASSIVE INCOME',
    pnlModalCopied: 'Copied!',
    pnlModalCopyBtn: 'Copy Stats',
    pnlModalCloseBtn: 'Close',

    // 3. Prestige / Rugpull Modal
    prestigeTitle: 'Launch New Token & Rugpull',
    prestigeSub: 'Prestige System',
    prestigeDesc: 'Reset your cash and infrastructure to launch a new token and earn Whale Tokens (+50% permanent profit bonus).',
    prestigeCurrentTokens: 'Current Whale Tokens:',
    prestigeClaimTokens: 'Claim Tokens:',
    prestigeTokensUnit: 'Tokens',
    prestigeExecuteBtn: 'Execute Rugpull',
    prestigeCancelBtn: 'Cancel',
    prestigeWarningTitle: 'RUGPULL CONSEQUENCES & IMPACT',
    prestigeResetNoticeTitle: 'What Will Be Reset (Lost):',
    prestigeResetCash: 'Trading cash balance resets back to initial $10.00.',
    prestigeResetInfra: 'All hardware and passive mining rig levels reset to Level 0.',
    prestigeResetPositions: 'Active trade positions & TP/SL orders are closed immediately.',
    prestigeKeepNoticeTitle: 'What You Keep & Gain (Permanent):',
    prestigeKeepTokens: 'Whale Tokens are permanently credited to your account.',
    prestigeKeepBonus: 'Each token grants a permanent +50% profit multiplier forever.',
    prestigeKeepDividend: 'Each token generates an automatic +$5.00/s passive dividend forever (never goes broke).',
    prestigeKeepFaucet: 'Access privilege to the Whale Emergency Faucet whenever capital drops critically low.',
    prestigeKeepHistory: 'Workstation tier milestones and Black Market stash remain intact.',

    // Whale Emergency Faucet
    whaleFaucetTitle: 'WHALE EMERGENCY FAUCET',
    whaleFaucetDesc: 'Emergency liquidity safety net exclusively for Whale Token holders when capital is critical.',
    whaleFaucetClaimBtn: 'Claim Bailout',
    whaleFaucetCooldown: 'Cooldown',
    whaleFaucetReady: 'Standby',

    // 4. Settings Modal
    settingsTitle: 'Settings',
    settingsAutoSaveTitle: 'Progress saved automatically',
    settingsAutoSaveDesc: 'Saves every 3 seconds, after transactions, and on page unload. Legacy saves are automatically migrated on the same domain and browser.',
    settingsOfflineDesc: 'Offline earnings: maximum 8 hours, excluding event bonuses. Active position price simulation is paused while closed.',
    settingsLanguageTitle: 'Display Language',
    settingsLanguageDesc: 'Switch between English and Indonesian',
    settingsAudioTitle: 'Cyberpunk Synth Sound Effects',
    settingsAudioDesc: 'Synthesized Web Audio API soundscape (order, profit, liquidation, upgrade).',
    settingsAudioMuted: 'Muted',
    settingsAudioActive: 'Active',
    settingsResetTitle: 'Reset Game Progress',
    settingsResetDesc: 'Wipe all progress & start fresh from scratch.',
    settingsResetConfirmBtn: 'Yes, delete progress',
    settingsResetBtn: 'Hard Reset',
    settingsResetWarning: 'All progress and Whale Tokens will be permanently deleted.',
    settingsResetCancel: 'Cancel reset',

    // 5. Offline Modal
    offlineTitle: 'Bots & Crew Kept Working!',
    offlineDesc: 'While you were away ({seconds} seconds, max 8 hours), the system generated:',
    offlineClaimBtn: 'Added to cash, continue',

    // 6. Multi-tab Lock Modal
    multiTabTitle: 'Active Session in Another Tab',
    multiTabDesc: 'Game is currently running in another browser tab. To avoid overwriting net worth, upgrades, and trading positions, this terminal is paused.',
    multiTabShieldTitle: 'Multi-Tab Sync Protection',
    multiTabShieldDesc: 'Autosave and market engine are paused on this tab to prevent progress conflict. Click below to take over trading control in this tab.',
    multiTabTakeOverBtn: 'Use in This Tab (Take Over)',

    // 7. Adjust TP/SL Modal
    adjustModalTitle: 'Adjust Position TP & SL',
    adjustModalEntry: 'Entry',
    adjustModalMargin: 'Margin',
    adjustModalLiq: 'Liquidation',
    adjustModalRemoveTp: 'Remove TP',
    adjustModalRemoveSl: 'Remove SL',
    adjustModalPreset: 'Preset:',
    adjustModalEstProfit: 'Est. Profit:',
    adjustModalTotalReturnCash: 'Total returned to cash:',
    adjustModalTpAbove: 'TP for {type} must be {direction} entry (${entry})',
    adjustModalEstLoss: 'Est. Loss:',
    adjustModalRemainingCash: 'Remaining capital returned:',
    adjustModalSlLiqBreached: 'SL cannot breach liquidation price (${liq})',
    adjustModalSlBelow: 'SL for {type} must be {direction} entry (${entry})',
    adjustModalCancelBtn: 'Cancel',
    adjustModalSaveBtn: 'Save TP/SL',

    // 8. Workstation Gallery Modal
    galleryTitle: 'Workstation Evolution & 3D Ranks',
    gallerySub: '3D visualization of trading headquarters from Cramped Dorm to The Architect of Singularity',
    galleryLevelsBadge: '7 LEVELS',
    galleryStatusActive: 'ACTIVE',
    galleryStatusUnlocked: '✓ UNLOCKED',
    galleryStatusLocked: 'LOCKED',
    galleryPeakNetWorth: 'Peak Net Worth:',
    galleryWhaleTokens: 'Whale Token:',
    galleryTokensUnit: 'Tokens',
    galleryUpkeepFee: 'Upkeep Fee:',
    galleryCurrentFooter: 'Current workstation:',
    galleryCloseBtn: 'Close Gallery',

    // 9. Black Market
    tabBlackMarket: 'Black Market',
    blackMarketTitle: 'Degen Black Market',
    blackMarketSubtitle: 'Purchase secret consumables and power-ups to manipulate the market & protect capital.',
    ownedLabel: 'Owned',
    buyItemBtn: 'Buy (+1)',
    inventoryQuickBar: 'Quick Inventory:',
    itemPumpWhistle: 'Whale Pump Whistle',
    itemPumpWhistleDesc: 'Blow whale whistle for instant buy injection (+3% to +5%). [Limit: 1x/day • Degen Perps only • Protected by Slippage & Rebound].',
    itemDumpHorn: 'Whale Dump Horn',
    itemDumpHornDesc: 'Sound dump horn for instant panic sell (-3% to -5%). [Limit: 1x/day • Degen Perps only • Protected by Slippage & Rebound].',
    whaleItemDailyLimitNote: '⚡ 1x/Day • Degen Perps Only',
    whaleUsedTodayBadge: 'Used Today (Resets 00:00)',
    itemLiqShield: 'Liquidation Shield',
    itemLiqShieldDesc: 'One-time insurance shield. Saves 85% of your margin capital if price hits liquidation.',
    itemLev250x: 'God Leverage 250x Ticket',
    itemLev250xDesc: 'Unlocks extreme 250x leverage execution for your next position. Maximum degen risk!',
    itemZeroFee: 'Zero-Fee VIP Pass',
    itemZeroFeeDesc: 'Enjoy 100% exchange fee waiver for the next 10 minutes.',
    itemInsiderRadar: 'Insider Alpha Radar',
    itemInsiderRadarDesc: 'Intercepts private alpha telegrams. Locks in bullish market bias probability for 45s!',
    toastPumpWhistle: '🟢 WHALE PUMP! Giant green candle injected into the chart!',
    toastDumpHorn: '🔴 WHALE DUMP! Sudden panic sell liquidation cascade triggered!',
    toastLiqShieldSaved: '🛡️ LIQUIDATION SHIELD SHATTERED! 85% of margin saved from wipeout!',
    toastLev250xActive: '⚡ 250x GOD LEVERAGE READY! 250x button unlocked for next trade!',
    toastZeroFeeActive: '💎 ZERO-FEE VIP PASS ACTIVE! 0% trading fee for 10 minutes!',
    toastInsiderRadarActive: '📡 INSIDER ALPHA RADAR ACTIVE! Bullish market bias locked for 45s!',

    // 10. PnL Share Card Modal
    pnlCardTitle: 'Viral PnL Card Generator',
    pnlCardSub: 'Render high-resolution Bybit / Binance Cyberpunk style PnL cards ready to flex on social media.',
    pnlCardTabPortfolio: 'All-Time Portfolio',
    pnlCardTabPosition: 'Active Position / Trade',
    pnlCardDownloadBtn: 'Download Image (PNG)',
    pnlCardCopyImgBtn: 'Copy Image to Clipboard',
    pnlCardCopiedImg: '✓ Image Copied to Clipboard!',
    pnlCardCopiedFallback: '✓ Stats Copied to Clipboard!',
    pnlCardCloseBtn: 'Close',

    // 11. Meme Launchpad (pump.fun / Crash)
    modePerps: 'Perps Futures',
    modeLaunchpad: 'Meme Launchpad',
    modeShop: 'Shop',
    shopTitle: 'DEGEN SHOP',
    shopSubtitle: 'All-in-One Degen Store: Infrastructure Upgrades & Black Market Power-Ups.',
    shopTabInfra: 'Infrastructure',
    shopTabBlackMarket: 'Black Market',
    shopInfraTitle: 'Hardware & Mining Infrastructure',
    shopInfraDesc: 'Upgrade mining rigs and automated quant bots to generate passive cash (DPS).',
    shopBlackMarketDesc: 'Purchase consumables and illicit power-ups to manipulate market candles.',
    totalDpsGenerated: 'Total Passive DPS:',
    memeTitle: 'MEMECOIN PUMP.FUN ROCKET',
    memeSubtitle: 'Place your ape bet, watch the rocket fly to the moon, and Cash Out before dev RUGPULLS!',
    memeApeInBtn: 'APE-IN BET',
    memeCashOutBtn: 'CASH OUT NOW',
    memeWaitingRocket: 'Preparing next token launch...',
    memeFlying: 'ROCKET BLASTING OFF TO THE MOON!',
    memeRugged: '💥 DEV RUGPULL! ALL LIQUIDITY DRAINED!',
    memeCashedOutSuccess: '🎉 CASHED OUT SUCCESSFULLY!',
    memeLastCrashes: 'Recent Token Multipliers:',
    memeCurrentApe: 'Active Bet:',
    memePotentialPayout: 'Potential Payout:',
    memeWindowActive: 'FAIR LAUNCH WINDOW ACTIVE',
    memeWindowClosesIn: 'Window Closes In:',
    memeRadarScanningTitle: 'SOLANA & BASE MEME RADAR',
    memeRadarScanningDesc: 'Scanning on-chain mempool for new meme token deployments...',
    memeNextDropEstimate: 'Estimated Next Fair Launch:',
    memeRadarStandby: 'RADAR STANDBY / MEMPOOL SCANNING',
    memeRadarCooldownNotice: 'Token launches are paced at ~15m randomized intervals.',
    memeActivateRadarBtn: '⚡ Activate Insider Radar (Skip Cooldown)',
    memeWindowOpenedToast: '🚀 [MEME RADAR] New token detected on Pump.fun! Fair Launch window open for 3 minutes!',
    bmStatusOpen: 'SMUGGLER CHANNELS OPEN',
    bmStatusClosed: 'BLACK MARKET OFFLINE',
    bmClosedReason: 'Smugglers are laying low to evade regulatory raids.',
    bmScheduleTitle: 'Smuggler Operation Schedule:',
    bmSession1: '🌙 Night Shift: 02:00 - 03:00 Local',
    bmSession2: '☀️ Afternoon Drop: 14:00 - 15:00 Local',
    bmNextSessionIn: 'Next session opens in:',
    bmClosesIn: 'Session closes in:',
    bmClosedBuyBtn: '🔒 CLOSED (Scheduled Hours)',
    bmOpenedToast: '🕶️ [BLACK MARKET] Smugglers have arrived! Illicit dead-drop is open for a few hours!'
  }
};
