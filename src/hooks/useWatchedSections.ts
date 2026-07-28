import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchWithCredentials } from '@/lib/api';
import { sectionKey, type WatchedSection } from '@/types/seatAlerts';

const REFRESH_INTERVAL_MS = 60_000;

// Mirrors the backend WatchedSectionDto / SeatReadingDto. The API returns typed responses now,
// so these no longer need a PascalCase fallback on every field.
interface ApiWatchedSection {
  courseCode: string;
  section: string;
}

interface ApiSeatReading {
  courseCode: string;
  courseName: string;
  section: string;
  seatsLeft: number;
  instructor: string;
  lastUpdate: string;
}

function readSections<T>(json: unknown): T[] {
  const sections = (json as { sections?: unknown })?.sections;
  return Array.isArray(sections) ? (sections as T[]) : [];
}

/**
 * The student's watched sections, and the live seat data for them.
 *
 * Two endpoints back this, deliberately:
 * - `watched` is a cheap database read and is the authoritative list, so rows render immediately.
 * - `watched/live` performs an upstream fetch and only returns sections it got data for, so it is
 *   treated as a seat-data overlay, never as the list itself. A section missing from it keeps its
 *   row with `seatsLeft: null`.
 *
 * Every callback here has a stable identity. The previous implementation's polling effect depended
 * on a callback that changed whenever the list array was replaced, so any add or remove silently
 * tore down and restarted monitoring — and re-enabled it after the user pressed Stop.
 */
