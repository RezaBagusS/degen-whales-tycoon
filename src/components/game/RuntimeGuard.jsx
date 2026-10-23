'use client';

import React from 'react';

// Keep a render/effect failure inside the game instead of losing the whole
// React root. No telemetry, save deletion, or external requests.
export default class RuntimeGuard extends React.Component {
  state = { error: null, attempt: 0 };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) {
      return <React.Fragment key={this.state.attempt}>{this.props.children}</React.Fragment>;
    }
    const message = String(this.state.error?.message || 'Kesalahan tampilan game').slice(0, 240);
    return (
      <main role="alert" className="min-h-screen bg-[#0B0E14] text-slate-100 flex items-center justify-center p-6">
        <section className="w-full max-w-lg space-y-5 rounded-2xl border border-amber-400/40 bg-[#111622] p-6">
          <span className="font-mono text-sm text-emerald-300">DEGEN &amp; WHALE / V1.3.1</span>
          <h1 className="text-2xl font-bold">Game belum berhasil dimuat</h1>
          <p className="text-base text-slate-300">
            Terjadi kesalahan saat menampilkan game. Simpanan tidak dihapus.
            Coba muat ulang; jika tetap gagal, kirim screenshot pesan di bawah.
          </p>
          <pre className="whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-4 text-sm text-amber-200">{message}</pre>
          <button
            className="rounded-lg bg-emerald-400 px-5 py-3 font-bold text-slate-950"
            onClick={() => this.setState(state => ({ error: null, attempt: state.attempt + 1 }))}
          >
            Coba muat ulang game
          </button>
        </section>
      </main>
    );
  }
}
