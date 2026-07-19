import { ChargeFixe } from '@/lib/types';
import { ResultatConcert } from '@/lib/calculs/rentabiliteConcert';

/**
 * Convertit le montant d'une charge fixe en équivalent JOURNALIER,
 * quelle que soit sa périodicité de facturation d'origine.
 *
 * Ramené à 365 jours par an :
 * - hebdomadaire : montant / 7            (équivaut à montant × 52,1428 ÷ 365)
 * - mensuelle    : montant / 30,4166      (équivaut à montant × 12 ÷ 365)
 * - annuelle     : montant / 365
 */
export function montantJournalier(charge: ChargeFixe): number {
  switch (charge.periodicite) {
    case 'hebdomadaire':
      return charge.montant / 7;
    case 'mensuelle':
      return charge.montant / 30.4166;
    case 'annuelle':
      return charge.montant / 365;
    default:
      return 0;
  }
}

/**
 * Additionne l'équivalent journalier de toutes les charges fixes actives.
 * C'est ce montant qui sera ensuite imputé à chaque concert.
 */
export function totalChargesFixesJournalier(charges: ChargeFixe[]): number {
  return charges.reduce((total, c) => total + montantJournalier(c), 0);
}

export interface ResultatEconomique {
  chargeFixeImputee: number;
  coutEconomiqueGlobal: number;
  resultatEconomique: number;
  margeEconomique: number; // %
}

/**
 * Calcule le Résultat économique d'un concert : son résultat opérationnel,
 * diminué de sa part de charges de structure (loyer, assurance annuelle...).
 *
 * @param nbJoursImputation nombre de jours de charges fixes à imputer à ce concert
 *                          (1 par défaut : un concert = une soirée)
 */
export function calculerResultatEconomique(
  resultatOperationnel: ResultatConcert,
  chargesFixesJournalier: number,
  nbJoursImputation: number = 1
): ResultatEconomique {
  const chargeFixeImputee = chargesFixesJournalier * nbJoursImputation;
  const coutEconomiqueGlobal = resultatOperationnel.coutsOperationnels + chargeFixeImputee;
  const resultatEconomique = resultatOperationnel.revenuTotal - coutEconomiqueGlobal;
  const margeEconomique =
    resultatOperationnel.revenuTotal > 0 ? (resultatEconomique / resultatOperationnel.revenuTotal) * 100 : 0;

  return { chargeFixeImputee, coutEconomiqueGlobal, resultatEconomique, margeEconomique };
}
