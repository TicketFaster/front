import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

// Charts
import { NgChartsModule } from 'ng2-charts';

// Core
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TokenInterceptor } from './core/interceptors/token.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

// Features
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
import { LoginComponent } from './features/auth/login/login.component';

// Shared
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { StatusChipComponent } from './shared/components/status-chip/status-chip.component';

// Enregistrement des locales pour la France
registerLocaleData(localeFr, 'fr');

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    EvenementListComponent,
    EvenementFormComponent,
    EvenementDetailComponent,
    SalleListComponent,
    SalleFormComponent,
    SeanceListComponent,
    SeanceFormComponent,
    ClientListComponent,
    ClientFormComponent,
    ClientDetailComponent,
    ReservationListComponent,
    ReservationFormComponent,
    ReservationDetailComponent,
    BilletListComponent,
    BilletDetailComponent,
    LoginComponent,
    ConfirmDialogComponent,
    StatusChipComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgChartsModule,
    
    // Angular Material
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  providers: [
    DatePipe,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
