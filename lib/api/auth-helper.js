import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function getUserFromRequest(request) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'No autorizado' };
  }

  const token = authHeader.slice('Bearer '.length);

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data?.user) {
    return { user: null, error: 'Sesión inválida' };
  }

  return { user: data.user, error: null };
}
