import type { CourseSearchResult } from '@/types/course';
import { formatTime } from '@/lib/roomUtils';
import { courseColor } from '@/lib/scheduleView';

interface CourseCardProps {
  course: CourseSearchResult;
}

function MetaChip({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--light-text)] bg-white/[0.04] border border-white/10 rounded-full px-2.5 py-1">
      <i className={`fas ${icon} text-[var(--dark-text)]`} aria-hidden />
      {children}
    </span>
  );
}

export function CourseCard({ course }: CourseCardProps) {
  const color = courseColor(course.courseCode);
  const startTime = formatTime(course.startTime);
  const endTime = formatTime(course.endTime);

  return (
    <div className="bg-[var(--lighter-dark)] rounded-xl border border-white/10 p-5 flex flex-col gap-3 shadow-[0_3px_10px_rgba(0,0,0,0.2)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_5px_20px_rgba(0,0,0,0.3)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="flex items-start gap-2.5 min-w-0">
        <span
          className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: color.bg }}
          aria-hidden
        />
        <div className="min-w-0">
          <h3 className="text-[var(--light-text)] text-lg font-semibold leading-tight m-0">
            <span className="tabular-nums">{course.courseCode}</span>: {course.courseName}
          </h3>
          <p className="text-[var(--dark-text)] text-sm m-0 mt-1">
            <i className="fas fa-user-tie mr-2" aria-hidden />
            {course.instructorName}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <MetaChip icon="fa-hashtag">
          Section <b className="font-semibold">{course.section}</b>
        </MetaChip>
        <MetaChip icon="fa-tag">{course.subType}</MetaChip>
        <MetaChip icon="fa-graduation-cap">
          {course.credits} cr
        </MetaChip>
        <MetaChip icon="fa-calendar">{course.day || 'No day'}</MetaChip>
        <MetaChip icon="fa-clock">
          <span className="tabular-nums">
            {startTime} – {endTime}
          </span>
        </MetaChip>
        {course.room && <MetaChip icon="fa-door-open">Room {course.room}</MetaChip>}
      </div>
    </div>
  );
}
