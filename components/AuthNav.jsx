'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';

export default function AuthNav() {
  const { user } = useUser();
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div className="auth-bar">
      {user ? (
        <>
          <span className="auth-bar-email">{user.email}</span>
          {user.email === 'joaquinslonimskyy@gmail.com' && (
            <a href="/admin" className="admin-link">Admin</a>
          )}
          <a href="/mis-ordenes" className="mis-ordenes-link">Mis Órdenes</a>
          <button className="auth-bar-btn" onClick={handleSignOut}>
            Cerrar sesión
          </button>
        </>
      ) : (
        <>
          <Link href="/login" className="auth-bar-link">Iniciar sesión</Link>
          <Link href="/register" className="auth-bar-link">Registrarse</Link>
        </>
      )}
    </div>
  );
}
