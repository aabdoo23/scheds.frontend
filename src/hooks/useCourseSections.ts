import { useState, useCallback } from 'react';
import { fetchWithCredentials } from '@/lib/api';

export function useCourseSections() {
  const [sections, setSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSections = useCallback(async (courseCode: string) => {
    setLoading(true);
    setSections([]);
    try {
      const res = await fetchWithCredentials('/api/coursebase/get-course-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseCode }),
      });
      const json = await res.json();
      setSections(Array.isArray(json) ? json : []);
    } catch {
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { sections, loading, fetchSections };
}
