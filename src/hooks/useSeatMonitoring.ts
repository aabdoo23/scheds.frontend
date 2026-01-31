import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchWithCredentials } from '@/lib/api';
import type { CartItem } from '@/types/seatModeration';
import type { SeatResult } from '@/types/seatModeration';

interface ApiSeatResult {
  Course?: string;
  CourseName?: string;
  Section?: string;
  HasSeats?: boolean;
  SeatsLeft?: number;
  Instructor?: string;
  course?: string;
  courseName?: string;
  section?: string;
  hasSeats?: boolean;
  seatsLeft?: number;
  instructor?: string;
}

function normalizeResult(item: ApiSeatResult): SeatResult {
  return {
    course: item.Course ?? item.course ?? '',
    courseName: item.CourseName ?? item.courseName ?? '',
    section: item.Section ?? item.section ?? '',
    hasSeats: item.HasSeats ?? item.hasSeats ?? false,
    seatsLeft: item.SeatsLeft ?? item.seatsLeft ?? 0,
    instructor: item.Instructor ?? item.instructor ?? '',
  };
}

export function useSeatMonitoring(cart: CartItem[], isAuthenticated: boolean) {
  const [results, setResults] = useState<SeatResult[]>([]);
  const [statusText, setStatusText] = useState('Ready to monitor');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkSeats = useCallback(async () => {
    if (cart.length === 0) return;
    setStatusText('Checking seats...');
    try {
      const courseCodes = cart.map((c) => c.courseCode);
      const sections = cart.map((c) => c.section);
      const res = await fetchWithCredentials('/api/SeatModeration/check-seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseCode: courseCodes, sections }),
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.results ?? json.Results ?? [];
        setResults(data.map((item: ApiSeatResult) => normalizeResult(item)));
        setStatusText(`Last checked: ${new Date().toLocaleTimeString()}`);
      }
    } catch {
      setStatusText('Error checking seats');
    }
  }, [cart]);

  const checkSeatsRef = useRef(checkSeats);
  useEffect(() => {
    checkSeatsRef.current = checkSeats;
  }, [checkSeats]);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    checkSeats();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => checkSeatsRef.current(), 60000);
  }, [checkSeats]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    setStatusText('Monitoring stopped');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setResults([]);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || cart.length === 0) return;
    let cancelled = false;
    checkSeats().then(() => {
      if (cancelled) return;
      setIsMonitoring(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => checkSeatsRef.current(), 60000);
    });
    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, cart.length, checkSeats]);

  useEffect(() => {
    if (cart.length === 0 && isMonitoring) {
      stopMonitoring();
    }
  }, [cart.length, isMonitoring, stopMonitoring]);

  return {
    results,
    statusText,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    checkSeats,
  };
}
