export default function GameLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07090E] p-6 text-slate-100">
      <div role="status" aria-live="polite" className="space-y-3 text-center">
        <p className="font-mono text-sm tracking-widest text-emerald-300">DEGEN &amp; WHALE</p>
        <h1 className="text-2xl font-bold">Menyiapkan trading floor...</h1>
        <p className="text-base text-slate-400">Memuat game dan simpanan browser.</p>
      </div>
    </main>
  );
}
