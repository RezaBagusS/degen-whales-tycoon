// Exchange-grade Telemetry, APM & Error Tracking Engine for Degen & Whale Tycoon
// Supports in-memory ring buffer monitoring & optional Sentry forwarder

const MAX_LOG_ENTRIES = 200;
const MAX_LATENCY_SAMPLES = 500;

class TelemetryStore {
  constructor() {
    this.errors = [];
    this.latencySamples = [];
    this.webVitals = [];
    this.startTime = Date.now();
  }

  recordError({ message, stack, source = 'server', route = '/', user = null, metadata = {} }) {
    const errorEntry = {
      id: `err-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      message: String(message || 'Unknown error'),
      stack: stack ? String(stack) : null,
      source,
      route,
      user,
      metadata
    };

    this.errors.unshift(errorEntry);
    if (this.errors.length > MAX_LOG_ENTRIES) {
      this.errors.pop();
    }

    // Forward to Sentry if SENTRY_DSN is configured
    this.forwardToSentry(errorEntry).catch(() => {});

    return errorEntry;
  }

  recordLatency(endpoint, durationMs, statusCode = 200) {
    const sample = {
      endpoint,
      durationMs: Math.round(durationMs),
      statusCode,
      timestamp: Date.now()
    };

    this.latencySamples.push(sample);
    if (this.latencySamples.length > MAX_LATENCY_SAMPLES) {
      this.latencySamples.shift();
    }
  }

  recordWebVital(metric) {
    this.webVitals.unshift({
      ...metric,
      timestamp: Date.now()
    });
    if (this.webVitals.length > 100) {
      this.webVitals.pop();
    }
  }

  async forwardToSentry(entry) {
    const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!dsn) return;

    try {
      // Parse Sentry DSN: https://[public_key]@[host]/[project_id]
      const url = new URL(dsn);
      const publicKey = url.username;
      const projectId = url.pathname.replace(/^\//, '');
      const host = url.host;

      const sentryEndpoint = `https://${host}/api/${projectId}/store/?sentry_version=7&sentry_key=${publicKey}&sentry_client=degen-telemetry/1.0`;

      const payload = {
        event_id: entry.id.replace(/[^a-f0-9]/gi, '').padEnd(32, '0').slice(0, 32),
        timestamp: entry.timestamp,
        platform: 'javascript',
        level: 'error',
        logger: entry.source,
        message: entry.message,
        exception: {
          values: [
            {
              type: 'Error',
              value: entry.message,
              stacktrace: entry.stack ? { frames: [{ filename: entry.route, function: 'handler' }] } : undefined
            }
          ]
        },
        tags: {
          source: entry.source,
          route: entry.route
        },
        extra: entry.metadata
      };

      await fetch(sentryEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3000)
      });
    } catch {
      // Fail silently to never crash game on telemetry forward
    }
  }

  getMetrics() {
    const mem = process.memoryUsage ? process.memoryUsage() : { heapUsed: 0, heapTotal: 0, rss: 0 };
    const uptimeSec = Math.floor((Date.now() - this.startTime) / 1000);

    // Calculate latency metrics
    let avgLatency = 0;
    let p95Latency = 0;
    if (this.latencySamples.length > 0) {
      const sorted = [...this.latencySamples].map(s => s.durationMs).sort((a, b) => a - b);
      avgLatency = Math.round(sorted.reduce((acc, v) => acc + v, 0) / sorted.length);
      const p95Idx = Math.floor(sorted.length * 0.95);
      p95Latency = sorted[p95Idx] || avgLatency;
    }

    return {
      uptimeSec,
      memory: {
        heapUsedMb: (mem.heapUsed / 1024 / 1024).toFixed(1),
        heapTotalMb: (mem.heapTotal / 1024 / 1024).toFixed(1),
        rssMb: (mem.rss / 1024 / 1024).toFixed(1)
      },
      errorCountTotal: this.errors.length,
      errorsRecent: this.errors.slice(0, 50),
      latency: {
        sampleCount: this.latencySamples.length,
        avgMs: avgLatency,
        p95Ms: p95Latency,
        recentSamples: this.latencySamples.slice(-20)
      },
      webVitals: this.webVitals.slice(0, 20),
      sentryConfigured: Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN)
    };
  }
}

// Global singleton to preserve across Next.js API invocations in memory
const globalStore = globalThis;
if (!globalStore.__degen_telemetry_store) {
  globalStore.__degen_telemetry_store = new TelemetryStore();
}

export const telemetry = globalStore.__degen_telemetry_store;
export default telemetry;
