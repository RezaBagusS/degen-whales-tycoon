'use client';

import dynamic from 'next/dynamic';
import GameLoading from './GameLoading';

// This boundary is intentionally client-only. The engine initializes from
// localStorage and generates random candles; server-rendering it would cause
// browser/server state mismatches and premature saves.
const Game = dynamic(() => import('./game/Game'), {
  ssr: false,
  loading: () => <GameLoading />,
});

import MonetagVignette from './ads/MonetagVignette';
import MonetagOnClick from './ads/MonetagOnClick';

export default function GameClient() {
  return (
    <>
      <MonetagVignette />
      <MonetagOnClick />
      <Game />
    </>
  );
}
