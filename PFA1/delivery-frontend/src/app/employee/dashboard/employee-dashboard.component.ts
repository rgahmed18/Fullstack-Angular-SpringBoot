import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { EmployeeDashboardService, MissionResponseDTO, DashboardStats, Notification } from '../services/employee-dashboard.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { NotificationCenterComponent } from '../components/notification-center.component';
import { ReassignMissionDialogComponent, ReassignMissionData } from '../../admin/components/reassign-mission-dialog.component';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatDialogModule,
    MatSnackBarModule
],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {
  missions: MissionResponseDTO[] = [];
  notifications: Notification[] = [];
  missionsWithProblems: MissionResponseDTO[] = [];
  stats: DashboardStats = {
    totalMissions: 0,
    activeMissions: 0,
    pendingMissions: 0,
    completedMissions: 0,
    unreadNotifications: 0
  };
  loading = true;
  selectedTabIndex = 0;
  employeeName = '';
  currentEmployeeName: any;
  employeeProfile: any = null;
  private pollingSubscription?: Subscription;
  private readonly POLLING_INTERVAL = 5000; // 5 seconds

  constructor(
    private authService: AuthService,
    private router: Router,
    private dashboardService: EmployeeDashboardService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Debug logging
    const currentUser = this.authService.currentUserValue;
    console.log('Current user:', currentUser);
    console.log('Employee ID:', currentUser?.employeId);
    
    // Load employee profile to get full name
    if (currentUser?.employeId) {
      this.dashboardService.getEmployeeProfile(currentUser.employeId).subscribe({
        next: (profile: any) => {
          this.employeeProfile = profile;
          console.log('Employee profile loaded:', profile);
          if (profile?.nom && profile?.prenom) {
            this.employeeName = `${profile.nom} ${profile.prenom}`;
          } else {
            this.employeeName = currentUser?.email?.split('@')[0] || 'Employé';
          }
          console.log('Employee name set to:', this.employeeName);
        },
        error: (error: any) => {
          console.error('Error loading employee profile:', error);
          this.employeeName = currentUser?.email?.split('@')[0] || 'Employé';
        }
      });
    } else {
      console.log('No employee ID found');
      this.employeeName = 'Employé';
    }
    
    this.loadDashboardData();
    this.startRealTimePolling();
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  private startRealTimePolling(): void {
    // Start polling for mission status updates every 5 seconds
    this.pollingSubscription = interval(this.POLLING_INTERVAL)
      .pipe(
        switchMap(() => this.dashboardService.getMissionsWithProblems())
      )
      .subscribe({
        next: (missionsWithProblems) => {
          const previousCount = this.missionsWithProblems.length;
          this.missionsWithProblems = missionsWithProblems;
          
          // If missions with problems changed, also refresh main missions
          if (previousCount !== missionsWithProblems.length) {
            this.refreshMissionsData();
          }
        },
        error: (error) => {
          console.error('Error during real-time polling:', error);
        }
      });
  }

  private refreshMissionsData(): void {
    // Refresh missions and stats without showing loading spinner
    this.dashboardService.getMissions().subscribe({
      next: (missions) => {
        this.missions = missions;
      },
      error: (error) => {
        console.error('Error refreshing missions:', error);
      }
    });

    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error refreshing stats:', error);
      }
    });
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load dashboard stats
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
      }
    });

    // Load missions
    this.dashboardService.getMissions().subscribe({
      next: (missions) => {
        this.missions = missions;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading missions:', error);
        this.loading = false;
      }
    });

    // Load notifications
    this.dashboardService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      }
    });

    // Load missions with problems
    this.dashboardService.getMissionsWithProblems().subscribe({
      next: (missions) => {
        this.missionsWithProblems = missions;
      },
      error: (error) => {
        console.error('Error loading missions with problems:', error);
      }
    });
  }

  getActiveMissions(): MissionResponseDTO[] {
    return this.missions.filter(m => 
      m.etat === 'COMMENCEE' || 
      m.etat === 'EN_ATTENTE' || 
      m.etat === 'EN_COURS' || 
      !m.etat
    );
  }

  getCompletedMissions(): MissionResponseDTO[] {
    return this.missions.filter(m => m.etat === 'TERMINEE');
  }

  getPendingMissions(): MissionResponseDTO[] {
    return this.missions.filter(m => m.etat === 'EN_ATTENTE' || !m.etat);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'COMMENCEE': 
      case 'EN_COURS': return 'primary';
      case 'EN_ATTENTE': return 'warn';
      case 'TERMINEE': return 'accent';
      case 'REFUSEE': return 'warn';
      default: return 'basic';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'COMMENCEE': 
      case 'EN_COURS': return 'En cours';
      case 'EN_ATTENTE': return 'En attente';
      case 'TERMINEE': return 'Terminée';
      case 'REFUSEE': return 'Refusée';
      default: return status || 'En attente';
    }
  }

  getMissionTypeIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'documents': return 'description';
      case 'materiel': return 'inventory';
      case 'personnel': return 'person';
      default: return 'local_shipping';
    }
  }



  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  getNotificationIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'mission': return 'assignment';
      case 'alert': return 'warning';
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'info':
      default: return 'info';
    }
  }

  markNotificationAsRead(notificationId: number): void {
    this.dashboardService.markNotificationAsRead(notificationId).subscribe({
      next: () => {
        this.loadDashboardData(); // Reload to update counts
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  viewMissionDetails(missionId: number): void {
    this.router.navigate(['/employee/mission', missionId]);
  }

  openReassignDialog(mission: MissionResponseDTO): void {
    const dialogRef = this.dialog.open(ReassignMissionDialogComponent, {
      width: '500px',
      data: {
        mission: mission,
        availableDrivers: []
      } as ReassignMissionData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.chauffeurId) {
        this.reassignMission(mission.id, result.chauffeurId);
      }
    });
  }

  private reassignMission(missionId: number, chauffeurId: number): void {
    this.dashboardService.reassignMission(missionId, chauffeurId).subscribe({
      next: () => {
        // Remove the reassigned mission from the problems list immediately
        this.missionsWithProblems = this.missionsWithProblems.filter(mission => mission.id !== missionId);
        
        // Also update the main missions array to reflect the assignment
        const missionIndex = this.missions.findIndex(m => m.id === missionId);
        if (missionIndex !== -1) {
          // Update the mission to indicate it has been assigned (we'll get full details on reload)
          this.missions[missionIndex] = { 
            ...this.missions[missionIndex], 
            chauffeurNom: 'Assigné', // Temporary placeholder until reload
            chauffeurPrenom: '',
            etat: 'EN_ATTENTE', // Reset status to pending
            probleme: '' // Clear the problem
          };
        }
        
        this.snackBar.open('Mission réassignée avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Immediately refresh all data to show updated assignments
        this.refreshMissionsData();
      },
      error: (error) => {
        console.error('Error reassigning mission:', error);
        this.snackBar.open('Erreur lors de la réassignation', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private reloadMissionsWithProblems(): void {
    this.dashboardService.getMissionsWithProblems().subscribe({
      next: (missions) => {
        this.missionsWithProblems = missions;
      },
      error: (error) => {
        console.error('Error reloading missions with problems:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Date non définie';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  }


  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getCurrentDate(): string {
    const today = new Date();
    return today.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  createNewMission(): void {
    this.router.navigate(['/employee/create-mission']);
  }
}
