import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { ChauffeurService } from '../../core/services/chauffeur.service';
import { AuthService } from '../../core/services/auth.service';

export interface IndisponibiliteRequest {
  dateDebut: string;
  dateFin: string;
  type: string;
  raison: string;
}

export interface Indisponibilite {
  id: number;
  dateDebut: string;
  dateFin: string;
  type: string;
  raison: string;
  acceptee: boolean;
  statut: string; // EN_ATTENTE, ACCEPTEE, REFUSEE
}

@Component({
  selector: 'app-conge-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <div class="conge-container">
      <mat-card class="form-card">
        <mat-card-header>
          <div class="header-content">
            <mat-icon class="header-icon">free_breakfast</mat-icon>
            <div class="header-text">
              <mat-card-title>Soumettez votre demande</mat-card-title>
            </div>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="congeForm" (ngSubmit)="onSubmit()" class="conge-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="date-field">
                <mat-label>Date de début</mat-label>
                <input matInput [matDatepicker]="startPicker" formControlName="dateDebut" readonly>
                <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
                <mat-error *ngIf="congeForm.get('dateDebut')?.hasError('required')">
                  La date de début est obligatoire
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="date-field">
                <mat-label>Date de fin</mat-label>
                <input matInput [matDatepicker]="endPicker" formControlName="dateFin" readonly>
                <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
                <mat-error *ngIf="congeForm.get('dateFin')?.hasError('required')">
                  La date de fin est obligatoire
                </mat-error>
                <mat-error *ngIf="congeForm.get('dateFin')?.hasError('dateRange')">
                  La date de fin doit être après la date de début
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Type de congé</mat-label>
              <mat-select formControlName="type">
                <mat-option value="CONGE_ANNUEL">Congé annuel</mat-option>
                <mat-option value="CONGE_MALADIE">Congé maladie</mat-option>
                <mat-option value="CONGE_PERSONNEL">Congé personnel</mat-option>
                <mat-option value="CONGE_URGENCE">Congé d'urgence</mat-option>
                <mat-option value="AUTRE">Autre</mat-option>
              </mat-select>
              <mat-error *ngIf="congeForm.get('type')?.hasError('required')">
                Le type de congé est obligatoire
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Raison (optionnel)</mat-label>
              <textarea 
                matInput 
                formControlName="raison" 
                rows="4" 
                placeholder="Décrivez brièvement la raison de votre demande...">
              </textarea>
            </mat-form-field>

            <div class="form-actions">
              <button 
                mat-raised-button 
                color="primary" 
                type="submit" 
                [disabled]="congeForm.invalid || submitting">
                <mat-spinner diameter="20" *ngIf="submitting"></mat-spinner>
                <mat-icon *ngIf="!submitting">send</mat-icon>
                {{ submitting ? 'Envoi en cours...' : 'Soumettre la demande' }}
              </button>
              <button 
                mat-button 
                type="button" 
                (click)="resetForm()"
                [disabled]="submitting">
                <mat-icon>refresh</mat-icon>
                Réinitialiser
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Mes demandes de congé -->
      <mat-card class="history-card">
        <mat-card-header>
          <div class="header-content">
            <mat-icon class="header-icon">history</mat-icon>
            <div class="header-text">
              <mat-card-title>Mes Demandes de Congé</mat-card-title>
              <mat-card-subtitle>Historique de vos demandes d'indisponibilité</mat-card-subtitle>
            </div>
          </div>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="loadingHistory" class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Chargement de l'historique...</p>
          </div>

          <div *ngIf="!loadingHistory && indisponibilites.length > 0" class="history-list">
            <div *ngFor="let indispo of indisponibilites" class="history-item">
              <div class="history-header">
                <div class="history-info">
                  <h3 class="history-title">{{ getTypeLabel(indispo.type) }}</h3>
                  <p class="history-dates">
                    Du {{ formatDate(indispo.dateDebut) }} au {{ formatDate(indispo.dateFin) }}
                  </p>
                </div>
                <mat-chip 
                  class="status-chip" 
                  [class]="getStatusClass(indispo)">
                  <mat-icon>{{ getStatusIcon(indispo) }}</mat-icon>
                  {{ getStatusLabel(indispo) }}
                </mat-chip>
              </div>
              
              <div class="history-content" *ngIf="indispo.raison">
                <mat-icon>description</mat-icon>
                <p>{{ indispo.raison }}</p>
              </div>
              
              <mat-divider *ngIf="indisponibilites.indexOf(indispo) < indisponibilites.length - 1"></mat-divider>
            </div>
          </div>

          <div *ngIf="!loadingHistory && indisponibilites.length === 0" class="empty-state">
            <mat-icon>event_busy</mat-icon>
            <h3>Aucune demande de congé</h3>
            <p>Vous n'avez pas encore soumis de demande d'indisponibilité.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .conge-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-card, .history-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #2196f3;
    }

    .header-text {
      flex: 1;
    }

    .conge-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: 20px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .date-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .form-actions button {
      min-width: 140px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      color: rgba(0,0,0,0.6);
    }

    .loading-container mat-spinner {
      margin-bottom: 16px;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .history-item {
      padding: 16px 0;
    }

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .history-info h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 500;
      color: rgba(0,0,0,0.87);
    }

    .history-dates {
      margin: 0;
      font-size: 14px;
      color: rgba(0,0,0,0.6);
    }

    .status-chip {
      font-size: 12px;
      font-weight: 500;
    }

    .status-chip.accepted {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-chip.pending {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .status-chip.refused {
      background-color: #ffebee;
      color: #c62828;
    }

    .history-content {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-top: 8px;
    }

    .history-content mat-icon {
      color: rgba(0,0,0,0.6);
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-top: 2px;
    }

    .history-content p {
      margin: 0;
      font-size: 14px;
      line-height: 1.4;
      color: rgba(0,0,0,0.7);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 20px;
      text-align: center;
      color: rgba(0,0,0,0.6);
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 500;
      color: rgba(0,0,0,0.7);
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .conge-container {
        padding: 16px;
      }

      .form-row {
        flex-direction: column;
        gap: 12px;
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions button {
        width: 100%;
      }

      .history-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
      }
    }
  `]
})
export class CongeFormComponent implements OnInit {
  congeForm: FormGroup;
  submitting = false;
  loadingHistory = false;
  indisponibilites: Indisponibilite[] = [];

  constructor(
    private fb: FormBuilder,
    private chauffeurService: ChauffeurService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.congeForm = this.fb.group({
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      type: ['', Validators.required],
      raison: ['']
    }, { validators: this.dateRangeValidator });
  }

  ngOnInit(): void {
    this.loadIndisponibilites();
  }

  dateRangeValidator(group: FormGroup) {
    const dateDebut = group.get('dateDebut')?.value;
    const dateFin = group.get('dateFin')?.value;
    
    if (dateDebut && dateFin && new Date(dateFin) <= new Date(dateDebut)) {
      group.get('dateFin')?.setErrors({ dateRange: true });
      return { dateRange: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.congeForm.valid) {
      this.submitting = true;
      
      const formValue = this.congeForm.value;
      const request: IndisponibiliteRequest = {
        dateDebut: this.formatDateForBackend(formValue.dateDebut),
        dateFin: this.formatDateForBackend(formValue.dateFin),
        type: formValue.type,
        raison: formValue.raison || ''
      };

      const chauffeurId = this.getCurrentChauffeurId();
      
      this.chauffeurService.creerIndisponibilite(chauffeurId, request).subscribe({
        next: (response) => {
          this.snackBar.open('Demande de congé soumise avec succès!', 'Fermer', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          this.resetForm();
          this.loadIndisponibilites();
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error submitting leave request:', error);
          this.snackBar.open('Erreur lors de la soumission de la demande', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.submitting = false;
        }
      });
    }
  }

resetForm(): void {
  this.congeForm.reset();
  // Marquer tous les champs comme non touchés pour supprimer les erreurs de validation
  this.congeForm.markAsUntouched();
  this.congeForm.markAsPristine();
  
  // Réinitialiser explicitement chaque champ avec des valeurs vides
  this.congeForm.patchValue({
    dateDebut: '',
    dateFin: '',
    type: '',
    raison: ''
  });
  
  // Supprimer toutes les erreurs de validation
  Object.keys(this.congeForm.controls).forEach(key => {
    this.congeForm.get(key)?.setErrors(null);
  });
}

  loadIndisponibilites(): void {
    this.loadingHistory = true;
    const chauffeurId = this.getCurrentChauffeurId();
    
    this.chauffeurService.getIndisponibilites(chauffeurId).subscribe({
      next: (indisponibilites) => {
        this.indisponibilites = indisponibilites.sort((a, b) => 
          new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime()
        );
        this.loadingHistory = false;
      },
      error: (error) => {
        console.error('Error loading indisponibilites:', error);
        this.loadingHistory = false;
      }
    });
  }

  private getCurrentChauffeurId(): number {
    const currentUser = this.authService.currentUserValue;
    return currentUser?.chauffeurId || currentUser?.id || 0;
  }

  private formatDateForBackend(date: Date): string {
    return date.toISOString();
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

  getStatusLabel(indispo: Indisponibilite): string {
    if (indispo.statut) {
      switch (indispo.statut) {
        case 'EN_ATTENTE': return 'En attente';
        case 'ACCEPTEE': return 'Acceptée';
        case 'REFUSEE': return 'Refusée';
        default: return 'En attente';
      }
    }
    // Fallback pour les anciens enregistrements sans champ statut
    return indispo.acceptee ? 'Acceptée' : 'En attente';
  }

  getStatusIcon(indispo: Indisponibilite): string {
    if (indispo.statut) {
      switch (indispo.statut) {
        case 'EN_ATTENTE': return 'schedule';
        case 'ACCEPTEE': return 'check_circle';
        case 'REFUSEE': return 'cancel';
        default: return 'schedule';
      }
    }
    return indispo.acceptee ? 'check_circle' : 'schedule';
  }

  getStatusClass(indispo: Indisponibilite): string {
    if (indispo.statut) {
      switch (indispo.statut) {
        case 'EN_ATTENTE': return 'pending';
        case 'ACCEPTEE': return 'accepted';
        case 'REFUSEE': return 'refused';
        default: return 'pending';
      }
    }
    return indispo.acceptee ? 'accepted' : 'pending';
  }
}
