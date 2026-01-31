import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchWithCredentials } from '@/lib/api';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/Button';
import type { GenerationDetail } from '@/types/admin';

const DAY_NAMES = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

function parseSelectedDays(json: string | null): string {
  if (!json) return 'Not specified';
  try {
    const days = JSON.parse(json) as boolean[];
    if (!Array.isArray(days)) return 'Not specified';
    const selected = days
      .map((checked, i) => (checked ? DAY_NAMES[i] : null))
      .filter(Boolean);
    return selected.length > 0 ? selected.join(', ') : 'None';
  } catch {
    return 'Not specified';
  }
}

function formatPreference(value: string | number, fallback = 'Not specified'): string {
  if (value === '' || value === null || value === undefined) return fallback;
  return String(value);
}

export function AdminGenerationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, loading: authLoading, logout } = useAdminAuth();
  const [generation, setGeneration] = useState<GenerationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTechnical, setShowTechnical] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    fetchWithCredentials(`/api/admin/generations/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setGeneration)
      .finally(() => setLoading(false));
  }, [isAuthenticated, id]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="inline-block w-8 h-8 border-2 border-[var(--light-blue)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loading || !generation) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        {!loading && !generation ? (
          <p className="text-[var(--light-text)]">Generation not found</p>
        ) : (
          <span className="inline-block w-8 h-8 border-2 border-[var(--light-blue)] border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    );
  }

  const selectedDaysDisplay = parseSelectedDays(generation.selectedDaysJson);
  const hasTechnical = generation.clientIpAddress || generation.userAgent;

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <nav className="flex items-center gap-2 mb-6 text-[var(--dark-text)]">
        <Link to="/admin" className="hover:text-[var(--light-text)]">Dashboard</Link>
        <span>/</span>
        <Link to="/admin/generations" className="hover:text-[var(--light-text)]">History</Link>
        <span>/</span>
        <span className="text-[var(--light-text)]">Details #{generation.id}</span>
      </nav>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--light-text)]">Generation Details</h1>
        <Button variant="danger" onClick={logout}>
          Logout
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 rounded-lg bg-[var(--lighter-dark)] border border-white/10">
          <h2 className="text-lg font-semibold text-[var(--light-text)] mb-4">Generation Information</h2>
          <dl className="space-y-2 text-[var(--light-text)]">
            <div className="flex justify-between"><dt>ID:</dt><dd>{generation.id}</dd></div>
            <div className="flex justify-between"><dt>Generated At:</dt><dd>{new Date(generation.generatedAt).toLocaleString()} UTC</dd></div>
            <div className="flex justify-between"><dt>Schedules Generated:</dt><dd>{generation.numberOfSchedulesGenerated}</dd></div>
            <div className="flex justify-between"><dt>Used Live Data:</dt><dd>{generation.usedLiveData ? 'Yes' : 'No'}</dd></div>
            <div className="flex justify-between"><dt>Engineering:</dt><dd>{generation.isEngineering ? 'Yes' : 'No'}</dd></div>
            <div className="flex justify-between"><dt>Zero Seats Considered:</dt><dd>{generation.consideredZeroSeats ? 'Yes' : 'No'}</dd></div>
          </dl>
        </div>
        <div className="p-4 rounded-lg bg-[var(--lighter-dark)] border border-white/10">
          <h2 className="text-lg font-semibold text-[var(--light-text)] mb-4">Schedule Preferences</h2>
          <dl className="space-y-2 text-[var(--light-text)]">
            <div className="flex justify-between"><dt>Min Items/Day:</dt><dd>{formatPreference(generation.minimumNumberOfItemsPerDay, '—')}</dd></div>
            <div className="flex justify-between"><dt>Largest Gap:</dt><dd>{formatPreference(generation.largestAllowedGap, '—')}</dd></div>
            <div className="flex justify-between"><dt>Number of Days:</dt><dd>{generation.isNumberOfDaysSelected ? generation.numberOfDays : 'Not specified'}</dd></div>
            <div className="flex justify-between"><dt>Days Start:</dt><dd>{formatPreference(generation.daysStart)}</dd></div>
            <div className="flex justify-between"><dt>Days End:</dt><dd>{formatPreference(generation.daysEnd)}</dd></div>
            <div className="flex justify-between"><dt>Selected Days:</dt><dd>{selectedDaysDisplay}</dd></div>
          </dl>
        </div>
      </div>

      {hasTechnical && (
        <div className="mb-6 p-4 rounded-lg bg-[var(--lighter-dark)] border border-white/10">
          <button
            type="button"
            onClick={() => setShowTechnical((s) => !s)}
            className="flex items-center gap-2 text-[var(--light-text)] font-semibold hover:text-[var(--light-blue)]"
          >
            <span>{showTechnical ? '▼' : '▶'}</span>
            <span>Technical</span>
          </button>
          {showTechnical && (
            <dl className="mt-3 space-y-2 text-[var(--light-text)] text-sm">
              {generation.clientIpAddress && (
                <div><dt className="text-[var(--dark-text)]">IP Address:</dt><dd className="font-mono">{generation.clientIpAddress}</dd></div>
              )}
              {generation.userAgent && (
                <div><dt className="text-[var(--dark-text)]">User Agent:</dt><dd className="font-mono break-all">{generation.userAgent}</dd></div>
              )}
            </dl>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 rounded-lg bg-[var(--lighter-dark)] border border-white/10">
          <h2 className="text-lg font-semibold text-[var(--light-text)] mb-4">Selected Courses</h2>
          <ul className="space-y-1 text-[var(--light-text)]">
            {(generation.selectedCourses ?? []).length === 0 ? (
              <li className="text-[var(--dark-text)]">None</li>
            ) : (
              (generation.selectedCourses ?? []).map((c, i) => (
                <li key={i}>{c.courseCode}: {c.courseName}</li>
              ))
            )}
          </ul>
        </div>
        <div className="p-4 rounded-lg bg-[var(--lighter-dark)] border border-white/10">
          <h2 className="text-lg font-semibold text-[var(--light-text)] mb-4">Custom Selected Courses</h2>
          {(generation.selectedCustomCourses ?? []).length === 0 ? (
            <p className="text-[var(--dark-text)]">None</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[var(--light-text)] text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2">Course</th>
                    <th className="text-left py-2">Main</th>
                    <th className="text-left py-2">Sub</th>
                    <th className="text-left py-2">Professor</th>
                    <th className="text-left py-2">TA</th>
                  </tr>
                </thead>
                <tbody>
                  {(generation.selectedCustomCourses ?? []).map((c, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-2">{c.courseCode}: {c.courseName}</td>
                      <td className="py-2 text-[var(--dark-text)]">{c.customMainSection ?? '—'}</td>
                      <td className="py-2 text-[var(--dark-text)]">{c.customSubSection ?? '—'}</td>
                      <td className="py-2 text-[var(--dark-text)]">{c.customProfessor ?? '—'}</td>
                      <td className="py-2 text-[var(--dark-text)]">{c.customTA ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
