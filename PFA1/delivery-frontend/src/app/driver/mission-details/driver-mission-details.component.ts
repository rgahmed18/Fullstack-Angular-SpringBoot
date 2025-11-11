import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { DriverDashboardService, MissionResponseDTO } from '../services/driver-dashboard.service';

@Component({
  selector: 'app-driver-mission-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './driver-mission-details.component.html',
  styleUrls: ['./driver-mission-details.component.scss']
})
export class DriverMissionDetailsComponent implements OnInit {
  mission: MissionResponseDTO | null = null;
  loading = true;
  error: string | null = null;
  missionId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private driverService: DriverDashboardService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.missionId = +params['id'];
      if (this.missionId) {
        this.loadMissionDetails();
      }
    });
  }

  loadMissionDetails(): void {
    this.loading = true;
    this.error = null;

    // Get mission from the missions list (since we don't have a specific endpoint)
    this.driverService.getMissions().subscribe({
      next: (missions) => {
        this.mission = missions.find(m => m.id === this.missionId) || null;
        if (!this.mission) {
          this.error = 'Mission non trouvée';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading mission details:', error);
        this.error = 'Erreur lors du chargement des détails de la mission';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/driver/dashboard']);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'warn';
      case 'COMMENCEE': return 'primary';
      case 'TERMINEE': return 'accent';
      case 'REFUSEE': return 'warn';
      default: return 'basic';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'En Attente';
      case 'COMMENCEE': return 'En Cours';
      case 'TERMINEE': return 'Terminée';
      case 'REFUSEE': return 'Refusée';
      default: return status;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  openInMaps(location: string): void {
    const encodedLocation = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, '_blank');
  }

  startMission(): void {
    if (this.mission) {
      this.driverService.acceptMission(this.mission.id).subscribe({
        next: () => {
          this.loadMissionDetails();
        },
        error: (error) => {
          console.error('Error starting mission:', error);
        }
      });
    }
  }

  completeMission(): void {
    if (this.mission) {
      this.driverService.completeMission(this.mission.id).subscribe({
        next: () => {
          this.loadMissionDetails();
        },
        error: (error) => {
          console.error('Error completing mission:', error);
        }
      });
    }
  }

  refuseMission(): void {
    if (this.mission) {
      const reason = prompt('Raison du refus:');
      if (reason) {
        this.driverService.refuseMission(this.mission.id, reason).subscribe({
          next: () => {
            this.loadMissionDetails();
          },
          error: (error) => {
            console.error('Error refusing mission:', error);
          }
        });
      }
    }
  }

  reportProblem(): void {
    if (this.mission) {
      const problem = prompt('Décrivez le problème:');
      if (problem) {
        this.driverService.reportProblem(this.mission.id, problem).subscribe({
          next: () => {
            this.loadMissionDetails();
          },
          error: (error) => {
            console.error('Error reporting problem:', error);
          }
        });
      }
    }
  }
}
