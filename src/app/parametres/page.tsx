'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Salle, Artiste, Saison, ChargeFixe } from '@/lib/types';
import { Trash2, Plus } from 'lucide-react';

type Onglet = 'salles' | 'artistes' | 'saisons' | 'charges-fixes';

export default function ParametresPage() {
  const [onglet, setOnglet] = useState<Onglet>('salles');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">Configuration & paramètres</h1>
      <p className="mt-1 text-sm text-gray-500">
        Salles, artistes et saisons — ces informations serviront de base pour vos concerts.
      </p>

      <div className="mt-6 flex gap-2 border-b border-gray-200">
        {(['salles', 'artistes', 'saisons', 'charges-fixes'] as Onglet[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setOnglet(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              onglet === tab
                ? 'border-brand-dark text-brand-dark'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab === 'charges-fixes' ? 'Charges fixes' : tab}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {onglet === 'salles' && <GestionSalles />}
        {onglet === 'artistes' && <GestionArtistes />}
        {onglet === 'saisons' && <GestionSaisons />}
        {onglet === 'charges-fixes' && <GestionChargesFixes />}
      </div>
    </div>
  );
}

function GestionSalles() {
  const [salles, setSalles] = useState<Salle[]>([]);
  const [nom, setNom] = useState('');
  const [adresse, setAdresse] = useState('');
  const [capacite, setCapacite] = useState('');
  const [chargement, setChargement] = useState(true);

  const charger = async () => {
    const { data } = await supabase.from('cmp_salles').select('*').order('nom');
    setSalles((data as Salle[]) ?? []);
    setChargement(false);
  };

  useEffect(() => {
    charger();
  }, []);

  const ajouter = async () => {
    if (!nom.trim()) {
      alert('Merci de renseigner un nom avant d\'ajouter.');
      return;
    }
    await supabase.from('cmp_salles').insert({
      nom,
      adresse: adresse || null,
      capacite: Number(capacite) || 0,
    });
    setNom('');
    setAdresse('');
    setCapacite('');
    charger();
  };

  const supprimer = async (id: string, nom: string) => {
    if (!confirm(`Supprimer la salle "${nom}" ? Cette action est irréversible.`)) return;
    await supabase.from('cmp_salles').delete().eq('id', id);
    charger();
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <input
          placeholder="Nom de la salle"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <input
          placeholder="Adresse (optionnel)"
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <input
          placeholder="Capacité"
          type="number"
          value={capacite}
          onChange={(e) => setCapacite(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <button
          onClick={ajouter}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-dark px-3 py-2 text-sm text-white hover:bg-brand-dark/90"
        >
          <Plus size={16} /> Ajouter
        </button>
      </div>

      <div className="mt-6 divide-y divide-gray-100">
        {chargement && <p className="text-sm text-gray-400">Chargement...</p>}
        {!chargement && salles.length === 0 && (
          <p className="text-sm text-gray-400">Aucune salle enregistrée pour l'instant.</p>
        )}
        {salles.map((s) => (
          <div key={s.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-brand-dark">{s.nom}</p>
              <p className="text-xs text-gray-400">
                {s.adresse ? `${s.adresse} · ` : ''}Capacité : {s.capacite} places
              </p>
            </div>
            <button onClick={() => supprimer(s.id, s.nom)} className="text-gray-300 hover:text-danger">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function GestionArtistes() {
  const [artistes, setArtistes] = useState<Artiste[]>([]);
  const [nom, setNom] = useState('');
  const [genre, setGenre] = useState('');
  const [contact, setContact] = useState('');
  const [chargement, setChargement] = useState(true);

  const charger = async () => {
    const { data } = await supabase.from('cmp_artistes').select('*').order('nom');
    setArtistes((data as Artiste[]) ?? []);
    setChargement(false);
  };

  useEffect(() => {
    charger();
  }, []);

  const ajouter = async () => {
    if (!nom.trim()) {
      alert('Merci de renseigner un nom avant d\'ajouter.');
      return;
    }
    await supabase.from('cmp_artistes').insert({
      nom,
      genre_musical: genre || null,
      contact: contact || null,
    });
    setNom('');
    setGenre('');
    setContact('');
    charger();
  };

  const supprimer = async (id: string, nom: string) => {
    if (!confirm(`Supprimer l'artiste "${nom}" ? Cette action est irréversible.`)) return;
    await supabase.from('cmp_artistes').delete().eq('id', id);
    charger();
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <input
          placeholder="Nom de l'artiste"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <input
          placeholder="Genre musical"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <input
          placeholder="Contact (optionnel)"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <button
          onClick={ajouter}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-dark px-3 py-2 text-sm text-white hover:bg-brand-dark/90"
        >
          <Plus size={16} /> Ajouter
        </button>
      </div>

      <div className="mt-6 divide-y divide-gray-100">
        {chargement && <p className="text-sm text-gray-400">Chargement...</p>}
        {!chargement && artistes.length === 0 && (
          <p className="text-sm text-gray-400">Aucun artiste enregistré pour l'instant.</p>
        )}
        {artistes.map((a) => (
          <div key={a.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-brand-dark">{a.nom}</p>
              <p className="text-xs text-gray-400">{a.genre_musical || '—'}</p>
            </div>
            <button onClick={() => supprimer(a.id, a.nom)} className="text-gray-300 hover:text-danger">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function GestionSaisons() {
  const [saisons, setSaisons] = useState<Saison[]>([]);
  const [nom, setNom] = useState('');
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');
  const [chargement, setChargement] = useState(true);

  const charger = async () => {
    const { data } = await supabase.from('cmp_saisons').select('*').order('date_debut', { ascending: false });
    setSaisons((data as Saison[]) ?? []);
    setChargement(false);
  };

  useEffect(() => {
    charger();
  }, []);

  const ajouter = async () => {
    if (!nom.trim()) {
      alert('Merci de renseigner un nom avant d\'ajouter.');
      return;
    }
    await supabase.from('cmp_saisons').insert({
      nom,
      date_debut: debut || null,
      date_fin: fin || null,
    });
    setNom('');
    setDebut('');
    setFin('');
    charger();
  };

  const supprimer = async (id: string, nom: string) => {
    if (!confirm(`Supprimer la saison "${nom}" ? Cette action est irréversible.`)) return;
    await supabase.from('cmp_saisons').delete().eq('id', id);
    charger();
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <input
          placeholder='Nom (ex: "2025-2026")'
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={debut}
          onChange={(e) => setDebut(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={fin}
          onChange={(e) => setFin(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <button
          onClick={ajouter}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-dark px-3 py-2 text-sm text-white hover:bg-brand-dark/90"
        >
          <Plus size={16} /> Ajouter
        </button>
      </div>

      <div className="mt-6 divide-y divide-gray-100">
        {chargement && <p className="text-sm text-gray-400">Chargement...</p>}
        {!chargement && saisons.length === 0 && (
          <p className="text-sm text-gray-400">Aucune saison enregistrée pour l'instant.</p>
        )}
        {saisons.map((s) => (
          <div key={s.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-brand-dark">{s.nom}</p>
              <p className="text-xs text-gray-400">
                {s.date_debut || '?'} → {s.date_fin || '?'}
              </p>
            </div>
            <button onClick={() => supprimer(s.id, s.nom)} className="text-gray-300 hover:text-danger">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function GestionChargesFixes() {
  const [charges, setCharges] = useState<ChargeFixe[]>([]);
  const [categorie, setCategorie] = useState('');
  const [montant, setMontant] = useState('');
  const [periodicite, setPeriodicite] = useState<'hebdomadaire' | 'mensuelle' | 'annuelle'>('mensuelle');
  const [chargement, setChargement] = useState(true);

  const charger = async () => {
    const { data } = await supabase.from('cmp_charges_fixes').select('*').order('categorie');
    setCharges((data as ChargeFixe[]) ?? []);
    setChargement(false);
  };

  useEffect(() => {
    charger();
  }, []);

  const ajouter = async () => {
    if (!categorie.trim()) {
      alert('Merci de renseigner une catégorie (ex: "Loyer") avant d\'ajouter.');
      return;
    }
    if (!montant || Number(montant) <= 0) {
      alert('Merci de renseigner un montant supérieur à 0.');
      return;
    }
    await supabase.from('cmp_charges_fixes').insert({
      categorie,
      montant: Number(montant) || 0,
      periodicite,
    });
    setCategorie('');
    setMontant('');
    charger();
  };

  const supprimer = async (id: string, cat: string) => {
    if (!confirm(`Supprimer la charge fixe "${cat}" ?`)) return;
    await supabase.from('cmp_charges_fixes').delete().eq('id', id);
    charger();
  };

  const journalier = (c: ChargeFixe) => {
    if (c.periodicite === 'hebdomadaire') return c.montant / 7;
    if (c.periodicite === 'mensuelle') return c.montant / 30.4166;
    return c.montant / 365;
  };

  const totalJournalier = charges.reduce((t, c) => t + journalier(c), 0);
  const labelPeriodicite = { hebdomadaire: '/ semaine', mensuelle: '/ mois', annuelle: '/ an' };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <p className="mb-4 text-xs text-gray-400">
        Ces charges (loyer, assurance annuelle, comptabilité...) sont automatiquement ramenées à un
        équivalent journalier, puis imputées à chaque concert dans son Résultat économique.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <input
          placeholder="Catégorie (ex: Loyer)"
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <input
          placeholder="Montant €"
          type="number"
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <select
          value={periodicite}
          onChange={(e) => setPeriodicite(e.target.value as typeof periodicite)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="hebdomadaire">Par semaine</option>
          <option value="mensuelle">Par mois</option>
          <option value="annuelle">Par an</option>
        </select>
        <button
          onClick={ajouter}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-dark px-3 py-2 text-sm text-white hover:bg-brand-dark/90"
        >
          <Plus size={16} /> Ajouter
        </button>
      </div>

      <div className="mt-6 divide-y divide-gray-100">
        {chargement && <p className="text-sm text-gray-400">Chargement...</p>}
        {!chargement && charges.length === 0 && (
          <p className="text-sm text-gray-400">Aucune charge fixe enregistrée pour l'instant.</p>
        )}
        {charges.map((c) => (
          <div key={c.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-brand-dark">{c.categorie}</p>
              <p className="text-xs text-gray-400">
                {c.montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}{' '}
                {labelPeriodicite[c.periodicite]} · soit{' '}
                {journalier(c).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} / jour
              </p>
            </div>
            <button onClick={() => supprimer(c.id, c.categorie)} className="text-gray-300 hover:text-danger">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {charges.length > 0 && (
        <div className="mt-4 rounded-lg bg-surface-light px-4 py-3 text-sm font-medium text-brand-dark">
          Total des charges fixes : {totalJournalier.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} / jour
          <span className="ml-1 font-normal text-gray-400">
            (imputé automatiquement à chaque concert dans son Résultat économique)
          </span>
        </div>
      )}
    </div>
  );
}
