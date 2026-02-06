export const API_BASE = import.meta.env.VITE_API_BASE ?? '';

const TOKEN_KEY = 'scheds_token';

export async function fetchWithCredentials(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
    credentials: 'include',
  });
}