export function useWatchedSections(isAuthenticated: boolean) {
  const [sections, setSections] = useState<WatchedSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [pendingKeys, setPendingKeys] = useState<string[]>([]);
  const [openedKeys, setOpenedKeys] = useState<string[]>([]);

  // Seat counts from the previous refresh, for detecting the moment a section opens. A ref, not
  // state, so that detection never feeds back into the refresh callback's identity.
  const previousSeats = useRef(new Map<string, number>());
  const refreshInFlight = useRef(false);
  const hasLoadedList = useRef(false);

  const markPending = useCallback((key: string, pending: boolean) => {
    setPendingKeys((keys) =>
      pending ? [...new Set([...keys, key])] : keys.filter((k) => k !== key)
    );
  }, []);

  const loadList = useCallback(async () => {
    if (!hasLoadedList.current) setLoading(true);
    try {
      const res = await fetchWithCredentials('/api/SeatAlerts/watched');
      if (!res.ok) {
        if (res.status === 401) setSections([]);
        else setError('Could not load your watched sections.');
        return;
      }
      const json = await res.json();
      const items = readSections<ApiWatchedSection>(json);
      const watched: WatchedSection[] = items.map((item) => ({
        courseCode: item.courseCode,
        section: item.section,
        courseName: '',
        instructor: '',
        seatsLeft: null,
        lastUpdate: null,
      }));

      // Keep any seat data already on screen for sections that are still watched.
      setSections((current) => {
        const bySeatKey = new Map(current.map((s) => [sectionKey(s.courseCode, s.section), s]));
        return watched.map((item) => {
          const existing = bySeatKey.get(sectionKey(item.courseCode, item.section));
          return existing ? { ...item, ...existing } : item;
        });
      });
      setError(null);
      hasLoadedList.current = true;
    } catch {
      setError('Could not load your watched sections.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSeats = useCallback(async () => {
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;
    setRefreshing(true);
    try {
      const res = await fetchWithCredentials('/api/SeatAlerts/watched/live');
      if (!res.ok) {
        setError(
          res.status === 401
            ? 'Your session expired. Sign in again to see live seats.'
            : 'Could not reach live seat data. Showing the last reading.'
        );
        return;
      }

      const json = await res.json();
      const rows = readSections<ApiSeatReading>(json);
      const live = new Map(
        rows.map((row) => [
          sectionKey(row.courseCode, row.section),
          {
            courseName: row.courseName,
            instructor: row.instructor,
            seatsLeft: row.seatsLeft,
            lastUpdate: row.lastUpdate,
          },
        ])
      );

      // A section counts as "just opened" only on a known 0 -> >0 transition. The first reading
      // establishes the baseline, so an already-open section on page load is not announced as new.
      const opened: string[] = [];
      for (const [key, data] of live) {
        const before = previousSeats.current.get(key);
        if (before !== undefined && before <= 0 && data.seatsLeft > 0) opened.push(key);
        previousSeats.current.set(key, data.seatsLeft);
      }

      setSections((current) =>
        current.map((item) => {
          const data = live.get(sectionKey(item.courseCode, item.section));
          return data ? { ...item, ...data } : { ...item, seatsLeft: null };
        })
      );
      if (opened.length > 0) setOpenedKeys((keys) => [...new Set([...keys, ...opened])]);
      setLastRefreshed(new Date());
      setError(null);
    } catch {
      setError('Could not reach live seat data. Showing the last reading.');
    } finally {
      refreshInFlight.current = false;
      setRefreshing(false);
    }
  }, []);

  const add = useCallback(
    async (courseCode: string, section: string) => {
      const key = sectionKey(courseCode, section);
      markPending(key, true);
      try {
        const res = await fetchWithCredentials('/api/SeatAlerts/watch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseCode, section }),
        });
        if (!res.ok) {
          setError('Could not start watching that section.');
          return false;
        }
        await loadList();
        await refreshSeats();
        return true;
      } catch {
        setError('Could not start watching that section.');
        return false;
      } finally {
        markPending(key, false);
      }
    },
    [loadList, refreshSeats, markPending]
  );

  const remove = useCallback(
    async (courseCode: string, section: string) => {
      const key = sectionKey(courseCode, section);
      markPending(key, true);
      try {
        const res = await fetchWithCredentials('/api/SeatAlerts/unwatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseCode, section }),
        });
        if (!res.ok) {
          setError('Could not stop watching that section.');
          return false;
        }
        previousSeats.current.delete(key);
        setOpenedKeys((keys) => keys.filter((k) => k !== key));
        setSections((current) =>
          current.filter((s) => sectionKey(s.courseCode, s.section) !== key)
        );
        return true;
      } catch {
        setError('Could not stop watching that section.');
        return false;
      } finally {
        markPending(key, false);
      }
    },
    [markPending]
  );

  const removeAll = useCallback(async () => {
    try {
      const res = await fetchWithCredentials('/api/SeatAlerts/unwatch-all', { method: 'POST' });
      if (!res.ok) {
        setError('Could not stop watching your sections.');
        return false;
      }
      previousSeats.current.clear();
      setOpenedKeys([]);
      setSections([]);
      return true;
    } catch {
      setError('Could not stop watching your sections.');
      return false;
    }
  }, []);

  const dismissOpened = useCallback(() => setOpenedKeys([]), []);

  // Initial load.
  useEffect(() => {
    if (!isAuthenticated) {
      setSections([]);
      hasLoadedList.current = false;
      previousSeats.current.clear();
      return;
    }
    loadList().then(refreshSeats);
  }, [isAuthenticated, loadList, refreshSeats]);

  // Poll while the tab is visible. The server watches and emails regardless, so polling a hidden
  // tab buys nothing; refresh immediately when the student comes back to it.
  useEffect(() => {
    if (!isAuthenticated) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (timer === null) timer = setInterval(refreshSeats, REFRESH_INTERVAL_MS);
    };
    const stop = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };
    const onVisibilityChange = () => {
      if (document.hidden) {
        stop();
      } else {
        refreshSeats();
        start();
      }
    };

    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isAuthenticated, refreshSeats]);

  return {
    sections,
    loading,
    refreshing,
    error,
    lastRefreshed,
    pendingKeys,
    openedKeys,
    refreshSeats,
    add,
    remove,
    removeAll,
    dismissOpened,
  };
}
