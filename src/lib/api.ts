import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from '@/lib/authStorage';

export const API_BASE = import.meta.env.VITE_API_BASE ?? '';

let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.accessToken);
    return true;
  } catch {
    return false;
  } finally {
    refreshPromise = null;
  }
}

export async function fetchWithCredentials(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  let res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 401 && getRefreshToken()) {
    if (!refreshPromise) refreshPromise = doRefresh();
    const refreshed = await refreshPromise;
    if (refreshed) {
      const newToken = getAccessToken();
      const retryHeaders = new Headers(options.headers);
      if (newToken) retryHeaders.set('Authorization', `Bearer ${newToken}`);
      res = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: retryHeaders,
        credentials: 'include',
      });
    } else {
      clearTokens();
    }
  }

  return res;
}
