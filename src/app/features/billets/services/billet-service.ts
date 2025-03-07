import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Billet } from '../../../shared/models/billet.model';

@Injectable({
  providedIn: 'root'
})
export class BilletService {
  private endpoint = 'billets';

  constructor(private apiService: ApiService) {}

  /**
   * Récupère tous les billets
   */
  getAllBillets(): Observable<Billet[]> {
    return this.apiService.getAll<Billet>(this.endpoint);
  }

  /**
   * Récupère un billet par son ID
   */
  getBilletById(id: number): Observable<Billet> {
    return this.apiService.getOne<Billet>(this.endpoint, id);
  }

  /**
   * Récupère les billets d'une réservation
   */
  getBilletsByReservation(reservationId: number): Observable<Billet[]> {
    return this.apiService.getAll<Billet>(`${this.endpoint}/reservation/${reservationId}`);
  }

  /**
   * Récupère les billets d'une séance
   */
  getBilletsBySeance(seanceId: number): Observable<Billet[]> {
    return this.apiService.getAll<Billet>(`${this.endpoint}/seance/${seanceId}`);
  }

  /**
   * Met à jour le statut d'un billet
   */
  updateBilletStatus(id: number, statut: string): Observable<Billet> {
    return this.apiService.patch<Billet>(`${this.endpoint}/${id}/status`, { statut });
  }

  /**
   * Génère un PDF pour un billet
   */
  generateBilletPDF(id: number): Observable<Blob> {
    return this.apiService.getFile(`${this.endpoint}/${id}/pdf`);
  }

  /**
   * Vérifie la validité d'un billet par son code-barre
   */
  verifyBillet(codeBarres: string): Observable<{ 
    valid: boolean, 
    message: string, 
    billet?: Billet 
  }> {
    return this.apiService.post<{ valid: boolean, message: string, billet?: Billet }>(
      `${this.endpoint}/verify`, 
      { code_barres: codeBarres }
    );
  }

  /**
   * Marque un billet comme utilisé
   */
  markBilletAsUsed(id: number): Observable<Billet> {
    return this.updateBilletStatus(id, 'UTILISE');
  }
}
