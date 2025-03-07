import { Seance } from './seance.model';

export interface Evenement {
  id: number;
  titre: string;
  description?: string;
  categorie?: string;
  duree: string;
  prix_standard: number;
  seances?: Seance[];
}
