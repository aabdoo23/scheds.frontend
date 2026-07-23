import { Fragment, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { courseColor } from '@/lib/scheduleView';

const primaryCta =
  'inline-flex items-center justify-center gap-2.5 min-h-[50px] px-6 py-3 rounded-lg font-semibold text-lg text-white bg-[var(--light-blue)] hover:bg-[var(--dark-blue)] transition-colors no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark)] active:translate-y-px';
const secondaryCta =
  'inline-flex items-center justify-center gap-2.5 min-h-[50px] px-6 py-3 rounded-lg font-semibold text-lg text-[var(--light-text)] bg-[var(--lighter)] border border-white/10 hover:bg-white/10 transition-colors no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark)] active:translate-y-px';
const quietLink =
  'inline-flex items-center gap-2 min-h-[44px] text-[var(--dark-text)] hover:text-[var(--light-text)] transition-colors no-underline text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] rounded';

/* Faceted orange gem — the brand accent from the original hero, rebuilt as SVG. */
function Gem({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 60 84" aria-hidden>
      <polygon points="30,2 56,28 30,82 4,28" fill="#ff7300" />
      <polygon points="30,2 56,28 30,28" fill="#ff912e" />
      <polygon points="30,2 4,28 30,28" fill="#e35e00" />
      <polygon points="30,28 56,28 30,82" fill="#f16e07" />
      <polygon points="30,28 4,28 30,82" fill="#ff8420" />
      <line x1="30" y1="2" x2="30" y2="82" stroke="#ffcfa1" strokeWidth="1" opacity="0.6" />
      <line x1="4" y1="28" x2="56" y2="28" stroke="#ffcfa1" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

const STAR_CLIP =
  'polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)';

/* Each card's hover personality — motivated, not decorative:
   'lift'   leans forward and rises, the section you're reaching for
   'tilt'   faces the cursor in 3D, like a card you pick up to inspect
   'settle' snaps level and drops, like a section landing in its slot */
type Personality = 'lift' | 'tilt' | 'settle';

interface StreamCardData {
  courseCode: string;
  courseName: string;
  instructor: string;
  time?: string;
  room?: string;
  seatsLeft: number;
  credits?: string;
  subType: string;
  section: string;
  personality: Personality;
  /* resting position + launch origin (where it flies in from, out of the hub) */
  pos: React.CSSProperties;
  launch: { lx: number; ly: number };
  rotate: number;
  delay: string;
  parallax: number;
  width?: number;
}

const STREAM_CARDS: StreamCardData[] = [
  {
    courseCode: 'CSCI101',
    courseName: 'Computer & Information Skills',
    instructor: 'Asmaa Ali Elsheikh',
    time: 'Thursday, 8:30 - 9:29',
    room: '12',
    seatsLeft: 30,
    credits: '3.00',
    subType: 'Tutorial',
    section: '01A',
    personality: 'lift',
    pos: { left: '56.5%', top: '10%', zIndex: 8 },
    launch: { lx: 80, ly: 200 },
    rotate: 3,
    delay: '0.95s',
    parallax: 40,
  },
  {
    courseCode: 'BMD001',
    courseName: 'Principles of Biology',
    instructor: 'Malak Mohamed',
    time: 'Thursday, 10:30 - 12:29',
    room: '01',
    seatsLeft: 12,
    credits: '0.00',
    subType: 'Lab',
    section: '01A',
    personality: 'tilt',
    pos: { left: '75%', top: '19%', zIndex: 7 },
    launch: { lx: -90, ly: 180 },
    rotate: -3,
    delay: '0.70s',
    parallax: 30,
  },
  {
    courseCode: 'ENGL003',
    courseName: 'English II',
    instructor: 'Noha Gamaledin Saad',
    seatsLeft: 60,
    subType: 'Lecture',
    section: '03B',
    personality: 'settle',
    pos: { left: '78%', top: '52%', zIndex: 6 },
    launch: { lx: -70, ly: 90 },
    rotate: -2,
    delay: '1.2s',
    parallax: 24,
    width: 200,
  },
];

/* Origin grid blocks. `delay` staggers the assemble-on-load pop; `ex/ey/er` are the
   outward burst vectors used when the hub is hovered (the sort re-runs, then reassembles). */
const GRID_BLOCKS: {
  row: number;
  col: number;
  color: string;
  span: number;
  delay: string;
  ex: number;
  ey: number;
  er: number;
}[] = [
  { row: 0, col: 0, color: 'var(--card-blue)', span: 2, delay: '0.30s', ex: -34, ey: -30, er: -10 },
  { row: 0, col: 2, color: 'var(--card-green)', span: 1, delay: '0.42s', ex: 30, ey: -36, er: 9 },
  { row: 1, col: 1, color: 'var(--card-purple)', span: 2, delay: '0.54s', ex: -42, ey: -4, er: -6 },
  { row: 2, col: 2, color: 'var(--card-cyan)', span: 2, delay: '0.66s', ex: 44, ey: 8, er: 8 },
  { row: 3, col: 0, color: 'var(--card-rose)', span: 1, delay: '0.78s', ex: -30, ey: 34, er: -9 },
  { row: 3, col: 3, color: 'var(--card-yellow)', span: 1, delay: '0.90s', ex: 38, ey: 34, er: 11 },
];

const GRID_TIMES = ['8:30', '9:30', '10:30', '11:30'];
const GRID_DAYS = ['SAT', 'SUN', 'MON', 'TUE'];

function StreamCard({ card }: { card: StreamCardData }) {
  const color = courseColor(card.courseCode);
  return (
    <div
      className="sort-card absolute"
      data-par={card.parallax}
      data-tilt={card.personality === 'tilt' ? '' : undefined}
      style={
        {
          ...card.pos,
          animationDelay: card.delay,
          '--lx': `${card.launch.lx}px`,
          '--ly': `${card.launch.ly}px`,
        } as React.CSSProperties
      }
    >
      <div
        className="sort-card-inner"
        data-hover={card.personality}
        style={{ '--rot': `${card.rotate}deg`, width: card.width ?? 214 } as React.CSSProperties}
      >
        <div className="sort-card-face rounded-[14px] overflow-hidden bg-[var(--lighter)] border border-white/10 shadow-[0_18px_44px_rgba(0,0,0,0.5)]">
        <div className="px-4 pt-3.5 pb-3">
          <div className="flex items-center justify-between text-[11px] text-[var(--dark-text)]">
            <span>
              Seats left{' '}
              <b className="font-bold text-[var(--light-text)] tabular-nums">{card.seatsLeft}</b>
            </span>
            {card.credits && (
              <span>
                Credits{' '}
                <b className="font-bold text-[var(--light-text)] tabular-nums">{card.credits}</b>
              </span>
            )}
          </div>
          <h3 className="text-[var(--light-text)] text-[15px] font-semibold leading-[1.18] tracking-tight mt-2 mb-0.5">
            <span className="tabular-nums">{card.courseCode}</span>: {card.courseName}
          </h3>
          <p className="text-[var(--dark-text)] text-xs m-0">{card.instructor}</p>
          {card.time && (
            <div className="flex flex-col gap-0.5 mt-2 text-[11.5px] text-[var(--dark-text)]">
              <span className="tabular-nums">{card.time}</span>
              {card.room && <span>Room: {card.room}</span>}
            </div>
          )}
        </div>
        <div
          className="flex items-center justify-between px-4 py-2 text-[12.5px] font-bold"
          style={{ backgroundColor: color.bg, color: color.text }}
        >
          <span>{card.subType}</span>
          <span className="text-[11px] font-bold tabular-nums bg-black/25 rounded px-1.5 py-0.5">
            {card.section}
          </span>
        </div>
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  const heroRef = useRef<HTMLElement>(null);

  const runSort = useCallback(() => {
    const el = heroRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.classList.remove('sort-run');
    void el.offsetWidth; // force reflow so the animation restarts
    el.classList.add('sort-run');
  }, []);

  // Kick off the sort once the hero has mounted and the copy has settled.
  useEffect(() => {
    const t = window.setTimeout(runSort, 620);
    return () => window.clearTimeout(t);
  }, [runSort]);

  // Cursor parallax for the decorative layer (motion values, not React state).
  useEffect(() => {
    const el = heroRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const nodes = Array.from(el.querySelectorAll<HTMLElement>('[data-par]'));
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
    };
    const loop = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      for (const n of nodes) {
        const f = Number(n.dataset.par) || 0;
        n.style.translate = `${(cx * f).toFixed(1)}px ${(cy * f).toFixed(1)}px`;
      }
      raf = requestAnimationFrame(loop);
    };
    el.addEventListener('pointermove', onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      el.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Cursor-follow tilt for the "inspect" card — 3D lean toward the pointer, eased back on leave.
  useEffect(() => {
    const el = heroRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const card = el.querySelector<HTMLElement>('.sort-card[data-tilt]');
    const inner = card?.querySelector<HTMLElement>('.sort-card-inner');
    if (!card || !inner) return;
    const onMove = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      inner.style.setProperty('--ry', `${(px * 18).toFixed(1)}deg`);
      inner.style.setProperty('--rx', `${(-py * 18).toFixed(1)}deg`);
    };
    const onLeave = () => {
      inner.style.setProperty('--rx', '0deg');
      inner.style.setProperty('--ry', '0deg');
    };
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', onLeave);
    return () => {
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="home-hero relative min-h-[calc(100vh-var(--navbar-height))] bg-[var(--dark)] overflow-hidden flex items-center"
    >
      {/* faint cockpit grid, masked toward the current */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.22] [background-image:linear-gradient(rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:60px_60px] [mask-image:radial-gradient(120%_100%_at_70%_30%,#000_42%,transparent_80%)] [-webkit-mask-image:radial-gradient(120%_100%_at_70%_30%,#000_42%,transparent_80%)]"
      />

      {/* decorative brand current — lg+ only; smaller screens get a clean copy-first hero */}
      <div aria-hidden className="hidden lg:block absolute inset-0 z-[1] pointer-events-none">
        {/* glows */}
        <div className="absolute -right-[6%] -top-[16%] w-[720px] h-[620px] rounded-full blur-[70px] [background:radial-gradient(circle,rgba(0,90,134,0.5),transparent_68%)]" />
        <div className="absolute left-[34%] top-[44%] w-[520px] h-[520px] rounded-full blur-[70px] [background:radial-gradient(circle,rgba(0,64,96,0.42),transparent_70%)]" />
        {/* liquid masses */}
        <div className="orbit-bob absolute -right-[10%] -top-[20%] w-[760px] h-[600px] bg-[#12303f] [border-radius:48%_52%_54%_46%/56%_44%_56%_44%]" />
        <div className="absolute left-[50%] top-[12%] w-[540px] h-[380px] bg-[#0f2a38] blur-[1px] -rotate-[4deg] [border-radius:56%_44%_62%_38%/60%_50%_50%_40%]" />
        <div className="absolute left-[33%] top-[50%] w-[380px] h-[440px] bg-[#102b39] -rotate-[8deg] [border-radius:60%_40%_47%_53%/63%_55%_45%_37%]" />
        <div className="orbit-bob absolute left-[44%] top-[42%] w-[150px] h-[214px] bg-[#143a4c] rotate-[38deg] [border-radius:50%_50%_50%_6%]" />
        <div className="absolute -left-[8%] -bottom-[18%] w-[660px] h-[540px] bg-[#0e2733] [border-radius:52%_48%_60%_40%/58%_42%_58%_42%]" />
      </div>

      {/* stars + plus marks */}
      <div aria-hidden className="hidden lg:block absolute inset-0 z-[5] pointer-events-none">
        <span className="absolute left-[6%] top-[42%] w-11 h-11 bg-[var(--card-yellow)]" data-par={14} style={{ clipPath: STAR_CLIP }} />
        <span className="absolute left-[10%] top-[60%] w-[26px] h-[26px] bg-[var(--orange)]" data-par={10} style={{ clipPath: STAR_CLIP }} />
        <span className="absolute left-[52%] top-[62%] w-[30px] h-[30px] bg-[var(--card-purple)]" data-par={22} style={{ clipPath: STAR_CLIP }} />
        <span className="absolute left-[57%] top-[77%] w-[34px] h-[34px] bg-[var(--card-yellow)]" data-par={16} style={{ clipPath: STAR_CLIP }} />
        <span className="absolute left-[38%] top-[72%] text-[34px] font-extrabold leading-none text-white/35" data-par={18}>+</span>
        <span className="absolute left-[66%] top-[37%] text-[34px] font-extrabold leading-none text-white/35" data-par={26}>+</span>
        <span className="absolute left-[63%] top-[74%] text-[34px] font-extrabold leading-none text-white/35" data-par={12}>+</span>
      </div>

      {/* gems */}
      <Gem className="orbit-bob hidden lg:block absolute left-[50%] top-[30%] w-24 h-[132px] z-[4] [filter:drop-shadow(0_0_22px_rgba(255,115,0,0.5))]" />
      <Gem
        className="orbit-bob hidden lg:block absolute left-[52.5%] top-[52%] w-[74px] h-[104px] z-[4] rotate-[14deg] [filter:drop-shadow(0_0_22px_rgba(255,115,0,0.5))]"
      />

      {/* the sort bench — the schedule hub the cards sorted out of. Hovering re-runs
          the sort: the blocks burst outward, then reassemble. */}
      <div
        aria-hidden
        className="schedule-hub hidden lg:block absolute left-[59%] top-[48%] z-[5] w-[320px] bg-[var(--lighter-dark)] border border-white/10 rounded-xl shadow-[0_24px_54px_rgba(0,0,0,0.55)]"
      >
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10">
          <span className="text-[11px] font-semibold text-[var(--light-text)]">
            Generated schedule
          </span>
          <span className="text-[10px] text-[var(--dark-text)] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--card-green)]" />0 conflicts
          </span>
        </div>
        <div className="grid grid-cols-[56px_repeat(4,1fr)] bg-[var(--lighter)]">
          <span className="text-[9.5px] font-semibold text-[var(--dark-text)] py-1.5 text-center">
            Time
          </span>
          {GRID_DAYS.map((d) => (
            <span key={d} className="text-[9.5px] font-semibold text-[var(--dark-text)] py-1.5 text-center">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-[56px_repeat(4,1fr)] relative">
          {GRID_TIMES.map((t) => (
            <Fragment key={t}>
              <span className="text-[9px] text-[var(--dark-text)] py-1.5 pr-1.5 border-t border-white/10 text-right tabular-nums">
                {t}
              </span>
              {GRID_DAYS.map((d) => (
                <span key={`${t}-${d}`} className="border-t border-l border-white/10 min-h-[28px]" />
              ))}
            </Fragment>
          ))}
          {/* blocks positioned over the cells; inner .blk-fill carries the burst transform */}
          {GRID_BLOCKS.map((b, i) => (
            <span
              key={i}
              className="sort-blk absolute"
              style={{
                left: `calc(56px + (100% - 56px) / 4 * ${b.col} + 2px)`,
                width: `calc((100% - 56px) / 4 - 4px)`,
                top: `calc(28px * ${b.row} + 2px)`,
                height: `calc(28px * ${b.span} - 4px)`,
                animationDelay: b.delay,
              }}
            >
              <span
                className="blk-fill block w-full h-full rounded"
                style={
                  {
                    backgroundColor: b.color,
                    '--ex': `${b.ex}px`,
                    '--ey': `${b.ey}px`,
                    '--er': `${b.er}deg`,
                    '--i': i,
                  } as React.CSSProperties
                }
              />
            </span>
          ))}
        </div>
      </div>

      {/* section cards streaming out of the grid */}
      <div aria-hidden className="hidden lg:block">
        {STREAM_CARDS.map((c) => (
          <StreamCard key={c.courseCode + c.section} card={c} />
        ))}
      </div>

      {/* copy */}
      <div className="relative z-20 w-full max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-20 py-10">
        <div className="max-w-xl">
          <p className="reveal-rise inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dark-text)] m-0 mb-5">
            <span
              className="w-2 h-2 rounded-full bg-[var(--orange)] shadow-[0_0_0_5px_rgba(255,115,0,0.16)]"
              aria-hidden
            />
            Live NU Self-Service data
          </p>
          <h1
            className="reveal-rise text-[var(--light-text)] font-black tracking-[-0.035em] text-[clamp(2.5rem,6.4vw,4.75rem)] leading-[0.98] m-0"
            style={{ animationDelay: '0.06s' }}
          >
            Your time,<br />your way.
          </h1>
          <p
            className="reveal-rise text-[var(--dark-text)] text-lg mt-5 mb-0 max-w-md leading-relaxed"
            style={{ animationDelay: '0.22s' }}
          >
            Search courses, set your constraints, and watch every conflict-free timetable sort
            itself out, straight from live data.
          </p>

          <div
            className="reveal-rise flex flex-col sm:flex-row gap-3 mt-8"
            style={{ animationDelay: '0.3s' }}
          >
            <Link to="/generate-schedules" className={primaryCta}>
              <i className="fas fa-calendar-check" aria-hidden />
              Generate Schedule
            </Link>
            <Link to="/find-study-rooms" className={secondaryCta}>
              <i className="fas fa-door-open" aria-hidden />
              Find Study Rooms
            </Link>
          </div>

          <div
            className="reveal-rise flex flex-wrap items-center gap-x-6 gap-y-1 mt-8"
            style={{ animationDelay: '0.4s' }}
          >
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
