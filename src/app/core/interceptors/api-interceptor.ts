import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  
  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Si la requête va vers notre API
    if (request.url.includes(environment.apiUrl)) {
      // Ajouter des en-têtes par défaut
      const apiRequest = request.clone({
        setHeaders: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      return next.handle(apiRequest);
    }
    
    // Si la requête est destinée à une autre URL, la laisser passer sans modification
    return next.handle(request);
  }
}
