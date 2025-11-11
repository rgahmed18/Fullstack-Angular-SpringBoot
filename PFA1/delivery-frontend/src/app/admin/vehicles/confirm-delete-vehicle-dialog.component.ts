import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

export interface DeleteVehicleDialogData {
  vehicle: {
    id: number;
    immatriculation: string;
    marque: string;
    modele: string;
    chauffeur?: {
      nom: string;
      prenom: string;
    };
    isInActiveMission?: boolean;
    currentMissionStatus?: string;
  };
}

@Component({
  selector: 'app-confirm-delete-vehicle-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <div class="delete-dialog">
      <div class="dialog-header">
        <mat-icon class="warning-icon">warning</mat-icon>
        <h2 mat-dialog-title>Confirmer la suppression</h2>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <div class="vehicle-info">
          <div class="vehicle-details">
            <mat-icon class="vehicle-icon">directions_car</mat-icon>
            <div class="details">
              <h3>{{ data.vehicle.marque }} {{ data.vehicle.modele }}</h3>
              <p class="vehicle-plate">{{ data.vehicle.immatriculation }}</p>
              <p class="vehicle-id">ID: #{{ data.vehicle.id }}</p>
            </div>
          </div>
          
          <!-- Chauffeur Assignment Warning -->
          <div *ngIf="data.vehicle.chauffeur" class="assignment-section">
            <mat-icon class="person-icon">person</mat-icon>
            <div class="assignment-text">
              <strong>Assigné à :</strong>
              <p>{{ data.vehicle.chauffeur.prenom }} {{ data.vehicle.chauffeur.nom }}</p>
            </div>
          </div>
          
          <!-- Active Mission Warning -->
          <div *ngIf="data.vehicle.isInActiveMission" class="warning-section">
            <mat-icon class="alert-icon">error</mat-icon>
            <div class="warning-text">
              <strong>Attention !</strong>
              <p>Ce véhicule est actuellement utilisé dans une mission active 
                 <mat-chip class="status-chip" color="warn">
                   {{ getMissionStatusLabel() }}
                 </mat-chip>
              </p>
              <p class="warning-note">La suppression pourrait affecter cette mission.</p>
            </div>
          </div>
        </div>
        
        <div class="confirmation-text">
          <p><strong>Êtes-vous sûr de vouloir supprimer ce véhicule ?</strong></p>
          <p class="warning-note">Cette action est irréversible et supprimera définitivement le véhicule du système.</p>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()" class="cancel-btn">
          <mat-icon>close</mat-icon>
          Annuler
        </button>
        <button mat-raised-button color="warn" (click)="onConfirm()" class="delete-btn">
          <mat-icon>delete</mat-icon>
          Supprimer
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .delete-dialog {
      min-width: 480px;
      max-width: 600px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding: 0 24px;
      padding-top: 24px;
    }

    .warning-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #f59e0b;
    }

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #1e293b;
    }

    .dialog-content {
      padding: 0 24px;
      margin-bottom: 24px;
    }

    .vehicle-info {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      border: 1px solid #e2e8f0;
    }

    .vehicle-details {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .vehicle-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #8b5cf6;
      background: rgba(139, 92, 246, 0.1);
      border-radius: 50%;
      padding: 8px;
    }

    .details h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
    }

    .vehicle-plate {
      margin: 4px 0;
      font-size: 16px;
      color: #3b82f6;
      font-family: monospace;
      font-weight: 600;
      background: rgba(59, 130, 246, 0.1);
      padding: 4px 8px;
      border-radius: 6px;
      display: inline-block;
    }

    .vehicle-id {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: #64748b;
      font-family: monospace;
    }

    .assignment-section {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
    }

    .person-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #3b82f6;
      flex-shrink: 0;
    }

    .assignment-text strong {
      color: #1e40af;
      font-weight: 600;
    }

    .assignment-text p {
      margin: 4px 0 0 0;
      color: #1e40af;
      font-weight: 500;
    }

    .warning-section {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      padding: 16px;
    }

    .alert-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #ef4444;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .warning-text strong {
      color: #dc2626;
      font-weight: 600;
    }

    .warning-text p {
      margin: 4px 0;
      color: #7f1d1d;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-chip {
      font-size: 12px;
      height: 24px;
    }

    .confirmation-text {
      text-align: center;
    }

    .confirmation-text p {
      margin: 8px 0;
      color: #374151;
    }

    .warning-note {
      font-size: 14px;
      color: #6b7280;
      font-style: italic;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 0 24px 24px 24px;
      margin: 0;
    }

    .cancel-btn {
      color: #64748b;
      border: 1px solid #e2e8f0;
    }

    .cancel-btn:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .delete-btn {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .delete-btn:hover {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
    }

    .cancel-btn mat-icon,
    .delete-btn mat-icon {
      margin-right: 8px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class ConfirmDeleteVehicleDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteVehicleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteVehicleDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  getMissionStatusLabel(): string {
    switch (this.data.vehicle.currentMissionStatus) {
      case 'COMMENCEE': return 'Commencée';
      case 'EN_COURS': return 'En cours';
      default: return 'Active';
    }
  }
}
