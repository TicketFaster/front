import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientService } from '../services/client.service';
import { ReservationService } from '../../reservations/services/reservation.service';
import { Client, StatistiquesClient } from '../../../shared/models/client.model';
import { Reservation } from '../../../shared/models/reservation.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss']
})
export class ClientDetailComponent implements OnInit {
  client: Client | null = null;
  statistiques: StatistiquesClient | null = null;
  reservations: Reservation[] = [];
  
  loading: boolean = true;
  statsLoading: boolean = true;
  reservationsLoading: boolean = true;
  
  error: string | null = null;

  displayedColumns: string[] = ['id', 'date_reservation', 'statut_paiement', 'montant_total', 'actions'];

  constructor(
    private clientService: ClientService,
    private reservationService: ReservationService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadClient();
  }

  loadClient(): void {
    this.loading = true;
    this.error = null;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    this.clientService.getClientById(id).subscribe({
      next: (client) => {
        this.client = client;
        this.loading = false;
        
        // Charger les statistiques et les réservations
        this.loadClientStatistics(id);
        this.loadClientReservations(id);
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du client';
        this.loading = false;
        console.error('Erreur lors du chargement du client', err);
      }
    });
  }

  loadClientStatistics(clientId: number): void {
    this.statsLoading = true;
    
    this.clientService.getClientStatistics(clientId).subscribe({
      next: (stats) => {
        this.statistiques = stats;
        this.statsLoading = false;
      },
      error: (err) => {
        this.statsLoading = false;
        this.snackBar.open('Erreur lors du chargement des statistiques client', 'Fermer', { duration: 3000 });
        console.error('Erreur lors du chargement des statistiques client', err);
      }
    });
  }

  loadClientReservations(clientId: number): void {
    this.reservationsLoading = true;
    
    this.reservationService.getReservationsByClient(clientId).subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.reservationsLoading = false;
      },
      error: (err) => {
        this.reservationsLoading = false;
        this.snackBar.open('Erreur lors du chargement des réservations client', 'Fermer', { duration: 3000 });
        console.error('Erreur lors du chargement des réservations client', err);
      }
    });
  }

  deleteClient(): void {
    if (!this.client) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer le client "${this.client.prenom} ${this.client.nom}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.client) {
        this.clientService.deleteClient(this.client.id).subscribe({
          next: () => {
            this.snackBar.open('Client supprimé avec succès', 'Fermer', { duration: 3000 });
            this.router.navigate(['/clients']);
          },
          error: (err) => {
            this.snackBar.open('Erreur lors de la suppression du client', 'Fermer', { duration: 3000 });
            console.error('Erreur lors de la suppression du client', err);
          }
        });
      }
    });
  }

  createReservation(): void {
    if (!this.client) return;
    
    // Redirection vers le formulaire de réservation avec pré-selection du client
    this.router.navigate(['/reservations/create'], { 
      queryParams: { clientId: this.client.id }
    });
  }
}
