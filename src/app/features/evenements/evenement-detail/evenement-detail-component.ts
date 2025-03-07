import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EvenementService } from '../services/evenement.service';
import { SeanceService } from '../../seances/services/seance.service';
import { Evenement } from '../../../shared/models/evenement.model';
import { Seance } from '../../../shared/models/seance.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-evenement-detail',
  templateUrl: './evenement-detail.component.html',
  styleUrls: ['./evenement-detail.component.scss']
})
export class EvenementDetailComponent implements OnInit {
  evenement: Evenement | null = null;
  seances: Seance[] = [];
  loading: boolean = true;
  error: string | null = null;
  displayedColumns: string[] = ['id', 'date_heure', 'salle', 'places_disponibles', 'taux_remplissage', 'actions'];

  constructor(
    private evenementService: EvenementService,
    private seanceService: SeanceService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEvenement();
  }

  loadEvenement(): void {
    this.loading = true;
    this.error = null;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    this.evenementService.getEvenementById(id).subscribe({
      next: (evenement) => {
        this.evenement = evenement;
        this.loadSeances(id);
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de l\'événement';
        this.loading = false;
        console.error('Erreur lors du chargement de l\'événement', err);
      }
    });
  }

  loadSeances(evenementId: number): void {
    this.seanceService.getSeancesByEvenement(evenementId).subscribe({
      next: (seances) => {
        this.seances = seances;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Erreur lors du chargement des séances', err);
      }
    });
  }

  deleteEvenement(): void {
    if (!this.evenement) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer l'événement "${this.evenement.titre}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.evenement) {
        this.evenementService.deleteEvenement(this.evenement.id).subscribe({
          next: () => {
            this.snackBar.open('Événement supprimé avec succès', 'Fermer', { duration: 3000 });
            this.router.navigate(['/evenements']);
          },
          error: (err) => {
            this.snackBar.open('Erreur lors de la suppression de l\'événement', 'Fermer', { duration: 3000 });
            console.error('Erreur lors de la suppression de l\'événement', err);
          }
        });
      }
    });
  }

  deleteSeance(seance: Seance): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer la séance du ${new Date(seance.date_heure).toLocaleString()} ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.seanceService.deleteSeance(seance.id).subscribe({
          next: () => {
            this.snackBar.open('Séance supprimée avec succès', 'Fermer', { duration: 3000 });
            this.loadSeances(this.evenement?.id as number);
          },
          error: (err) => {
            this.snackBar.open('Erreur lors de la suppression de la séance', 'Fermer', { duration: 3000 });
            console.error('Erreur lors de la suppression de la séance', err);
          }
        });
      }
    });
  }

  getTauxRemplissageClass(taux: number): string {
    if (taux >= 90) return 'taux-eleve';
    if (taux >= 60) return 'taux-moyen';
    return 'taux-faible';
  }
}
