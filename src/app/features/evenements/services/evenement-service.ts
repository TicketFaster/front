import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Evenement } from '../../../shared/models/evenement.model';

@Injectable({
  providedIn: 'root'
})
export class EvenementService {
  private endpoint = 'evenements';

  constructor(private apiService: ApiService) {}

  /**
   * Récupère tous les événements
   */
  getAllEvenements(): Observable<Evenement[]> {
    return this.apiService.getAll<Evenement>(this.endpoint);
  }

  /**
   * Récupère un événement par son ID
   */
  getEvenementById(id: number): Observable<Evenement> {
    return this.apiService.getOne<Evenement>(this.endpoint, id);
  }

  /**
   * Crée un nouvel événement
   */
  createEvenement(evenement: Partial<Evenement>): Observable<Evenement> {
    return this.apiService.create<Evenement>(this.endpoint, evenement);
  }

  /**
   * Met à jour un événement existant
   */
  updateEvenement(id: number, evenement: Partial<Evenement>): Observable<Evenement> {
    return this.apiService.update<Evenement>(this.endpoint, id, evenement);
  }

  /**
   * Supprime un événement
   */
  deleteEvenement(id: number): Observable<void> {
    return this.apiService.delete(this.endpoint, id);
  }
}
