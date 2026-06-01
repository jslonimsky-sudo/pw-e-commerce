'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Completá todos los campos.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Ingresá un email con formato válido.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });
    setLoading(false);

    if (authError) {
      setError(authError.message || 'Ocurrió un error. Intentá de nuevo.');
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <Link href="/" className="auth-logo">
            JS <span>STUDIOS</span>
          </Link>
          <h1 className="auth-title">¡CASI LISTO!</h1>
          <p className="auth-subtitle">
            Revisá tu email para confirmar tu cuenta. Una vez confirmada podés iniciar sesión.
          </p>
          <p className="auth-footer">
            <Link href="/login">Volver a iniciar sesión</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-logo">
          JS <span>STUDIOS</span>
        </Link>

        <h1 className="auth-title">CREAR CUENTA</h1>
        <p className="auth-subtitle">Registrate para acceder a la tienda.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="fullName">Nombre completo</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre"
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  );
}
