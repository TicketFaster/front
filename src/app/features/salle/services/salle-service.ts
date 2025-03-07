import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Salle } from '../../../shared/models/salle.model';

@Injectable({
  providedIn: 'root'
})
export class SalleService {
  private endpoint = 'salles';

  constructor(private apiService: ApiService) {}

  /**
   * Récupère toutes les salles
   */
  getAllSalles(): Observable<Salle[]> {
    return this.apiService.getAll<Salle>(this.endpoint);
  }

  /**
   * Récupère une salle par son ID
   */
  getSalleById(id: number): Observable<Salle> {
    return this.apiService.getOne<Salle>(this.endpoint, id);
  }

  /**
   * Crée une nouvelle salle
   */
  createSalle(salle: Partial<Salle>): Observable<Salle> {
    return this.apiService.create<Salle>(this.endpoint, salle);
  }

  /**
   * Met à jour une salle existante
   */
  updateSalle(id: number, salle: Partial<Salle>): Observable<Salle> {
    return this.apiService.update<Salle>(this.endpoint, id, salle);
  }

  /**
   * Supprime une salle
   */
  deleteSalle(id: number): Observable<void> {
    return this.apiService.delete(this.endpoint, id);
  }

  /**
   * Récupère les statistiques d'occupation d'une salle
   */
  getSalleOccupationStats(id: number): Observable<any> {
    return this.apiService.getAll<any>(`${this.endpoint}/${id}/stats`);
  }

  /**
   * Vérifie la disponibilité d'une salle à une date donnée
   */
  checkSalleDisponibilite(id: number, date: string): Observable<{ disponible: boolean; seances: any[] }> {
    return this.apiService.getAll<{ disponible: boolean; seances: any[] }>(
      `${this.endpoint}/${id}/disponibilite?date=${date}`
    );
  }
}
