import { Client } from './client.model';
import { Billet } from './billet.model';

export interface Reservation {
  id: number;
  id_client: number;
  date_reservation: Date | string;
  statut_paiement: string;
  montant_total: number;
  client?: Client;
  billets?: Billet[];
}

export interface NouvelleReservation {
  id_client: number;
  billets: {
    id_seance: number;
    type_tarif: string;
    prix_final: number;
  }[];
}

export interface RapportVentes {
  evenement: string;
  date_heure: Date | string;
  nombre_billets: number;
  montant_total: number;
  taux_remplissage: number;
}
