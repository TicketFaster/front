import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Billetterie';
  isAuthenticated = false;
  isSidenavOpen = true;
  currentRoute = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Vérifier si l'utilisateur est authentifié
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });

    // Suivre les changements de route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects;
      
      // Fermer automatiquement le sidenav sur mobile lors du changement de route
      if (window.innerWidth < 768) {
        this.isSidenavOpen = false;
      }
    });
  }

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getPageTitle(): string {
    const route = this.currentRoute;
    
    if (route.includes('/dashboard')) return 'Tableau de bord';
    if (route.includes('/evenements')) return 'Gestion des événements';
    if (route.includes('/salles')) return 'Gestion des salles';
    if (route.includes('/seances')) return 'Gestion des séances';
    if (route.includes('/clients')) return 'Gestion des clients';
    if (route.includes('/reservations')) return 'Gestion des réservations';
    if (route.includes('/billets')) return 'Gestion des billets';
    
    return this.title;
  }
}
