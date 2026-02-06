const ACCESS_TOKEN_KEY = 'scheds_access_token';
const REFRESH_TOKEN_KEY = 'scheds_refresh_token';

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((cb) => cb());
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken !== undefined) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  notify();
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  notify();
}

export function addListener(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
