import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './features/dashboard/dashboard.component';
import { EvenementListComponent } from './features/evenements/evenement-list/evenement-list.component';
import { EvenementFormComponent } from './features/evenements/evenement-form/evenement-form.component';
import { EvenementDetailComponent } from './features/evenements/evenement-detail/evenement-detail.component';
import { SalleListComponent } from './features/salles/salle-list/salle-list.component';
import { SalleFormComponent } from './features/salles/salle-form/salle-form.component';
import { SeanceListComponent } from './features/seances/seance-list/seance-list.component';
import { SeanceFormComponent } from './features/seances/seance-form/seance-form.component';
import { ClientListComponent } from './features/clients/client-list/client-list.component';
import { ClientFormComponent } from './features/clients/client-form/client-form.component';
import { ClientDetailComponent } from './features/clients/client-detail/client-detail.component';
import { ReservationListComponent } from './features/reservations/reservation-list/reservation-list.component';
import { ReservationFormComponent } from './features/reservations/reservation-form/reservation-form.component';
import { ReservationDetailComponent } from './features/reservations/reservation-detail/reservation-detail.component';
import { BilletListComponent } from './features/billets/billet-list/billet-list.component';
import { BilletDetailComponent } from './features/billets/billet-detail/billet-detail.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  
  // Routes Événements
  { path: 'evenements', component: EvenementListComponent, canActivate: [AuthGuard] },
  { path: 'evenements/create', component: EvenementFormComponent, canActivate: [AuthGuard] },
  { path: 'evenements/:id', component: EvenementDetailComponent, canActivate: [AuthGuard] },
  { path: 'evenements/:id/edit', component: EvenementFormComponent, canActivate: [AuthGuard] },
  
  // Routes Salles
  { path: 'salles', component: SalleListComponent, canActivate: [AuthGuard] },
  { path: 'salles/create', component: SalleFormComponent, canActivate: [AuthGuard] },
  { path: 'salles/:id/edit', component: SalleFormComponent, canActivate: [AuthGuard] },
  
  // Routes Séances
  { path: 'seances', component: SeanceListComponent, canActivate: [AuthGuard] },
  { path: 'seances/create', component: SeanceFormComponent, canActivate: [AuthGuard] },
  { path: 'seances/:id/edit', component: SeanceFormComponent, canActivate: [AuthGuard] },
  
  // Routes Clients
  { path: 'clients', component: ClientListComponent, canActivate: [AuthGuard] },
  { path: 'clients/create', component: ClientFormComponent, canActivate: [AuthGuard] },
  { path: 'clients/:id', component: ClientDetailComponent, canActivate: [AuthGuard] },
  { path: 'clients/:id/edit', component: ClientFormComponent, canActivate: [AuthGuard] },
  
  // Routes Réservations
  { path: 'reservations', component: ReservationListComponent, canActivate: [AuthGuard] },
  { path: 'reservations/create', component: ReservationFormComponent, canActivate: [AuthGuard] },
  { path: 'reservations/:id', component: ReservationDetailComponent, canActivate: [AuthGuard] },
  
  // Routes Billets
  { path: 'billets', component: BilletListComponent, canActivate: [AuthGuard] },
  { path: 'billets/:id', component: BilletDetailComponent, canActivate: [AuthGuard] },
  
  // Redirection par défaut
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
