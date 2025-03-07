import { AppDataSource } from '../utils/database';
import { logger } from '../utils/logger';

export interface RapportVentes {
  evenement: string;
  date_heure: Date;
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
  derniere_reservation: Date;
  categories_frequentes: string;
  panier_moyen: number;
  billets_par_type: Record<string, any>;
}

export interface DisponibilitesPeriode {
  id_seance: number;
  date_heure: Date;
  salle: string;
  places_disponibles: number;
  prix_standard: number;
  taux_remplissage: number;
}

export class RapportService {
  /**
   * Génère un rapport de ventes pour une période donnée
   * Utilise la fonction SQL fn_RapportVentes
   */
  async genererRapportVentes(dateDebut: Date, dateFin: Date): Promise<RapportVentes[]> {
    try {
      const query = `
        SELECT * FROM fn_RapportVentes($1, $2)
      `;
      
      const result = await AppDataSource.query(query, [dateDebut, dateFin]);
      return result;
    } catch (error) {
      logger.error('Erreur lors de la génération du rapport de ventes', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques d'un client
   * Utilise la fonction SQL fn_StatistiquesClient
   */
  async getStatistiquesClient(clientId: number): Promise<StatistiquesClient | null> {
    try {
      const query = `
        SELECT * FROM fn_StatistiquesClient($1)
      `;
      
      const result = await AppDataSource.query(query, [clientId]);
      
      if (result && result.length > 0) {
        // Convertir le JSON (billets_par_type) en objet JavaScript
        const stats = result[0];
        if (typeof stats.billets_par_type === 'string') {
          stats.billets_par_type = JSON.parse(stats.billets_par_type);
        }
        return stats;
      }
      
      return null;
    } catch (error) {
      logger.error(`Erreur lors de la récupération des statistiques du client ${clientId}`, error);
      throw error;
    }
  }

  /**
   * Récupère les disponibilités sur une période pour un événement
   * Utilise la fonction SQL fn_DisponibilitesPeriode
   */
  async getDisponibilitesPeriode(
    evenementId: number,
    dateDebut: Date,
    dateFin: Date,
    nbPlacesMin: number = 1
  ): Promise<DisponibilitesPeriode[]> {
    try {
      const query = `
        SELECT * FROM fn_DisponibilitesPeriode($1, $2, $3, $4)
      `;
      
      const result = await AppDataSource.query(query, [evenementId, dateDebut, dateFin, nbPlacesMin]);
      return result;
    } catch (error) {
      logger.error('Erreur lors de la récupération des disponibilités', error);
      throw error;
    }
  }

  /**
   * Calculer le taux de remplissage d'une séance
   * Utilise la fonction SQL fn_TauxRemplissage
   */
  async getTauxRemplissage(seanceId: number): Promise<number> {
    try {
      const query = `
        SELECT fn_TauxRemplissage($1) as taux
      `;
      
      const result = await AppDataSource.query(query, [seanceId]);
      return result[0]?.taux || 0;
    } catch (error) {
      logger.error(`Erreur lors du calcul du taux de remplissage pour la séance ${seanceId}`, error);
      throw error;
    }
  }

  /**
   * Calcule le prix avec réduction
   * Utilise la fonction SQL fn_CalculPrixReduit
   */
  async calculerPrixReduit(prixBase: number, typeTarif: string): Promise<number> {
    try {
      const query = `
        SELECT fn_CalculPrixReduit($1, $2) as prix_reduit
      `;
      
      const result = await AppDataSource.query(query, [prixBase, typeTarif]);
      return result[0]?.prix_reduit || prixBase;
    } catch (error) {
      logger.error('Erreur lors du calcul du prix réduit', error);
      throw error;
    }
  }
  
  /**
   * Génère un rapport des ventes par catégorie d'événement
   */
  async getVentesParCategorie(dateDebut: Date, dateFin: Date): Promise<Array<{
    categorie: string;
    nombre_evenements: number;
    nombre_billets: number;
    montant_total: number;
  }>> {
    try {
      const query = `
        SELECT 
          e.categorie,
          COUNT(DISTINCT e.id_evenement) as nombre_evenements,
          COUNT(b.id_billet) as nombre_billets,
          SUM(b.prix_final) as montant_total
        FROM 
          BILLET b
          INNER JOIN SEANCE s ON b.id_seance = s.id_seance
          INNER JOIN EVENEMENT e ON s.id_evenement = e.id_evenement
          INNER JOIN RESERVATION r ON b.id_reservation = r.id_reservation
        WHERE
          s.date_heure BETWEEN $1 AND $2
          AND r.statut_paiement = 'PAYE'
          AND b.statut != 'ANNULE'
        GROUP BY e.categorie
        ORDER BY montant_total DESC
      `;
      
      const result = await AppDataSource.query(query, [dateDebut, dateFin]);
      return result;
    } catch (error) {
      logger.error('Erreur lors de la génération du rapport des ventes par catégorie', error);
      throw error;
    }
  }
  
  /**
   * Génère un rapport des ventes par mois
   */
  async getVentesParMois(annee: number): Promise<Array<{
    mois: number;
    mois_nom: string;
    nombre_billets: number;
    montant_total: number;
  }>> {
    try {
      const query = `
        SELECT 
          EXTRACT(MONTH FROM s.date_heure) as mois,
          TO_CHAR(s.date_heure, 'Month') as mois_nom,
          COUNT(b.id_billet) as nombre_billets,
          SUM(b.prix_final) as montant_total
        FROM 
          BILLET b
          INNER JOIN SEANCE s ON b.id_seance = s.id_seance
          INNER JOIN RESERVATION r ON b.id_reservation = r.id_reservation
        WHERE
          EXTRACT(YEAR FROM s.date_heure) = $1
          AND r.statut_paiement = 'PAYE'
          AND b.statut != 'ANNULE'
        GROUP BY mois, mois_nom
        ORDER BY mois
      `;
      
      const result = await AppDataSource.query(query, [annee]);
      return result;
    } catch (error) {
      logger.error(`Erreur lors de la génération du rapport des ventes par mois pour l'année ${annee}`, error);
      throw error;
    }
  }
  
  /**
   * Génère un rapport sur les types de tarifs vendus
   */
  async getVentesParTypeTarif(dateDebut: Date, dateFin: Date): Promise<Array<{
    type_tarif: string;
    nombre_billets: number;
    montant_total: number;
    pourcentage: number;
  }>> {
    try {
      const query = `
        WITH total_ventes AS (
          SELECT 
            COUNT(b.id_billet) as total_billets,
            SUM(b.prix_final) as total_montant
          FROM 
            BILLET b
            INNER JOIN SEANCE s ON b.id_seance = s.id_seance
            INNER JOIN RESERVATION r ON b.id_reservation = r.id_reservation
          WHERE
            s.date_heure BETWEEN $1 AND $2
            AND r.statut_paiement = 'PAYE'
            AND b.statut != 'ANNULE'
        )
        SELECT 
          b.type_tarif,
          COUNT(b.id_billet) as nombre_billets,
          SUM(b.prix_final) as montant_total,
          ROUND((COUNT(b.id_billet) * 100.0 / total_ventes.total_billets), 2) as pourcentage
        FROM 
          BILLET b
          INNER JOIN SEANCE s ON b.id_seance = s.id_seance
          INNER JOIN RESERVATION r ON b.id_reservation = r.id_reservation,
          total_ventes
        WHERE
          s.date_heure BETWEEN $1 AND $2
          AND r.statut_paiement = 'PAYE'
          AND b.statut != 'ANNULE'
        GROUP BY b.type_tarif, total_ventes.total_billets
        ORDER BY nombre_billets DESC
      `;
      
      const result = await AppDataSource.query(query, [dateDebut, dateFin]);
      return result;
    } catch (error) {
      logger.error('Erreur lors de la génération du rapport des ventes par type de tarif', error);
      throw error;
    }
  }
}
