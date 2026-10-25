import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Degen & Whale | Trading Floor Simulator',
  description: 'Game idle tycoon dan simulasi trading fiktif. Bukan layanan trading atau rekomendasi investasi.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  other: {
    monetag: '99242c795ef560bb1f8a03bb35800ae8',
  },
  robots: { index: false, follow: false },
};

import TelemetryProvider from '../components/telemetry/TelemetryProvider';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="monetag" content="99242c795ef560bb1f8a03bb35800ae8" />
      </head>
      <body>
        <TelemetryProvider>
          {children}
        </TelemetryProvider>
        <noscript>
          <p style={{ padding: 24 }}>Aktifkan JavaScript untuk menjalankan Degen &amp; Whale.</p>
        </noscript>
      </body>
    </html>
  );
}
