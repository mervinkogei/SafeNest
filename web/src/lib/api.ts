export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('safenest_token') || '';
}

export function setSession(token: string, user: unknown) {
  localStorage.setItem('safenest_token', token);
  localStorage.setItem('safenest_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('safenest_token');
  localStorage.removeItem('safenest_user');
}

export function currentUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('safenest_user');
  return raw ? JSON.parse(raw) : null;
}

export async function api(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Something went wrong');
  }
  return data;
}
