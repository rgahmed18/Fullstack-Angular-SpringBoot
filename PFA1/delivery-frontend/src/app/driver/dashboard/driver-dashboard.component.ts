import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { CongeFormComponent } from '../components/conge-form.component';
import { NotificationCenterComponent } from '../components/notification-center.component';
import { LeaveNotificationPopupComponent } from '../components/leave-notification-popup.component';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DriverDashboardService, MissionResponseDTO, DashboardStats } from '../services/driver-dashboard.service';
import { MissionActionDialogComponent, MissionActionData } from '../components/mission-action-dialog.component';

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './driver-dashboard.component.html',
  styleUrls: ['./driver-dashboard.component.scss']
})
export class DriverDashboardComponent implements OnInit {
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
  refusalReason = '';
  problemDescription = '';
  currentView = 'dashboard'; // 'dashboard' or 'conge'
  chauffeurProfile: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private driverService: DriverDashboardService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    // Get current user and chauffeur ID
    const currentUser = this.authService.currentUserValue;
    const chauffeurId = currentUser?.chauffeurId;

    if (chauffeurId) {
      // Load chauffeur profile first to get name
      this.driverService.getChauffeurProfile(chauffeurId).subscribe({
        next: (profile: any) => {
          this.chauffeurProfile = profile;
          console.log('Chauffeur profile loaded:', profile);
        },
        error: (error: any) => {
          console.error('Error loading chauffeur profile:', error);
        }
      });
    }

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
    const today = new Date().toISOString().split('T')[0];
    return this.missions.filter(m => {
      const missionDate = new Date(m.dateHeure).toISOString().split('T')[0];
      return missionDate === today;
    });
  }

  getActiveMissions(): MissionResponseDTO[] {
    return this.missions.filter(m => 
      m.etat === 'COMMENCEE' || 
      m.etat === 'EN_COURS' || 
      m.etat === 'EN_ATTENTE' || 
      !m.etat
    );
  }

  getCompletedMissions(): MissionResponseDTO[] {
    return this.missions.filter(m => m.etat === 'TERMINEE' || m.etat === 'REFUSEE');
  }

  getPendingMissions(): MissionResponseDTO[] {
    return this.missions.filter(m => m.etat === 'EN_ATTENTE' || !m.etat);
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  formatDateFr(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  }

  getDayNumber(dateString: string): number {
    const date = new Date(dateString);
    return date.getDate();
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

  reportProblem(missionId: number, problem: string): void {
    this.driverService.reportProblem(missionId, problem).subscribe({
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Navigation methods
  showDashboard(): void {
    this.currentView = 'dashboard';
  }

  showCongeForm(): void {
    this.currentView = 'conge';
  }

  // Timeline methods for the new schedule view
  getCurrentWeekRange(): string {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6));
    
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return `${startOfWeek.toLocaleDateString('fr-FR', options)} - ${endOfWeek.toLocaleDateString('fr-FR', options)}`;
  }

  getWeekDays(): Array<{name: string, date: string}> {
    const days = [];
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    
    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push({
        name: dayNames[i],
        date: day.toISOString().split('T')[0]
      });
    }
    
    return days;
  }

  getTimeMarkers(): string[] {
    const markers = [];
    for (let hour = 6; hour <= 20; hour += 2) {
      markers.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return markers;
  }

  getMissionsForDay(date: string): MissionResponseDTO[] {
    return this.missions.filter(mission => {
      const missionDate = new Date(mission.dateHeure).toISOString().split('T')[0];
      return missionDate === date;
    });
  }

  getMissionStatusClass(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'pending';
      case 'COMMENCEE': return 'active';
      case 'TERMINEE': return 'completed';
      case 'REFUSEE': return 'refused';
      default: return 'pending';
    }
  }

  getMissionPosition(dateTime: string): number {
    const date = new Date(dateTime);
    const hour = date.getHours();
    const minute = date.getMinutes();
    
    // Calculate position based on 6AM start (6AM = 0px, 8PM = max width)
    const startHour = 6;
    const totalHours = 14; // 6AM to 8PM
    const hourWidth = 80; // pixels per hour
    
    const position = ((hour - startHour) + (minute / 60)) * hourWidth;
    return Math.max(0, position);
  }

  getMissionDuration(): number {
    // Assume 2-hour duration for each mission
    return 160; // 2 hours * 80px per hour
  }

  // New methods for dashboard greeting and navigation
  getChauffeurName(): string {
    // Try to get name from chauffeur profile data if available
    if (this.chauffeurProfile?.nom && this.chauffeurProfile?.prenom) {
      return `${this.chauffeurProfile.nom} ${this.chauffeurProfile.prenom}`;
    }
    
    // Fallback to basic user data
    const currentUser = this.authService.currentUserValue;
    return currentUser?.email?.split('@')[0] || 'Chauffeur';
  }
  getGreetingMessage(): string {
    const hour = new Date().getHours();
    const todayMissions = this.getTodayMissions().length;
    
    if (hour < 12) {
      return `Bonne matinée ! Vous avez ${todayMissions} mission${todayMissions > 1 ? 's' : ''} aujourd'hui.`;
    } else if (hour < 18) {
      return `Bon après-midi ! ${todayMissions > 0 ? `Il vous reste ${todayMissions} mission${todayMissions > 1 ? 's' : ''} à traiter.` : 'Aucune mission en attente.'}`;
    } else {
      return `Bonne soirée ! ${todayMissions > 0 ? `Vous avez ${todayMissions} mission${todayMissions > 1 ? 's' : ''} en cours.` : 'Journée terminée.'}`;
    }
  }

  navigateToMissions(): void {
    this.router.navigate(['/driver/mes-missions']);
  }

  navigateToPlanning(): void {
    this.router.navigate(['/driver/planning']);
  }

  navigateToHistory(): void {
    this.router.navigate(['/driver/historique']);
  }

  navigateToConge(): void {
    this.router.navigate(['/driver/conge']);
  }
    getGreeting(): string {
    const hour = new Date().getHours();
    const name = this.getChauffeurName();
    
    if (hour < 12) {
      return `Bonjour, ${name}`;
    } else if (hour < 18) {
      return `Bon après-midi, ${name}`;
    } else {
      return `Bonsoir, ${name}`;
    }
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getTodayMissionsCount(): number {
    return this.getTodayMissions().length;
  }
}
