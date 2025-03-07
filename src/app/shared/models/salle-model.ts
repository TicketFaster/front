import { Seance } from './seance.model';

export interface Salle {
  id: number;
  nom: string;
  capacite: number;
  configuration?: string;
  seances?: Seance[];
}
