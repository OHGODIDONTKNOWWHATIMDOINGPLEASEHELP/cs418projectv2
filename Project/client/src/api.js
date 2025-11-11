// Single source of truth for API calls

const API = import.meta.env.VITE_API_URL || 'https://cs418projectv2.onrender.com';


// one-time log so you can confirm the base in the browser console
if (!window.__apiBaseLogged) {
  console.log('[API BASE]', API, 'from', window.location.origin);
  window.__apiBaseLogged = true;
}

export async function api(path, { method = 'GET', body, token, headers } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {})
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined
  });

  // Try to parse JSON; tolerate empty bodies
  let data = null;
  try { data = await res.json(); } catch {}

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data ?? {};
}
