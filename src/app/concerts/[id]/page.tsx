'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Concert, Salle, Artiste, Revenu, DepenseOperationnelle, ChargeFixe } from '@/lib/types';
import { calculerResultatConcert, formaterMontant } from '@/lib/calculs/rentabiliteConcert';
import { totalChargesFixesJournalier, calculerResultatEconomique } from '@/lib/calculs/economique';
import StatusBadge from '@/components/StatusBadge';
import { Trash2, Plus, Pencil, Check, X } from 'lucide-react';

const TYPES_REVENUS = ['Bar', 'Sponsor', 'Subvention', 'Merchandising', 'Autre'];
const CATEGORIES_DEPENSES = [
  'Cachet artiste', 'Assurance', 'Électricité/Eau/Internet', 'Impression', 'Communication',
  'Location matériel', 'Techniciens', 'Sécurité', 'Transport', 'Hébergement', 'Catering', 'Autre',
];

export default function FicheConcertPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [concert, setConcert] = useState<Concert | null>(null);
  const [salle, setSalle] = useState<Salle | null>(null);
  const [artiste, setArtiste] = useState<Artiste | null>(null);
  const [revenus, setRevenus] = useState<Revenu[]>([]);
  const [depenses, setDepenses] = useState<DepenseOperationnelle[]>([]);
  const [chargesFixes, setChargesFixes] = useState<ChargeFixe[]>([]);
  const [chargement, setChargement] = useState(true);

  const [typeRevenu, setTypeRevenu] = useState(TYPES_REVENUS[0]);
  const [montantRevenu, setMontantRevenu] = useState('');
  const [categorieDepense, setCategorieDepense] = useState(CATEGORIES_DEPENSES[0]);
  const [montantDepense, setMontantDepense] = useState('');

  const [editionRevenuId, setEditionRevenuId] = useState<string | null>(null);
  const [editionRevenuMontant, setEditionRevenuMontant] = useState('');
  const [editionDepenseId, setEditionDepenseId] = useState<string | null>(null);
  const [editionDepenseMontant, setEditionDepenseMontant] = useState('');

  const charger = useCallback(async () => {
    const { data: c } = await supabase.from('cmp_concerts').select('*').eq('id', params.id).single();
    if (!c) {
      setChargement(false);
      return;
    }
    setConcert(c as Concert);

    const [{ data: s }, { data: a }, { data: rev }, { data: dep }, { data: cf }] = await Promise.all([
      c.salle_id ? supabase.from('cmp_salles').select('*').eq('id', c.salle_id).single() : Promise.resolve({ data: null }),
      c.artiste_id ? supabase.from('cmp_artistes').select('*').eq('id', c.artiste_id).single() : Promise.resolve({ data: null }),
      supabase.from('cmp_revenus').select('*').eq('concert_id', params.id),
      supabase.from('cmp_depenses_operationnelles').select('*').eq('concert_id', params.id),
      supabase.from('cmp_charges_fixes').select('*'),
    ]);

    setSalle((s as Salle) ?? null);
    setArtiste((a as Artiste) ?? null);
    setRevenus((rev as Revenu[]) ?? []);
    setDepenses((dep as DepenseOperationnelle[]) ?? []);
    setChargesFixes((cf as ChargeFixe[]) ?? []);
    setChargement(false);
  }, [params.id]);

  useEffect(() => {
    charger();
  }, [charger]);

  const ajouterRevenu = async () => {
    if (!montantRevenu || Number(montantRevenu) <= 0) {
      alert('Merci de renseigner un montant supérieur à 0.');
      return;
    }
    await supabase.from('cmp_revenus').insert({
      concert_id: params.id,
      type: typeRevenu,
      montant: Number(montantRevenu),
    });
    setMontantRevenu('');
    charger();
  };

  const supprimerRevenu = async (id: string) => {
    if (!confirm('Supprimer cette recette ?')) return;
    await supabase.from('cmp_revenus').delete().eq('id', id);
    charger();
  };

  const commencerEditionRevenu = (r: Revenu) => {
    setEditionRevenuId(r.id);
    setEditionRevenuMontant(String(r.montant));
  };

  const sauvegarderEditionRevenu = async (id: string) => {
    await supabase.from('cmp_revenus').update({ montant: Number(editionRevenuMontant) || 0 }).eq('id', id);
    setEditionRevenuId(null);
    charger();
  };

  const ajouterDepense = async () => {
    if (!montantDepense || Number(montantDepense) <= 0) {
      alert('Merci de renseigner un montant supérieur à 0.');
      return;
    }
    await supabase.from('cmp_depenses_operationnelles').insert({
      concert_id: params.id,
      categorie: categorieDepense,
      montant: Number(montantDepense),
    });
    setMontantDepense('');
    charger();
  };

  const supprimerDepense = async (id: string) => {
    if (!confirm('Supprimer cette dépense ?')) return;
    await supabase.from('cmp_depenses_operationnelles').delete().eq('id', id);
    charger();
  };

  const commencerEditionDepense = (d: DepenseOperationnelle) => {
    setEditionDepenseId(d.id);
    setEditionDepenseMontant(String(d.montant));
  };

  const sauvegarderEditionDepense = async (id: string) => {
    await supabase.from('cmp_depenses_operationnelles').update({ montant: Number(editionDepenseMontant) || 0 }).eq('id', id);
    setEditionDepenseId(null);
    charger();
  };

  const supprimerConcert = async () => {
    if (!confirm('Supprimer définitivement ce concert, ainsi que toutes ses recettes et dépenses ? Cette action est irréversible.')) return;
    await supabase.from('cmp_concerts').delete().eq('id', params.id);
    router.push('/concerts');
  };

  if (chargement) return <p className="text-sm text-gray-400">Chargement...</p>;
  if (!concert) return <p className="text-sm text-gray-400">Concert introuvable.</p>;

  const resultat = calculerResultatConcert(concert, revenus, depenses, salle?.capacite ?? 0);
  const chargesJournalieres = totalChargesFixesJournalier(chargesFixes);
  const eco = calculerResultatEconomique(resultat, chargesJournalieres);

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-dark">
            {artiste?.nom ?? 'Concert'} — {new Date(concert.date).toLocaleDateString('fr-FR')}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {salle?.nom ?? 'Salle non renseignée'} {salle?.capacite ? `· ${salle.capacite} places` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge statut={resultat.statutRentabilite} />
          <button
            onClick={() => router.push(`/concerts/${params.id}/modifier`)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:border-brand-dark hover:text-brand-dark"
          >
            <Pencil size={14} /> Modifier
          </button>
          <button
            onClick={supprimerConcert}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:border-danger hover:text-danger"
          >
            <Trash2 size={14} /> Supprimer le concert
          </button>
        </div>
      </div>

      {/* KPI résumé */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Kpi label="Revenu total" valeur={formaterMontant(resultat.revenuTotal)} />
        <Kpi label="Coûts opérationnels" valeur={formaterMontant(resultat.coutsOperationnels)} />
        <Kpi label="Résultat opérationnel" valeur={formaterMontant(resultat.resultatOperationnel)} accent />
        <Kpi label="Taux de remplissage" valeur={`${resultat.tauxRemplissage.toFixed(0)} %`} />
      </div>

      {/* Résultat économique */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-brand-dark">Résultat économique (avec charges de structure)</h2>
        <p className="mt-1 text-xs text-gray-400">
          Intègre une part de vos charges fixes (loyer, assurance annuelle...) en plus des coûts propres à cette soirée.
          {chargesFixes.length === 0 && ' Aucune charge fixe enregistrée — configurez-les dans Paramètres → Charges fixes.'}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-gray-400">Charge fixe imputée</p>
            <p className="text-sm font-medium text-gray-700">{formaterMontant(eco.chargeFixeImputee)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Coût économique global</p>
            <p className="text-sm font-medium text-gray-700">{formaterMontant(eco.coutEconomiqueGlobal)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Résultat économique</p>
            <p className={`text-sm font-semibold ${eco.resultatEconomique >= 0 ? 'text-success' : 'text-danger'}`}>
              {formaterMontant(eco.resultatEconomique)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Marge économique</p>
            <p className="text-sm font-medium text-gray-700">{eco.margeEconomique.toFixed(1)} %</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Billetterie (résumé lecture seule, vient du formulaire de création) */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-brand-dark">Billetterie</h2>
          <div className="mt-3 space-y-1 text-sm text-gray-600">
            <p>CA brut : {formaterMontant(resultat.caBrutBilletterie)}</p>
            <p>Commission ({concert.commission_billetterie_pct}%) : -{formaterMontant(resultat.commissionBilletterie)}</p>
            <p className="font-medium text-brand-dark">CA net billetterie : {formaterMontant(resultat.caNetBilletterie)}</p>
            <p className="mt-2 text-xs text-gray-400">
              {concert.billets_vendus} billets vendus · {concert.invitations} invitations · {concert.places_vip} VIP
            </p>
          </div>
        </div>

        {/* Autres revenus */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-brand-dark">Autres recettes (bar, sponsors...)</h2>
          <div className="mt-3 flex gap-2">
            <select value={typeRevenu} onChange={(e) => setTypeRevenu(e.target.value)} className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm">
              {TYPES_REVENUS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Montant €"
              value={montantRevenu}
              onChange={(e) => setMontantRevenu(e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
            />
            <button onClick={ajouterRevenu} className="rounded-lg bg-brand-dark px-3 py-1.5 text-white">
              <Plus size={16} />
            </button>
          </div>
          <div className="mt-3 divide-y divide-gray-100">
            {revenus.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 text-sm">
                {editionRevenuId === r.id ? (
                  <>
                    <span className="flex items-center gap-2">
                      {r.type} —
                      <input
                        type="number"
                        autoFocus
                        value={editionRevenuMontant}
                        onChange={(e) => setEditionRevenuMontant(e.target.value)}
                        className="w-24 rounded border border-gray-200 px-2 py-1 text-sm"
                      />
                    </span>
                    <span className="flex gap-2">
                      <button onClick={() => sauvegarderEditionRevenu(r.id)} className="text-success hover:text-success/70">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setEditionRevenuId(null)} className="text-gray-300 hover:text-gray-500">
                        <X size={14} />
                      </button>
                    </span>
                  </>
                ) : (
                  <>
                    <span>{r.type} — {formaterMontant(r.montant)}</span>
                    <span className="flex gap-2">
                      <button onClick={() => commencerEditionRevenu(r)} className="text-gray-300 hover:text-brand-dark">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => supprimerRevenu(r.id)} className="text-gray-300 hover:text-danger">
                        <Trash2 size={14} />
                      </button>
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dépenses opérationnelles */}
        <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-brand-dark">Dépenses opérationnelles de la soirée</h2>
          <div className="mt-3 flex gap-2">
            <select value={categorieDepense} onChange={(e) => setCategorieDepense(e.target.value)} className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm">
              {CATEGORIES_DEPENSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Montant €"
              value={montantDepense}
              onChange={(e) => setMontantDepense(e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
            />
            <button onClick={ajouterDepense} className="rounded-lg bg-brand-dark px-3 py-1.5 text-white">
              <Plus size={16} />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            {depenses.map((d) => (
              <div key={d.id} className="flex items-center justify-between border-b border-gray-50 py-2 text-sm">
                {editionDepenseId === d.id ? (
                  <>
                    <span className="flex items-center gap-2">
                      {d.categorie} —
                      <input
                        type="number"
                        autoFocus
                        value={editionDepenseMontant}
                        onChange={(e) => setEditionDepenseMontant(e.target.value)}
                        className="w-24 rounded border border-gray-200 px-2 py-1 text-sm"
                      />
                    </span>
                    <span className="flex gap-2">
                      <button onClick={() => sauvegarderEditionDepense(d.id)} className="text-success hover:text-success/70">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setEditionDepenseId(null)} className="text-gray-300 hover:text-gray-500">
                        <X size={14} />
                      </button>
                    </span>
                  </>
                ) : (
                  <>
                    <span>{d.categorie} — {formaterMontant(d.montant)}</span>
                    <span className="flex gap-2">
                      <button onClick={() => commencerEditionDepense(d)} className="text-gray-300 hover:text-brand-dark">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => supprimerDepense(d.id)} className="text-gray-300 hover:text-danger">
                        <Trash2 size={14} />
                      </button>
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, valeur, accent }: { label: string; valeur: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${accent ? 'text-brand-dark' : 'text-gray-700'}`}>{valeur}</p>
    </div>
  );
}
