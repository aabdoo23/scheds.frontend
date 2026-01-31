import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { fetchWithCredentials } from '@/lib/api';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/Button';
import type { AnalyticsData } from '@/types/admin';

const PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
] as const;

function buildAnalyticsUrl(preset: (typeof PRESETS)[number]) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - preset.days);
  return `/api/admin/analytics?from=${from.toISOString()}&to=${to.toISOString()}`;
}

export function AdminAnalyticsPage() {
  const { isAuthenticated, loading: authLoading, logout } = useAdminAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<(typeof PRESETS)[number]>(PRESETS[1]);

  const fetchData = useCallback(async () => {
    const url = buildAnalyticsUrl(preset);
    const res = await fetchWithCredentials(url);
    if (res.ok) {
      const json = await res.json();
      setData(json);
    } else {
      setData(null);
    }
  }, [preset]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, [isAuthenticated, fetchData]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="inline-block w-8 h-8 border-2 border-[var(--light-blue)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="inline-block w-8 h-8 border-2 border-[var(--light-blue)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data.usageStatistics ?? {};
  const monthly = data.monthlyStats;
  const dailyStats = data.dailyStats ?? [];
  const coursesWithCounts = data.mostSelectedCoursesWithCounts ?? [];
  const customizationsWithCounts = data.mostSelectedCustomizationsWithCounts ?? [];

  const chartData = dailyStats.map((d) => ({
    date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    generations: d.count,
    schedules: d.totalSchedulesGenerated,
  }));

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <nav className="flex items-center gap-2 mb-6 text-[var(--dark-text)]">
        <Link to="/admin" className="hover:text-[var(--light-text)]">Dashboard</Link>
        <span>/</span>
        <span className="text-[var(--light-text)]">Analytics</span>
      </nav>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--light-text)]">Detailed Analytics</h1>
        <Button variant="danger" onClick={logout}>
          Logout
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        {PRESETS.map((p) => (
          <Button
            key={p.days}
            variant={preset.days === p.days ? 'primary' : 'secondary'}
            onClick={() => setPreset(p)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard title="Total Generations" value={stats['Total Generations'] ?? 0} />
        <StatCard title="This Month" value={monthly?.currentMonthGenerations ?? 0} sub={`${monthly?.growthPercentage ?? 0}%`} />
        <StatCard title="Schedules Generated" value={monthly?.currentMonthSchedules ?? 0} sub={`Avg: ${monthly?.averageSchedulesPerGeneration ?? 0}`} />
        <StatCard title="Live Data Used" value={stats['Live Data Usage'] ?? 0} />
        <StatCard title="Engineering" value={stats['Engineering Students'] ?? 0} />
      </div>

      <div className="p-4 rounded-lg bg-[var(--lighter-dark)] border border-white/10 mb-6">
        <h2 className="text-lg font-semibold text-[var(--light-text)] mb-4">Daily Stats</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="var(--dark-text)" fontSize={12} />
              <YAxis stroke="var(--dark-text)" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--lighter-dark)', border: '1px solid rgba(255,255,255,0.1)' }}
                labelStyle={{ color: 'var(--light-text)' }}
              />
              <Line type="monotone" dataKey="generations" stroke="var(--light-blue)" name="Generations" strokeWidth={2} />
              <Line type="monotone" dataKey="schedules" stroke="#22c55e" name="Schedules" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 rounded-lg bg-[var(--lighter-dark)] border border-white/10">
          <h2 className="text-lg font-semibold text-[var(--light-text)] mb-4">Most Selected Courses (Top 15)</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coursesWithCounts} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="var(--dark-text)" fontSize={12} />
                <YAxis type="category" dataKey="label" stroke="var(--dark-text)" fontSize={11} width={75} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--lighter-dark)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <Bar dataKey="count" fill="var(--light-blue)" name="Selections" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-[var(--lighter-dark)] border border-white/10">
          <h2 className="text-lg font-semibold text-[var(--light-text)] mb-4">Most Used Customizations (Top 15)</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customizationsWithCounts} layout="vertical" margin={{ left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="var(--dark-text)" fontSize={12} />
                <YAxis type="category" dataKey="label" stroke="var(--dark-text)" fontSize={10} width={115} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--lighter-dark)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <Bar dataKey="count" fill="#22c55e" name="Uses" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ title, value, sub }: { title: string; value: number; sub?: string }) {
  return (
    <div className="p-4 rounded-lg bg-[var(--lighter-dark)] border border-white/10">
      <p className="text-[var(--dark-text)] text-sm">{title}</p>
      <p className="text-xl font-bold text-[var(--light-text)]">{value}</p>
      {sub && <p className="text-xs text-[var(--dark-text)]">{sub}</p>}
    </div>
  );
}
