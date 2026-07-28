import { useEffect } from 'react';

/**
 * Prefixes the document title while something needs attention, so a student who has the tab in
 * the background still sees that a seat opened. Restores the original title on cleanup.
 */
export function useTitleBadge(count: number) {
  useEffect(() => {
    if (count <= 0) return;

    const original = document.title;
    document.title = `(${count}) Seat open · Scheds`;
    return () => {
      document.title = original;
    };
  }, [count]);
}
