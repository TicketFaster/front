import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EvenementService } from '../evenements/services/evenement.service';
import { ReservationService } from '../reservations/services/reservation.service';
import { Evenement } from '../../shared/models/evenement.model';
import { RapportVentes } from '../../shared/models/reservation.model';
import { SeanceService } from '../seances/services/seance.service';
import { Seance } from '../../shared/models/seance.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  evenements: Evenement[] = [];
  prochainesSeances: Seance[] = [];
  rapportVentes: RapportVentes[] = [];
  
  periodeForm: FormGroup;
  
  // Pour les graphiques
  ventesParlEventChart: any = {
    data: [],
    labels: []
  };
  
  tauxRemplissageChart: any = {
    data: [],
    labels: []
  };

  constructor(
    private fb: FormBuilder,
    private evenementService: EvenementService,
    private reservationService: ReservationService,
    private seanceService: SeanceService
  ) {
    // Initialiser le formulaire
    this.periodeForm = this.fb.group({
      dateDebut: [this.getFirstDayOfMonth()],
      dateFin: [new Date()]
    });
  }

  ngOnInit(): void {
    this.loadEvenements();
    this.loadProchainesSeances();
    this.generateRapport();
  }

  loadEvenements(): void {
    this.evenementService.getAllEvenements().subscribe(
      (data) => {
        this.evenements = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des événements', error);
      }
    );
  }

  loadProchainesSeances(): void {
    this.seanceService.getProchainesSeances().subscribe(
      (data) => {
        this.prochainesSeances = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des prochaines séances', error);
      }
    );
  }

  generateRapport(): void {
    const dateDebut = this.formatDate(this.periodeForm.get('dateDebut')?.value);
    const dateFin = this.formatDate(this.periodeForm.get('dateFin')?.value);
    
    this.reservationService.generateSalesReport(dateDebut, dateFin).subscribe(
      (data) => {
        this.rapportVentes = data;
        this.prepareChartData();
      },
      (error) => {
        console.error('Erreur lors de la génération du rapport', error);
      }
    );
  }

  prepareChartData(): void {
    // Préparer les données pour le graphique des ventes par événement
    const ventesParEvenement = this.rapportVentes.reduce((acc, item) => {
      if (!acc[item.evenement]) {
        acc[item.evenement] = 0;
      }
      acc[item.evenement] += item.montant_total;
      return acc;
    }, {} as {[key: string]: number});
    
    this.ventesParlEventChart.labels = Object.keys(ventesParEvenement);
    this.ventesParlEventChart.data = Object.values(ventesParEvenement);
    
    // Préparer les données pour le graphique des taux de remplissage
    const tauxRemplissageParEvenement = this.rapportVentes.reduce((acc, item) => {
      if (!acc[item.evenement]) {
        acc[item.evenement] = [];
      }
      acc[item.evenement].push(item.taux_remplissage);
      return acc;
    }, {} as {[key: string]: number[]});
    
    this.tauxRemplissageChart.labels = Object.keys(tauxRemplissageParEvenement);
    this.tauxRemplissageChart.data = Object.keys(tauxRemplissageParEvenement).map(key => {
      const taux = tauxRemplissageParEvenement[key];
      return taux.reduce((sum, val) => sum + val, 0) / taux.length;
    });
  }

  getFirstDayOfMonth(): Date {
    const date = new Date();
    date.setDate(1);
    return date;
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }
}
