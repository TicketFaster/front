import { Billet } from '../entities/billet.entity';
import { Seance } from '../entities/seance.entity';
import { AppDataSource } from '../utils/database';
import { logger } from '../utils/logger';

export class BilletService {
  private billetRepository = AppDataSource.getRepository(Billet);
  private seanceRepository = AppDataSource.getRepository(Seance);

  // ... autres méthodes existantes ...

  /**
   * Valide un billet par son code-barres
   */
  async validateBilletByCodeBarres(codeBarres: string): Promise<{
    valid: boolean;
    message: string;
    billet?: Billet;
    evenement?: { titre: string; };
    seance?: { date_heure: Date; };
    salle?: { nom: string; };
  }> {
    try {
      // Rechercher le billet par son code-barres
      const billet = await this.billetRepository.findOne({
        where: { code_barre: codeBarres },
        relations: ['seance', 'seance.evenement', 'seance.salle']
      });

      // Si le billet n'existe pas
      if (!billet) {
        return {
          valid: false,
          message: 'Billet non trouvé'
        };
      }

      // Vérifier si le billet est valide
      if (billet.statut === 'ANNULE') {
        return {
          valid: false,
          message: 'Ce billet a été annulé',
          billet
        };
      }

      // Vérifier si le billet a déjà été utilisé
      if (billet.statut === 'UTILISE') {
        return {
          valid: false,
          message: 'Ce billet a déjà été utilisé',
          billet,
          evenement: { titre: billet.seance.evenement.titre },
          seance: { date_heure: billet.seance.date_heure },
          salle: { nom: billet.seance.salle.nom }
        };
      }

      // Vérifier si la séance est passée
      const now = new Date();
      if (new Date(billet.seance.date_heure) < now) {
        // La séance est déjà passée
        return {
          valid: false,
          message: 'La séance est déjà passée',
          billet,
          evenement: { titre: billet.seance.evenement.titre },
          seance: { date_heure: billet.seance.date_heure },
          salle: { nom: billet.seance.salle.nom }
        };
      }

      // Le billet est valide
      return {
        valid: true,
        message: 'Billet valide',
        billet,
        evenement: { titre: billet.seance.evenement.titre },
        seance: { date_heure: billet.seance.date_heure },
        salle: { nom: billet.seance.salle.nom }
      };
    } catch (error) {
      logger.error('Erreur lors de la validation du billet', error);
      throw error;
    }
  }

  /**
   * Marque un billet comme utilisé
   */
  async markBilletAsUsed(id: number): Promise<Billet | null> {
    try {
      // Vérifier si le billet existe et est valide
      const billet = await this.billetRepository.findOneBy({ id });
      
      if (!billet) {
        return null;
      }

      if (billet.statut !== 'VALIDE') {
        throw new Error(`Le billet ${id} ne peut pas être marqué comme utilisé car son statut est ${billet.statut}`);
      }

      // Mettre à jour le statut
      billet.statut = 'UTILISE';
      return await this.billetRepository.save(billet);
    } catch (error) {
      logger.error(`Erreur lors du marquage du billet ${id} comme utilisé`, error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques d'utilisation des billets en temps réel
   */
  async getUsageStatistics(eventId?: number): Promise<{
    total: number;
    utilises: number;
    pourcentage: number;
    par_evenement?: Array<{ evenement: string; total: number; utilises: number; pourcentage: number; }>
  }> {
    try {
      // Construire la requête de base
      let query = this.billetRepository
        .createQueryBuilder('billet')
        .innerJoin('billet.seance', 'seance')
        .innerJoin('seance.evenement', 'evenement');

      // Filtrer par événement si nécessaire
      if (eventId) {
        query = query.where('evenement.id = :eventId', { eventId });
      }

      // Récupérer le total de billets valides et utilisés
      const statsTotal = await query
        .select([
          'COUNT(billet.id) as total',
          'SUM(CASE WHEN billet.statut = \'UTILISE\' THEN 1 ELSE 0 END) as utilises'
        ])
        .getRawOne();

      // Calculer le pourcentage
      const total = parseInt(statsTotal.total) || 0;
      const utilises = parseInt(statsTotal.utilises) || 0;
      const pourcentage = total > 0 ? Math.round((utilises / total) * 100) : 0;

      // Si un événement spécifique a été demandé, retourner seulement les statistiques globales
      if (eventId) {
        return { total, utilises, pourcentage };
      }

      // Sinon, récupérer les statistiques par événement
      const statsByEvent = await this.billetRepository
        .createQueryBuilder('billet')
        .innerJoin('billet.seance', 'seance')
        .innerJoin('seance.evenement', 'evenement')
        .select([
          'evenement.titre as evenement',
          'COUNT(billet.id) as total',
          'SUM(CASE WHEN billet.statut = \'UTILISE\' THEN 1 ELSE 0 END) as utilises'
        ])
        .groupBy('evenement.titre')
        .getRawMany();

      // Calculer les pourcentages par événement
      const par_evenement = statsByEvent.map(stat => ({
        evenement: stat.evenement,
        total: parseInt(stat.total) || 0,
        utilises: parseInt(stat.utilises) || 0,
        pourcentage: parseInt(stat.total) > 0 ? Math.round((parseInt(stat.utilises) / parseInt(stat.total)) * 100) : 0
      }));

      return { total, utilises, pourcentage, par_evenement };
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques d\'utilisation', error);
      throw error;
    }
  }
}
