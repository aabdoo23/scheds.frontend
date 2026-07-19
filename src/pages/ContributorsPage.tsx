import { useMemo } from 'react';
import { useContributors, type Contributor } from '@/hooks/useContributors';
import { MANUAL_CONTRIBUTORS } from '@/components/layout/navConfig';
import { courseColor } from '@/lib/scheduleView';

const GOLDEN_ANGLE = (137.5 * Math.PI) / 180;

function kfmt(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : `${n}`;
}

interface PlacedNode {
  x: number; // 0-100, % within the square field
  y: number;
  size: number; // avatar px
  color: string; // ring / identity hue
  name: string;
  href?: string;
  avatarUrl?: string;
  commits?: number;
  add?: number;
  del?: number;
  role?: string;
  delay: number;
}

function initials(name: string): string {
  const parts = name.replace(/[^a-zA-Z0-9 ]/g, '').split(/\s+/).filter(Boolean);
  const s = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return s.toUpperCase();
}

function nodeAriaLabel(n: PlacedNode): string {
  if (n.role) return `${n.name} — ${n.role}`;
  const bits = [`${n.commits ?? 0} commits`];
  if (n.add) bits.push(`+${n.add.toLocaleString()} additions`);
  if (n.del) bits.push(`-${n.del.toLocaleString()} deletions`);
  return `${n.name} — ${bits.join(', ')}`;
}

