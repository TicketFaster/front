import { Billet } from './billet.model';

export interface BilletScanResult {
  valid: boolean;
  message: string;
  billet?: Billet;
  evenement?: {
    titre: string;
  };
  seance?: {
    date_heure: Date | string;
  };
  salle?: {
    nom: string;
  };
}

export interface UsageStats {
  total: number;
  utilises: number;
  pourcentage: number;
  par_evenement?: Array<{
    evenement: string;
    total: number;
    utilises: number;
    pourcentage: number;
  }>;
}
