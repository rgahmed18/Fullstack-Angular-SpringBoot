import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { DriverDashboardService, MissionResponseDTO } from '../services/driver-dashboard.service';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.scss']
})
export class HistoriqueComponent implements OnInit {
  missions: MissionResponseDTO[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private driverService: DriverDashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMissions();
  }

  loadMissions(): void {
    this.loading = true;
    this.error = null;

    this.driverService.getMissions().subscribe({
      next: (missions) => {
        this.missions = missions || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading missions:', error);
        this.error = 'Erreur lors du chargement de l\'historique';
        this.loading = false;
      }
    });
  }

  getCompletedMissions(): MissionResponseDTO[] {
    return this.missions.filter(m => m.etat === 'TERMINEE' || m.etat === 'REFUSEE');
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
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

  getMissionStatusClass(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'pending';
      case 'COMMENCEE': return 'active';
      case 'TERMINEE': return 'completed';
      case 'REFUSEE': return 'refused';
      default: return 'pending';
    }
  }

  viewMissionDetails(missionId: number): void {
    this.router.navigate(['/driver/mission', missionId]);
  }
}
