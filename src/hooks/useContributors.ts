import { useState, useEffect } from 'react';
import { GITHUB_REPOS } from '@/components/layout/navConfig';

const CACHE_KEY = 'scheds_contributors_v3';
const CACHE_TTL_MS = 60 * 60 * 1000;
const STATS_202_DELAY_MS = 2500;
const STATS_202_MAX_ATTEMPTS = 3;

export type RepoStats = {
  additions: number;
  deletions: number;
  commits: number;
};

export type Contributor = {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  repos: Record<string, RepoStats>;
  /** Set for non-GitHub team members (e.g. Designer). No contribution bar or repo stats shown. */
  role?: string;
};

type GitHubStatsContributor = {
  author: { login: string; avatar_url: string; html_url: string } | null;
  total: number;
  weeks: Array<{ w: number; a: number; d: number; c: number }>;
};

function statsContributorsApiUrl(href: string): string {
  return href.replace('https://github.com/', 'https://api.github.com/repos/') + '/stats/contributors';
}

function contributorsApiUrl(href: string): string {
  return href.replace('https://github.com/', 'https://api.github.com/repos/') + '/contributors?per_page=100';
}

const GITHUB_FETCH_OPTIONS: RequestInit = {
  headers: {
    Accept: 'application/vnd.github+json',
    ...(import.meta.env.VITE_GITHUB_TOKEN && {
      Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
    }),
  },
};

type SimpleContributor = { login: string; avatar_url: string; html_url: string; contributions: number };

function sumWeeks(weeks: GitHubStatsContributor['weeks'] | undefined): RepoStats {
  let additions = 0;
  let deletions = 0;
  let commits = 0;
  if (!Array.isArray(weeks)) return { additions, deletions, commits };
  for (const w of weeks) {
    additions += w.a ?? 0;
    deletions += w.d ?? 0;
    commits += w.c ?? 0;
  }
  return { additions, deletions, commits };
}

async function fetchStatsWithRetry(url: string, repoLabel: string): Promise<GitHubStatsContributor[]> {
  for (let attempt = 0; attempt < STATS_202_MAX_ATTEMPTS; attempt++) {
    const res = await fetch(url, GITHUB_FETCH_OPTIONS);
    if (res.status === 204) return [];
    if (res.status === 202) {
      await new Promise((r) => setTimeout(r, STATS_202_DELAY_MS));
      continue;
    }
    if (res.status === 200) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
    throw new Error(`${repoLabel}: GitHub ${res.status}`);
  }
  throw new Error(`${repoLabel}: GitHub stats not ready after ${STATS_202_MAX_ATTEMPTS} attempts`);
}

function loadFromCache(): Contributor[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw) as { ts: number; data: Contributor[] };
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function saveToCache(data: Contributor[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // ignore
  }
}

export function useContributors() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = loadFromCache();
    if (cached) {
      setContributors(cached);
      setLoading(false);
      return;
    }

    const fetches = GITHUB_REPOS.map((repo) =>
      fetchStatsWithRetry(statsContributorsApiUrl(repo.href), repo.label).then((arr) => ({
        label: repo.label,
        arr: arr as GitHubStatsContributor[],
      }))
    );

    Promise.all(fetches)
      .then(async (results) => {
        const byLogin = new Map<string, Contributor>();
        for (const { label, arr } of results) {
          for (const item of arr) {
            const author = item.author;
            if (!author?.login) continue;
            const stats = sumWeeks(item.weeks);
            const existing = byLogin.get(author.login);
            if (existing) {
              existing.contributions += item.total;
              existing.repos[label] = stats;
            } else {
              byLogin.set(author.login, {
                login: author.login,
                avatar_url: author.avatar_url,
                html_url: author.html_url,
                contributions: item.total,
                repos: { [label]: stats },
              });
            }
          }
        }
        let merged = Array.from(byLogin.values()).sort(
          (a, b) => b.contributions - a.contributions
        );

        if (merged.length === 0) {
          const simpleFetches = GITHUB_REPOS.map((repo) =>
            fetch(contributorsApiUrl(repo.href), GITHUB_FETCH_OPTIONS)
              .then((r) => (r.status === 204 ? [] : r.ok ? r.json() : Promise.reject(new Error(`${repo.label}: ${r.status}`))))
              .then((data: unknown) => ({ label: repo.label, arr: Array.isArray(data) ? data as SimpleContributor[] : [] }))
          );
          const simpleResults = await Promise.all(simpleFetches);
          const byLoginSimple = new Map<string, Contributor>();
          for (const { label, arr } of simpleResults) {
            for (const c of arr) {
              const existing = byLoginSimple.get(c.login);
              if (existing) {
                existing.contributions += c.contributions;
                existing.repos[label] = { additions: 0, deletions: 0, commits: c.contributions };
              } else {
                byLoginSimple.set(c.login, {
                  login: c.login,
                  avatar_url: c.avatar_url,
                  html_url: c.html_url,
                  contributions: c.contributions,
                  repos: { [label]: { additions: 0, deletions: 0, commits: c.contributions } },
                });
              }
            }
          }
          merged = Array.from(byLoginSimple.values()).sort(
            (a, b) => b.contributions - a.contributions
          );
        }

        saveToCache(merged);
        setContributors(merged);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load contributors'))
      .finally(() => setLoading(false));
  }, []);

  return { contributors, loading, error };
}
