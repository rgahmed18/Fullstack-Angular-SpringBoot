import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService, DemandeConge } from '../../../core/services/admin.service';

@Component({
  selector: 'app-demandes-conge',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="demandes-container">
      <div class="header">
        <div class="header-content">
          <div class="title-row">
            <button mat-icon-button routerLink="/admin/dashboard" class="back-btn" matTooltip="Retour au tableau de bord">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <mat-icon class="header-icon">free_breakfast</mat-icon>
            <h2>Demandes de Congé</h2>
          </div>
          <p>Gérer les demandes d'indisponibilité des chauffeurs</p>
        </div>
      </div>

      <div class="content" *ngIf="!loading; else loadingTemplate">
        <div class="demandes-grid" *ngIf="demandes.length > 0; else emptyState">
          <mat-card class="demande-card" *ngFor="let demande of demandes">
            <mat-card-header>
              <div class="card-header">
                <div class="chauffeur-info">
                  <div class="chauffeur-avatar">
                    <mat-icon>person</mat-icon>
                  </div>
                  <div class="chauffeur-details">
                    <h3>{{ demande.chauffeurNom }} {{ demande.chauffeurPrenom }}</h3>
                    <p>{{ demande.chauffeurTelephone }}</p>
                  </div>
                </div>
                <mat-chip class="type-chip" [ngClass]="getTypeClass(demande.type)">
                  <mat-icon>{{ getTypeIcon(demande.type) }}</mat-icon>
                  {{ getTypeLabel(demande.type) }}
                </mat-chip>
              </div>
            </mat-card-header>

            <mat-card-content>
              <div class="demande-details">
                <div class="date-range">
                  <div class="date-item">
                    <mat-icon>event</mat-icon>
                    <div>
                      <span class="label">Du</span>
                      <span class="date">{{ formatDate(demande.dateDebut) }}</span>
                    </div>
                  </div>
                  <div class="arrow">
                    <mat-icon>arrow_forward</mat-icon>
                  </div>
                  <div class="date-item">
                    <mat-icon>event</mat-icon>
                    <div>
                      <span class="label">Au</span>
                      <span class="date">{{ formatDate(demande.dateFin) }}</span>
                    </div>
                  </div>
                </div>

                <div class="raison-section" *ngIf="demande.raison">
                  <mat-icon>description</mat-icon>
                  <div>
                    <span class="label">Raison:</span>
                    <p class="raison-text">{{ demande.raison }}</p>
                  </div>
                </div>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button mat-raised-button color="primary" 
                      (click)="accepterDemande(demande)"
                      [disabled]="processing">
                <mat-icon>check</mat-icon>
                Accepter
              </button>
              <button mat-raised-button color="warn" 
                      (click)="refuserDemande(demande)"
                      [disabled]="processing">
                <mat-icon>close</mat-icon>
                Refuser
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <ng-template #emptyState>
          <div class="empty-state">
            <mat-icon>free_breakfast</mat-icon>
            <h3>Aucune demande de congé</h3>
            <p>Il n'y a actuellement aucune demande de congé en attente.</p>
          </div>
        </ng-template>
      </div>

      <ng-template #loadingTemplate>
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Chargement des demandes de congé...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .demandes-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
      background: #f5f5f5;
      min-height: 100vh;
    }

    .back-navigation {
      margin-bottom: 16px;
    }

    .back-btn {
      background: rgba(98, 139, 24, 0.1);
      color: #628B18;
      transition: all 0.3s ease;
    }

    .back-btn:hover {
      background: rgba(98, 139, 24, 0.2);
      transform: translateX(-2px);
    }

    .back-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .header {
      background: linear-gradient(135deg, #2d2f36 0%, #57751e 100%);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 32px;
      color: white;
    }

    .header-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .title-row h2 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }

    .back-btn {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      transition: all 0.3s ease;
    }

    .back-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateX(-2px);
    }

    .back-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .header-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-content p {
      margin: 0;
      opacity: 0.9;
      font-size: 16px;
    }

    .demandes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
    }

    .demande-card {
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .demande-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .chauffeur-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .chauffeur-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .chauffeur-details h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }

    .chauffeur-details p {
      margin: 4px 0 0 0;
      color: #6b7280;
      font-size: 14px;
    }

    .type-chip {
      font-weight: 500;
    }

    .type-chip.annual {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
    }

    .type-chip.sick {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .type-chip.personal {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    .type-chip.emergency {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    .type-chip.other {
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
    }

    .demande-details {
      margin-top: 16px;
    }

    .date-range {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 12px;
    }

    .date-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .date-item mat-icon {
      color: #3b82f6;
    }

    .date-item .label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      font-weight: 600;
    }

    .date-item .date {
      font-size: 14px;
      color: #1f2937;
      font-weight: 500;
    }

    .arrow mat-icon {
      color: #9ca3af;
    }

    .raison-section {
      display: flex;
      gap: 12px;
      padding: 16px;
      background: #fef3c7;
      border-radius: 12px;
      border-left: 4px solid #f59e0b;
    }

    .raison-section mat-icon {
      color: #f59e0b;
      margin-top: 2px;
    }

    .raison-section .label {
      font-size: 12px;
      color: #92400e;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .raison-text {
      margin: 0;
      color: #78350f;
      font-size: 14px;
      line-height: 1.5;
    }

    mat-card-actions {
      display: flex;
      gap: 12px;
      padding: 16px 24px;
      background: #f9fafb;
    }

    mat-card-actions button {
      flex: 1;
      border-radius: 8px;
      font-weight: 500;
    }

    .empty-state {
      text-align: center;
      padding: 64px 32px;
      color: #6b7280;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      color: #374151;
    }

    .empty-state p {
      margin: 0;
      font-size: 16px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px;
      gap: 16px;
    }

    .loading-container p {
      color: #6b7280;
      margin: 0;
    }

    @media (max-width: 768px) {
      .demandes-container {
        padding: 16px;
      }

      .demandes-grid {
        grid-template-columns: 1fr;
      }

      .date-range {
        flex-direction: column;
        gap: 12px;
      }

      .arrow {
        transform: rotate(90deg);
      }

      mat-card-actions {
        flex-direction: column;
      }

      mat-card-actions button {
        width: 100%;
      }
    }
  `]
})
export class DemandesCongeComponent implements OnInit {
  demandes: DemandeConge[] = [];
  loading = false;
  processing = false;

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.loading = true;
    this.adminService.getDemandesConge().subscribe({
      next: (demandes) => {
        // Filter only pending requests (in case backend returns all)
        this.demandes = demandes.filter((d: DemandeConge) => d.statut === 'EN_ATTENTE' || (!d.statut && !d.acceptee));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading leave requests:', error);
        this.snackBar.open('Erreur lors du chargement des demandes', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  getStatusLabel(demande: DemandeConge): string {
    if (demande.statut) {
      switch (demande.statut) {
        case 'EN_ATTENTE': return 'En attente';
        case 'ACCEPTEE': return 'Acceptée';
        case 'REFUSEE': return 'Refusée';
        default: return 'En attente';
      }
    }
    // Fallback for old records without statut field
    return demande.acceptee ? 'Acceptée' : 'En attente';
  }

  getStatusClass(demande: DemandeConge): string {
    if (demande.statut) {
      switch (demande.statut) {
        case 'EN_ATTENTE': return 'status-pending';
        case 'ACCEPTEE': return 'status-accepted';
        case 'REFUSEE': return 'status-refused';
        default: return 'status-pending';
      }
    }
    return demande.acceptee ? 'status-accepted' : 'status-pending';
  }

  accepterDemande(demande: DemandeConge): void {
    this.processing = true;
    this.adminService.accepterDemandeConge(demande.id).subscribe({
      next: () => {
        this.snackBar.open('Demande de congé acceptée', 'Fermer', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.loadDemandes();
        this.processing = false;
      },
      error: (error) => {
        console.error('Error accepting leave request:', error);
        this.snackBar.open('Erreur lors de l\'acceptation', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.processing = false;
      }
    });
  }

  refuserDemande(demande: DemandeConge): void {
    const dialogRef = this.dialog.open(RefusDialogComponent, {
      width: '400px',
      data: { 
        chauffeur: {
          id: demande.chauffeurId,
          nom: demande.chauffeurNom,
          prenom: demande.chauffeurPrenom,
          telephone: demande.chauffeurTelephone
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.processing = true;
        this.adminService.refuserDemandeConge(demande.id, result.raison).subscribe({
          next: () => {
            this.snackBar.open('Demande de congé refusée', 'Fermer', {
              duration: 5000,
              panelClass: ['success-snackbar']
            });
            this.loadDemandes();
            this.processing = false;
          },
          error: (error) => {
            console.error('Error refusing leave request:', error);
            this.snackBar.open('Erreur lors du refus', 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.processing = false;
          }
        });
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getTypeLabel(type: string): string {
    const typeLabels: { [key: string]: string } = {
      'CONGE_ANNUEL': 'Congé annuel',
      'CONGE_MALADIE': 'Congé maladie',
      'CONGE_PERSONNEL': 'Congé personnel',
      'CONGE_URGENCE': 'Congé d\'urgence',
      'AUTRE': 'Autre'
    };
    return typeLabels[type] || type;
  }

  getTypeIcon(type: string): string {
    const typeIcons: { [key: string]: string } = {
      'CONGE_ANNUEL': 'beach_access',
      'CONGE_MALADIE': 'local_hospital',
      'CONGE_PERSONNEL': 'person',
      'CONGE_URGENCE': 'emergency',
      'AUTRE': 'help_outline'
    };
    return typeIcons[type] || 'help_outline';
  }

  getTypeClass(type: string): string {
    const typeClasses: { [key: string]: string } = {
      'CONGE_ANNUEL': 'annual',
      'CONGE_MALADIE': 'sick',
      'CONGE_PERSONNEL': 'personal',
      'CONGE_URGENCE': 'emergency',
      'AUTRE': 'other'
    };
    return typeClasses[type] || 'other';
  }
}

// Refusal Dialog Component
@Component({
  selector: 'app-refus-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
  template: `
    <h2 mat-dialog-title>Refuser la demande de congé</h2>
    <mat-dialog-content>
      <p>Refuser la demande de congé de <strong>{{ data.chauffeur.nom }} {{ data.chauffeur.prenom }}</strong></p>
      <form [formGroup]="refusForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Raison du refus</mat-label>
          <textarea matInput formControlName="raison" rows="3" 
                    placeholder="Expliquez pourquoi cette demande est refusée..."></textarea>
          <mat-error *ngIf="refusForm.get('raison')?.hasError('required')">
            La raison du refus est obligatoire
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="warn" (click)="onConfirm()" [disabled]="refusForm.invalid">
        Refuser
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
  `]
})
export class RefusDialogComponent {
  refusForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<RefusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.refusForm = this.fb.group({
      raison: ['', Validators.required]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.refusForm.valid) {
      this.dialogRef.close(this.refusForm.value);
    }
  }
}
