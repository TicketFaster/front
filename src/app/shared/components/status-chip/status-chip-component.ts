import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-status-chip',
  templateUrl: './status-chip.component.html',
  styleUrls: ['./status-chip.component.scss']
})
export class StatusChipComponent implements OnInit {
  @Input() status: string = '';
  @Input() type: 'reservation' | 'billet' = 'reservation';
  
  statusClass: string = '';
  statusLabel: string = '';

  ngOnInit(): void {
    this.setStatusProperties();
  }

  private setStatusProperties(): void {
    if (this.type === 'reservation') {
      this.setReservationStatusProperties();
    } else if (this.type === 'billet') {
      this.setBilletStatusProperties();
    }
  }

  private setReservationStatusProperties(): void {
    switch (this.status) {
      case 'PAYE':
        this.statusClass = 'status-success';
        this.statusLabel = 'Payé';
        break;
      case 'EN_ATTENTE':
        this.statusClass = 'status-warning';
        this.statusLabel = 'En attente';
        break;
      case 'ANNULE':
        this.statusClass = 'status-danger';
        this.statusLabel = 'Annulé';
        break;
      case 'REMBOURSE':
        this.statusClass = 'status-info';
        this.statusLabel = 'Remboursé';
        break;
      default:
        this.statusClass = 'status-default';
        this.statusLabel = this.status || 'Inconnu';
    }
  }

  private setBilletStatusProperties(): void {
    switch (this.status) {
      case 'VALIDE':
        this.statusClass = 'status-success';
        this.statusLabel = 'Valide';
        break;
      case 'UTILISE':
        this.statusClass = 'status-info';
        this.statusLabel = 'Utilisé';
        break;
      case 'ANNULE':
        this.statusClass = 'status-danger';
        this.statusLabel = 'Annulé';
        break;
      default:
        this.statusClass = 'status-default';
        this.statusLabel = this.status || 'Inconnu';
    }
  }
}
