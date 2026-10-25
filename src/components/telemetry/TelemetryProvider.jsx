'use client';

import { useEffect } from 'react';

export default function TelemetryProvider({ children }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Report unhandled client runtime errors
    const handleError = (event) => {
      try {
        const errorData = {
          type: 'error',
          message: event.message || (event.error && event.error.message) || 'Unknown Client Error',
          stack: event.error?.stack || null,
          route: window.location.pathname,
          timestamp: new Date().toISOString(),
          screenSize: `${window.innerWidth}x${window.innerHeight}`
        };

        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/telemetry/report', JSON.stringify(errorData));
        } else {
          fetch('/api/telemetry/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(errorData),
            keepalive: true
          }).catch(() => {});
        }
      } catch {
        // Guard against telemetry errors
      }
    };

    // Report unhandled promise rejections
    const handleRejection = (event) => {
      try {
        const reason = event.reason;
        const errorData = {
          type: 'error',
          message: reason?.message || String(reason || 'Unhandled Promise Rejection'),
          stack: reason?.stack || null,
          route: window.location.pathname,
          timestamp: new Date().toISOString(),
          screenSize: `${window.innerWidth}x${window.innerHeight}`
        };

        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/telemetry/report', JSON.stringify(errorData));
        } else {
          fetch('/api/telemetry/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(errorData),
            keepalive: true
          }).catch(() => {});
        }
      } catch {
        // Guard against telemetry errors
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return children;
}
