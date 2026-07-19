-- ============================================================
-- CONCERT MANAGER PRO — Évolution : Charges fixes & Résultat économique
-- À copier-coller intégralement dans Supabase → SQL Editor → New query
-- ============================================================

create table if not exists cmp_charges_fixes (
  id uuid primary key default gen_random_uuid(),
  categorie text not null,          -- Loyer, Assurance annuelle, Abonnements, Comptabilité...
  montant numeric(10,2) not null default 0,   -- montant pour UNE période (une semaine, un mois, ou une année)
  periodicite text not null default 'mensuelle',  -- hebdomadaire | mensuelle | annuelle
  created_at timestamptz default now()
);

alter table cmp_charges_fixes enable row level security;

create policy "Accès ouvert temporaire - charges fixes" on cmp_charges_fixes
  for all using (true) with check (true);
