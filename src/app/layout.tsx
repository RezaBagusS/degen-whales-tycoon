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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <meta name="monetag" content="99242c795ef560bb1f8a03bb35800ae8" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(s){s.dataset.zone='12106783',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`
          }}
        />
      </head>
      <body>
        {children}
        <noscript>
          <p style={{ padding: 24 }}>Aktifkan JavaScript untuk menjalankan Degen &amp; Whale.</p>
        </noscript>
      </body>
    </html>
  );
}
