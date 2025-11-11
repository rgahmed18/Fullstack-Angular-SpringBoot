import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DriverDashboardService, MissionResponseDTO, DashboardStats } from '../services/driver-dashboard.service';
import { MissionActionDialogComponent, MissionActionData } from '../components/mission-action-dialog.component';

@Component({
  selector: 'app-mes-missions',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './mes-missions.component.html',
  styleUrls: ['./mes-missions.component.scss']
})
export class MesMissionsComponent implements OnInit {
  missions: MissionResponseDTO[] = [];
  stats: DashboardStats = {
    totalMissions: 0,
    activeMissions: 0,
    pendingMissions: 0,
    completedMissions: 0,
    refusedMissions: 0,
    successRate: 0
  };
  loading = true;
  error: string | null = null;

  constructor(
    private driverService: DriverDashboardService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    // Load stats and missions in parallel
    Promise.all([
      this.driverService.getDashboardStats().toPromise(),
      this.driverService.getMissions().toPromise()
    ]).then(([stats, missions]) => {
      this.stats = stats || this.stats;
      this.missions = missions || [];
      this.loading = false;
    }).catch(error => {
      console.error('Error loading dashboard data:', error);
      this.error = 'Erreur lors du chargement des données';
      this.loading = false;
    });
  }

  getTodayMissions(): MissionResponseDTO[] {
    // Get current date in local timezone
    const now = new Date();
    const today = now.getFullYear() + '-' + 
                  String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(now.getDate()).padStart(2, '0');
    
    return this.missions.filter(m => {
      const missionDate = new Date(m.dateHeure).toISOString().split('T')[0];
      return missionDate === today;
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'warn';
      case 'COMMENCEE':
      case 'EN_COURS': return 'primary';
      case 'TERMINEE': return 'accent';
      case 'REFUSEE': return 'warn';
      default: return 'basic';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'À faire';
      case 'COMMENCEE':
      case 'EN_COURS': return 'En cours';
      case 'TERMINEE': return 'Terminée';
      case 'REFUSEE': return 'Refusée';
      default: return status;
    }
  }

  // Accept mission with confirmation dialog
  acceptMission(mission: MissionResponseDTO): void {
    const dialogData: MissionActionData = {
      missionId: mission.id,
      action: 'accept',
      missionTitle: `Mission #${mission.id}`,
      destination: mission.destination
    };

    const dialogRef = this.dialog.open(MissionActionDialogComponent, {
      width: '500px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.confirmed) {
        this.driverService.acceptMission(mission.id).subscribe({
          next: (updatedMission) => {
            this.showSuccessMessage('Mission acceptée avec succès');
            this.loadDashboardData();
          },
          error: (error) => {
            console.error('Error accepting mission:', error);
            this.showErrorMessage('Erreur lors de l\'acceptation de la mission');
          }
        });
      }
    });
  }

  // Refuse mission with reason dialog
  refuseMission(mission: MissionResponseDTO): void {
    const dialogData: MissionActionData = {
      missionId: mission.id,
      action: 'refuse',
      missionTitle: `Mission #${mission.id}`,
      destination: mission.destination
    };

    const dialogRef = this.dialog.open(MissionActionDialogComponent, {
      width: '500px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.confirmed && result?.reason) {
        this.driverService.refuseMission(mission.id, result.reason).subscribe({
          next: (updatedMission) => {
            this.showSuccessMessage('Mission refusée. L\'employé a été notifié.');
            this.loadDashboardData();
          },
          error: (error) => {
            console.error('Error refusing mission:', error);
            this.showErrorMessage('Erreur lors du refus de la mission');
          }
        });
      }
    });
  }

  // Start mission with confirmation dialog
  startMission(mission: MissionResponseDTO): void {
    const dialogData: MissionActionData = {
      missionId: mission.id,
      action: 'start',
      missionTitle: `Mission #${mission.id}`,
      destination: mission.destination
    };

    const dialogRef = this.dialog.open(MissionActionDialogComponent, {
      width: '500px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.confirmed) {
        this.driverService.startMission(mission.id).subscribe({
          next: (updatedMission) => {
            this.showSuccessMessage('Mission commencée. L\'employé a été notifié.');
            this.loadDashboardData();
          },
          error: (error) => {
            console.error('Error starting mission:', error);
            this.showErrorMessage('Erreur lors du démarrage de la mission');
          }
        });
      }
    });
  }

  // Complete mission with confirmation dialog
  completeMission(mission: MissionResponseDTO): void {
    const dialogData: MissionActionData = {
      missionId: mission.id,
      action: 'complete',
      missionTitle: `Mission #${mission.id}`,
      destination: mission.destination
    };

    const dialogRef = this.dialog.open(MissionActionDialogComponent, {
      width: '500px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.confirmed) {
        this.driverService.completeMission(mission.id).subscribe({
          next: (updatedMission) => {
            this.showSuccessMessage('Mission terminée avec succès. L\'employé a été notifié.');
            this.loadDashboardData();
          },
          error: (error) => {
            console.error('Error completing mission:', error);
            this.showErrorMessage('Erreur lors de la finalisation de la mission');
          }
        });
      }
    });
  }

  // Report problem with dialog
  reportProblemDialog(mission: MissionResponseDTO): void {
    const dialogData: MissionActionData = {
      missionId: mission.id,
      action: 'report-problem',
      missionTitle: `Mission #${mission.id}`,
      destination: mission.destination
    };

    const dialogRef = this.dialog.open(MissionActionDialogComponent, {
      width: '500px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.confirmed && result?.reason) {
        this.driverService.reportProblem(mission.id, result.reason).subscribe({
          next: () => {
            this.showSuccessMessage('Problème signalé avec succès');
            this.loadDashboardData();
          },
          error: (error) => {
            console.error('Error reporting problem:', error);
            this.showErrorMessage('Erreur lors du signalement du problème');
          }
        });
      }
    });
  }

  viewMissionDetails(missionId: number): void {
    this.router.navigate(['/driver/mission', missionId]);
  }

  // Helper methods for notifications
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 7000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  // Check if mission can be accepted
  canAcceptMission(mission: MissionResponseDTO): boolean {
    return mission.etat === 'EN_ATTENTE' && !mission.acceptee;
  }

  // Check if mission can be started
  canStartMission(mission: MissionResponseDTO): boolean {
    return mission.etat === 'EN_ATTENTE' && mission.acceptee;
  }

  // Check if mission can be completed
  canCompleteMission(mission: MissionResponseDTO): boolean {
    return mission.etat === 'COMMENCEE' || mission.etat === 'EN_COURS';
  }

  // Check if mission can be refused
  canRefuseMission(mission: MissionResponseDTO): boolean {
    return mission.etat === 'EN_ATTENTE' && !mission.acceptee;
  }
}
