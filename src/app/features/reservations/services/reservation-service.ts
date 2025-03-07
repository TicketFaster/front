import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Reservation, NouvelleReservation, RapportVentes } from '../../../shared/models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private endpoint = 'reservations';

  constructor(private apiService: ApiService) {}

  /**
   * Récupère toutes les réservations
   */
  getAllReservations(): Observable<Reservation[]> {
    return this.apiService.getAll<Reservation>(this.endpoint);
  }

  /**
   * Récupère une réservation par son ID
   */
  getReservationById(id: number): Observable<Reservation> {
    return this.apiService.getOne<Reservation>(this.endpoint, id);
  }

  /**
   * Récupère les réservations d'un client
   */
  getReservationsByClient(clientId: number): Observable<Reservation[]> {
    return this.apiService.getAll<Reservation>(`${this.endpoint}/client/${clientId}`);
  }

  /**
   * Crée une nouvelle réservation
   */
  createReservation(reservation: NouvelleReservation): Observable<Reservation> {
    return this.apiService.create<Reservation>(this.endpoint, reservation);
  }

  /**
   * Met à jour le statut d'une réservation
   */
  updateReservationStatus(id: number, statut_paiement: string): Observable<Reservation> {
    return this.apiService.patch<Reservation>(`${this.endpoint}/${id}/status`, { statut_paiement });
  }

  /**
   * Génère un rapport de ventes pour une période donnée
   */
  generateSalesReport(dateDebut: string, dateFin: string): Observable<RapportVentes[]> {
    return this.apiService.getAll<RapportVentes>(`rapports/ventes?date_debut=${dateDebut}&date_fin=${dateFin}`);
  }
}
