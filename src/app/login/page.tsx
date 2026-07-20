'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Si déjà connecté, redirige directement vers le tableau de bord
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.location.href = '/';
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(
        error.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect.'
          : "Erreur de connexion : " + error.message
      );
      return;
    }

    window.location.href = '/';
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-light">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-brand-dark">Concert Manager Pro</h1>
        <p className="mt-1 mb-6 text-sm text-gray-500">Connecte-toi pour accéder à tes concerts.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-dark"
              placeholder="ton.email@exemple.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-dark"
              placeholder="••••••••"
            />
          </div>

          {errorMsg && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-brand-dark px-4 py-2 text-sm text-white hover:bg-brand-dark/90 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
