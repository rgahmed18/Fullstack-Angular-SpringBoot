import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DriverDashboardService, MissionResponseDTO } from '../services/driver-dashboard.service';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.scss']
})
export class PlanningComponent implements OnInit {
  missions: MissionResponseDTO[] = [];
  loading = true;
  error: string | null = null;

  constructor(private driverService: DriverDashboardService) {}

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
        this.error = 'Erreur lors du chargement des missions';
        this.loading = false;
      }
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  getDayNumber(dateString: string): number {
    const date = new Date(dateString);
    return date.getDate();
  }

  getWeekDays(): Array<{name: string, date: string}> {
    const days = [];
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    
    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    
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

  getMissionsForDay(date: string): MissionResponseDTO[] {
    return this.missions.filter(mission => {
      const missionDate = new Date(mission.dateHeure).toISOString().split('T')[0];
      return missionDate === date;
    });
  }
}
