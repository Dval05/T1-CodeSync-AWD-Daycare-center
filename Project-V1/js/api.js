import supabase from '../supabaseClient.js';

function getGoogleIdToken() {
  return localStorage.getItem('google_id_token') || null;
}

export async function apiFetch(path, options = {}) {
  const token = getGoogleIdToken() || (await getSupabaseAccessToken());
  if (!token) throw new Error('No autenticado: falta token');

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  // Añadir Content-Type solo si hay body y no está ya definido
  if (options.body && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(`/api${path}`, { ...options, headers });
}

async function getSupabaseAccessToken() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch {
    return null;
  }
}

export default apiFetch;