function OrbitNode({ n }: { n: PlacedNode }) {
  const inner = (
    <div className="orbit-bob flex flex-col items-center gap-1" style={{ animationDelay: `${n.delay}s` }}>
      <span
        className="relative grid place-items-center rounded-full overflow-hidden bg-[var(--lighter)] text-[var(--light-text)] font-bold transition-transform duration-200 group-hover:scale-110 group-focus-visible:scale-110"
        style={{
          width: n.size,
          height: n.size,
          boxShadow: `0 0 0 2px ${n.color}`,
          fontSize: n.size * 0.36,
        }}
      >
        <span aria-hidden>{initials(n.name)}</span>
        {n.avatarUrl && (
          <img
            src={n.avatarUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
      </span>
      <span className="text-sm font-semibold text-[var(--light-text)] leading-tight max-w-[130px] truncate text-center">
        {n.name}
      </span>
      {n.role ? (
        <span className="text-xs text-[var(--dark-text)] leading-tight max-w-[130px] truncate text-center">
          {n.role}
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-xs leading-tight tabular-nums">
          <span className="text-[var(--dark-text)]">{n.commits}c</span>
          {!!n.add && <span className="text-[var(--success)]">+{kfmt(n.add)}</span>}
          {!!n.del && <span className="text-[var(--btn-danger)]">-{kfmt(n.del)}</span>}
        </span>
      )}
    </div>
  );

  const common =
    'group absolute -translate-x-1/2 -translate-y-1/2 no-underline focus:outline-none focus-visible:outline-none rounded-lg';
  const style = { left: `${n.x}%`, top: `${n.y}%` };

  return n.href ? (
    <a
      href={n.href}
      target="_blank"
      rel="noopener noreferrer"
      className={common}
      style={style}
      aria-label={nodeAriaLabel(n)}
    >
      {inner}
    </a>
  ) : (
    <div className={common} style={style} aria-label={nodeAriaLabel(n)}>
      {inner}
    </div>
  );
}

export function ContributorsPage() {
  const { contributors, loading, error } = useContributors();

  const ranked = useMemo(
    () => [...contributors].sort((a, b) => b.contributions - a.contributions),
    [contributors]
  );
  const maxContributions = ranked[0]?.contributions ?? 0;

  const totals = useMemo(() => {
    if (contributors.length === 0) return null;
    let totalCommits = 0;
    let totalAdditions = 0;
    let totalDeletions = 0;
    for (const c of contributors) {
      totalCommits += c.contributions;
      for (const stats of Object.values(c.repos)) {
        totalAdditions += stats.additions;
        totalDeletions += stats.deletions;
      }
    }
    return {
      contributors: contributors.length + MANUAL_CONTRIBUTORS.length,
      totalCommits,
      totalAdditions,
      totalDeletions,
    };
  }, [contributors]);

  const nodes = useMemo<PlacedNode[]>(() => {
    // One constellation for everyone: commit contributors (ranked) then core team,
    // all styled identically — spread by golden angle, sized by commits.
    const people: PlacedNode[] = [];

    ranked.forEach((c: Contributor) => {
      let add = 0;
      let del = 0;
      for (const s of Object.values(c.repos)) {
        add += s.additions;
        del += s.deletions;
      }
      const size = 48 + (maxContributions > 0 ? c.contributions / maxContributions : 0) * 44;
      people.push({
        x: 0,
        y: 0,
        size,
        color: courseColor(c.login).bg,
        name: c.login,
        href: c.html_url || undefined,
        avatarUrl: c.avatar_url || undefined,
        commits: c.contributions,
        add,
        del,
        delay: 0,
      });
    });

    MANUAL_CONTRIBUTORS.forEach((c) => {
      people.push({
        x: 0,
        y: 0,
        size: 60,
        color: courseColor(c.name).bg,
        name: c.name,
        href: c.link || undefined,
        avatarUrl: c.avatarUrl || undefined,
        role: c.role,
        delay: 0,
      });
    });

    // Place with a golden-angle spiral so any count fills the field evenly.
    return people.map((p, i) => {
      const angle = i * GOLDEN_ANGLE - Math.PI / 2;
      const radius = 23 + (i % 4) * 6; // 23–41% from center
      return {
        ...p,
        x: 50 + radius * Math.cos(angle),
        y: 50 + radius * Math.sin(angle),
        delay: Math.min(i, 14) * 0.1,
      };
    });
  }, [ranked, maxContributions]);

  const showOrbit = !loading && !error && nodes.length > 0;

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-[var(--light-text)]">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight m-0 mb-1">Contributors</h1>
      <p className="text-[var(--dark-text)] m-0 mb-3">
        The people building Scheds, in orbit around it — sized by commits.
      </p>

      {totals && (
        <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
          <span className="text-[var(--dark-text)]">
            <span className="text-[var(--light-text)] font-semibold tabular-nums">
              {totals.contributors}
            </span>{' '}
            contributors
          </span>
          <span className="text-[var(--dark-text)]">
            <span className="text-[var(--light-text)] font-semibold tabular-nums">
              {totals.totalCommits.toLocaleString()}
            </span>{' '}
            commits
          </span>
          <span className="text-[var(--dark-text)]">
            <span className="text-[var(--success)] font-semibold tabular-nums">
              +{totals.totalAdditions.toLocaleString()}
            </span>{' '}
            additions
          </span>
          <span className="text-[var(--dark-text)]">
            <span className="text-[var(--btn-danger)] font-semibold tabular-nums">
              -{totals.totalDeletions.toLocaleString()}
            </span>{' '}
            deletions
          </span>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-[var(--lighter-dark)] border border-white/10 text-center">
          <i className="fas fa-circle-notch fa-spin text-4xl text-[var(--light-blue)] mb-4" aria-hidden />
          <p className="text-[var(--dark-text)] m-0">Loading contributors&hellip;</p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-[var(--lighter-dark)] border border-[var(--btn-danger)]/40 text-center"
        >
          <i className="fas fa-triangle-exclamation text-4xl text-[var(--btn-danger)] mb-4" aria-hidden />
          <h2 className="text-xl font-semibold m-0 mb-2">Couldn&apos;t load contributors</h2>
          <p className="text-[var(--light-text)]/80 m-0 max-w-md">{error}</p>
        </div>
      )}

      {showOrbit && (
        <div className="rounded-2xl bg-[var(--lighter-dark)] border border-white/10 p-3 sm:p-4 overflow-hidden">
          <div
            className="relative aspect-square mx-auto"
            style={{ width: 'min(100%, calc(100dvh - 15rem))' }}
          >
            {/* Rings + spokes (decorative) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              aria-hidden
            >
              <circle cx="50" cy="50" r="23" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="0.4" />
              <circle cx="50" cy="50" r="37" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
              {nodes.map((n) => (
                <line
                  key={`spoke-${n.name}`}
                  x1="50"
                  y1="50"
                  x2={n.x}
                  y2={n.y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="0.4"
                />
              ))}
            </svg>

            {/* Center: Scheds */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
              <span
                className="grid place-items-center rounded-full bg-[var(--light-blue)] text-white font-bold"
                style={{ width: 84, height: 84, boxShadow: '0 0 0 4px rgba(47,143,184,0.35)' }}
              >
                <img
                  src="/images/logo-new.png"
                  alt=""
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              </span>
              <span className="text-xs font-semibold text-[var(--light-text)]">Scheds</span>
            </div>

            {/* Screen-reader ranked list (nodes are also focusable links) */}
            <h2 className="sr-only">Contributors, ranked by commits</h2>

            {nodes.map((n) => (
              <OrbitNode key={n.name} n={n} />
            ))}
          </div>
        </div>
      )}

      {!loading && !error && nodes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-[var(--lighter-dark)] border border-white/10 text-center">
          <i className="fab fa-github text-4xl text-[var(--dark-text)] mb-4" aria-hidden />
          <p className="text-[var(--dark-text)] m-0 max-w-md">
            Couldn&apos;t load contributors. Refresh the page to try again.
          </p>
        </div>
      )}
    </main>
  );
}
