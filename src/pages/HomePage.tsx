import { Link } from 'react-router-dom';

const primaryCta =
  'inline-flex items-center justify-center gap-2.5 min-h-[44px] px-6 py-4 rounded-lg font-semibold text-lg text-white bg-[var(--light-blue)] hover:bg-[var(--dark-blue)] transition-colors no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark)]';
const secondaryCta =
  'inline-flex items-center justify-center gap-2.5 min-h-[44px] px-6 py-4 rounded-lg font-semibold text-lg text-[var(--light-text)] bg-[var(--lighter)] border border-white/10 hover:bg-white/10 transition-colors no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark)]';
const quietLink =
  'inline-flex items-center gap-2 min-h-[44px] text-[var(--dark-text)] hover:text-[var(--light-text)] transition-colors no-underline text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] rounded';

export function HomePage() {
  return (
    <section
      className="min-h-[calc(100vh-var(--navbar-height))] bg-[var(--dark)] flex flex-col justify-center relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/new-bg-final.png')" }}
    >
      {/* Scrim: keep the hero image but anchor the copy on a dark, readable side */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-[var(--dark)] via-[var(--dark)]/85 to-[var(--dark)]/30"
      />
      <div className="relative w-full px-6 sm:px-10 lg:px-20 py-10">
        <div className="max-w-xl">
          <h1 className="text-[var(--light-text)] font-bold tracking-tight text-[clamp(2rem,6vw,3.25rem)] leading-[1.1] m-0">
            Your NU schedule, sorted in seconds.
          </h1>
          <p className="text-[var(--dark-text)] text-lg mt-4 mb-0 max-w-md">
            Search courses, set your constraints, and generate every conflict-free timetable —
            straight from live Self-Service data.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link to="/generate-schedules" className={primaryCta}>
              <i className="fas fa-calendar-check" aria-hidden />
              Generate Schedule
            </Link>
            <Link to="/find-study-rooms" className={secondaryCta}>
              <i className="fas fa-door-open" aria-hidden />
              Find Study Rooms
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-8">
            <Link to="/self-service-search" className={quietLink}>
              <i className="fas fa-magnifying-glass" aria-hidden />
              Search sections
            </Link>
            <Link to="/seat-moderation" className={quietLink}>
              <i className="fas fa-chair" aria-hidden />
              Seat requests
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
