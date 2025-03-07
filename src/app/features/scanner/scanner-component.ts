import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScannerService } from './services/scanner.service';
import { EvenementService } from '../evenements/services/evenement.service';
import { Evenement } from '../../shared/models/evenement.model';
import { BilletScanResult } from '../../shared/models/scanner.model';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.scss']
})
export class ScannerComponent implements OnInit {
  scanForm: FormGroup;
  scanResult: BilletScanResult | null = null;
  loading: boolean = false;
  submitting: boolean = false;
  evenements: Evenement[] = [];
  selectedEventId: number | null = null;
  stats: any = null;
  
  @ViewChild('codeBarreInput') codeBarreInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private scannerService: ScannerService,
    private evenementService: EvenementService,
    private snackBar: MatSnackBar
  ) {
    this.scanForm = this.fb.group({
      codeBarres: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEvenements();
    this.loadStats();
  }

  loadEvenements(): void {
    this.evenementService.getAllEvenements().subscribe({
      next: (evenements) => {
        this.evenements = evenements;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des événements', error);
      }
    });
  }

  loadStats(): void {
    this.loading = true;
    this.scannerService.getUsageStats(this.selectedEventId).subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur lors du chargement des statistiques', error);
      }
    });
  }

  onEventChange(): void {
    this.loadStats();
  }

  onScan(): void {
    if (this.scanForm.invalid) {
      return;
    }

    const codeBarres = this.scanForm.get('codeBarres')?.value;
    this.submitting = true;

    this.scannerService.validateBillet(codeBarres).subscribe({
      next: (result) => {
        this.scanResult = result;
        this.submitting = false;
        
        // Réinitialiser le formulaire et mettre le focus sur l'input
        this.scanForm.reset();
        setTimeout(() => {
          if (this.codeBarreInput) {
            this.codeBarreInput.nativeElement.focus();
          }
        });
        
        // Son de notification
        this.playSound(result.valid);
        
        // Recharger les statistiques
        this.loadStats();
      },
      error: (error) => {
        this.submitting = false;
        this.snackBar.open('Erreur lors de la validation du billet', 'Fermer', { duration: 3000 });
        console.error('Erreur lors de la validation du billet', error);
      }
    });
  }

  markAsUsed(): void {
    if (!this.scanResult || !this.scanResult.billet) {
      return;
    }

    this.submitting = true;
    this.scannerService.markBilletAsUsed(this.scanResult.billet.id).subscribe({
      next: () => {
        this.snackBar.open('Billet marqué comme utilisé avec succès', 'Fermer', { duration: 3000 });
        this.scanResult.valid = false;
        this.scanResult.message = 'Ce billet a été marqué comme utilisé';
        this.submitting = false;
        
        // Recharger les statistiques
        this.loadStats();
      },
      error: (error) => {
        this.submitting = false;
        this.snackBar.open('Erreur lors du marquage du billet comme utilisé', 'Fermer', { duration: 3000 });
        console.error('Erreur lors du marquage du billet comme utilisé', error);
      }
    });
  }

  resetScan(): void {
    this.scanResult = null;
    this.scanForm.reset();
    
    setTimeout(() => {
      if (this.codeBarreInput) {
        this.codeBarreInput.nativeElement.focus();
      }
    });
  }

  private playSound(valid: boolean): void {
    const audio = new Audio();
    audio.src = valid 
      ? 'assets/sounds/success.mp3' 
      : 'assets/sounds/error.mp3';
    audio.load();
    audio.play();
  }
}
