import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SeanceService } from '../services/seance.service';
import { EvenementService } from '../../evenements/services/evenement.service';
import { SalleService } from '../../salles/services/salle.service';
import { Evenement } from '../../../shared/models/evenement.model';
import { Salle } from '../../../shared/models/salle.model';

@Component({
  selector: 'app-seance-form',
  templateUrl: './seance-form.component.html',
  styleUrls: ['./seance-form.component.scss']
})
export class SeanceFormComponent implements OnInit {
  seanceForm: FormGroup;
  isEditMode: boolean = false;
  seanceId: number | null = null;
  evenementId: number | null = null;
  
  evenements: Evenement[] = [];
  salles: Salle[] = [];
  
  filteredEvenements: Observable<Evenement[]> | undefined;
  filteredSalles: Observable<Salle[]> | undefined;
  
  loading: boolean = false;
  submitting: boolean = false;
  evenementLoading: boolean = false;
  salleLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private seanceService: SeanceService,
    private evenementService: EvenementService,
    private salleService: SalleService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.seanceForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadEvenements();
    this.loadSalles();
    this.checkEditMode();
    this.setupFilteredEvenements();
    this.setupFilteredSalles();
    
    // Vérifier s'il y a un evenementId dans les query params
    this.route.queryParams.subscribe(params => {
      if (params['evenementId']) {
        this.evenementId = Number(params['evenementId']);
        this.seanceForm.get('id_evenement')?.setValue(this.evenementId);
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      id_evenement: ['', Validators.required],
      salle_id: ['', Validators.required],
      date_heure: ['', Validators.required],
      places_disponibles: [''],
      evenement: [''],
      salle: ['']
    });
  }

  checkEditMode(): void {
    this.seanceId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.seanceId;
    
    if (this.isEditMode && this.seanceId) {
      this.loading = true;
      this.seanceService.getSeanceById(this.seanceId).subscribe({
        next: (seance) => {
          this.populateForm(seance);
          this.loading = false;
        },
        error: (err) => {
          this.snackBar.open('Erreur lors du chargement de la séance', 'Fermer', { duration: 3000 });
          this.loading = false;
          console.error('Erreur lors du chargement de la séance', err);
        }
      });
    }
  }

  loadEvenements(): void {
    this.evenementLoading = true;
    this.evenementService.getAllEvenements().subscribe({
      next: (evenements) => {
        this.evenements = evenements;
        this.evenementLoading = false;
        
        // Si on est en mode édition, re-sélectionner l'événement
        if (this.isEditMode && this.seanceForm.get('id_evenement')?.value) {
          this.setEvenementFromId(this.seanceForm.get('id_evenement')?.value);
        }

        // Si on a un evenementId depuis les query params
        if (this.evenementId) {
          this.setEvenementFromId(this.evenementId);
        }
      },
      error: (err) => {
        this.evenementLoading = false;
        this.snackBar.open('Erreur lors du chargement des événements', 'Fermer', { duration: 3000 });
        console.error('Erreur lors du chargement des événements', err);
      }
    });
  }

  loadSalles(): void {
    this.salleLoading = true;
    this.salleService.getAllSalles().subscribe({
      next: (salles) => {
        this.salles = salles;
        this.salleLoading = false;
        
        // Si on est en mode édition, re-sélectionner la salle
        if (this.isEditMode && this.seanceForm.get('salle_id')?.value) {
          this.setSalleFromId(this.seanceForm.get('salle_id')?.value);
        }
      },
      error: (err) => {
        this.salleLoading = false;
        this.snackBar.open('Erreur lors du chargement des salles', 'Fermer', { duration: 3000 });
        console.error('Erreur lors du chargement des salles', err);
      }
    });
  }

  populateForm(seance: any): void {
    this.seanceForm.patchValue({
      id_evenement: seance.id_evenement,
      salle_id: seance.salle_id,
      date_heure: new Date(seance.date_heure),
      places_disponibles: seance.places_disponibles
    });
    
    // Mettre à jour les champs d'autocomplétion
    if (seance.evenement) {
      this.seanceForm.get('evenement')?.setValue(seance.evenement);
    } else {
      this.setEvenementFromId(seance.id_evenement);
    }
    
    if (seance.salle) {
      this.seanceForm.get('salle')?.setValue(seance.salle);
    } else {
      this.setSalleFromId(seance.salle_id);
    }
  }

