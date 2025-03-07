import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Méthode générique pour récupérer toutes les entités
   */
  getAll<T>(endpoint: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.apiUrl}/${endpoint}`);
  }

  /**
   * Méthode générique pour récupérer une entité par son ID
   */
  getOne<T>(endpoint: string, id: number): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}/${id}`);
  }

  /**
   * Méthode générique pour créer une entité
   */
  create<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data);
  }

  /**
   * Méthode générique pour mettre à jour une entité
   */
  update<T>(endpoint: string, id: number, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}/${id}`, data);
  }

  /**
   * Méthode générique pour mettre à jour partiellement une entité
   */
  patch<T>(endpoint: string, id: number, data: any): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}/${endpoint}/${id}`, data);
  }

  /**
   * Méthode générique pour supprimer une entité
   */
  delete(endpoint: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${endpoint}/${id}`);
  }
}
