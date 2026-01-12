import { createClient } from '@supabase/supabase-js';
import { OAuth2Client } from 'google-auth-library';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

async function validateWithSupabase(token) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return null;
    return {
      provider: 'supabase',
      id: data.user.id,
      email: data.user.email,
      raw: data.user,
    };
  } catch (_) {
    return null;
  }
}

async function validateWithGoogle(token) {
  if (!googleClient) return null;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email || payload.email_verified !== true) return null;
    return {
      provider: 'google',
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      raw: payload,
    };
  } catch (_) {
    return null;
  }
}

export async function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ ok: false, error: 'Falta Authorization Bearer token' });

  // Intenta validar con Supabase y luego con Google
  const supabaseUser = await validateWithSupabase(token);
  const googleUser = supabaseUser ? null : await validateWithGoogle(token);

  const user = supabaseUser || googleUser;
  if (!user) return res.status(401).json({ ok: false, error: 'Token inválido o sesión no válida' });

  req.user = user;
  next();
}

export default requireAuth;