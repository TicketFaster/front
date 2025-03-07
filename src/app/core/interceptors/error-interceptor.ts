import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !request.url.includes('auth/login')) {
          return this.handle401Error(request, next);
        }
        
        if (error.status === 403) {
          this.snackBar.open('Vous n\'avez pas les permissions nécessaires', 'Fermer', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        }
        
        // Erreur générique
        const errorMessage = error.error?.message || 'Une erreur est survenue';
        this.snackBar.open(errorMessage, 'Fermer', { duration: 3000 });
        
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      
      return this.authService.refreshToken().pipe(
        switchMap(response => {
          this.isRefreshing = false;
          
          // Recréer la requête avec le nouveau token
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${response.token}`
            }
          });
          
          return next.handle(request);
        }),
        catchError(error => {
          this.isRefreshing = false;
          
          // En cas d'échec du rafraîchissement, déconnecter l'utilisateur
          this.authService.logout();
          this.router.navigate(['/login']);
          
          this.snackBar.open('Votre session a expiré. Veuillez vous reconnecter.', 'Fermer', { duration: 3000 });
          
          return throwError(() => error);
        })
      );
    }
    
    return next.handle(request);
  }
}
