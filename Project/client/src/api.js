const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function api(path, { method = 'GET', body } = {}) {
  // try to grab token from localStorage (that your AuthContext saved)
  const token = localStorage.getItem('token');

  const res = await fetch(API_BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}
