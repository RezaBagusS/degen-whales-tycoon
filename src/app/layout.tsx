import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Degen & Whale | Trading Floor Simulator',
  description: 'Game idle tycoon dan simulasi trading fiktif. Bukan layanan trading atau rekomendasi investasi.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>
        {children}
        <noscript>
          <p style={{ padding: 24 }}>Aktifkan JavaScript untuk menjalankan Degen &amp; Whale.</p>
        </noscript>
      </body>
    </html>
  );
}
