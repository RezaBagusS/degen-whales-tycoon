'use client';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6 text-slate-100">
      <section className="max-w-lg space-y-5 rounded-2xl border border-amber-400/40 bg-[#111622] p-6">
        <h1 className="text-2xl font-bold">Game belum berhasil dimuat</h1>
        <p className="text-base text-slate-300">Coba kembali atau muat ulang halaman. Simpanan browser tidak dihapus.</p>
        <button onClick={reset} className="rounded-lg bg-emerald-400 px-5 py-3 font-bold text-slate-950">Coba lagi</button>
      </section>
    </main>
  );
}
