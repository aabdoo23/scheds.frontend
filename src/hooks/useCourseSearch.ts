import { useState, useCallback } from 'react';
import { fetchWithCredentials } from '@/lib/api';
import type { CourseSearchResult } from '@/types/course';

interface ApiCourseItem {
  CardId?: string;
  CourseCode?: string;
  CourseName?: string;
  InstructorName?: string;
  Section?: string;
  Credits?: number;
  Day?: string;
  StartTime?: string;
  EndTime?: string;
  Room?: string;
  SubType?: string;
  SeatsLeft?: number;
}

function normalizeCourse(item: ApiCourseItem): CourseSearchResult {
  return {
    cardId: item.CardId ?? '',
    courseCode: item.CourseCode ?? '',
    courseName: item.CourseName ?? '',
    instructorName: item.InstructorName ?? '',
    section: item.Section ?? '',
    credits: item.Credits ?? 0,
    day: item.Day ?? '',
    startTime: item.StartTime ?? '',
    endTime: item.EndTime ?? '',
    room: item.Room ?? '',
    subType: item.SubType ?? '',
    seatsLeft: item.SeatsLeft ?? 0,
  };
}

export function useCourseSearch() {
  const [data, setData] = useState<CourseSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length <= 2) {
      setError('Please enter a course code (at least 3 characters).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithCredentials(
        `/api/coursebase/SelfSearch?query=${encodeURIComponent(trimmed)}`
      );
      const json = await res.json();
      if (!Array.isArray(json) || json.length === 0) {
        setData([]);
        setError('Course not found. Please try again.');
      } else {
        setData(json.map((item: ApiCourseItem) => normalizeCourse(item)));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error fetching schedule. Please try again.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, search };
}
