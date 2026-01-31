import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithCredentials } from '@/lib/api';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/Button';
import type { AdminDashboard } from '@/types/admin';

export function AdminDashboardPage() {
  const { isAuthenticated, loading: authLoading, logout } = useAdminAuth();
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchWithCredentials('/api/admin/dashboard')
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

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

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--light-text)]">Analytics Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/admin/analytics">
            <Button variant="secondary">Analytics</Button>
          </Link>
          <Link to="/admin/generations">
            <Button variant="secondary">Generation History</Button>
          </Link>
          <Button variant="danger" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard title="Total Generations" value={stats['Total Generations'] ?? 0} />
        <StatCard title="This Month" value={monthly?.currentMonthGenerations ?? 0} sub={`${monthly?.growthPercentage ?? 0}%`} />
        <StatCard title="Schedules Generated" value={monthly?.currentMonthSchedules ?? 0} sub={`Avg: ${monthly?.averageSchedulesPerGeneration ?? 0}`} />
        <StatCard title="Live Data Used" value={stats['Live Data Usage'] ?? 0} />
        <StatCard title="Engineering" value={stats['Engineering Students'] ?? 0} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card title="Most Selected Courses">
          <ul className="list-decimal list-inside space-y-1 text-[var(--light-text)]">
            {(data.mostSelectedCourses ?? []).slice(0, 10).map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </Card>
        <Card title="Most Used Customizations">
          <ul className="list-disc list-inside space-y-1 text-[var(--light-text)]">
            {(data.mostSelectedCustomizations ?? []).slice(0, 10).map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Daily Stats (Last 7 Days)">
        <div className="overflow-x-auto">
          <table className="w-full text-[var(--light-text)]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2">Date</th>
                <th className="text-right py-2">Count</th>
                <th className="text-right py-2">Schedules</th>
              </tr>
            </thead>
            <tbody>
              {(data.dailyStats ?? []).map((d, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-2">{new Date(d.date).toLocaleDateString()}</td>
                  <td className="text-right py-2">{d.count}</td>
                  <td className="text-right py-2">{d.totalSchedulesGenerated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Recent Generations" className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-[var(--light-text)]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2">ID</th>
                <th className="text-left py-2">Generated At</th>
                <th className="text-right py-2">Schedules</th>
                <th className="text-right py-2">Courses</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data.recentGenerations ?? []).map((g) => (
                <tr key={g.id} className="border-b border-white/5">
                  <td className="py-2">{g.id}</td>
                  <td className="py-2">{new Date(g.generatedAt).toLocaleString()}</td>
                  <td className="text-right py-2">{g.numberOfSchedulesGenerated}</td>
                  <td className="text-right py-2">{g.totalCourses}</td>
                  <td className="py-2">
                    <Link to={`/admin/generations/${g.id}`} className="text-[var(--light-blue)] hover:underline">
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
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

function Card({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-4 rounded-lg bg-[var(--lighter-dark)] border border-white/10 ${className}`}>
      <h2 className="text-lg font-semibold text-[var(--light-text)] mb-4">{title}</h2>
      {children}
    </div>
  );
}
