'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Section {
  id: string;
  titre: string;
  contenu: React.ReactNode;
}

function Accordeon({ section, ouvert, onToggle }: { section: Section; ouvert: boolean; onToggle: () => void }) {
  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <span className="text-sm font-semibold text-brand-dark">{section.titre}</span>
        {ouvert ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
      </button>
      {ouvert && <div className="px-6 pb-6 text-sm text-gray-600 space-y-3">{section.contenu}</div>}
    </div>
  );
}

export default function DocumentationPage() {
  const [ouvert, setOuvert] = useState<string | null>('demarrage');

  const toggle = (id: string) => setOuvert(ouvert === id ? null : id);

  const sections: Section[] = [
    {
      id: 'demarrage',
      titre: '🚀 Par où commencer',
      contenu: (
        <>
          <p>Avant de créer votre premier concert, renseignez vos données de base dans <strong>Paramètres</strong> :</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Ajoutez au moins une <strong>salle</strong> (nom + capacité) — la capacité sert à calculer le taux de remplissage</li>
            <li>Ajoutez vos <strong>artistes</strong></li>
            <li>Ajoutez vos <strong>saisons</strong> (ex: "2025-2026") pour pouvoir regrouper vos concerts</li>
          </ol>
          <p>Une fois ces éléments prêts, vous pouvez créer votre premier concert.</p>
        </>
      ),
    },
    {
      id: 'ajouter-concert',
      titre: '📋 Comment ajouter un concert',
      contenu: (
        <>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Allez dans <strong>Concerts</strong> → <strong>"Nouveau concert"</strong></li>
            <li>Renseignez la date, la salle, l'artiste, le prix du billet et le nombre de billets vendus</li>
            <li>Cliquez sur <strong>"Créer le concert"</strong> — vous êtes redirigé vers sa fiche</li>
            <li>Sur la fiche, ajoutez les <strong>autres recettes</strong> (bar, sponsors...) et les <strong>dépenses</strong> (cachet, technicien, sécurité...)</li>
            <li>Le <strong>Résultat opérationnel</strong> et le badge 🟢🟠🔴 se mettent à jour automatiquement à chaque ajout</li>
          </ol>
        </>
      ),
    },
    {
      id: 'analyser-rentabilite',
      titre: '📊 Comment analyser la rentabilité d\'un concert',
      contenu: (
        <>
          <p>Sur la fiche d'un concert, trois chiffres sont à surveiller :</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Revenu total</strong> : billetterie nette + toutes les autres recettes</li>
            <li><strong>Coûts opérationnels</strong> : la somme de toutes les dépenses de la soirée</li>
            <li><strong>Résultat opérationnel</strong> : Revenu total − Coûts opérationnels</li>
          </ul>
          <p>Le badge de statut suit une règle simple :</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>🟢 <strong>Rentable</strong> : résultat opérationnel positif</li>
            <li>🟠 <strong>Équilibre</strong> : résultat opérationnel exactement à zéro</li>
            <li>🔴 <strong>Perte</strong> : résultat opérationnel négatif</li>
          </ul>
          <p>Pour aller plus loin, utilisez le <strong>Simulateur</strong> avant de programmer un concert similaire, afin d'anticiper sa rentabilité.</p>
        </>
      ),
    },
    {
      id: 'dashboard',
      titre: '🏠 Le Tableau de bord',
      contenu: (
        <>
          <p>Affiche une vue d'ensemble calculée automatiquement à partir de tous vos concerts :</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Chiffre d'affaires</strong> : somme du revenu total de tous les concerts</li>
            <li><strong>Résultat opérationnel</strong> : somme des résultats de tous les concerts</li>
            <li><strong>Marge moyenne</strong> : moyenne du (résultat ÷ revenu) de chaque concert, en %</li>
            <li><strong>Taux de remplissage moyen</strong> : moyenne du (spectateurs ÷ capacité de la salle) de chaque concert</li>
          </ul>
        </>
      ),
    },
    {
      id: 'simulateur',
      titre: '🧮 Le Simulateur',
      contenu: (
        <>
          <p>Permet de tester un concert <strong>avant</strong> qu'il n'existe réellement, sans rien enregistrer dans la base de données.</p>
          <p><strong>Seuil de rentabilité</strong> : le nombre de spectateurs à partir duquel le concert simulé devient rentable, compte tenu du prix du billet, de la commission, et des coûts fixes saisis.</p>
          <p><strong>Scénarios rapides</strong> : des boutons qui ajustent automatiquement les chiffres (ex: "Pessimiste" réduit le nombre de spectateurs de 30%). Vous pouvez ensuite affiner chaque champ manuellement.</p>
        </>
      ),
    },
    {
      id: 'point-mort',
      titre: '🌡️ Le Point mort',
      contenu: (
        <>
          <p>La <strong>carte thermique</strong> (grille colorée) montre le résultat opérationnel pour différentes combinaisons de prix de billet et de nombre de spectateurs, en gardant les mêmes coûts fixes.</p>
          <p>Vert = rentable, orange = à l'équilibre, rouge = perte. Cela permet de voir rapidement quelle combinaison prix/fréquentation est nécessaire pour ne pas perdre d'argent.</p>
          <p>Le <strong>graphique</strong> en dessous montre, à un prix de billet fixe, comment le résultat évolue selon le nombre de spectateurs — la ligne pointillée rouge marque le seuil de rentabilité (résultat = 0).</p>
        </>
      ),
    },
    {
      id: 'calendrier',
      titre: '📅 Le Calendrier',
      contenu: (
        <>
          <p>Regroupe tous vos concerts réels (déjà créés) par année puis par mois, avec pour chaque année un <strong>cumul</strong> du chiffre d'affaires et du résultat opérationnel.</p>
          <p>Cliquez sur un concert pour ouvrir sa fiche détaillée.</p>
        </>
      ),
    },
    {
      id: 'finances',
      titre: '💰 Les Finances avancées',
      contenu: (
        <>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Recettes/Dépenses par catégorie</strong> : additionne tous les montants de tous les concerts, regroupés par type</li>
            <li><strong>Évolution mensuelle</strong> : regroupe les concerts par mois selon leur date, et montre recettes, dépenses et résultat mois par mois</li>
            <li><strong>Trésorerie cumulée</strong> : additionne progressivement le résultat de chaque mois — donne une tendance générale, mais ce n'est pas un relevé bancaire exact (les charges fixes annuelles ne sont pas encore incluses, ce sera ajouté dans une prochaine étape)</li>
          </ul>
        </>
      ),
    },
    {
      id: 'parametres',
      titre: '⚙️ Les Paramètres',
      contenu: (
        <>
          <p>Trois listes de base à tenir à jour :</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Salles</strong> : la capacité renseignée sert au calcul du taux de remplissage de chaque concert</li>
            <li><strong>Artistes</strong></li>
            <li><strong>Saisons</strong> : permettent de regrouper vos concerts (ex: pour une future répartition des charges fixes annuelles)</li>
          </ul>
          <p className="text-xs text-gray-400">⚠️ Supprimer une salle, un artiste ou une saison ne supprime pas les concerts déjà créés, mais ceux-ci perdront cette information associée.</p>
        </>
      ),
    },
    {
      id: 'charges-fixes',
      titre: '🏢 Les Charges fixes & le Résultat économique',
      contenu: (
        <>
          <p>
            Le <strong>Résultat opérationnel</strong> (celui affiché avec le badge 🟢🟠🔴) ne tient compte que
            des coûts directement liés à la soirée. Il ne dit pas si votre <strong>activité globale</strong> est
            viable une fois le loyer, l'assurance annuelle, la comptabilité... pris en compte.
          </p>
          <p>C'est le rôle du <strong>Résultat économique</strong>, calculé automatiquement dès que vous avez renseigné vos charges fixes.</p>
          <p><strong>Comment le configurer :</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Allez dans <strong>Paramètres → Charges fixes</strong></li>
            <li>Ajoutez chaque charge avec son montant et sa <strong>périodicité de facturation réelle</strong> (par semaine, par mois, ou par an — inutile de convertir vous-même)</li>
          </ol>
          <p><strong>Comment le calcul fonctionne :</strong> chaque charge est automatiquement ramenée à un équivalent journalier (montant ÷ 7 pour une charge hebdomadaire, ÷ 30,4166 pour une charge mensuelle, ÷ 365 pour une charge annuelle), puis additionnée. Ce total journalier est ensuite imputé à chaque concert (1 jour de charges fixes par concert), pour obtenir :</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Coût économique global</strong> = coûts opérationnels + charge fixe imputée</li>
            <li><strong>Résultat économique</strong> = revenu total − coût économique global</li>
          </ul>
          <p className="text-xs text-gray-400">Ce résultat est visible sur la fiche de chaque concert, et cumulé sur le Tableau de bord.</p>
        </>
      ),
    },
    {
      id: 'lexique',
      titre: '📖 Lexique des indicateurs',
      contenu: (
        <div className="space-y-2">
          <p><strong>CA brut billetterie</strong> : prix du billet × nombre de billets vendus</p>
          <p><strong>CA net billetterie</strong> : CA brut moins la commission de billetterie</p>
          <p><strong>Résultat opérationnel</strong> : revenu total du concert moins ses coûts opérationnels</p>
          <p><strong>Marge</strong> : résultat opérationnel ÷ revenu total, exprimé en %</p>
          <p><strong>Taux de remplissage</strong> : (billets vendus + invitations + VIP) ÷ capacité de la salle, en %</p>
          <p><strong>Seuil de rentabilité (point mort)</strong> : nombre de spectateurs payants nécessaire pour que le résultat opérationnel atteigne zéro</p>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">Guide utilisateur</h1>
      <p className="mt-1 text-sm text-gray-500">
        Explications de chaque écran et de chaque calcul. Cliquez sur une section pour l'ouvrir.
      </p>

      <div className="mt-6 space-y-3">
        {sections.map((s) => (
          <Accordeon key={s.id} section={s} ouvert={ouvert === s.id} onToggle={() => toggle(s.id)} />
        ))}
      </div>
    </div>
  );
}
