import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BilletService } from '../services/billet.service';
import { Billet } from '../../../shared/models/billet.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-billet-detail',
  templateUrl: './billet-detail.component.html',
  styleUrls: ['./billet-detail.component.scss']
})
export class BilletDetailComponent implements OnInit {
  billet: Billet | null = null;
  loading: boolean = true;
  error: string | null = null;
  processing: boolean = false;
  
  constructor(
    private billetService: BilletService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadBillet();
  }

  loadBillet(): void {
    this.loading = true;
    this.error = null;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    this.billetService.getBilletById(id).subscribe({
      next: (billet) => {
        this.billet = billet;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du billet';
        this.loading = false;
        console.error('Erreur lors du chargement du billet', err);
      }
    });
  }

  markAsUsed(): void {
    if (!this.billet) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Marquer comme utilisé',
        message: 'Êtes-vous sûr de vouloir marquer ce billet comme utilisé ? Cette action est irréversible.',
        confirmText: 'Confirmer',
        cancelText: 'Annuler',
        color: 'primary'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.billet) {
        this.processing = true;
        this.billetService.markBilletAsUsed(this.billet.id).subscribe({
          next: (updatedBillet) => {
            this.billet = updatedBillet;
            this.processing = false;
            this.snackBar.open('Billet marqué comme utilisé', 'Fermer', { duration: 3000 });
          },
          error: (err) => {
            this.processing = false;
            this.snackBar.open('Erreur lors de la mise à jour du statut du billet', 'Fermer', { duration: 3000 });
            console.error('Erreur lors de la mise à jour du statut du billet', err);
          }
        });
      }
    });
  }

  cancelBillet(): void {
    if (!this.billet) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Annuler le billet',
        message: 'Êtes-vous sûr de vouloir annuler ce billet ? Cette action est irréversible.',
        confirmText: 'Annuler le billet',
        cancelText: 'Revenir',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.billet) {
        this.processing = true;
        this.billetService.updateBilletStatus(this.billet.id, 'ANNULE').subscribe({
          next: (updatedBillet) => {
            this.billet = updatedBillet;
            this.processing = false;
            this.snackBar.open('Billet annulé avec succès', 'Fermer', { duration: 3000 });
          },
          error: (err) => {
            this.processing = false;
            this.snackBar.open('Erreur lors de l\'annulation du billet', 'Fermer', { duration: 3000 });
            console.error('Erreur lors de l\'annulation du billet', err);
          }
        });
      }
    });
  }

  downloadPDF(): void {
    if (!this.billet) return;
    
    this.processing = true;
    this.billetService.generateBilletPDF(this.billet.id).subscribe({
      next: (blob) => {
        this.processing = false;
        saveAs(blob, `billet_${this.billet?.id}.pdf`);
      },
      error: (err) => {
        this.processing = false;
        this.snackBar.open('Erreur lors de la génération du PDF', 'Fermer', { duration: 3000 });
        console.error('Erreur lors de la génération du PDF', err);
      }
    });
  }

  canBeUsed(): boolean {
    return this.billet?.statut === 'VALIDE';
  }

  canBeCancelled(): boolean {
    return this.billet?.statut === 'VALIDE';
  }
}
