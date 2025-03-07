import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Client, StatistiquesClient } from '../../../shared/models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private endpoint = 'clients';

  constructor(private apiService: ApiService) {}

  /**
   * Récupère tous les clients
   */
  getAllClients(): Observable<Client[]> {
    return this.apiService.getAll<Client>(this.endpoint);
  }

  /**
   * Récupère un client par son ID
   */
  getClientById(id: number): Observable<Client> {
    return this.apiService.getOne<Client>(this.endpoint, id);
  }

  /**
   * Crée un nouveau client
   */
  createClient(client: Partial<Client>): Observable<Client> {
    return this.apiService.create<Client>(this.endpoint, client);
  }

  /**
   * Met à jour un client existant
   */
  updateClient(id: number, client: Partial<Client>): Observable<Client> {
    return this.apiService.update<Client>(this.endpoint, id, client);
  }

  /**
   * Supprime un client
   */
  deleteClient(id: number): Observable<void> {
    return this.apiService.delete(this.endpoint, id);
  }

  /**
   * Récupère les statistiques d'un client
   */
  getClientStatistics(id: number): Observable<StatistiquesClient> {
    return this.apiService.getOne<StatistiquesClient>(`rapports/client/${id}`);
  }

  /**
   * Recherche des clients par un terme de recherche
   */
  searchClients(searchTerm: string): Observable<Client[]> {
    return this.apiService.getAll<Client>(`${this.endpoint}/search?term=${encodeURIComponent(searchTerm)}`);
  }
}
