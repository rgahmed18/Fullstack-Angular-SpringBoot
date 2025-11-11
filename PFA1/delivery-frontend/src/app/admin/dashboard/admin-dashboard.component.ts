import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService, DashboardStats, RecentActivity, MissionResponseDTO } from '../../core/services/dashboard.service';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { AdminNotificationCenterComponent } from '../components/admin-notification-center.component';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatBadgeModule,
    MatListModule,
    MatToolbarModule,
    MatSidenavModule,
    MatMenuModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatOptionModule,
    AdminNotificationCenterComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  // Real dashboard data
  stats = {
    missions: 0,
    chauffeurs: 0,
    vehicules: 0,
    employes: 0,
    availableVehicules: 0,
    activeMissions: 0
  };

  recentActivity: RecentActivity[] = [];
  recentMissions: MissionResponseDTO[] = [];

  loading = true;
  error: string | null = null;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.error = null;

    // Try to get comprehensive stats first, fallback to individual calls
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = {
          missions: stats.totalMissions,
          chauffeurs: stats.totalChauffeurs,
          vehicules: stats.totalVehicules,
          employes: stats.totalEmployes,
          availableVehicules: stats.availableVehicules,
          activeMissions: stats.activeMissions
        };
        this.loading = false;
      },
      error: (error) => {
        console.warn('Comprehensive stats not available, trying individual endpoints:', error);
        this.loadIndividualStats();
      }
    });

    // Load recent missions instead of mock activity
    this.loadRecentMissions();
    

  }

  loadIndividualStats() {
    // Fallback: load individual counts
    forkJoin({
      missions: this.dashboardService.getMissionsCount(),
      chauffeurs: this.dashboardService.getChauffeursCount(),
      vehicules: this.dashboardService.getVehiculesCount(),
      employes: this.dashboardService.getEmployesCount()
    }).subscribe({
      next: (counts) => {
        this.stats = {
          missions: counts.missions.count,
          chauffeurs: counts.chauffeurs.count,
          vehicules: counts.vehicules.count,
          employes: counts.employes.count,
          availableVehicules: Math.floor(counts.vehicules.count * 0.7), // Estimate
          activeMissions: Math.floor(counts.missions.count * 0.3) // Estimate
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load dashboard data:', error);
        this.error = 'Impossible de charger les données du tableau de bord';
        this.loading = false;
        // Set default values
        this.stats = {
          missions: 0,
          chauffeurs: 0,
          vehicules: 0,
          employes: 0,
          availableVehicules: 0,
          activeMissions: 0
        };
      }
    });
  }

  // Navigation items for sidebar
  menuItems = [
    { icon: 'dashboard', label: 'Tableau de Bord', route: '/admin/dashboard' },
    { icon: 'people', label: 'Chauffeurs', route: '/admin/chauffeurs' },
    { icon: 'badge', label: 'Employés', route: '/admin/employees' },
    { icon: 'directions_car', label: 'Véhicules', route: '/admin/dashboard/vehicles' },
    { icon: 'assignment', label: 'Missions', route: '/admin/missions' },
    { icon: 'free_breakfast', label: 'Demandes de Congé', route: '/admin/dashboard/demandes-conge' },
  ];

  // Current user info (you can get this from AuthService)
  currentUser = {
    name: 'Admin',
    role: 'Administrateur'
  };

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // Helper method to navigate
  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  // Helper method to refresh data
  refreshData() {
    this.loadDashboardData();
  }

  // Helper method to get activity icon
  getActivityIcon(type: string): string {
    switch (type) {
      case 'mission': return 'assignment';
      case 'chauffeur': return 'person_add';
      case 'vehicule': return 'local_shipping';
      case 'employe': return 'badge';
      default: return 'info';
    }
  }

  // Helper method to format timestamp
  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Il y a ${hours}h`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  }

  // Load recent missions for activity display
  loadRecentMissions() {
    console.log('Loading all missions for recent activity...');
    
    this.dashboardService.getAllMissions().subscribe({
      next: (allMissions) => {
        console.log('All missions loaded:', allMissions);
        
        if (allMissions && allMissions.length > 0) {
          // Sort by date and take the 10 most recent
          const sortedMissions = allMissions
            .sort((a, b) => new Date(b.dateHeure).getTime() - new Date(a.dateHeure).getTime())
            .slice(0, 10);
          
          this.recentMissions = sortedMissions;
          this.recentActivity = sortedMissions.map(mission => ({
            id: mission.id,
            type: 'mission' as const,
            title: `Mission #${mission.id}`,
            description: `${mission.depart} → ${mission.destination} (${this.getStatusLabel(mission.etat)})`,
            timestamp: mission.dateHeure,
            status: this.getActivityStatus(mission.etat)
          }));
          
          console.log('Recent activity set with', this.recentActivity.length, 'missions');
        } else {
          console.log('No missions found');
          this.recentActivity = [];
          this.recentMissions = [];
        }
      },
      error: (error) => {
        console.error('Could not load missions:', error);
        console.error('Error details:', error.message);
        this.recentActivity = [];
        this.recentMissions = [];
      }
    });
  }



  // Get status label for missions
  getStatusLabel(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'En attente';
      case 'COMMENCEE':
      case 'EN_COURS': return 'En cours';
      case 'TERMINEE': return 'Terminée';
      case 'REFUSEE': return 'Refusée';
      default: return status || 'En attente';
    }
  }

  // Convert mission status to activity status
  getActivityStatus(missionStatus: string): 'completed' | 'new' | 'warning' | 'info' {
    switch (missionStatus) {
      case 'TERMINEE': return 'completed';
      case 'EN_ATTENTE': return 'new';
      case 'REFUSEE': return 'warning';
      case 'COMMENCEE':
      case 'EN_COURS': return 'info';
      default: return 'info';
    }
  }

  // Get status icon for activity status
  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return 'check_circle';
      case 'new': return 'schedule';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'help';
    }
  }

  // Get status text for activity status
  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Terminée';
      case 'new': return 'En attente';
      case 'warning': return 'Refusée';
      case 'info': return 'En cours';
      default: return 'Inconnu';
    }
  }

  // Format date for display
  formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }



}
