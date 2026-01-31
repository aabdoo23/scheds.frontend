import { useState, useEffect, useCallback } from 'react';
import { fetchWithCredentials } from '@/lib/api';
import type { CourseSearchItem } from '@/types/seatModeration';

interface ApiCourse {
  CourseCode?: string;
  CourseName?: string;
  courseCode?: string;
  courseName?: string;
}

function normalizeCourse(item: ApiCourse): CourseSearchItem {
  return {
    courseCode: item.CourseCode ?? item.courseCode ?? '',
    courseName: item.CourseName ?? item.courseName ?? '',
  };
}

export function useCourseSearchDebounced(query: string, delay = 500) {
  const [results, setResults] = useState<CourseSearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length <= 1) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetchWithCredentials(
        `/api/coursebase/get-filtered-courses?query=${encodeURIComponent(trimmed)}`
      );
      const json = await res.json();
      const items = Array.isArray(json) ? json : [];
      setResults(items.map((item: ApiCourse) => normalizeCourse(item)));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), delay);
    return () => clearTimeout(timer);
  }, [query, delay, search]);

  return { results, loading };
}
