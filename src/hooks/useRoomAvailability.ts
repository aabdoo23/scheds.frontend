import { useState, useCallback } from 'react';
import { fetchWithCredentials } from '@/lib/api';
import type { RoomAvailability } from '@/types/room';

export function useRoomAvailability() {
  const [data, setData] = useState<RoomAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoomAvailability = useCallback(
    async (dayOfWeek: string, time?: string | null, minimumMinutes = 0) => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        dayOfWeek,
        minimumMinutes: String(minimumMinutes),
      });
      if (time) params.append('time', time);

      try {
        const res = await fetchWithCredentials(`/api/room/availability?${params}`);
        if (res.status === 404) {
          setData([]);
        } else if (!res.ok) {
          throw new Error('Failed to fetch room availability');
        } else {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error fetching room data');
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, loading, error, fetchRoomAvailability };
}
