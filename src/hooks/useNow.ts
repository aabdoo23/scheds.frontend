import { useSyncExternalStore } from 'react';

const TICK_MS = 5_000;
const BUCKET_MS = 10_000;

function subscribe(onChange: () => void): () => void {
  const timer = setInterval(onChange, TICK_MS);
  return () => clearInterval(timer);
}

/**
 * Current time, quantized to {@link BUCKET_MS}, for rendering relative times.
 *
 * Reading `Date.now()` during render is impure and, worse, freezes the displayed age between
 * refreshes — "12s ago" would sit there for a minute. Quantizing keeps the snapshot stable
 * between ticks, which is what `useSyncExternalStore` requires to avoid re-rendering in a loop.
 */
function getSnapshot(): number {
  return Math.floor(Date.now() / BUCKET_MS) * BUCKET_MS;
}

export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
