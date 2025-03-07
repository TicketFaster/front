import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Seance } from '../../../shared/models/seance.model';

@Injectable({
  providedIn: 'root'
})
export class SeanceService {
  private endpoint = 'seances';

  constructor(private apiService: ApiService) {}

  /**
   * Récupère toutes les séances
   */
  getAllSeances(): Observable<Seance[]> {
    return this.apiService.getAll<Seance>(this.endpoint);
  }

  /**
   * Récupère une séance par son ID
   */
  getSeanceById(id: number): Observable<Seance> {
    return this.apiService.getOne<Seance>(this.endpoint, id);
  }

  /**
   * Récupère les séances d'un événement
   */
  getSeancesByEvenement(evenementId: number): Observable<Seance[]> {
    return this.apiService.getAll<Seance>(`${this.endpoint}/evenement/${evenementId}`);
  }

  /**
   * Récupère les séances d'une salle
   */
  getSeancesBySalle(salleId: number): Observable<Seance[]> {
    return this.apiService.getAll<Seance>(`${this.endpoint}/salle/${salleId}`);
  }

  /**
   * Récupère les prochaines séances
   */
  getProchainesSeances(limit: number = 10): Observable<Seance[]> {
    return this.apiService.getAll<Seance>(`${this.endpoint}/prochaines?limit=${limit}`);
  }

  /**
   * Crée une nouvelle séance
   */
  createSeance(seance: Partial<Seance>): Observable<Seance> {
    return this.apiService.create<Seance>(this.endpoint, seance);
  }

  /**
   * Met à jour une séance existante
   */
  updateSeance(id: number, seance: Partial<Seance>): Observable<Seance> {
    return this.apiService.update<Seance>(this.endpoint, id, seance);
  }

  /**
   * Supprime une séance
   */
  deleteSeance(id: number): Observable<void> {
    return this.apiService.delete(this.endpoint, id);
  }

  /**
   * Récupère le taux de remplissage d'une séance
   */
  getTauxRemplissage(id: number): Observable<{ taux: number }> {
    return this.apiService.getOne<{ taux: number }>(`rapports/taux-remplissage/${id}`);
  }

  /**
   * Recherche des séances disponibles sur une période pour un événement
   */
  searchDisponibilites(
    evenementId: number,
    dateDebut: string,
    dateFin: string,
    nbPlacesMin: number = 1
  ): Observable<any[]> {
    return this.apiService.getAll<any>(
      `rapports/disponibilites/${evenementId}?date_debut=${dateDebut}&date_fin=${dateFin}&nb_places_min=${nbPlacesMin}`
    );
  }
}
