const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export async function fetchWithCredentials(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: 'include',
  });
}
