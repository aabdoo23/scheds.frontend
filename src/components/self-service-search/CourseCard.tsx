import type { CourseSearchResult } from '@/types/course';
import { formatTime } from '@/lib/roomUtils';

const CARD_COLORS = [
  'var(--card-blue)',
  'var(--card-green)',
  'var(--card-yellow)',
  'var(--card-purple)',
  'var(--card-brown)',
];

const FONT_COLORS = [
  'var(--font-color)',
  'var(--font-color)',
  'var(--font-color-dark)',
  'var(--font-color)',
  'var(--font-color-dark)',
];

interface CourseCardProps {
  course: CourseSearchResult;
  index: number;
}

export function CourseCard({ course, index }: CourseCardProps) {
  const cardColor = CARD_COLORS[index % CARD_COLORS.length];
  const fontColor = FONT_COLORS[index % FONT_COLORS.length];
  const startTime = formatTime(course.startTime);
  const endTime = formatTime(course.endTime);

  return (
    <div
      className="rounded-[18px] shadow-[0_4px_8px_rgba(60,60,60,0.08)] p-0 flex flex-col justify-between min-h-[240px] transition-all duration-150 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(60,60,60,0.16)]"
      style={{ background: cardColor }}
    >
      <div className="px-7 pt-7 pb-3">
        <div
          className="text-[1.35rem] font-bold mb-2"
          style={{ color: fontColor }}
        >
          {course.courseCode}: {course.courseName}
        </div>
        <div
          className="text-base mb-4"
          style={{ color: fontColor }}
        >
          <i className="fas fa-user-tie mr-2" />
          Instructor <b>{course.instructorName}</b>
        </div>
        <div className="flex flex-wrap gap-2.5 mb-2">
          <span className="bg-white/70 rounded-xl px-3.5 py-1 text-[0.95rem] font-medium text-[#151515] shadow-[0_1px_2px_rgba(185,211,221,0.097)]">
            <i className="fas fa-hashtag mr-1" />
            Section <b>{course.section}</b>
          </span>
          <span className="bg-white/70 rounded-xl px-3.5 py-1 text-[0.95rem] font-medium text-[#151515] shadow-[0_1px_2px_rgba(185,211,221,0.097)]">
            <i className="fas fa-tag mr-1" />
            <b>{course.subType}</b>
          </span>
          <span className="bg-white/70 rounded-xl px-3.5 py-1 text-[0.95rem] font-medium text-[#151515] shadow-[0_1px_2px_rgba(185,211,221,0.097)]">
            <i className="fas fa-graduation-cap mr-1" />
            Credits <b>{course.credits}</b>
          </span>
          <span className="bg-white/70 rounded-xl px-3.5 py-1 text-[0.95rem] font-medium text-[#151515] shadow-[0_1px_2px_rgba(185,211,221,0.097)]">
            <i className="fas fa-calendar mr-1" />
            <b>{course.day || 'No Day'}</b>
          </span>
          <span className="bg-white/70 rounded-xl px-3.5 py-1 text-[0.95rem] font-medium text-[#151515] shadow-[0_1px_2px_rgba(185,211,221,0.097)]">
            <i className="fas fa-clock mr-1" />
            <b>{startTime} - {endTime}</b>
          </span>
          {course.room && (
            <span className="bg-white/70 rounded-xl px-3.5 py-1 text-[0.95rem] font-medium text-[#151515] shadow-[0_1px_2px_rgba(185,211,221,0.097)]">
              <i className="fas fa-door-open mr-1" />
              Room <b>{course.room}</b>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
