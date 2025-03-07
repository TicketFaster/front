import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { RapportService } from '../services/rapport.service';
import { RapportVentes, VenteParCategorie, VenteParTypeTarif } from '../../../shared/models/rapport.model';

@Component({
  selector: 'app-rapport-ventes',
  templateUrl: './rapport-ventes.component.html',
  styleUrls: ['./rapport-ventes.component.scss']
})
export class RapportVentesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  periodeForm: FormGroup;
  
  rapportData: RapportVentes[] = [];
  ventesParCategorie: VenteParCategorie[] = [];
  ventesParTarif: VenteParTypeTarif[] = [];
  
  dataSource: MatTableDataSource<RapportVentes> = new MatTableDataSource<RapportVentes>([]);
  displayedColumns: string[] = ['evenement', 'date_heure', 'nombre_billets', 'montant_total', 'taux_remplissage'];
  
  loading: boolean = false;
  error: string | null = null;
  
  // Récapitulatif
  totalBillets: number = 0;
  totalMontant: number = 0;
  tauxMoyen: number = 0;
  
  // Charts
  public categorieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Ventes par catégorie'
      }
    }
  };
  
  public categorieChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Montant des ventes' }
    ]
  };
  
  public categorieChartType: ChartType = 'bar';
  
  public tarifChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right',
      },
      title: {
        display: true,
        text: 'Répartition des types de tarifs'
      }
    }
  };
  
  public tarifChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [
      { data: [], backgroundColor: [] }
    ]
  };
  
  public tarifChartType: ChartType = 'pie';

  constructor(
    private fb: FormBuilder,
    private rapportService: RapportService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {
    // Initialiser le formulaire avec le premier jour du mois et aujourd'hui
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    this.periodeForm = this.fb.group({
      dateDebut: [firstDay],
      dateFin: [today]
    });
  }

  ngOnInit(): void {
    this.genererRapport();
  }

  genererRapport(): void {
    if (this.periodeForm.invalid) {
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    const dateDebut = this.formatDate(this.periodeForm.get('dateDebut')?.value);
    const dateFin = this.formatDate(this.periodeForm.get('dateFin')?.value);
    
    // Génération du rapport principal
    this.rapportService.genererRapportVentes(dateDebut, dateFin).subscribe({
      next: (data) => {
        this.rapportData = data;
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        
        // Calculer le récapitulatif
        this.calculerRecapitulatif();
        
        // Charger les données supplémentaires pour les graphiques
        this.chargerVentesParCategorie(dateDebut, dateFin);
        this.chargerVentesParTarif(dateDebut, dateFin);
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de la génération du rapport';
        this.loading = false;
        this.snackBar.open('Erreur lors de la génération du rapport', 'Fermer', { duration: 3000 });
        console.error('Erreur lors de la génération du rapport', err);
      }
    });
  }

  chargerVentesParCategorie(dateDebut: string, dateFin: string): void {
    this.rapportService.getVentesParCategorie(dateDebut, dateFin).subscribe({
      next: (data) => {
        this.ventesParCategorie = data;
        
        // Mettre à jour le graphique
        this.categorieChartData.labels = data.map(item => item.categorie || 'Non catégorisé');
        this.categorieChartData.datasets[0].data = data.map(item => item.montant_total);
        
        if (this.chart) {
          this.chart.update();
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des ventes par catégorie', err);
      }
    });
  }

  chargerVentesParTarif(dateDebut: string, dateFin: string): void {
    this.rapportService.getVentesParTypeTarif(dateDebut, dateFin).subscribe({
      next: (data) => {
        this.ventesParTarif = data;
        
        // Générer des couleurs
        const colors = this.generateColors(data.length);
        
        // Mettre à jour le graphique
        this.tarifChartData.labels = data.map(item => item.type_tarif);
        this.tarifChartData.datasets[0].data = data.map(item => item.pourcentage);
        this.tarifChartData.datasets[0].backgroundColor = colors;
        
        if (this.chart) {
          this.chart.update();
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des ventes par type de tarif', err);
      }
    });
  }

  calculerRecapitulatif(): void {
    this.totalBillets = this.rapportData.reduce((sum, item) => sum + item.nombre_billets, 0);
    this.totalMontant = this.rapportData.reduce((sum, item) => sum + item.montant_total, 0);
    
    if (this.rapportData.length > 0) {
      this.tauxMoyen = this.rapportData.reduce((sum, item) => sum + item.taux_remplissage, 0) / this.rapportData.length;
    } else {
      this.tauxMoyen = 0;
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getTauxRemplissageClass(taux: number): string {
    if (taux >= 90) return 'taux-eleve';
    if (taux >= 60) return 'taux-moyen';
    return 'taux-faible';
  }

  exportCsv(): void {
    if (!this.rapportData || this.rapportData.length === 0) {
      this.snackBar.open('Aucune donnée à exporter', 'Fermer', { duration: 3000 });
      return;
    }
    
    // Préparer les en-têtes et les données
    const headers = ['Événement', 'Date et heure', 'Nombre de billets', 'Montant total', 'Taux de remplissage'];
    const data = this.rapportData.map(item => [
      item.evenement,
      this.datePipe.transform(item.date_heure, 'dd/MM/yyyy HH:mm') || '',
      item.nombre_billets.toString(),
      item.montant_total.toFixed(2),
      `${item.taux_remplissage.toFixed(2)}%`
    ]);
    
    // Ajouter une ligne pour le récapitulatif
    data.push([]);
    data.push(['Récapitulatif', '', '', '', '']);
    data.push(['Total billets', '', this.totalBillets.toString(), '', '']);
    data.push(['Total montant', '', '', this.totalMontant.toFixed(2), '']);
    data.push(['Taux moyen', '', '', '', `${this.tauxMoyen.toFixed(2)}%`]);
    
    // Générer le CSV
    let csv = '';
    csv += headers.join(';') + '\n';
    data.forEach(row => {
      csv += row.join(';') + '\n';
    });
    
    // Télécharger le fichier
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `rapport_ventes_${this.formatDateFilename(new Date())}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  private formatDateFilename(date: Date): string {
    if (!date) return '';
    return this.datePipe.transform(date, 'yyyyMMdd_HHmmss') || '';
  }

  private generateColors(count: number): string[] {
    const colors = [];
    const hueStep = 360 / count;
    
    for (let i = 0; i < count; i++) {
      const hue = i * hueStep;
      colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    
    return colors;
  }
}
