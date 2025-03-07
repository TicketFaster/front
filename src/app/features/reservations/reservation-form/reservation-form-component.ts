import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ClientService } from '../../clients/services/client.service';
import { EvenementService } from '../../evenements/services/evenement.service';
import { SeanceService } from '../../seances/services/seance.service';
import { ReservationService } from '../services/reservation.service';

import { Client } from '../../../shared/models/client.model';
import { Evenement } from '../../../shared/models/evenement.model';
import { Seance } from '../../../shared/models/seance.model';
import { TypeTarif } from '../../../shared/models/billet.model';

@Component({
  selector: 'app-reservation-form',
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.scss']
})
export class ReservationFormComponent implements OnInit {
  reservationForm: FormGroup;
  
  // Données
  clients: Client[] = [];
  evenements: Evenement[] = [];
  seances: Seance[] = [];
  filteredSeances: Seance[] = [];
  
  // Autocomplete
  filteredClients: Observable<Client[]> | undefined;
  
  // Types de tarifs disponibles
  typeTarifs: TypeTarif[] = ['STANDARD', 'REDUIT', 'ETUDIANT', 'SENIOR', 'GROUPE', 'VIP', 'LAST_MINUTE'];
  
  // Calculs
  montantTotal = 0;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private evenementService: EvenementService,
    private seanceService: SeanceService,
    private reservationService: ReservationService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.reservationForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadEvenements();
    this.loadSeances();
    
    // Configurer l'autocomplétion pour les clients
    this.filteredClients = this.reservationForm.get('client')?.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.nom + ' ' + value.prenom),
      map(name => name ? this._filterClients(name) : this.clients.slice())
    );
    
    // Écouter les changements d'événement pour filtrer les séances
    this.reservationForm.get('evenement_id')?.valueChanges.subscribe(
      evenementId => {
        this.filterSeances(evenementId);
      }
    );
    
    // Écouter les changements de billets pour calculer le montant total
    this.billets.valueChanges.subscribe(() => {
      this.calculerMontantTotal();
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      client: ['', Validators.required],
      client_id: ['', Validators.required],
      evenement_id: ['', Validators.required],
      billets: this.fb.array([this.createBilletFormGroup()])
    });
  }

  createBilletFormGroup(): FormGroup {
    return this.fb.group({
      id_seance: ['', Validators.required],
      type_tarif: ['STANDARD', Validators.required],
      prix_standard: [{ value: 0, disabled: true }],
      prix_final: [{ value: 0, disabled: true }]
    });
  }

  get billets(): FormArray {
    return this.reservationForm.get('billets') as FormArray;
  }

  addBillet(): void {
    this.billets.push(this.createBilletFormGroup());
  }

  removeBillet(index: number): void {
    this.billets.removeAt(index);
    this.calculerMontantTotal();
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe(
      (data) => {
        this.clients = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des clients', error);
        this.snackBar.open('Erreur lors du chargement des clients', 'Fermer', { duration: 3000 });
      }
    );
  }

  loadEvenements(): void {
    this.evenementService.getAllEvenements().subscribe(
      (data) => {
        this.evenements = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des événements', error);
        this.snackBar.open('Erreur lors du chargement des événements', 'Fermer', { duration: 3000 });
      }
    );
  }

  loadSeances(): void {
    this.seanceService.getAllSeances().subscribe(
      (data) => {
        this.seances = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des séances', error);
        this.snackBar.open('Erreur lors du chargement des séances', 'Fermer', { duration: 3000 });
      }
    );
  }

  filterSeances(evenementId: number): void {
    if (!evenementId) {
      this.filteredSeances = [];
      return;
    }
    
    this.filteredSeances = this.seances.filter(
      seance => seance.id_evenement === evenementId && seance.places_disponibles > 0
    );
  }

  onSeanceChange(billetIndex: number): void {
    const billetFormGroup = this.billets.at(billetIndex) as FormGroup;
    const seanceId = billetFormGroup.get('id_seance')?.value;
    const seance = this.seances.find(s => s.id === seanceId);
    
    if (seance && seance.evenement) {
      const prixStandard = seance.evenement.prix_standard;
      billetFormGroup.get('prix_standard')?.setValue(prixStandard);
      this.calculerPrixBillet(billetIndex);
    }
  }

  onTypeTarifChange(billetIndex: number): void {
    this.calculerPrixBillet(billetIndex);
  }

  calculerPrixBillet(billetIndex: number): void {
    const billetFormGroup = this.billets.at(billetIndex) as FormGroup;
    const prixStandard = billetFormGroup.get('prix_standard')?.value || 0;
    const typeTarif = billetFormGroup.get('type_tarif')?.value;
    
    let prixFinal = prixStandard;
    switch (typeTarif) {
      case 'REDUIT':
        prixFinal = prixStandard * 0.8; // 20% de réduction
        break;
      case 'ETUDIANT':
        prixFinal = prixStandard * 0.5; // 50% de réduction
        break;
      case 'SENIOR':
        prixFinal = prixStandard * 0.7; // 30% de réduction
        break;
      case 'GROUPE':
        prixFinal = prixStandard * 0.85; // 15% de réduction
        break;
      case 'VIP':
        prixFinal = prixStandard * 1.5; // 50% de supplément
        break;
      case 'LAST_MINUTE':
        prixFinal = prixStandard * 0.7; // 30% de réduction
        break;
    }
    
    billetFormGroup.get('prix_final')?.setValue(prixFinal);
    this.calculerMontantTotal();
  }

  calculerMontantTotal(): void {
    this.montantTotal = 0;
    for (let i = 0; i < this.billets.length; i++) {
      const billetFormGroup = this.billets.at(i) as FormGroup;
      const prixFinal = billetFormGroup.get('prix_final')?.value || 0;
      this.montantTotal += prixFinal;
    }
  }

  displayClient(client: Client): string {
    return client ? `${client.nom} ${client.prenom}` : '';
  }

  onClientSelected(event: any): void {
    const client = event.option.value;
    this.reservationForm.get('client_id')?.setValue(client.id);
  }

  private _filterClients(name: string): Client[] {
    const filterValue = name.toLowerCase();
    return this.clients.filter(client => 
      `${client.nom} ${client.prenom}`.toLowerCase().includes(filterValue)
    );
  }

  onSubmit(): void {
    if (this.reservationForm.invalid) {
      this.snackBar.open('Veuillez remplir correctement tous les champs obligatoires', 'Fermer', { duration: 3000 });
      return;
    }
    
    // Préparer les données à envoyer
    const reservationData = {
      id_client: this.reservationForm.get('client_id')?.value,
      billets: this.billets.value.map((billet: any) => ({
        id_seance: billet.id_seance,
        type_tarif: billet.type_tarif,
        prix_final: billet.prix_final
      }))
    };
    
    // Envoyer la réservation
    this.reservationService.createReservation(reservationData).subscribe(
      (data) => {
        this.snackBar.open('Réservation créée avec succès', 'Fermer', { duration: 3000 });
        this.router.navigate(['/reservations', data.id]);
      },
      (error) => {
        console.error('Erreur lors de la création de la réservation', error);
        this.snackBar.open(error.error.message || 'Erreur lors de la création de la réservation', 'Fermer', { duration: 3000 });
      }
    );
  }
}
