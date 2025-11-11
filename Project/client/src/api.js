const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function api(path, { method='GET', body, token } = {}) {
  const res = await fetch(API_BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined,
  }).catch((e) => {
    console.error('Network error calling', API_BASE + path, e);
    throw e;
  });

  const text = await res.text();
  // try to parse JSON
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    console.error('Bad JSON from server:', text);
    throw new Error('Server returned non-JSON response');
  }

  if (!res.ok) {
    console.error('API error', res.status, data);
    throw new Error(data.error || `Request failed with ${res.status}`);
  }

  return data;
}
