import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithCredentials } from '@/lib/api';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/Button';
import type { GenerationListItem } from '@/types/admin';

export function AdminGenerationsPage() {
  const { isAuthenticated, loading: authLoading, logout } = useAdminAuth();
  const [generations, setGenerations] = useState<GenerationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchWithCredentials('/api/admin/generations')
      .then((res) => (res.ok ? res.json() : []))
      .then(setGenerations)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="inline-block w-8 h-8 border-2 border-[var(--light-blue)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="inline-block w-8 h-8 border-2 border-[var(--light-blue)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <nav className="flex items-center gap-2 mb-6 text-[var(--dark-text)]">
        <Link to="/admin" className="hover:text-[var(--light-text)]">Dashboard</Link>
        <span>/</span>
        <span className="text-[var(--light-text)]">Generation History</span>
      </nav>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--light-text)]">Schedule Generation History</h1>
        <Button variant="danger" onClick={logout}>
          Logout
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg bg-[var(--lighter-dark)] border border-white/10">
        <table className="w-full text-[var(--light-text)]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4">ID</th>
              <th className="text-left py-3 px-4">Generated At</th>
              <th className="text-right py-3 px-4">Schedules</th>
              <th className="text-right py-3 px-4">Courses</th>
              <th className="text-right py-3 px-4">Custom</th>
              <th className="text-left py-3 px-4">Live</th>
              <th className="text-left py-3 px-4">Engineering</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {generations.map((g) => (
              <tr key={g.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 px-4">{g.id}</td>
                <td className="py-3 px-4">{new Date(g.generatedAt).toLocaleString()}</td>
                <td className="text-right py-3 px-4">{g.numberOfSchedulesGenerated}</td>
                <td className="text-right py-3 px-4">{g.selectedCoursesCount}</td>
                <td className="text-right py-3 px-4">{g.selectedCustomCoursesCount}</td>
                <td className="py-3 px-4">{g.usedLiveData ? 'Yes' : 'No'}</td>
                <td className="py-3 px-4">{g.isEngineering ? 'Yes' : 'No'}</td>
                <td className="py-3 px-4">
                  <Link to={`/admin/generations/${g.id}`} className="text-[var(--light-blue)] hover:underline">
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
