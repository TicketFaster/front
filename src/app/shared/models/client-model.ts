import { Reservation } from './reservation.model';

export interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  reservations?: Reservation[];
}

export interface StatistiquesClient {
  nom_client: string;
  prenom_client: string;
  email: string;
  nombre_reservations: number;
  montant_total_achats: number;
  derniere_reservation: Date | string;
  categories_frequentes: string;
  panier_moyen: number;
  billets_par_type: Record<string, number>;
}
