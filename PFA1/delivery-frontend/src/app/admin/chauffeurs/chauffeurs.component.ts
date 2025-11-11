import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ChauffeurService } from '../../core/services/chauffeur.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog.component';

export interface ChauffeurWithStats {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  actif: boolean;
  missionCount: number;
  pendingMissionCount: number;  // EN_ATTENTE missions
  activeMissionCount: number;   // COMMENCEE, EN_COURS missions
  completedMissionCount: number;
  status: 'DISPONIBLE' | 'EN_MISSION' | 'INDISPONIBLE';
}

@Component({
  selector: 'app-chauffeurs',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="chauffeurs-container">
      <!-- Header -->
      <div class="header">
        <div class="header-content">
          <div class="header-left">
            <button mat-icon-button (click)="goBack()" class="back-button">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div class="header-text">
              <h1>Gestion des Chauffeurs</h1>
              <p>Liste et gestion des chauffeurs</p>
            </div>
          </div>
          <div class="header-right">
            <button mat-raised-button color="primary" (click)="addChauffeur()" class="add-button">
              <mat-icon>person_add</mat-icon>
              Ajouter Chauffeur
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="content">
        <!-- Loading State -->
        <div *ngIf="loading" class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Chargement des chauffeurs...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !loading" class="error-container">
          <mat-icon class="error-icon">error</mat-icon>
          <h3>Erreur de chargement</h3>
          <p>{{ error }}</p>
          <button mat-button color="primary" (click)="loadChauffeurs()">
            <mat-icon>refresh</mat-icon>
            Réessayer
          </button>
        </div>

        <!-- Chauffeurs Table -->
        <div *ngIf="!loading && !error && chauffeurs.length > 0" class="table-container">
          <table mat-table [dataSource]="chauffeurs" class="chauffeurs-table">
            
            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nom</th>
              <td mat-cell *matCellDef="let chauffeur">
                <div class="name-cell">
                  <div class="avatar">
                    <mat-icon>person</mat-icon>
                  </div>
                  <div class="name-info">
                    <div class="full-name">{{ chauffeur.prenom }} {{ chauffeur.nom }}</div>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Email Column -->
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let chauffeur">
                <div class="email-cell">
                  <mat-icon>email</mat-icon>
                  <span class="email-text">{{ chauffeur.email }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Phone Column -->
            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef>Téléphone</th>
              <td mat-cell *matCellDef="let chauffeur">
                <div class="phone-cell">
                  <mat-icon>phone</mat-icon>
                  {{ chauffeur.telephone }}
                </div>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Statut</th>
              <td mat-cell *matCellDef="let chauffeur">
                <mat-chip [ngClass]="getStatusClass(chauffeur.status)">
                  <mat-icon>{{ getStatusIcon(chauffeur.status) }}</mat-icon>
                  {{ getStatusLabel(chauffeur.status) }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Missions Column -->
            <ng-container matColumnDef="missions">
              <th mat-header-cell *matHeaderCellDef>Missions</th>
              <td mat-cell *matCellDef="let chauffeur">
                <div class="missions-cell">
                  <!-- Loading state for mission statistics -->
                  <div *ngIf="loadingMissionStats" class="mission-loading">
                    <mat-spinner diameter="20"></mat-spinner>
                    <span>Chargement...</span>
                  </div>
                  
                  <!-- Mission statistics -->
                  <div *ngIf="!loadingMissionStats" class="mission-stats-container">
                    <div class="mission-stat total">
                      <span class="stat-number">{{ chauffeur.missionCount || 0 }}</span>
                      <span class="stat-label">Total</span>
                    </div>
                    <div class="mission-stat pending" *ngIf="chauffeur.pendingMissionCount > 0">
                      <span class="stat-number">{{ chauffeur.pendingMissionCount }}</span>
                      <span class="stat-label">En Attente</span>
                    </div>
                    <div class="mission-stat active" *ngIf="chauffeur.activeMissionCount > 0">
                      <span class="stat-number">{{ chauffeur.activeMissionCount }}</span>
                      <span class="stat-label">En Cours</span>
                    </div>
                    <div class="mission-stat completed" *ngIf="chauffeur.completedMissionCount > 0">
                      <span class="stat-number">{{ chauffeur.completedMissionCount }}</span>
                      <span class="stat-label">Terminées</span>
                    </div>
                    
                    <!-- Show error state if mission data failed to load -->
                    <div *ngIf="missionStatsError" class="mission-error">
                      <mat-icon>error_outline</mat-icon>
                      <span>Erreur</span>
                      <button mat-icon-button (click)="retryMissionStats()" matTooltip="Réessayer">
                        <mat-icon>refresh</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </td>
            </ng-container>



            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let chauffeur">
                <div class="actions-cell">
                  <button mat-icon-button color="primary" (click)="editChauffeur(chauffeur)" matTooltip="Modifier">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="accent" (click)="viewMissions(chauffeur)" matTooltip="Voir les missions">
                    <mat-icon>assignment</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteChauffeur(chauffeur)" matTooltip="Supprimer">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && chauffeurs.length === 0" class="empty-container">
          <mat-icon class="empty-icon">people_outline</mat-icon>
          <h3>Aucun chauffeur trouvé</h3>
          <p>Commencez par ajouter votre premier chauffeur</p>
          <button mat-raised-button color="primary" (click)="addChauffeur()">
            <mat-icon>person_add</mat-icon>
            Ajouter Chauffeur
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chauffeurs-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      margin: 0;
      padding: 0;
    }

    .header {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border-bottom: 1px solid #e2e8f0;
      padding: 24px 32px;
      position: sticky;
      top: 0;
      z-index: 10;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .back-button {
      color: #64748b;
    }

    .header-text h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, #182717ff 0%, #628B18 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header-text p {
      margin: 8px 0 0 0;
      color: #64748b;
      font-size: 16px;
      font-weight: 500;
    }

    .add-button {
      gap: 10px;
      padding: 12px 24px;
      border-radius: 12px;
      background: linear-gradient(135deg, #33353fff 0%, #628B18 100%);
      color: white;
      font-weight: 600;
      text-transform: none;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      transition: all 0.2s ease;
    }

    .add-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px #628B18;
    }

    .content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 32px;
    }

    .loading-container, .error-container, .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .error-icon, .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #94a3b8;
      margin-bottom: 16px;
    }

    .chauffeurs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
    }

    .chauffeur-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;
    }

    .chauffeur-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 20px;
    }

    .chauffeur-avatar {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #667eea 0%, #628B18 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px #628B18;
      transition: all 0.2s ease;
    }

    .chauffeur-avatar:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }

    .chauffeur-avatar mat-icon {
      color: white;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .chauffeur-info {
      flex: 1;
    }

    .chauffeur-info h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }

    .chauffeur-contact, .chauffeur-email {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 4px 0;
      color: #64748b;
      font-size: 14px;
    }

    .chauffeur-contact mat-icon, .chauffeur-email mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .status-badge {
      flex-shrink: 0;
    }

    .status-badge mat-chip {
      font-weight: 500;
      gap: 4px;
    }

    mat-chip.disponible {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%);
      color: #047857;
      border: 1px solid rgba(16, 185, 129, 0.3);
      font-weight: 600;
    }

    mat-chip.en-mission {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%);
      color: #1d4ed8;
      border: 1px solid rgba(59, 130, 246, 0.3);
      font-weight: 600;
    }

    mat-chip.indisponible {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%);
      color: #b45309;
      border: 1px solid rgba(245, 158, 11, 0.3);
      font-weight: 600;
    }

    .stats-section {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 12px;
    }

    .stats-section .container {
      width: 100%;
      margin: 0;
      padding: 0;
      background: #f8fafc;
      min-height: 100vh;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow-x: auto;
      margin: 24px 0;
      border: none;
      width: 100%;
    }

    .chauffeurs-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      table-layout: fixed;
      min-width: 1200px;
    }

    /* Column width definitions */
    .mat-column-name {
      width: 25%;
      min-width: 200px;
    }

    .mat-column-email {
      width: 20%;
      min-width: 180px;
    }

    .mat-column-phone {
      width: 15%;
      min-width: 130px;
    }

    .mat-column-status {
      width: 18%;
      min-width: 120px;
    }

    .mat-column-missions {
      width: 12%;
      min-width: 200px;
    }

    .mat-column-actions {
      width: 15%;
      min-width: 180px;
    }

    .mat-mdc-header-cell {
      background: linear-gradient(135deg, #6b7c32 0%, #8a9c42 100%) !important;
      font-weight: 700 !important;
      color: white !important;
      border-bottom: none !important;
      padding: 20px 24px !important;
      font-size: 13px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      position: relative;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      text-align: left !important;
    }

    .chauffeurs-table .mat-mdc-header-cell {
      background: linear-gradient(135deg, #6b7c32 0%, #8a9c42 100%) !important;
      color: white !important;
    }

    .chauffeurs-table th.mat-mdc-header-cell {
      background: linear-gradient(135deg, #6b7c32 0%, #8a9c42 100%) !important;
      color: white !important;
      font-weight: 700 !important;
    }

    .chauffeurs-table .mat-mdc-header-cell .mdc-data-table__header-cell-wrapper {
      color: white !important;
    }

    .chauffeurs-table .mat-mdc-header-cell .mat-sort-header-content {
      color: white !important;
    }

    /* Additional specific selectors for Angular Material header text */
    .chauffeurs-table .mat-mdc-header-cell span {
      color: white !important;
    }

    .chauffeurs-table .mat-mdc-header-cell .mat-mdc-header-cell-label {
      color: white !important;
    }

    .chauffeurs-table .mat-mdc-header-cell .mdc-data-table__header-cell-label {
      color: white !important;
    }

    .chauffeurs-table .mat-mdc-header-cell .mat-header-cell-label {
      color: white !important;
    }

    .chauffeurs-table .mat-mdc-header-cell * {
      color: white !important;
    }

    /* Force all text in header cells to be white */
    .chauffeurs-table th {
      background: linear-gradient(135deg, #2d3142ff 0%, #628B18 100%) !important;
      color: white !important;
    }

    .chauffeurs-table th * {
      color: white !important;
    }

    /* Most aggressive override for header text visibility */
    :host ::ng-deep .chauffeurs-table .mat-mdc-header-cell {
      background: linear-gradient(135deg, #6b7c32 0%, #8a9c42 100%) !important;
      color: white !important;
    }

    :host ::ng-deep .chauffeurs-table .mat-mdc-header-cell * {
      color: white !important;
    }

    :host ::ng-deep .chauffeurs-table th {
      background: linear-gradient(135deg, #6b7c32 0%, #8a9c42 100%) !important;
      color: white !important;
    }

    :host ::ng-deep .chauffeurs-table th * {
      color: white !important;
    }

    .mat-mdc-header-cell::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%);
    }

    .mat-mdc-cell {
      border-bottom: 1px solid #f1f5f9;
      padding: 24px 20px;
      vertical-align: middle;
      transition: all 0.3s ease;
      position: relative;
      text-align: left;
    }

    .mat-mdc-row {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .mat-mdc-row:hover {
      background: linear-gradient(135deg, rgba(107, 124, 50, 0.05) 0%, rgba(138, 156, 66, 0.03) 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(107, 124, 50, 0.1);
    }

    .mat-mdc-row:hover .mat-mdc-cell {
      border-bottom-color: #e2e8f0;
    }

    .mat-mdc-row:last-child .mat-mdc-cell {
      border-bottom: none;
    }

    /* Enhanced Cell Styles */
    .name-cell {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .avatar {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #6b7c32 0%, #8a9c42 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
      box-shadow: 0 4px 12px rgba(107, 124, 50, 0.3);
      transition: all 0.3s ease;
    }

    .mat-mdc-row:hover .avatar {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(107, 124, 50, 0.4);
    }

    .name-info {
      display: flex;
      flex-direction: column;
    }

    .full-name {
      font-weight: 600;
      font-size: 16px;
      color: #1e293b;
      margin-bottom: 2px;
    }

    .email-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #64748b;
      padding: 8px 12px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .mat-mdc-row:hover .email-cell {
      background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
      transform: translateX(4px);
    }

    .email-cell mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #667eea;
    }

    .email-text {
      font-size: 14px;
      color: #475569;
      font-weight: 500;
    }

    .phone-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #64748b;
      padding: 8px 12px;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .mat-mdc-row:hover .phone-cell {
      background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%);
      transform: translateX(4px);
    }

    .phone-cell mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #16a34a;
    }

    /* Enhanced Mission Statistics */
    .missions-cell {
      min-width: 200px;
      width: 200px;
    }

    .mission-stats-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }

    .mission-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 12px;
      border-radius: 12px;
      min-width: 60px;
      font-weight: 500;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .mat-mdc-row:hover .mission-stat {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .mission-stat.total {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      color: #374151;
      border: 2px solid #d1d5db;
    }

    .mission-stat.pending {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      color: #92400e;
      border: 2px solid #f59e0b;
    }

    .mission-stat.active {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      color: #1d4ed8;
      border: 2px solid #3b82f6;
    }

    .mission-stat.completed {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      color: #047857;
      border: 2px solid #10b981;
    }

    .stat-number {
      font-weight: 700;
      font-size: 18px;
      line-height: 1;
    }

    .stat-label {
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }

    /* Enhanced Actions */
    .actions-cell {
      display: flex;
      gap: 8px;
      justify-content: flex-start;
      align-items: center;
      min-width: 180px;
      width: 180px;
    }

    .actions-cell button {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      background: transparent;
      border: 1px solid #e2e8f0;
    }

    .actions-cell button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .actions-cell button[color="primary"]:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: #3b82f6;
    }

    .actions-cell button[color="accent"]:hover {
      background: rgba(139, 92, 246, 0.1);
      border-color: #8b5cf6;
    }

    .actions-cell button[color="warn"]:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: #ef4444;
    }

    .actions-cell button mat-icon {
      color: #64748b;
    }

    .actions-cell button[color="primary"] mat-icon {
      color: #3b82f6;
    }

    .actions-cell button[color="accent"] mat-icon {
      color: #8b5cf6;
    }

    .actions-cell button[color="warn"] mat-icon {
      color: #ef4444;
    }

    /* Status Chips Enhancement */
    mat-chip {
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .mat-mdc-row:hover mat-chip {
      transform: scale(1.05);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .mat-mdc-header-cell, .mat-mdc-cell {
        padding: 16px 12px;
      }
      
      .mission-stats-container {
        flex-direction: column;
        gap: 4px;
      }
      
      .mission-stat {
        min-width: 50px;
        padding: 6px 10px;
      }
    }

    @media (max-width: 768px) {
      .table-container {
        border-radius: 16px;
        margin: 16px;
      }
      
      .mat-mdc-header-cell, .mat-mdc-cell {
        padding: 12px 8px;
        font-size: 12px;
      }
      
      .avatar {
        width: 40px;
        height: 40px;
        font-size: 16px;
      }
      
      .full-name {
        font-size: 14px;
      }
      
      .email-cell, .phone-cell {
        padding: 6px 8px;
        gap: 8px;
      }
      
      .actions-cell {
        gap: 8px;
      }
      
      .actions-cell button {
        width: 36px;
        height: 36px;
      }
      
      .mission-stat {
        min-width: 45px;
        padding: 4px 8px;
      }
      
      .stat-number {
        font-size: 14px;
      }
      
      .stat-label {
        font-size: 9px;
      }
    }

    @media (max-width: 480px) {
      .chauffeurs-table {
        font-size: 11px;
      }
      
      .mat-mdc-header-cell {
        padding: 10px 6px;
        font-size: 10px;
      }
      
      .mat-mdc-cell {
        padding: 10px 6px;
      }
      
      .name-cell {
        gap: 8px;
      }
      
      .avatar {
        width: 32px;
        height: 32px;
        font-size: 14px;
      }
      
      .mission-stats-container {
        gap: 2px;
      }
      
      .actions-cell {
        flex-direction: column;
        gap: 4px;
      }
      
      .actions-cell button {
        width: 32px;
        height: 32px;
      }
    }

.stat-icon {
  width: 32px;
  height: 32px;
  font-size: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

    .stat-icon.missions {
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
    }

    .stat-icon.active {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    .stat-icon.completed {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .stat-details {
      display: flex;
      flex-direction: column;
    }

    .stat-number {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      line-height: 1;
    }

    .stat-label {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }

    .vehicle-section {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(59, 130, 246, 0.05);
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .vehicle-section.no-vehicle {
      background: rgba(148, 163, 184, 0.1);
      color: #64748b;
    }

    .vehicle-icon {
      color: #3b82f6;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .vehicle-section.no-vehicle .vehicle-icon {
      color: #94a3b8;
    }

    .vehicle-info {
      display: flex;
      flex-direction: column;
    }

    .vehicle-name {
      font-weight: 500;
      color: #1e293b;
      font-size: 14px;
    }

    .vehicle-plate {
      font-size: 12px;
      color: #64748b;
      font-family: monospace;
      background: rgba(59, 130, 246, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      margin-top: 4px;
      width: fit-content;
    }

    .card-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    .card-actions button {
      min-width: auto;
      padding: 8px 16px;
    }

    @media (max-width: 768px) {
      .chauffeurs-grid {
        grid-template-columns: 1fr;
      }
      
      .header-content {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .stats-section {
        flex-direction: column;
        gap: 12px;
      }
    }

    .missions-cell {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .mission-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px 14px;
      border-radius: 10px;
      min-width: 65px;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .mission-stat.total {
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .mission-stat.pending {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      color: #92400e;
    }

    .mission-stat.completed {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      color: #065f46;
    }

    .mission-stat.active {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%);
      color: #1d4ed8;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }

    .mission-stat.completed {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%);
      color: #047857;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .stat-number {
      font-weight: 600;
      font-size: 16px;
    }

    .stat-label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .email-cell {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #64748b;
    }

    .email-cell mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #94a3b8;
    }

    .email-text {
      font-size: 14px;
      color: #475569;
      font-weight: 500;
    }

    .actions-cell {
      display: flex;
      gap: 8px;
      justify-content: center;
    }

    .actions-cell button {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      transition: all 0.2s ease;
    }

    .actions-cell button:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .actions-cell button[color="primary"]:hover {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    }

    .actions-cell button[color="accent"]:hover {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    }

    .actions-cell button[color="warn"]:hover {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }

    /* Enhanced missions column styles */
    .mission-loading {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #64748b;
      font-size: 12px;
    }

    .mission-stats-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .mission-error {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #ef4444;
      font-size: 12px;
    }

    .mission-error mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .mission-error button {
      width: 24px;
      height: 24px;
      line-height: 24px;
    }

    .mission-error button mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
  `]
})
export class ChauffeursComponent implements OnInit {
  chauffeurs: ChauffeurWithStats[] = [];
  loading = false;
  loadingMissionStats = false;
  missionStatsError = false;
  error: string | null = null;
  displayedColumns: string[] = ['name', 'email', 'phone', 'status', 'missions', 'actions'];

  constructor(
    private router: Router,
    private chauffeurService: ChauffeurService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadChauffeurs();
  }

  loadChauffeurs() {
    this.loading = true;
    this.error = null;

    this.chauffeurService.getAllChauffeurs().subscribe({
      next: (chauffeurs: any[]) => {
        // Transform chauffeurs data and add mission statistics
        this.chauffeurs = chauffeurs.map(chauffeur => ({
          id: chauffeur.id,
          nom: chauffeur.nom,
          prenom: chauffeur.prenom,
          telephone: chauffeur.telephone,
          email: chauffeur.email,
          actif: chauffeur.actif !== false, // Default to true if not specified
          missionCount: 0, // Will be loaded with real data
          pendingMissionCount: 0, // EN_ATTENTE missions
          activeMissionCount: 0,  // COMMENCEE, EN_COURS missions
          completedMissionCount: 0,
          status: this.determineStatus(chauffeur)
        }));

        // Load mission statistics for each chauffeur
        this.loadMissionStatistics();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading chauffeurs:', error);
        this.error = 'Impossible de charger les chauffeurs. Vérifiez la connexion au serveur.';
        this.loading = false;
      }
    });
  }

  loadMissionStatistics() {
    console.log('Loading mission statistics for', this.chauffeurs.length, 'chauffeurs');
    this.loadingMissionStats = true;
    this.missionStatsError = false;
    
    // Load real mission statistics for all chauffeurs at once
    const missionRequests = this.chauffeurs.map(chauffeur => {
      console.log('Loading missions for chauffeur ID:', chauffeur.id);
      return this.chauffeurService.getChauffeurMissions(chauffeur.id).pipe(
        catchError(error => {
          console.error(`❌ Error loading missions for chauffeur ${chauffeur.id}:`, error);
          this.missionStatsError = true;
          return of([]); // Return empty array on error
        })
      );
    });

    if (missionRequests.length === 0) {
      console.log('No chauffeurs to load missions for');
      this.loadingMissionStats = false;
      return;
    }

    forkJoin(missionRequests).subscribe({
      next: (allMissions: any[][]) => {
        console.log('Mission data loaded successfully:', allMissions);
        this.chauffeurs.forEach((chauffeur, index) => {
          const missions = allMissions[index] || [];
          console.log(`Chauffeur ${chauffeur.prenom} ${chauffeur.nom} has ${missions.length} missions:`, missions);
          
          // Calculate mission statistics
          chauffeur.missionCount = missions.length;
          chauffeur.pendingMissionCount = missions.filter(m => 
            m.etat === 'EN_ATTENTE'
          ).length;
          chauffeur.activeMissionCount = missions.filter(m => 
            m.etat === 'COMMENCEE' || m.etat === 'EN_COURS'
          ).length;
          chauffeur.completedMissionCount = missions.filter(m => 
            m.etat === 'TERMINEE'
          ).length;
          
          console.log(`✅ Stats for ${chauffeur.prenom}: Total=${chauffeur.missionCount}, Pending=${chauffeur.pendingMissionCount}, Active=${chauffeur.activeMissionCount}, Completed=${chauffeur.completedMissionCount}`);
          
          // Update status based on actual mission data
          chauffeur.status = this.determineRealStatus(chauffeur, missions);
        });
        
        // Force change detection to update the UI
        this.loadingMissionStats = false;
        console.log('✅ Mission statistics loaded successfully for all chauffeurs');
      },
      error: (error) => {
        console.error('❌ Error loading mission statistics:', error);
        console.error('❌ This will cause mission counts to show as 0');
        
        // Show error message to user
        this.snackBar.open('Erreur lors du chargement des statistiques de missions', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        
        // Set default values for all chauffeurs on error
        this.loadingMissionStats = false;
        this.chauffeurs.forEach(chauffeur => {
          chauffeur.missionCount = 0;
          chauffeur.pendingMissionCount = 0;
          chauffeur.activeMissionCount = 0;
          chauffeur.completedMissionCount = 0;
        });
      }
    });
  }

  determineStatus(chauffeur: any): 'DISPONIBLE' | 'EN_MISSION' | 'INDISPONIBLE' {
    if (!chauffeur.actif) return 'INDISPONIBLE';
    // Initial status - will be updated when mission data loads
    return 'DISPONIBLE';
  }

  determineRealStatus(chauffeur: any, missions: any[]): 'DISPONIBLE' | 'EN_MISSION' | 'INDISPONIBLE' {
    // Check if chauffeur has active missions first (priority over actif status)
    const hasActiveMissions = missions.some(m => 
      m.etat === 'EN_ATTENTE' || m.etat === 'COMMENCEE' || m.etat === 'EN_COURS'
    );
    
    // If chauffeur has active missions, they are EN_MISSION regardless of actif status
    if (hasActiveMissions) return 'EN_MISSION';
    
    // Only check actif status if no active missions
    if (!chauffeur.actif) return 'INDISPONIBLE';
    
    return 'DISPONIBLE';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'DISPONIBLE': return 'disponible';
      case 'EN_MISSION': return 'en-mission';
      case 'INDISPONIBLE': return 'indisponible';
      default: return 'disponible';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'DISPONIBLE': return 'check_circle';
      case 'EN_MISSION': return 'drive_eta';
      case 'INDISPONIBLE': return 'block';
      default: return 'help';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'DISPONIBLE': return 'Disponible';
      case 'EN_MISSION': return 'En Mission';
      case 'INDISPONIBLE': return 'Indisponible';
      default: return status;
    }
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }

  addChauffeur() {
    this.router.navigate(['/admin/add-chauffeur']);
  }

  editChauffeur(chauffeur: ChauffeurWithStats) {
    this.router.navigate(['/admin/edit-chauffeur', chauffeur.id]);
  }

  deleteChauffeur(chauffeur: ChauffeurWithStats) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '450px',
      data: {
        title: 'Supprimer le Chauffeur',
        message: `Êtes-vous sûr de vouloir supprimer le chauffeur ${chauffeur.prenom} ${chauffeur.nom} ?`,
        subtitle: 'Cette action est irréversible et supprimera toutes les données associées.',
        chauffeur: chauffeur
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.performDeletion(chauffeur);
      }
    });
  }

  private performDeletion(chauffeur: ChauffeurWithStats) {
    this.chauffeurService.deleteChauffeur(chauffeur.id).subscribe({
      next: (response: any) => {
        const successMessage = response?.message || `${chauffeur.prenom} ${chauffeur.nom} supprimé avec succès`;
        this.snackBar.open(successMessage, 'Fermer', {
          duration: 4000,
          panelClass: ['success-snackbar']
        });
        this.loadChauffeurs(); // Reload the list
      },
      error: (error) => {
        console.error('Error deleting chauffeur:', error);
        let errorMessage = 'Erreur lors de la suppression';
        
        // Parse backend error message
        if (error.error && typeof error.error === 'object' && error.error.error) {
          errorMessage = error.error.error;
        } else if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.status === 400) {
          errorMessage = 'Impossible de supprimer: le chauffeur a des missions actives';
        } else if (error.status === 404) {
          errorMessage = 'Chauffeur non trouvé';
        } else if (error.status === 500) {
          errorMessage = 'Erreur interne du serveur. Vérifiez les logs backend.';
        }
        
        this.snackBar.open(errorMessage, 'Fermer', {
          duration: 6000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  retryMissionStats() {
    console.log('🔄 Retrying mission statistics loading...');
    this.loadMissionStatistics();
  }

  viewMissions(chauffeur: ChauffeurWithStats) {
    this.router.navigate(['/admin/chauffeur-missions', chauffeur.id], {
      queryParams: { 
        nom: chauffeur.nom, 
        prenom: chauffeur.prenom 
      }
    });
  }


}
