import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';

export interface Mission {
  id: number;
  depart: string;
  destination: string;
  dateHeure: string;
  typeMission: string;
  instructions: string;
  etat: string;
  employe?: {
    id: number;
    nom: string;
    prenom: string;
  };
  chauffeur?: {
    id: number;
    nom: string;
    prenom: string;
    telephone: string;
  };
  vehiculeImmatriculation?: string;
}

@Component({
  selector: 'app-missions',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule
  ],
  templateUrl: './missions.component.html',
  styleUrls: ['./missions.component.scss']
})
export class MissionsComponent implements OnInit {
  missions: Mission[] = [];
  loading = true;
  error: string | null = null;
  
  displayedColumns: string[] = ['id', 'route', 'date', 'type', 'status', 'employe', 'chauffeur', 'actions'];

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private fb: FormBuilder
  ) {}

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  ngOnInit(): void {
    this.loadMissions();
  }

  loadMissions(): void {
    this.loading = true;
    this.error = null;
    
    this.adminService.getAllMissions().subscribe({
      next: (missions: Mission[]) => {
        this.missions = missions;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading missions:', error);
        this.error = 'Erreur lors du chargement des missions';
        this.loading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'warn';
      case 'EN_COURS': return 'accent';
      case 'TERMINEE': return 'primary';
      case 'REFUSEE': return 'warn';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'En Attente';
      case 'EN_COURS': return 'En Cours';
      case 'TERMINEE': return 'Terminée';
      case 'REFUSEE': return 'Refusée';
      default: return status;
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'DOCUMENTS': return '#6b7c32';
      case 'MATERIEL': return '#708090';
      case 'PERSONNEL': return '#556b2f';
      default: return '#2f4f4f';
    }
  }

  editMission(mission: Mission): void {
    this.router.navigate(['/admin/missions/edit', mission.id]);
  }

  deleteMission(mission: Mission): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la mission #${mission.id} ?`)) {
      this.adminService.deleteMission(mission.id).subscribe({
        next: () => {
          this.snackBar.open('Mission supprimée avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadMissions();
        },
        error: (error: any) => {
          console.error('Error deleting mission:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  createNewMission(): void {
    this.router.navigate(['/admin/dashboard/create-mission']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEmployeName(mission: Mission): string {
    if (mission.employe && mission.employe.nom && mission.employe.prenom) {
      return `${mission.employe.prenom} ${mission.employe.nom}`;
    }
    return 'Non assigné';
  }

  getChauffeurName(mission: Mission): string {
    if (mission.chauffeur && mission.chauffeur.nom && mission.chauffeur.prenom) {
      return `${mission.chauffeur.prenom} ${mission.chauffeur.nom}`;
    }
    return 'Non assigné';
  }
}
