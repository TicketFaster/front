  import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { RapportVentes } from '../../../shared/models/rapport.model';

@Injectable({
  providedIn: 'root'
})
export class RapportService {
  private endpoint = 'rapports';

  constructor(private apiService: ApiService) {}

  /**
   * Génère un rapport de ventes pour une période donnée
   */
  genererRapportVentes(dateDebut: string, dateFin: string): Observable<RapportVentes[]> {
    return this.apiService.getAll<RapportVentes>(`${this.endpoint}/ventes?date_debut=${dateDebut}&date_fin=${dateFin}`);
  }

  /**
   * Récupère les statistiques d'un client
   */
  getStatistiquesClient(clientId: number): Observable<any> {
    return this.apiService.getOne<any>(`${this.endpoint}/client/${clientId}`);
  }

  /**
   * Récupère les disponibilités sur une période pour un événement
   */
  getDisponibilitesPeriode(
    evenementId: number,
    dateDebut: string,
    dateFin: string,
    nbPlacesMin: number = 1
  ): Observable<any[]> {
    return this.apiService.getAll<any>(
      `${this.endpoint}/disponibilites/${evenementId}?date_debut=${dateDebut}&date_fin=${dateFin}&nb_places_min=${nbPlacesMin}`
    );
  }

  /**
   * Récupère le taux de remplissage d'une séance
   */
  getTauxRemplissage(seanceId: number): Observable<{ taux: number }> {
    return this.apiService.getOne<{ taux: number }>(`${this.endpoint}/taux-remplissage/${seanceId}`);
  }

  /**
   * Calcule un prix réduit en fonction du type de tarif
   */
  calculerPrixReduit(prixBase: number, typeTarif: string): Observable<{ prix_base: number; type_tarif: string; prix_reduit: number }> {
    return this.apiService.create<{ prix_base: number; type_tarif: string; prix_reduit: number }>(
      `${this.endpoint}/calcul-prix`,
      { prix_base: prixBase, type_tarif: typeTarif }
    );
  }
  
  /**
   * Génère un rapport des ventes par catégorie d'événement
   */
  getVentesParCategorie(dateDebut: string, dateFin: string): Observable<any[]> {
    return this.apiService.getAll<any>(
      `${this.endpoint}/ventes-par-categorie?date_debut=${dateDebut}&date_fin=${dateFin}`
    );
  }
  
  /**
   * Génère un rapport des ventes par mois
   */
  getVentesParMois(annee?: number): Observable<any[]> {
    let url = `${this.endpoint}/ventes-par-mois`;
    if (annee) {
      url += `/${annee}`;
    }
    return this.apiService.getAll<any>(url);
  }
  
  /**
   * Génère un rapport sur les types de tarifs vendus
   */
  getVentesParTypeTarif(dateDebut: string, dateFin: string): Observable<any[]> {
    return this.apiService.getAll<any>(
      `${this.endpoint}/ventes-par-tarif?date_debut=${dateDebut}&date_fin=${dateFin}`
    );
  }
}
