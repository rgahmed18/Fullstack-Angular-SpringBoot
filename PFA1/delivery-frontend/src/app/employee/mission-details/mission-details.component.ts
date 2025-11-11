import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EmployeeDashboardService, MissionResponseDTO } from '../services/employee-dashboard.service';

@Component({
  selector: 'app-mission-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './mission-details.component.html',
  styleUrl: './mission-details.component.scss'
})
export class MissionDetailsComponent implements OnInit {
  mission: MissionResponseDTO | null = null;
  loading = true;
  error: string | null = null;
  missionId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeDashboardService: EmployeeDashboardService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.missionId = +params['id'];
      this.loadMissionDetails();
    });
  }

  loadMissionDetails(): void {
    this.loading = true;
    this.error = null;

    // Get all missions and find the specific one
    this.employeeDashboardService.getMissions().subscribe({
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

  getStatusColor(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'accent';
      case 'COMMENCEE': return 'primary';
      case 'TERMINEE': return 'success';
      case 'REFUSEE': return 'warn';
      default: return 'accent';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'schedule';
      case 'COMMENCEE': return 'play_circle';
      case 'TERMINEE': return 'check_circle';
      case 'REFUSEE': return 'cancel';
      default: return 'help';
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

  goBack(): void {
    this.router.navigate(['/employee/dashboard']);
  }

  openMap(address: string): void {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  }

  callChauffeur(phone: string): void {
    window.open(`tel:${phone}`);
  }
}
