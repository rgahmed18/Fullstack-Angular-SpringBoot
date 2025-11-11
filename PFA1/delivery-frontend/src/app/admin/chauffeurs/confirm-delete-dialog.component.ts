import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDeleteDialogData {
  title: string;
  message: string;
  subtitle: string;
  chauffeur: any;
}

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-container">
      <!-- Header -->
      <div class="dialog-header">
        <div class="warning-icon">
          <mat-icon>warning</mat-icon>
        </div>
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>

      <!-- Content -->
      <div mat-dialog-content class="dialog-content">
        <!-- Chauffeur Info Card -->
        <div class="chauffeur-card">
          <div class="chauffeur-avatar">
            <mat-icon>person</mat-icon>
          </div>
          <div class="chauffeur-info">
            <h3>{{ data.chauffeur.prenom }} {{ data.chauffeur.nom }}</h3>
            <p class="chauffeur-details">
              <mat-icon>phone</mat-icon>
              {{ data.chauffeur.telephone }}
            </p>
            <p class="chauffeur-details">
              <mat-icon>email</mat-icon>
              {{ data.chauffeur.email }}
            </p>
          </div>
        </div>

        <!-- Warning Message -->
        <div class="warning-message">
          <p class="main-message">{{ data.message }}</p>
          <p class="subtitle-message">{{ data.subtitle }}</p>
        </div>

        <!-- Mission Statistics Warning -->
        <div class="mission-warning" *ngIf="data.chauffeur.missionCount > 0">
          <mat-icon>assignment_late</mat-icon>
          <div class="mission-stats">
            <p><strong>{{ data.chauffeur.missionCount }}</strong> missions associées</p>
            <p *ngIf="data.chauffeur.pendingMissionCount > 0" class="pending-missions">
              <mat-icon>schedule</mat-icon>
              <strong>{{ data.chauffeur.pendingMissionCount }}</strong> missions en attente
            </p>
            <p *ngIf="data.chauffeur.activeMissionCount > 0" class="active-missions">
              <mat-icon>warning</mat-icon>
              <strong>{{ data.chauffeur.activeMissionCount }}</strong> missions en cours
            </p>
          </div>
        </div>

        <!-- Active Missions Blocking Warning -->
        <div class="blocking-warning" *ngIf="data.chauffeur.activeMissionCount > 0">
          <div class="blocking-header">
            <mat-icon>block</mat-icon>
            <h4>Suppression Impossible</h4>
          </div>
          <p>Ce chauffeur ne peut pas être supprimé car il a <strong>{{ data.chauffeur.activeMissionCount }} missions en cours</strong>.</p>
          <div class="suggested-actions">
            <h5>Actions suggérées :</h5>
            <ul>
              <li>Attendez que les missions en cours soient terminées</li>
              <li>Réassignez les missions à un autre chauffeur</li>
              <li>Contactez le chauffeur pour terminer ses missions</li>
            </ul>
          </div>
        </div>

        <!-- Pending Missions Info -->
        <div class="pending-info" *ngIf="data.chauffeur.pendingMissionCount > 0 && data.chauffeur.activeMissionCount === 0">
          <div class="pending-header">
            <mat-icon>info</mat-icon>
            <h4>Missions en Attente</h4>
          </div>
          <p>Ce chauffeur a <strong>{{ data.chauffeur.pendingMissionCount }} missions en attente</strong>. Ces missions seront automatiquement réassignées lors de la suppression.</p>
        </div>
      </div>

      <!-- Actions -->
      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()" class="cancel-button">
          <mat-icon>close</mat-icon>
          Fermer
        </button>
        <button 
          mat-raised-button 
          [color]="data.chauffeur.activeMissionCount > 0 ? 'primary' : 'warn'" 
          (click)="onConfirm()" 
          [disabled]="data.chauffeur.activeMissionCount > 0"
          class="delete-button"
          [ngClass]="{'disabled-button': data.chauffeur.activeMissionCount > 0}">
          <mat-icon>{{ data.chauffeur.activeMissionCount > 0 ? 'assignment' : 'delete_forever' }}</mat-icon>
          {{ data.chauffeur.activeMissionCount > 0 ? 'Voir les Missions Actives' : 'Supprimer Définitivement' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 0;
      overflow: hidden;
      border-radius: 16px;
    }

    .dialog-header {
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 1px solid #fecaca;
    }

    .warning-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .warning-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    h2 {
      margin: 0;
      color: #7f1d1d;
      font-weight: 600;
      font-size: 20px;
    }

    .dialog-content {
      padding: 24px;
      background: #ffffff;
    }

    .chauffeur-card {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }

    .chauffeur-avatar {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #3b82f6 0%, #628B18 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .chauffeur-avatar mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .chauffeur-info h3 {
      margin: 0 0 8px 0;
      color: #1e293b;
      font-weight: 600;
      font-size: 18px;
    }

    .chauffeur-details {
      margin: 4px 0;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #64748b;
      font-size: 14px;
    }

    .chauffeur-details mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .warning-message {
      margin-bottom: 20px;
    }

    .main-message {
      font-size: 16px;
      color: #374151;
      margin: 0 0 8px 0;
      font-weight: 500;
    }

    .subtitle-message {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    .mission-warning {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-top: 16px;
    }

    .mission-warning > mat-icon {
      color: #d97706;
      margin-top: 2px;
    }

    .mission-stats p {
      margin: 4px 0;
      color: #92400e;
      font-weight: 500;
    }

    .active-missions {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #dc2626 !important;
    }

    .active-missions mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .pending-missions {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #d97706 !important;
    }

    .pending-missions mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .pending-info {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 2px solid #0ea5e9;
      border-radius: 12px;
      padding: 20px;
      margin-top: 16px;
    }

    .pending-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .pending-header mat-icon {
      color: #0284c7;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .pending-header h4 {
      margin: 0;
      color: #0c4a6e;
      font-weight: 600;
      font-size: 16px;
    }

    .pending-info p {
      color: #0369a1;
      margin: 0;
      font-weight: 500;
    }

    .blocking-warning {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border: 2px solid #ef4444;
      border-radius: 12px;
      padding: 20px;
      margin-top: 16px;
    }

    .blocking-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .blocking-header mat-icon {
      color: #dc2626;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .blocking-header h4 {
      margin: 0;
      color: #7f1d1d;
      font-weight: 600;
      font-size: 16px;
    }

    .blocking-warning p {
      color: #991b1b;
      margin: 0 0 16px 0;
      font-weight: 500;
    }

    .suggested-actions h5 {
      color: #7f1d1d;
      margin: 0 0 8px 0;
      font-weight: 600;
      font-size: 14px;
    }

    .suggested-actions ul {
      margin: 0;
      padding-left: 20px;
      color: #991b1b;
    }

    .suggested-actions li {
      margin: 4px 0;
      font-size: 14px;
    }

    .dialog-actions {
      padding: 16px 24px 24px 24px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .cancel-button {
      background: #ffffff;
      border: 1px solid #d1d5db;
      color: #374151;
      border-radius: 8px;
      padding: 8px 20px;
      transition: all 0.2s ease;
    }

    .cancel-button:hover {
      background: #f9fafb;
      border-color: #9ca3af;
      transform: translateY(-1px);
    }

    .delete-button {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 20px;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      transition: all 0.2s ease;
    }

    .delete-button:hover {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
    }

    .delete-button mat-icon {
      margin-right: 8px;
    }

    .cancel-button mat-icon {
      margin-right: 8px;
    }

    .disabled-button {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
      color: white !important;
      cursor: not-allowed !important;
      opacity: 0.8;
    }

    .disabled-button:hover {
      transform: none !important;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
    }
  `]
})
export class ConfirmDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDeleteDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
