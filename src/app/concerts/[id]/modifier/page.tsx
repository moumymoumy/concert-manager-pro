'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Salle, Artiste, Saison, Concert } from '@/lib/types';

const STATUTS = [
  { value: 'planifie', label: 'Planifié' },
  { value: 'realise', label: 'Réalisé' },
  { value: 'annule', label: 'Annulé' },
];

export default function ModifierConcertPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [salles, setSalles] = useState<Salle[]>([]);
  const [artistes, setArtistes] = useState<Artiste[]>([]);
  const [saisons, setSaisons] = useState<Saison[]>([]);
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);

  const [date, setDate] = useState('');
  const [salleId, setSalleId] = useState('');
  const [artisteId, setArtisteId] = useState('');
  const [saisonId, setSaisonId] = useState('');
  const [genre, setGenre] = useState('');
  const [prixBillet, setPrixBillet] = useState('');
  const [billetsVendus, setBilletsVendus] = useState('');
  const [invitations, setInvitations] = useState('0');
  const [placesVip, setPlacesVip] = useState('0');
  const [commission, setCommission] = useState('0');
  const [statut, setStatut] = useState('planifie');

  useEffect(() => {
    const charger = async () => {
      const [{ data: concert }, { data: s }, { data: a }, { data: sa }] = await Promise.all([
        supabase.from('cmp_concerts').select('*').eq('id', params.id).single(),
        supabase.from('cmp_salles').select('*').order('nom'),
        supabase.from('cmp_artistes').select('*').order('nom'),
        supabase.from('cmp_saisons').select('*').order('date_debut', { ascending: false }),
      ]);
      setSalles((s as Salle[]) ?? []);
      setArtistes((a as Artiste[]) ?? []);
      setSaisons((sa as Saison[]) ?? []);

      if (concert) {
        const c = concert as Concert;
        setDate(c.date);
        setSalleId(c.salle_id ?? '');
        setArtisteId(c.artiste_id ?? '');
        setSaisonId(c.saison_id ?? '');
        setGenre(c.genre_musical ?? '');
        setPrixBillet(String(c.prix_billet));
        setBilletsVendus(String(c.billets_vendus));
        setInvitations(String(c.invitations));
        setPlacesVip(String(c.places_vip));
        setCommission(String(c.commission_billetterie_pct));
        setStatut(c.statut);
      }
      setChargement(false);
    };
    charger();
  }, [params.id]);

  const enregistrer = async () => {
    if (!date) {
      alert('La date du concert est obligatoire.');
      return;
    }
    setEnregistrement(true);
    const { error } = await supabase
      .from('cmp_concerts')
      .update({
        date,
        salle_id: salleId || null,
        artiste_id: artisteId || null,
        saison_id: saisonId || null,
        genre_musical: genre || null,
        prix_billet: Number(prixBillet) || 0,
        billets_vendus: Number(billetsVendus) || 0,
        invitations: Number(invitations) || 0,
        places_vip: Number(placesVip) || 0,
        commission_billetterie_pct: Number(commission) || 0,
        statut,
      })
      .eq('id', params.id);

    setEnregistrement(false);

    if (error) {
      alert("Une erreur est survenue : " + error.message);
      return;
    }

    router.push(`/concerts/${params.id}`);
  };

  const champClass = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm';
  const labelClass = 'block text-xs font-medium text-gray-500 mb-1';

  if (chargement) return <p className="text-sm text-gray-400">Chargement...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-brand-dark">Modifier le concert</h1>
      <p className="mt-1 text-sm text-gray-500">
        Les recettes et dépenses déjà saisies sont conservées, seules les informations de base changent.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl bg-white p-6 shadow-sm sm:grid-cols-2">
        <div>
          <label className={labelClass}>Statut</label>
          <select value={statut} onChange={(e) => setStatut(e.target.value)} className={champClass}>
            {STATUTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Date du concert *</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={champClass} />
        </div>

        <div>
          <label className={labelClass}>Saison</label>
          <select value={saisonId} onChange={(e) => setSaisonId(e.target.value)} className={champClass}>
            <option value="">—</option>
            {saisons.map((s) => (
              <option key={s.id} value={s.id}>{s.nom}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Salle</label>
          <select value={salleId} onChange={(e) => setSalleId(e.target.value)} className={champClass}>
            <option value="">—</option>
            {salles.map((s) => (
              <option key={s.id} value={s.id}>{s.nom} ({s.capacite} places)</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Artiste</label>
          <select value={artisteId} onChange={(e) => setArtisteId(e.target.value)} className={champClass}>
            <option value="">—</option>
            {artistes.map((a) => (
              <option key={a.id} value={a.id}>{a.nom}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Genre musical</label>
          <input value={genre} onChange={(e) => setGenre(e.target.value)} className={champClass} />
        </div>

        <div>
          <label className={labelClass}>Prix du billet (€)</label>
          <input type="number" value={prixBillet} onChange={(e) => setPrixBillet(e.target.value)} className={champClass} />
        </div>

        <div>
          <label className={labelClass}>Billets vendus</label>
          <input type="number" value={billetsVendus} onChange={(e) => setBilletsVendus(e.target.value)} className={champClass} />
        </div>

        <div>
          <label className={labelClass}>Commission billetterie (%)</label>
          <input type="number" value={commission} onChange={(e) => setCommission(e.target.value)} className={champClass} />
        </div>

        <div>
          <label className={labelClass}>Invitations</label>
          <input type="number" value={invitations} onChange={(e) => setInvitations(e.target.value)} className={champClass} />
        </div>

        <div>
          <label className={labelClass}>Places VIP</label>
          <input type="number" value={placesVip} onChange={(e) => setPlacesVip(e.target.value)} className={champClass} />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={enregistrer}
          disabled={enregistrement}
          className="rounded-lg bg-brand-dark px-5 py-2.5 text-sm text-white hover:bg-brand-dark/90 disabled:opacity-50"
        >
          {enregistrement ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
        <button
          onClick={() => router.push(`/concerts/${params.id}`)}
          className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm text-gray-500 hover:text-gray-700"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
