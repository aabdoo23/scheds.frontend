export interface CourseSearchItem {
  courseCode: string;
  courseName: string;
}

/**
 * One section the student is watching, with live seat data merged in when available.
 *
 * `seatsLeft === null` means live data has not arrived for this section — either the first
 * refresh is still running, or Self-Service could not be reached for that course. That is a
 * distinct state from "no seats left", and the UI shows it as such rather than faking a zero.
 */
export interface WatchedSection {
  courseCode: string;
  section: string;
  courseName: string;
  instructor: string;
  seatsLeft: number | null;
  /** ISO-8601 UTC timestamp of the seat reading, or null when there is none yet. */
  lastUpdate: string | null;
}

/**
 * Comparison key for a course/section pair. Mirrors the backend `CourseSection`: the course code
 * is upper-cased and the section zero-padded, because Self-Service is inconsistent about padding
 * ("1" vs "01") and the two endpoints are not guaranteed to agree on the form.
 */
export function sectionKey(courseCode: string, section: string): string {
  return `${courseCode.trim().toUpperCase()}|${section.trim().padStart(2, '0').toUpperCase()}`;
}
