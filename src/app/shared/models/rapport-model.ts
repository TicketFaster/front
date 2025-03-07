export interface RapportVentes {
  evenement: string;
  date_heure: Date | string;
  nombre_billets: number;
  montant_total: number;
  taux_remplissage: number;
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

export interface DisponibilitePeriode {
  id_seance: number;
  date_heure: Date | string;
  salle: string;
  places_disponibles: number;
  prix_standard: number;
  taux_remplissage: number;
}

export interface VenteParCategorie {
  categorie: string;
  nombre_evenements: number;
  nombre_billets: number;
  montant_total: number;
}

export interface VenteParMois {
  mois: number;
  mois_nom: string;
  nombre_billets: number;
  montant_total: number;
}

export interface VenteParTypeTarif {
  type_tarif: string;
  nombre_billets: number;
  montant_total: number;
  pourcentage: number;
}
