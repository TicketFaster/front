import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EvenementService } from '../services/evenement.service';
import { Evenement } from '../../../shared/models/evenement.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-evenement-list',
  templateUrl: './evenement-list.component.html',
  styleUrls: ['./evenement-list.component.scss']
})
export class EvenementListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'titre', 'categorie', 'duree', 'prix_standard', 'actions'];
  dataSource: MatTableDataSource<Evenement> = new MatTableDataSource<Evenement>([]);
  loading: boolean = true;
  error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private evenementService: EvenementService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEvenements();
  }

  loadEvenements(): void {
    this.loading = true;
    this.error = null;
    
    this.evenementService.getAllEvenements().subscribe({
      next: (evenements) => {
        this.dataSource = new MatTableDataSource(evenements);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des événements';
        this.loading = false;
        console.error('Erreur lors du chargement des événements', err);
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteEvenement(evenement: Evenement): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer l'événement "${evenement.titre}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.evenementService.deleteEvenement(evenement.id).subscribe({
          next: () => {
            this.snackBar.open('Événement supprimé avec succès', 'Fermer', { duration: 3000 });
            this.loadEvenements();
          },
          error: (err) => {
            this.snackBar.open('Erreur lors de la suppression de l\'événement', 'Fermer', { duration: 3000 });
            console.error('Erreur lors de la suppression de l\'événement', err);
          }
        });
      }
    });
  }
}