  setEvenementFromId(id: number): void {
    const evenement = this.evenements.find(e => e.id === id);
    if (evenement) {
      this.seanceForm.get('evenement')?.setValue(evenement);
    }
  }

  setSalleFromId(id: number): void {
    const salle = this.salles.find(s => s.id === id);
    if (salle) {
      this.seanceForm.get('salle')?.setValue(salle);
      
      // Auto-remplir les places disponibles si non spécifiées
      if (!this.seanceForm.get('places_disponibles')?.value && salle.capacite) {
        this.seanceForm.get('places_disponibles')?.setValue(salle.capacite);
      }
    }
  }

  setupFilteredEvenements(): void {
    this.filteredEvenements = this.seanceForm.get('evenement')?.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.titre;
        return name ? this._filterEvenements(name) : this.evenements.slice();
      })
    );
  }

  setupFilteredSalles(): void {
    this.filteredSalles = this.seanceForm.get('salle')?.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.nom;
        return name ? this._filterSalles(name) : this.salles.slice();
      })
    );
  }

  private _filterEvenements(name: string): Evenement[] {
    const filterValue = name.toLowerCase();
    return this.evenements.filter(evenement => 
      evenement.titre.toLowerCase().includes(filterValue)
    );
  }

  private _filterSalles(name: string): Salle[] {
    const filterValue = name.toLowerCase();
    return this.salles.filter(salle => 
      salle.nom.toLowerCase().includes(filterValue)
    );
  }

  displayEvenement(evenement: Evenement): string {
    return evenement && evenement.titre ? evenement.titre : '';
  }

  displaySalle(salle: Salle): string {
    return salle && salle.nom ? salle.nom : '';
  }

  onEvenementSelected(event: any): void {
    const evenement = event.option.value;
    this.seanceForm.get('id_evenement')?.setValue(evenement.id);
  }

  onSalleSelected(event: any): void {
    const salle = event.option.value;
    this.seanceForm.get('salle_id')?.setValue(salle.id);
    
    // Auto-remplir les places disponibles si non spécifiées
    if (!this.seanceForm.get('places_disponibles')?.value && salle.capacite) {
      this.seanceForm.get('places_disponibles')?.setValue(salle.capacite);
    }
  }

  onSubmit(): void {
    if (this.seanceForm.invalid) {
      this.markFormGroupAsTouched(this.seanceForm);
      return;
    }

    this.submitting = true;
    const seanceData = {
      id_evenement: this.seanceForm.get('id_evenement')?.value,
      salle_id: this.seanceForm.get('salle_id')?.value,
      date_heure: this.seanceForm.get('date_heure')?.value,
      places_disponibles: this.seanceForm.get('places_disponibles')?.value
    };

    if (this.isEditMode && this.seanceId) {
      this.seanceService.updateSeance(this.seanceId, seanceData).subscribe({
        next: (seance) => {
          this.submitting = false;
          this.snackBar.open('Séance mise à jour avec succès', 'Fermer', { duration: 3000 });
          
          if (this.evenementId) {
            this.router.navigate(['/evenements', this.evenementId]);
          } else {
            this.router.navigate(['/seances']);
          }
        },
        error: (err) => {
          this.submitting = false;
          this.snackBar.open(err.error.message || 'Erreur lors de la mise à jour de la séance', 'Fermer', { duration: 3000 });
          console.error('Erreur lors de la mise à jour de la séance', err);
        }
      });
    } else {
      this.seanceService.createSeance(seanceData).subscribe({
        next: (seance) => {
          this.submitting = false;
          this.snackBar.open('Séance créée avec succès', 'Fermer', { duration: 3000 });
          
          if (this.evenementId) {
            this.router.navigate(['/evenements', this.evenementId]);
          } else {
            this.router.navigate(['/seances']);
          }
        },
        error: (err) => {
          this.submitting = false;
          this.snackBar.open(err.error.message || 'Erreur lors de la création de la séance', 'Fermer', { duration: 3000 });
          console.error('Erreur lors de la création de la séance', err);
        }
      });
    }
  }

  markFormGroupAsTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if ((control as any).controls) {
        this.markFormGroupAsTouched(control as FormGroup);
      }
    });
  }
}
