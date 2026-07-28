import type { ScheduleCardItem } from '@/types/generate';

const DAY_TO_JS: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

// Floating local time (no timezone) , the calendar app interprets it in the
// viewer's own zone, which is what a student wants for a class time.
function icsStamp(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(
    d.getMinutes()
  )}00`;
}

function parseHM(t: string): { h: number; m: number } | null {
  const [h, m] = (t ?? '').split(':').map((x) => parseInt(x, 10));
  if (Number.isNaN(h)) return null;
  return { h, m: Number.isNaN(m) ? 0 : m };
}

// Next occurrence (today or later) of the given JS weekday.
function nextDateForWeekday(js: number): Date {
  const now = new Date();
  const diff = (js - now.getDay() + 7) % 7;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
}

function escapeICS(s: string): string {
  return s.replace(/([\\;,])/g, '\\$1').replace(/\n/g, '\\n');
}

// A weekly-recurring .ics for the selected schedule. No term dates are known, so
// each class recurs weekly for a semester's worth of weeks from the next occurrence.
export function buildICS(items: ScheduleCardItem[], calName = 'Scheds timetable'): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Scheds//Timetable//EN',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${escapeICS(calName)}`,
  ];

  items.forEach((it, idx) => {
    const js = DAY_TO_JS[(it.day ?? '').trim().toLowerCase()];
    const s = parseHM(it.startTime);
    const e = parseHM(it.endTime);
    if (js === undefined || !s || !e) return;

    const base = nextDateForWeekday(js);
    const start = new Date(base);
    start.setHours(s.h, s.m, 0, 0);
    const end = new Date(base);
    end.setHours(e.h, e.m, 0, 0);

    const desc = [
      it.courseName,
      it.instructorName && `Instructor: ${it.instructorName}`,
      it.section && `Section: ${it.section}`,
    ]
      .filter(Boolean)
      .join('\n');

    lines.push(
      'BEGIN:VEVENT',
      `UID:scheds-${idx}-${js}-${it.courseCode}-${it.section}@scheds`,
      `DTSTART:${icsStamp(start)}`,
      `DTEND:${icsStamp(end)}`,
      'RRULE:FREQ=WEEKLY;COUNT=16',
      `SUMMARY:${escapeICS(`${it.courseCode} ${it.subType ?? ''}`.trim())}`
    );
    if (desc) lines.push(`DESCRIPTION:${escapeICS(desc)}`);
    if (it.room) lines.push(`LOCATION:${escapeICS(it.room)}`);
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

// Plain-text section list, grouped by course, for pasting into Self-Service.
export function sectionsText(items: ScheduleCardItem[]): string {
  const seen = new Set<string>();
  const byCourse = new Map<string, string[]>();
  items.forEach((it) => {
    const key = `${it.courseCode}|${it.subType}|${it.section}`;
    if (seen.has(key)) return;
    seen.add(key);
    const arr = byCourse.get(it.courseCode) ?? [];
    arr.push(`${it.subType || 'Section'} ${it.section}`.trim());
    byCourse.set(it.courseCode, arr);
  });
  return Array.from(byCourse.entries())
    .map(([code, secs]) => `${code}: ${secs.join(', ')}`)
    .join('\n');
}
