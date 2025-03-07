import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReservationService } from '../services/reservation.service';
import { BilletService } from '../../billets/services/billet.service';
import { Reservation } from '../../../shared/models/reservation.model';
import { Billet } from '../../../shared/models/billet.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-reservation-detail',
  templateUrl: './reservation-detail.component.html',
  styleUrls: ['./reservation-detail.component.scss']
})
export class ReservationDetailComponent implements OnInit {
  reservation: Reservation | null = null;
  billets: Billet[] = [];
  loading: boolean = true;
  billetsLoading: boolean = true;
  error: string | null = null;
  processing: boolean = false;
  
  displayedColumns: string[] = ['id', 'evenement', 'seance', 'salle', 'type_tarif', 'prix_final', 'statut', 'actions'];

  constructor(
    private reservationService: ReservationService,
    private billetService: BilletService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadReservation();
  }

  loadReservation(): void {
    this.loading = true;
    this.error = null;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    this.reservationService.getReservationById(id).subscribe({
      next: (reservation) => {
        this.reservation = reservation;
        this.loading = false;
        this.loadBillets(id);
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de la réservation';
        this.loading = false;
        console.error('Erreur lors du chargement de la réservation', err);
      }
    });
  }

  loadBillets(reservationId: number): void {
    this.billetsLoading = true;
    
    this.billetService.getBilletsByReservation(reservationId).subscribe({
      next: (billets) => {
        this.billets = billets;
        this.billetsLoading = false;
      },
      error: (err) => {
        this.billetsLoading = false;
        this.snackBar.open('Erreur lors du chargement des billets', 'Fermer', { duration: 3000 });
        console.error('Erreur lors du chargement des billets', err);
      }
    });
  }

  updateReservationStatus(statut: string): void {
    if (!this.reservation) return;
    
    const statusLabels: { [key: string]: string } = {
      'PAYE': 'Payé',
      'EN_ATTENTE': 'En attente',
      'ANNULE': 'Annulé',
      'REMBOURSE': 'Remboursé'
    };
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Modifier le statut',
        message: `Êtes-vous sûr de vouloir modifier le statut de la réservation en "${statusLabels[statut]}" ?`,
        confirmText: 'Modifier',
        cancelText: 'Annuler',
        color: 'primary'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.reservation) {
        this.processing = true;
        this.reservationService.updateReservationStatus(this.reservation.id, statut).subscribe({
          next: (updatedReservation) => {
            this.reservation = updatedReservation;
            this.processing = false;
            this.snackBar.open(`Statut de la réservation mis à jour: ${statusLabels[statut]}`, 'Fermer', { duration: 3000 });
            
            // Recharger les billets car leur statut peut avoir changé
            this.loadBillets(this.reservation.id);
          },
          error: (err) => {
            this.processing = false;
            this.snackBar.open('Erreur lors de la mise à jour du statut', 'Fermer', { duration: 3000 });
            console.error('Erreur lors de la mise à jour du statut', err);
          }
        });
      }
    });
  }

  downloadReservationPDF(): void {
    if (!this.reservation) return;
    
    this.processing = true;
    this.reservationService.downloadPDF(this.reservation.id).subscribe({
      next: (blob) => {
        this.processing = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display: none');
        a.href = url;
        a.download = `reservation_${this.reservation?.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      },
      error: (err) => {
        this.processing = false;
        this.snackBar.open('Erreur lors du téléchargement du PDF', 'Fermer', { duration: 3000 });
        console.error('Erreur lors du téléchargement du PDF', err);
      }
    });
  }

  sendReservationByEmail(): void {
    if (!this.reservation) return;
    
    this.processing = true;
    this.reservationService.sendByEmail(this.reservation.id).subscribe({
      next: () => {
        this.processing = false;
        this.snackBar.open('Réservation envoyée par email avec succès', 'Fermer', { duration: 3000 });
      },
      error: (err) => {
        this.processing = false;
        this.snackBar.open('Erreur lors de l\'envoi par email', 'Fermer', { duration: 3000 });
        console.error('Erreur lors de l\'envoi par email', err);
      }
    });
  }

  downloadBilletPDF(billetId: number): void {
    this.billetService.generateBilletPDF(billetId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display: none');
        a.href = url;
        a.download = `billet_${billetId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      },
      error: (err) => {
        this.snackBar.open('Erreur lors du téléchargement du billet', 'Fermer', { duration: 3000 });
        console.error('Erreur lors du téléchargement du billet', err);
      }
    });
  }

  cancelBillet(billet: Billet): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Annuler le billet',
        message: `Êtes-vous sûr de vouloir annuler le billet #${billet.id} ?`,
        confirmText: 'Annuler le billet',
        cancelText: 'Revenir',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.billetService.updateBilletStatus(billet.id, 'ANNULE').subscribe({
          next: () => {
            this.snackBar.open('Billet annulé avec succès', 'Fermer', { duration: 3000 });
            this.loadBillets(this.reservation?.id as number);
          },
          error: (err) => {
            this.snackBar.open('Erreur lors de l\'annulation du billet', 'Fermer', { duration: 3000 });
            console.error('Erreur lors de l\'annulation du billet', err);
          }
        });
      }
    });
  }
}
