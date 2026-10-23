/**
 * Live Crypto Feed Service
 * Connects to live exchange ticker data (Binance WebSocket + Binance Vision REST Fallback)
 * to provide 1:1 real-world market prices for crypto_real pairs (BTC, ETH, SOL, BNB, AVAX, LINK).
 */

const SYMBOL_MAP = {
  'BTCUSDT': 'BTC/USDT',
  'ETHUSDT': 'ETH/USDT',
  'SOLUSDT': 'SOL/USDT',
  'BNBUSDT': 'BNB/USDT',
  'DOGEUSDT': 'DOGE/USDT',
  'AVAXUSDT': 'AVAX/USDT',
  'LINKUSDT': 'LINK/USDT',
};

const BINANCE_WS_STREAMS = Object.keys(SYMBOL_MAP)
  .map(s => `${s.toLowerCase()}@miniTicker`)
  .join('/');

const REST_ENDPOINTS = [
  'https://data-api.binance.vision/api/v3/ticker/24hr',
  'https://api.binance.com/api/v3/ticker/24hr',
];

const KLINES_ENDPOINTS = [
  'https://data-api.binance.vision/api/v3/klines',
  'https://api.binance.com/api/v3/klines',
];

class LiveCryptoFeed {
  constructor() {
    this.subscribers = new Set();
    this.ws = null;
    this.isWsConnected = false;
    this.pollInterval = null;
    this.reconnectTimeout = null;
    this.latestPrices = {};
    this.isStarted = false;
  }

  start() {
    if (typeof window === 'undefined' || this.isStarted) return;
    this.isStarted = true;

    // 1. Initial REST snapshot for instant price hydration
    this.fetchRestSnapshot();

    // 2. Start WebSocket stream
    this.connectWs();

    // 3. Fallback poll interval every 4 seconds in case WebSocket drops or is filtered by local DNS
    this.pollInterval = setInterval(() => {
      if (!this.isWsConnected) {
        this.fetchRestSnapshot();
      }
    }, 4000);
  }

  stop() {
    this.isStarted = false;
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        // ignore
      }
      this.ws = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.isWsConnected = false;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    if (Object.keys(this.latestPrices).length > 0) {
      callback(this.latestPrices);
    }
    if (!this.isStarted) {
      this.start();
    }
    return () => {
      this.subscribers.delete(callback);
      if (this.subscribers.size === 0) {
        this.stop();
      }
    };
  }

  notify(updates) {
    this.latestPrices = { ...this.latestPrices, ...updates };
    this.subscribers.forEach(cb => {
      try {
        cb(this.latestPrices);
      } catch (e) {
        console.error('Error in crypto feed subscriber:', e);
      }
    });
  }

  connectWs() {
    if (typeof window === 'undefined' || !this.isStarted) return;

    try {
      const wsUrl = `wss://stream.binance.com:9443/stream?streams=${BINANCE_WS_STREAMS}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isWsConnected = true;
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const data = parsed.data || parsed;
          if (data && data.s && SYMBOL_MAP[data.s]) {
            const pairSymbol = SYMBOL_MAP[data.s];
            const price = parseFloat(data.c);
            const open24h = parseFloat(data.o);
            const high24h = parseFloat(data.h);
            const low24h = parseFloat(data.l);

            if (Number.isFinite(price) && price > 0) {
              this.notify({
                [pairSymbol]: {
                  price,
                  open24h,
                  high24h,
                  low24h,
                  time: data.E || Date.now()
                }
              });
            }
          }
        } catch (err) {
          // parse error ignored
        }
      };

      this.ws.onerror = () => {
        this.isWsConnected = false;
      };

      this.ws.onclose = () => {
        this.isWsConnected = false;
        if (this.isStarted) {
          this.reconnectTimeout = setTimeout(() => {
            this.connectWs();
          }, 5000);
        }
      };
    } catch (e) {
      this.isWsConnected = false;
    }
  }

  async fetchRestSnapshot() {
    const symbolsParam = JSON.stringify(Object.keys(SYMBOL_MAP));

    for (const endpoint of REST_ENDPOINTS) {
      try {
        const res = await fetch(`${endpoint}?symbols=${encodeURIComponent(symbolsParam)}`, {
          cache: 'no-store',
          signal: AbortSignal.timeout ? AbortSignal.timeout(3500) : undefined
        });
        if (!res.ok) continue;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const updates = {};
          data.forEach(item => {
            const pair = SYMBOL_MAP[item.symbol];
            if (pair) {
              const price = parseFloat(item.lastPrice || item.c);
              const open24h = parseFloat(item.openPrice || item.o);
              const high24h = parseFloat(item.highPrice || item.h);
              const low24h = parseFloat(item.lowPrice || item.l);
              if (Number.isFinite(price) && price > 0) {
                updates[pair] = {
                  price,
                  open24h,
                  high24h,
                  low24h,
                  time: Date.now()
                };
              }
            }
          });
          if (Object.keys(updates).length > 0) {
            this.notify(updates);
            return;
          }
        }
      } catch (err) {
        // try next endpoint
      }
    }
  }

  /**
   * Fetch real historical candlesticks for a real crypto pair (e.g. SOLUSDT)
   * interval: '5m', '15m', '1h', '4h', '1d'
   */
  async fetchKlines(pairSymbol, interval = '1d', limit = 100) {
    const rawSymbol = Object.keys(SYMBOL_MAP).find(k => SYMBOL_MAP[k] === pairSymbol);
    if (!rawSymbol) return null;

    for (const endpoint of KLINES_ENDPOINTS) {
      try {
        const url = `${endpoint}?symbol=${rawSymbol}&interval=${interval}&limit=${limit}`;
        const res = await fetch(url, {
          cache: 'no-store',
          signal: AbortSignal.timeout ? AbortSignal.timeout(4000) : undefined
        });
        if (!res.ok) continue;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map(k => ({
            time: k[0],
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4])
          })).filter(c => Number.isFinite(c.open) && Number.isFinite(c.close));
        }
      } catch (e) {
        // try next endpoint
      }
    }
    return null;
  }
}

export const liveCryptoFeed = new LiveCryptoFeed();
