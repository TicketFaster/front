import { Reservation } from './reservation.model';
import { Seance } from './seance.model';

export interface Billet {
  id: number;
  id_reservation: number;
  id_seance: number;
  type_tarif: string;
  prix_final: number;
  code_barre: string;
  statut: string;
  reservation?: Reservation;
  seance?: Seance;
}

export type TypeTarif = 'STANDARD' | 'REDUIT' | 'ETUDIANT' | 'SENIOR' | 'GROUPE' | 'VIP' | 'LAST_MINUTE';
export type StatutBillet = 'VALIDE' | 'ANNULE' | 'UTILISE';
