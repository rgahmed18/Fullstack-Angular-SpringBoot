import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

export interface MissionActionData {
  missionId: number;
  action: 'accept' | 'refuse' | 'start' | 'complete' | 'report-problem';
  missionTitle: string;
  destination: string;
}

@Component({
  selector: 'app-mission-action-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <mat-icon [ngClass]="getIconClass()">{{ getIcon() }}</mat-icon>
        <h2 mat-dialog-title>{{ getTitle() }}</h2>
      </div>

      <div mat-dialog-content class="dialog-content">
        <div class="mission-info">
          <p><strong>Mission:</strong> {{ data.missionTitle }}</p>
          <p><strong>Destination:</strong> {{ data.destination }}</p>
        </div>

        <div class="action-message">
          <p>{{ getMessage() }}</p>
        </div>

        <!-- Refusal reason input (only for refuse action) -->
        <div *ngIf="data.action === 'refuse'" class="reason-input">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Raison du refus *</mat-label>
            <textarea 
              matInput 
              [(ngModel)]="reason" 
              placeholder="Veuillez indiquer la raison du refus..."
              rows="3"
              required>
            </textarea>
            <mat-icon matSuffix>edit_note</mat-icon>
          </mat-form-field>
          <p class="hint">Cette raison sera envoyée à l'employé concerné.</p>
        </div>

        <!-- Problem report input (only for report-problem action) -->
        <div *ngIf="data.action === 'report-problem'" class="reason-input">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description du problème *</mat-label>
            <textarea 
              matInput 
              [(ngModel)]="reason" 
              placeholder="Décrivez le problème rencontré..."
              rows="4"
              required>
            </textarea>
            <mat-icon matSuffix>warning</mat-icon>
          </mat-form-field>
          <p class="hint">🚨 L'employé sera immédiatement notifié de ce problème.</p>
        </div>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()" class="cancel-btn">
          <mat-icon>close</mat-icon>
          Annuler
        </button>
        <button 
          mat-raised-button 
          [color]="getButtonColor()" 
          (click)="onConfirm()"
          [disabled]="data.action === 'refuse' && !reason.trim()"
          class="confirm-btn">
          <mat-icon>{{ getConfirmIcon() }}</mat-icon>
          {{ getConfirmText() }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 400px;
      max-width: 500px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(0,0,0,0.12);
    }

    .dialog-header mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .dialog-header mat-icon.accept { background: #4caf50; }
    .dialog-header mat-icon.refuse { background: #f44336; }
    .dialog-header mat-icon.start { background: #2196f3; }
    .dialog-header mat-icon.complete { background: #ff9800; }
    .dialog-header mat-icon.report-problem { background: #ff5722; }

    .dialog-header h2 {
      margin: 0;
      font-weight: 500;
    }

    .dialog-content {
      padding: 0;
    }

    .mission-info {
      background: rgba(0,0,0,0.04);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .mission-info p {
      margin: 4px 0;
      font-size: 14px;
    }

    .action-message {
      margin-bottom: 16px;
    }

    .action-message p {
      font-size: 16px;
      color: rgba(0,0,0,0.7);
      text-align: center;
    }

    .reason-input {
      margin-top: 16px;
    }

    .full-width {
      width: 100%;
    }

    .hint {
      font-size: 12px;
      color: rgba(0,0,0,0.6);
      margin-top: 4px;
      font-style: italic;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid rgba(0,0,0,0.12);
    }

    .cancel-btn {
      color: rgba(0,0,0,0.6);
    }

    .confirm-btn {
      min-width: 120px;
    }

    .confirm-btn mat-icon {
      margin-right: 8px;
    }

    .cancel-btn mat-icon {
      margin-right: 8px;
    }
  `]
})
export class MissionActionDialogComponent {
  reason = '';

  constructor(
    public dialogRef: MatDialogRef<MissionActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MissionActionData
  ) {}

  getTitle(): string {
    switch (this.data.action) {
      case 'accept': return 'Accepter la mission';
      case 'refuse': return 'Refuser la mission';
      case 'start': return 'Commencer la mission';
      case 'complete': return 'Terminer la mission';
      case 'report-problem': return 'Signaler un problème';
      default: return 'Action sur la mission';
    }
  }

  getMessage(): string {
    switch (this.data.action) {
      case 'accept': return 'Êtes-vous sûr de vouloir accepter cette mission ?';
      case 'refuse': return 'Êtes-vous sûr de vouloir refuser cette mission ?';
      case 'start': return 'Êtes-vous prêt à commencer cette mission ?';
      case 'complete': return 'Confirmez-vous que cette mission est terminée ?';
      case 'report-problem': return 'Décrivez le problème rencontré pendant cette mission :';
      default: return '';
    }
  }

  getIcon(): string {
    switch (this.data.action) {
      case 'accept': return 'check_circle';
      case 'refuse': return 'cancel';
      case 'start': return 'play_arrow';
      case 'complete': return 'done_all';
      case 'report-problem': return 'report_problem';
      default: return 'help';
    }
  }

  getIconClass(): string {
    return this.data.action;
  }

  getButtonColor(): string {
    switch (this.data.action) {
      case 'accept': return 'primary';
      case 'refuse': return 'warn';
      case 'start': return 'primary';
      case 'complete': return 'accent';
      case 'report-problem': return 'warn';
      default: return 'primary';
    }
  }

  getConfirmIcon(): string {
    switch (this.data.action) {
      case 'accept': return 'thumb_up';
      case 'refuse': return 'thumb_down';
      case 'start': return 'play_arrow';
      case 'complete': return 'check';
      case 'report-problem': return 'send';
      default: return 'check';
    }
  }

  getConfirmText(): string {
    switch (this.data.action) {
      case 'accept': return 'Accepter';
      case 'refuse': return 'Refuser';
      case 'start': return 'Commencer';
      case 'complete': return 'Terminer';
      case 'report-problem': return 'Signaler';
      default: return 'Confirmer';
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.data.action === 'refuse' && !this.reason.trim()) {
      return; // Don't allow empty reason for refusal
    }

    if (this.data.action === 'report-problem' && !this.reason.trim()) {
      return; // Don't allow empty problem description
    }

    this.dialogRef.close({
      confirmed: true,
      reason: this.reason.trim() || undefined
    });
  }
}
