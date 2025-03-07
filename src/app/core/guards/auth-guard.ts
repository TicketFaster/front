import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          // Vérifier les permissions selon le rôle si nécessaire
          const user = this.authService.getUser();
          const requiredRole = route.data['role'];
          
          if (requiredRole && user.role !== requiredRole) {
            this.router.navigate(['/dashboard']);
            return false;
          }
          
          return true;
        } else {
          // Stocker l'URL d'origine pour rediriger après la connexion
          this.router.navigate(['/login'], { 
            queryParams: { returnUrl: state.url }
          });
          return false;
        }
      })
    );
  }
}
