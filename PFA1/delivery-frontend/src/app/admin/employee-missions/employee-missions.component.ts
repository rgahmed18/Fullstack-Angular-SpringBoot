import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmployeeService, MissionSummary } from '../../core/services/employee.service';

@Component({
  selector: 'app-employee-missions',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './employee-missions.component.html',
  styleUrls: ['./employee-missions.component.scss']
})
export class EmployeeMissionsComponent implements OnInit {
  employeeId!: number;
  employeeName: string = '';
  missions: MissionSummary[] = [];
  loading = true;
  error: string | null = null;

  displayedColumns: string[] = ['mission', 'route', 'dateTime', 'type', 'status'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.employeeId = Number(this.route.snapshot.paramMap.get('id'));
    this.employeeName = this.route.snapshot.queryParamMap.get('name') || 'Employé';
    this.loadEmployeeMissions();
  }

  loadEmployeeMissions() {
    this.loading = true;
    this.error = null;

    this.employeeService.getEmployeeMissions(this.employeeId).subscribe({
      next: (missions) => {
        this.missions = missions;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employee missions:', error);
        this.error = 'Erreur lors du chargement des missions';
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des missions', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'warn';
      case 'COMMENCEE': return 'primary';
      case 'EN_COURS': return 'primary';
      case 'TERMINEE': return 'accent';
      case 'REFUSEE': return 'warn';
      default: return 'basic';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'En attente';
      case 'COMMENCEE': return 'Commencée';
      case 'EN_COURS': return 'En cours';
      case 'TERMINEE': return 'Terminée';
      case 'REFUSEE': return 'Refusée';
      default: return status;
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'schedule';
      case 'COMMENCEE': return 'play_arrow';
      case 'EN_COURS': return 'directions_run';
      case 'TERMINEE': return 'check_circle';
      case 'REFUSEE': return 'cancel';
      default: return 'help';
    }
  }

  formatDateTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getActiveMissionsCount(): number {
    return this.missions.filter(m => 
      m.etat === 'EN_ATTENTE' || m.etat === 'COMMENCEE' || m.etat === 'EN_COURS'
    ).length;
  }

  getCompletedMissionsCount(): number {
    return this.missions.filter(m => m.etat === 'TERMINEE').length;
  }

  goBack() {
    this.router.navigate(['/admin/employees']);
  }
}
