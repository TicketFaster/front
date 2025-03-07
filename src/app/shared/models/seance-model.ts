import { Evenement } from './evenement.model';
import { Salle } from './salle.model';
import { Billet } from './billet.model';

export interface Seance {
  id: number;
  id_evenement: number;
  date_heure: Date | string;
  salle_id: number;
  places_disponibles: number;
  evenement?: Evenement;
  salle?: Salle;
  billets?: Billet[];
  taux_remplissage?: number;
}
