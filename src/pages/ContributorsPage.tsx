import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useContributors, type Contributor, type RepoStats } from '@/hooks/useContributors';
import { GITHUB_REPOS, MANUAL_CONTRIBUTORS } from '@/components/layout/navConfig';

function RepoStatLine({ repoLabel, stats }: { repoLabel: string; stats: RepoStats }) {
  const hasAddDel = stats.additions > 0 || stats.deletions > 0;
  return (
    <div className="flex items-center gap-2 text-sm opacity-90">
      <span className="font-medium text-[var(--light-text)]">{repoLabel}:</span>
      {hasAddDel && (
        <>
          <span className="text-green-500">+{stats.additions.toLocaleString()}</span>
          <span className="text-red-500">-{stats.deletions.toLocaleString()}</span>
        </>
      )}
      <span className="opacity-75">({stats.commits} commits)</span>
    </div>
  );
}

function ContributorCard({
  c,
  maxContributions,
}: {
  c: Contributor;
  maxContributions: number;
}) {
  const isManual = !!c.role;
  const repoLabels = GITHUB_REPOS.map((r) => r.label).filter((label) => c.repos[label]);
  const barWidth = maxContributions > 0 ? (c.contributions / maxContributions) * 100 : 0;
  const cardClass =
    'group flex flex-col p-5 rounded-xl bg-[var(--lighter)] text-[var(--light-text)] no-underline transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5';

  const content = (
    <>
      <div className="flex items-center gap-4 mb-3">
        <img
          src={c.avatar_url}
          alt=""
          className="w-14 h-14 rounded-full object-cover shrink-0 ring-2 ring-[var(--lighter-dark)] group-hover:ring-[var(--light-blue)]/50 transition-shadow"
        />
        <div className="min-w-0 flex-1">
          <span className="font-semibold text-lg block truncate">{c.login}</span>
          {isManual ? (
            <span className="text-sm opacity-80">{c.role}</span>
          ) : (
            <span className="text-sm opacity-80">
              {c.contributions.toLocaleString()} total commit{c.contributions !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
      {!isManual && (
        <>
          <div
            className="h-1.5 rounded-full bg-[var(--lighter-dark)] overflow-hidden mb-3"
            title={`${barWidth.toFixed(0)}% of top contributor`}
          >
            <div
              className="h-full rounded-full bg-[var(--light-blue)] transition-all duration-500"
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            {repoLabels.map((label) => (
              <RepoStatLine key={label} repoLabel={label} stats={c.repos[label]} />
            ))}
          </div>
        </>
      )}
    </>
  );

  if (isManual && !c.html_url) {
    return <div className={cardClass}>{content}</div>;
  }
  return (
    <a href={c.html_url} target="_blank" rel="noopener noreferrer" className={cardClass}>
      {content}
    </a>
  );
}

const CENTER = 50;
const GOLDEN_ANGLE = (137.5 * Math.PI) / 180;
const BASE_RADIUS = 24;
const RADIUS_SPREAD = 8;

function getNodePositions(n: number): Array<{ left: number; top: number }> {
  return Array.from({ length: n }, (_, i) => {
    const angle = i * GOLDEN_ANGLE;
    const radius = BASE_RADIUS + (i % 3) * RADIUS_SPREAD;
    return {
      left: CENTER + radius * Math.cos(angle),
      top: CENTER + radius * Math.sin(angle),
    };
  });
}

function ContributorsGraph({
  contributors,
  maxContributions,
}: {
  contributors: Contributor[];
  maxContributions: number;
}) {
  if (contributors.length === 0) return null;

  const positions = getNodePositions(contributors.length);

  return (
    <div className="w-full max-w-[700px] mx-auto mb-8">
      <h2 className="text-xl font-semibold text-[var(--light-text)] mb-4 text-center">
        Our contributors
      </h2>
      <div
        className="relative w-full overflow-visible"
        style={{ minHeight: '360px' }}
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {positions.map((pos, i) => (
            <line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={pos.left}
              y2={pos.top}
              stroke="var(--lighter-dark)"
              strokeWidth={0.4}
            />
          ))}
        </svg>

        <div
          className="absolute flex flex-col items-center gap-1.5"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <img
            src="/images/logo-new.png"
            alt=""
            className="w-12 h-12 object-contain"
          />
          <span className="font-semibold text-sm text-[var(--light-text)]">
            Scheds
          </span>
        </div>

        {contributors.map((c, i) => {
          const pos = positions[i];
          const isManual = !!c.role;
          const barPct =
            maxContributions > 0 ? (c.contributions / maxContributions) * 100 : 0;

          const nodeContent = (
            <div className="flex flex-col items-center text-center">
              <img
                src={c.avatar_url}
                alt=""
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[var(--lighter)] shrink-0 mb-1"
              />
              {c.html_url ? (
                <a
                  href={c.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sm text-[var(--light-text)] hover:underline truncate max-w-[90px]"
                >
                  {c.login}
                </a>
              ) : (
                <span className="font-semibold text-sm text-[var(--light-text)] truncate max-w-[90px]">
                  {c.login}
                </span>
              )}
              {isManual ? (
                <span className="text-xs text-[var(--dark-text)] truncate max-w-[90px]">
                  {c.role}
                </span>
              ) : (
                <>
                  <span className="text-xs text-[var(--dark-text)]">
                    {c.contributions} commits
                  </span>
                  <div className="mt-1 w-14 h-1.5 rounded-full bg-[var(--lighter-dark)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--orange)]"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          );

          return (
            <div
              key={c.login}
              className="absolute"
              style={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {nodeContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const manualAsContributors: Contributor[] = MANUAL_CONTRIBUTORS.map((m) => ({
  login: m.name,
  avatar_url: m.avatarUrl,
  html_url: m.link ?? '',
  contributions: 0,
  repos: {},
  role: m.role,
}));

export function ContributorsPage() {
  const { contributors, loading, error } = useContributors();

  const displayList = useMemo(
    () => [...contributors, ...manualAsContributors],
    [contributors]
  );

  const { totals, chartData, maxContributions } = useMemo(() => {
    if (contributors.length === 0) {
      return { totals: null, chartData: [], maxContributions: 0 };
    }
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
    const max = Math.max(...contributors.map((c) => c.contributions), 0);
    const chartData = contributors.slice(0, 10).map((c) => {
      let additions = 0;
      let deletions = 0;
      for (const stats of Object.values(c.repos)) {
        additions += stats.additions;
        deletions += stats.deletions;
      }
      return {
        name: c.login,
        commits: c.contributions,
        additions,
        deletions,
      };
    });
    return {
      totals: {
        contributors: contributors.length + MANUAL_CONTRIBUTORS.length,
        totalCommits,
        totalAdditions,
        totalDeletions,
      },
      chartData,
      maxContributions: max,
    };
  }, [contributors]);

  return (
    <div className="flex flex-col items-center p-5 min-h-screen text-[var(--light-text)]">
      <div className="text-center mt-6 mb-8">
        <h1 className="text-4xl font-semibold text-[var(--light-text)] mb-2.5">
          <i className="fab fa-github mr-2" />
          Contributors
        </h1>
        <p className="text-lg text-[var(--light-text)] opacity-80">
          People who contribute to Scheds across our frontend and backend repos
        </p>
      </div>

      <div className="w-full max-w-[1000px]">
        {loading && (
          <div className="text-center py-10 text-lg text-[var(--light-text)]">
            <i className="fas fa-spinner fa-spin mr-2" />
            Loading contributors...
          </div>
        )}

        {error && (
          <div className="text-center py-16 bg-[var(--lighter)] rounded-xl text-[var(--light-text)]">
            <i className="fas fa-exclamation-triangle text-6xl mb-5 opacity-50" />
            <h3 className="text-xl font-semibold">Couldn&apos;t load contributors</h3>
            <p className="mt-2 opacity-80">{error}</p>
          </div>
        )}

        {!loading && displayList.length > 0 && (
          <>
            {totals && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-[var(--lighter-dark)] px-4 py-4 rounded-xl shadow-[0_3px_10px_rgba(0,0,0,0.15)] text-center">
                  <div className="text-2xl md:text-3xl font-bold text-[var(--light-blue)]">
                    {totals.contributors}
                  </div>
                  <div className="text-sm text-[var(--light-text)] opacity-80">Contributors</div>
                </div>
                <div className="bg-[var(--lighter-dark)] px-4 py-4 rounded-xl shadow-[0_3px_10px_rgba(0,0,0,0.15)] text-center">
                  <div className="text-2xl md:text-3xl font-bold text-[var(--light-text)]">
                    {totals.totalCommits.toLocaleString()}
                  </div>
                  <div className="text-sm text-[var(--light-text)] opacity-80">Total commits</div>
                </div>
                <div className="bg-[var(--lighter-dark)] px-4 py-4 rounded-xl shadow-[0_3px_10px_rgba(0,0,0,0.15)] text-center">
                  <div className="text-2xl md:text-3xl font-bold text-green-500">
                    +{totals.totalAdditions.toLocaleString()}
                  </div>
                  <div className="text-sm text-[var(--light-text)] opacity-80">Additions</div>
                </div>
                <div className="bg-[var(--lighter-dark)] px-4 py-4 rounded-xl shadow-[0_3px_10px_rgba(0,0,0,0.15)] text-center">
                  <div className="text-2xl md:text-3xl font-bold text-red-500">
                    -{totals.totalDeletions.toLocaleString()}
                  </div>
                  <div className="text-sm text-[var(--light-text)] opacity-80">Deletions</div>
                </div>
              </div>
            )}

            <ContributorsGraph contributors={displayList} maxContributions={maxContributions} />
            
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {displayList.map((c) => (
                <ContributorCard
                  key={c.login}
                  c={c}
                  maxContributions={maxContributions}
                />
              ))}
            </div>

            {chartData.length > 0 && (
              <div className="bg-[var(--lighter)] rounded-xl p-4 md:p-6 mt-8 shadow-[0_3px_10px_rgba(0,0,0,0.1)]">
                <h2 className="text-xl font-semibold text-[var(--light-text)] mb-4">
                  Commits, additions & deletions by contributor
                </h2>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ left: 20, right: 20, top: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--lighter-dark)" />
                      <XAxis type="number" stroke="var(--dark-text)" fontSize={12} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={90}
                        stroke="var(--dark-text)"
                        fontSize={11}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--lighter-dark)',
                          border: '1px solid var(--lighter)',
                          borderRadius: '8px',
                          color: 'var(--light-text)',
                        }}
                        formatter={(value: number | undefined, name: string | undefined) => [
                          (value ?? 0).toLocaleString(),
                          name === 'additions' ? 'Additions' : name === 'deletions' ? 'Deletions' : 'Commits',
                        ]}
                        labelStyle={{ color: 'var(--light-text)' }}
                      />
                      <Bar
                        dataKey="commits"
                        fill="var(--light-blue)"
                        radius={[0, 4, 4, 0]}
                        name="Commits"
                      />
                      <Bar
                        dataKey="additions"
                        fill="#22c55e"
                        radius={[0, 4, 4, 0]}
                        name="Additions"
                      />
                      <Bar
                        dataKey="deletions"
                        fill="#ef4444"
                        radius={[0, 4, 4, 0]}
                        name="Deletions"
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '12px', color: 'var(--light-text)' }}
                        formatter={(value) => value}
                        iconType="square"
                        iconSize={10}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}

        {!loading && displayList.length === 0 && (
          <div className="text-center py-16 bg-[var(--lighter)] rounded-xl text-[var(--light-text)]">
            <i className="fab fa-github text-6xl mb-5 opacity-50" />
            <p className="text-lg opacity-80">Failed to load contributors, refresh the page to try again</p>
          </div>
        )}
      </div>
    </div>
  );
}
