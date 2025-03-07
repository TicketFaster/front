import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EvenementService } from '../services/evenement.service';
import { Evenement } from '../../../shared/models/evenement.model';

@Component({
  selector: 'app-evenement-form',
  templateUrl: './evenement-form.component.html',
  styleUrls: ['./evenement-form.component.scss']
})
export class EvenementFormComponent implements OnInit {
  evenementForm: FormGroup;
  isEditMode: boolean = false;
  evenementId: number | null = null;
  loading: boolean = false;
  submitting: boolean = false;
  categories: string[] = ['Concert', 'Théâtre', 'Festival', 'Conférence', 'Sport', 'Exposition', 'Autre'];

  constructor(
    private fb: FormBuilder,
    private evenementService: EvenementService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.evenementForm = this.createForm();
  }

  ngOnInit(): void {
    this.checkEditMode();
  }

  createForm(): FormGroup {
    return this.fb.group({
      titre: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      categorie: [''],
      duree: ['', [Validators.required, Validators.pattern('^[0-9]+:[0-5][0-9]$')]],
      prix_standard: ['', [Validators.required, Validators.min(0)]]
    });
  }

  checkEditMode(): void {
    this.evenementId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.evenementId;
    
    if (this.isEditMode && this.evenementId) {
      this.loading = true;
      this.evenementService.getEvenementById(this.evenementId).subscribe({
        next: (evenement) => {
          this.populateForm(evenement);
          this.loading = false;
        },
        error: (err) => {
          this.snackBar.open('Erreur lors du chargement de l\'événement', 'Fermer', { duration: 3000 });
          this.loading = false;
          console.error('Erreur lors du chargement de l\'événement', err);
        }
      });
    }
  }

  populateForm(evenement: Evenement): void {
    this.evenementForm.patchValue({
      titre: evenement.titre,
      description: evenement.description,
      categorie: evenement.categorie,
      duree: evenement.duree,
      prix_standard: evenement.prix_standard
    });
  }

  onSubmit(): void {
    if (this.evenementForm.invalid) {
      this.markFormGroupAsTouched(this.evenementForm);
      return;
    }

    this.submitting = true;
    const evenementData = this.evenementForm.value;

    if (this.isEditMode && this.evenementId) {
      this.evenementService.updateEvenement(this.evenementId, evenementData).subscribe({
        next: (evenement) => {
          this.submitting = false;
          this.snackBar.open('Événement mis à jour avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/evenements', evenement.id]);
        },
        error: (err) => {
          this.submitting = false;
          this.snackBar.open('Erreur lors de la mise à jour de l\'événement', 'Fermer', { duration: 3000 });
          console.error('Erreur lors de la mise à jour de l\'événement', err);
        }
      });
    } else {
      this.evenementService.createEvenement(evenementData).subscribe({
        next: (evenement) => {
          this.submitting = false;
          this.snackBar.open('Événement créé avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/evenements', evenement.id]);
        },
        error: (err) => {
          this.submitting = false;
          this.snackBar.open('Erreur lors de la création de l\'événement', 'Fermer', { duration: 3000 });
          console.error('Erreur lors de la création de l\'événement', err);
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
