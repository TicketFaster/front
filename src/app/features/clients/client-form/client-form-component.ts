import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientService } from '../services/client.service';
import { Client } from '../../../shared/models/client.model';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss']
})
export class ClientFormComponent implements OnInit {
  clientForm: FormGroup;
  isEditMode: boolean = false;
  clientId: number | null = null;
  loading: boolean = false;
  submitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.clientForm = this.createForm();
  }

  ngOnInit(): void {
    this.checkEditMode();
  }

  createForm(): FormGroup {
    return this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(255)]],
      prenom: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      telephone: ['', [Validators.pattern(/^[0-9]{1,20}$/)]]
    });
  }

  checkEditMode(): void {
    this.clientId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.clientId;
    
    if (this.isEditMode && this.clientId) {
      this.loading = true;
      this.clientService.getClientById(this.clientId).subscribe({
        next: (client) => {
          this.populateForm(client);
          this.loading = false;
        },
        error: (err) => {
          this.snackBar.open('Erreur lors du chargement du client', 'Fermer', { duration: 3000 });
          this.loading = false;
          console.error('Erreur lors du chargement du client', err);
        }
      });
    }
  }

  populateForm(client: Client): void {
    this.clientForm.patchValue({
      nom: client.nom,
      prenom: client.prenom,
      email: client.email,
      telephone: client.telephone
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.markFormGroupAsTouched(this.clientForm);
      return;
    }

    this.submitting = true;
    const clientData = this.clientForm.value;

    if (this.isEditMode && this.clientId) {
      this.clientService.updateClient(this.clientId, clientData).subscribe({
        next: (client) => {
          this.submitting = false;
          this.snackBar.open('Client mis à jour avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/clients', client.id]);
        },
        error: (err) => {
          this.submitting = false;
          this.snackBar.open('Erreur lors de la mise à jour du client', 'Fermer', { duration: 3000 });
          console.error('Erreur lors de la mise à jour du client', err);
        }
      });
    } else {
      this.clientService.createClient(clientData).subscribe({
        next: (client) => {
          this.submitting = false;
          this.snackBar.open('Client créé avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/clients', client.id]);
        },
        error: (err) => {
          this.submitting = false;
          this.snackBar.open('Erreur lors de la création du client', 'Fermer', { duration: 3000 });
          console.error('Erreur lors de la création du client', err);
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
