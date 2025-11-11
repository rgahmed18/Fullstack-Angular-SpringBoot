import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { EmployeeDashboardService, MissionResponseDTO } from '../services/employee-dashboard.service';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.scss']
})
export class HistoriqueComponent implements OnInit {
  missions: MissionResponseDTO[] = [];
  loading = true;

  constructor(
    private router: Router,
    private dashboardService: EmployeeDashboardService
  ) {}

  ngOnInit(): void {
    this.loadMissions();
  }

  loadMissions(): void {
    this.loading = true;
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
  }

  getCompletedMissions(): MissionResponseDTO[] {
    return this.missions.filter(m => m.etat === 'TERMINEE');
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

  viewMissionDetails(missionId: number): void {
    this.router.navigate(['/employee/mission', missionId]);
  }

}
