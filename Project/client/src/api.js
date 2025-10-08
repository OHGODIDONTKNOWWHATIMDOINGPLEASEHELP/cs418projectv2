const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
if (!window.__loggedApiBase) {
  console.log('[API BASE]', API, 'from', window.location.origin);
  window.__loggedApiBase = true;
}


export async function api(path, { method='GET', body, token } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}
