import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { DashboardService, MissionResponseDTO } from '../../core/services/dashboard.service';

export interface ReassignMissionData {
  mission: MissionResponseDTO;
}

export interface ChauffeurOption {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  actif: boolean;
  vehiculeInfo?: string;
}

@Component({
  selector: 'app-reassign-mission-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <mat-icon class="reassign-icon">assignment_ind</mat-icon>
        <h2>Affecter un Nouveau Chauffeur</h2>
      </div>

      <div class="dialog-content">
        <div class="mission-info">
          <h3>Mission #{{ data.mission.id }}</h3>
          <p><strong>Destination:</strong> {{ data.mission.destination }}</p>
          <p><strong>Départ:</strong> {{ data.mission.depart }}</p>
          <p><strong>Date:</strong> {{ formatDate(data.mission.dateHeure) }}</p>
          
          <div class="problem-section" *ngIf="data.mission.probleme">
            <mat-icon class="problem-icon">report_problem</mat-icon>
            <div>
              <strong>Problème signalé:</strong>
              <p class="problem-text">{{ data.mission.probleme }}</p>
            </div>
          </div>
        </div>

        <mat-form-field class="full-width">
          <mat-label>Sélectionner un chauffeur</mat-label>
          <mat-select [(value)]="selectedChauffeurId" [disabled]="loading">
            <mat-option *ngFor="let chauffeur of getActiveChauffeurs()" [value]="chauffeur.id">
              {{ chauffeur.nom }} {{ chauffeur.prenom }}
              <span class="phone-info"> - {{ chauffeur.telephone }}</span>
              <span *ngIf="chauffeur.vehiculeInfo" class="vehicle-info"> ({{ chauffeur.vehiculeInfo }})</span>
            </mat-option>
          </mat-select>
        </mat-form-field>

        <div *ngIf="loading" class="loading-section">
          <mat-spinner diameter="30"></mat-spinner>
          <p>Chargement des chauffeurs disponibles...</p>
        </div>
      </div>

      <div class="dialog-actions">
        <button mat-stroked-button (click)="onCancel()" [disabled]="loading">
          <mat-icon>close</mat-icon>
          Annuler
        </button>
        <button mat-raised-button color="primary" (click)="onConfirm()" 
                [disabled]="!selectedChauffeurId || loading">
          <mat-icon>assignment_turned_in</mat-icon>
          Affecter
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 500px;
      max-width: 600px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(0,0,0,0.12);
    }

    .reassign-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      background: #2196f3;
    }

    .dialog-header h2 {
      margin: 0;
      font-weight: 500;
      color: #333;
    }

    .dialog-content {
      padding: 0;
    }

    .mission-info {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .mission-info h3 {
      margin: 0 0 12px 0;
      color: #2196f3;
      font-weight: 600;
    }

    .mission-info p {
      margin: 8px 0;
      color: #555;
    }

    .problem-section {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-top: 16px;
      padding: 12px;
      background: #fff3e0;
      border-radius: 6px;
      border-left: 4px solid #ff9800;
    }

    .problem-icon {
      color: #ff9800;
      margin-top: 2px;
    }

    .problem-text {
      font-style: italic;
      color: #666;
      margin: 4px 0 0 0;
    }

    .full-width {
      width: 100%;
    }

    .phone-info {
      color: #666;
      font-size: 0.9em;
    }

    .vehicle-info {
      color: #2196f3;
      font-size: 0.85em;
      font-style: italic;
    }

    .loading-section {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      justify-content: center;
    }

    .loading-section p {
      margin: 0;
      color: #666;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid rgba(0,0,0,0.12);
    }

    .dialog-actions button {
      min-width: 120px;
    }

    .dialog-actions mat-icon {
      margin-right: 8px;
    }
  `]
})
export class ReassignMissionDialogComponent implements OnInit {
  availableChauffeurs: ChauffeurOption[] = [];
  selectedChauffeurId: number | null = null;
  loading = true;

  constructor(
    public dialogRef: MatDialogRef<ReassignMissionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReassignMissionData,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadAvailableChauffeurs();
  }

  loadAvailableChauffeurs(): void {
    this.loading = true;
    this.dashboardService.getAvailableDrivers().subscribe({
      next: (chauffeurs) => {
        this.availableChauffeurs = chauffeurs;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading drivers:', error);
        this.loading = false;
      }
    });
  }

  getActiveChauffeurs(): ChauffeurOption[] {
    return this.availableChauffeurs.filter(chauffeur => chauffeur.actif);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.selectedChauffeurId) {
      this.dialogRef.close({
        confirmed: true,
        chauffeurId: this.selectedChauffeurId
      });
    }
  }
}
