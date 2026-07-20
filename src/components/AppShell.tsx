'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';

/* --- Chapeau de l'application :
   1. Vérifie qu'un utilisateur est connecté, sinon redirige vers /login.
   2. N'affiche jamais la barre latérale sur l'écran de connexion lui-même.
   Tant que la vérification n'est pas terminée, rien ne s'affiche — pour éviter
   d'apercevoir brièvement des données avant une éventuelle redirection. --- */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const estPageLogin = pathname === '/login';
  const [statut, setStatut] = useState<'verification' | 'autorise' | 'refuse'>('verification');

  useEffect(() => {
    if (estPageLogin) {
      setStatut('autorise');
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setStatut('autorise');
      } else {
        setStatut('refuse');
        window.location.href = '/login';
      }
    });

    const { data: ecouteur } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    });

    return () => {
      ecouteur.subscription.unsubscribe();
    };
  }, [estPageLogin]);

  // Écran de connexion : jamais de barre latérale, jamais de vérification bloquante.
  if (estPageLogin) {
    return <>{children}</>;
  }

  if (statut === 'verification') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">
        Vérification de la connexion...
      </div>
    );
  }

  if (statut === 'refuse') {
    return null; // la redirection vers /login est déjà en cours
  }

  return (
    <>
      <Sidebar />
      <main className="ml-64 min-h-screen p-8">{children}</main>
    </>
  );
}
